import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import type { EditionSnapshot } from "../../src/types/edition.ts";
import { recordSlug } from "../public/search-scope.js";
import { namesPlace } from "../src/lib/place-name.ts";
import { words } from "../src/lib/words.ts";

const ROOT = path.join(import.meta.dirname, "..", "..");
function snapshots(dir: string): EditionSnapshot[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? snapshots(file)
      : entry.name.endsWith(".json")
        ? [JSON.parse(readFileSync(file, "utf8")) as EditionSnapshot]
        : [];
  });
}
const editions = path.join(ROOT, "data", "editions");
const edition = readdirSync(editions).toSorted().at(-1);
assert.ok(edition, "no edition: a record-title regression would prove nothing");
const entries = snapshots(path.join(editions, edition)).flatMap((snapshot) =>
  snapshot.resources.map((resource) => ({ snapshot, resource })),
);
const frequency = new Map<string, number>();
for (const { resource } of entries) frequency.set(resource.name, (frequency.get(resource.name) ?? 0) + 1);

test("a territory is recognised by any of its names, or by the word a reader types", () => {
  assert.ok(namesPlace("Ayudas al establecimiento en Asturias", "Principado de Asturias"));
  assert.ok(namesPlace("Ayudas de la Comunidad Foral de Navarra", "Comunidad Foral de Navarra"));
  assert.ok(namesPlace("Fondo de suelo agrario de Álava", "Araba / Álava"));
  assert.ok(
    namesPlace("Banca della terra della Provincia autonoma di Bolzano", "Provincia autonoma di Bolzano/Bozen — Alto Adige/Südtirol"),
  );
  assert.ok(namesPlace("Safer Provence-Alpes-Côte d'Azur", "Provence-Alpes-Côte d’Azur"), "the two apostrophes are one");
  assert.ok(!namesPlace("Ayudas al establecimiento de personas jóvenes agricultores", "Castilla y León"));
  assert.ok(!namesPlace("Hofübergabeberatung des BLHV", "Baden-Württemberg"));
});

/**
 * The line a result shows. Somebody looking for an instrument looks for it where they live, and 211 of 345
 * titles named no territory at all, so a reader in Castilla y León met "Ayudas al establecimiento de personas jóvenes agricultores" and could not
 * tell it was theirs. A record below its country now opens with its territory unless its own name already
 * says it, which keeps a long territorial name from doubling a title: the full trail once made the Bolzano
 * title 161 characters. The source's name is never shortened, and the site name is not repeated, because a
 * result prints it on its own line.
 */
test("a record title keeps its full source name and names the territory below its country", () => {
  assert.ok(entries.length > 0, "no records: a title regression would prove nothing");
  assert.ok(
    [...frequency.values()].some((count) => count > 1),
    "no namesakes: the territorial disambiguation has not been exercised",
  );
  const titles = new Set<string>();
  let placed = 0;
  for (const { snapshot, resource } of entries) {
    const country = "country" in snapshot ? snapshot.country.toLowerCase() : "";
    const route = `${country ? `${country}/` : ""}${recordSlug(country.toUpperCase())}/${resource.id}/`;
    const html = readFileSync(path.join(ROOT, "frontend", "dist", route, "index.html"), "utf8");
    const actual = decodeHTML(/<title>([^<]*)<\/title>/u.exec(html)?.[1] ?? "");
    const text = words(snapshot.metadata.language);
    const below = snapshot.schemaId === "regional-snapshot" || snapshot.schemaId === "hub-snapshot";
    const opens = below && !namesPlace(resource.name, snapshot.officialName);
    // A territory that pairs two forms with " — " opens a title with the first; the breadcrumb carries both.
    const place = snapshot.officialName.split(" — ")[0] ?? snapshot.officialName;
    const expected = opens
      ? text.recordPageTitleInPlace.replace("{place}", place).replace("{name}", resource.name)
      : resource.name + (frequency.get(resource.name)! > 1 ? ` — ${snapshot.officialName}` : "");
    if (opens) placed += 1;
    assert.ok(
      !opens || actual.length - resource.name.length <= 40,
      `${route}: the territory adds ${actual.length - resource.name.length} characters in front of the name; the full trail once made a title 161 characters`,
    );

    assert.equal(
      actual,
      expected,
      `${route}: a title is the source's full name, opened by its territory when it sits below its country and does not already name it`,
    );
    assert.ok(actual.includes(resource.name), `${route}: the title shortened the name the source gives this record`);
    assert.ok(
      !below || namesPlace(actual, snapshot.officialName),
      `${route}: "${actual}" does not say where it applies, so a reader cannot tell from the result whether it is theirs`,
    );
    assert.ok(
      !actual.endsWith(text.siteName),
      `${route}: the title spends its room on the site's name, which a result already prints on a line of its own`,
    );
    assert.ok(
      !titles.has(actual),
      `${route}: this title already identifies another record; include enough documented territory to distinguish it`,
    );
    titles.add(actual);
  }
  assert.ok(placed > 100, `only ${placed} titles were opened by their territory; most regional records do not name it`);
});

/**
 * The call a record documents, where a result still has room to carry it.
 *
 * Spanish and Italian readers type the year — `joven agricultor castilla-la mancha 2026`,
 * `primo insediamento basilicata 2026` — and the call sat on the page, past the end of every result. It
 * now opens the description, named the way its own source names it, and what follows is cut to what a
 * result shows rather than written past it.
 */
test("a record that documents a call says which one, before a result runs out of room", () => {
  const SNIPPET = 155;
  let checked = 0;
  for (const { snapshot, resource } of entries) {
    const calls = resource.calls ?? [];
    if (calls.length === 0) continue;
    const country = "country" in snapshot ? snapshot.country.toLowerCase() : "";
    const route = `${country ? `${country}/` : ""}${recordSlug(country.toUpperCase())}/${resource.id}/`;
    const html = readFileSync(path.join(ROOT, "frontend", "dist", route, "index.html"), "utf8");
    const description = decodeHTML(/<meta name="description" content="([^"]*)"/u.exec(html)?.[1] ?? "");
    checked += 1;

    // The page names a call the way its source does, and falls back to the year only when the name
    // would leave no sentence after it. Both forms are the rule; neither is a free pass for the other.
    const opens = calls.flatMap((call) => [
      call.name,
      ...(/\b20\d{2}\b/u.exec(call.name) ?? []),
      ...(call.closes ? [call.closes.slice(0, 4)] : []),
      ...(call.opens ? [call.opens.slice(0, 4)] : []),
    ]);
    assert.ok(
      opens.some((named) => description.startsWith(named)),
      `${route}: the description opens "${description.slice(0, 50)}…" and not with the call this record documents, so no result carries the year somebody typed`,
    );
    assert.ok(
      description.length <= SNIPPET,
      `${route}: the description runs to ${description.length} characters, so what a result shows ends before the record does`,
    );
  }
  assert.ok(checked > 50, `only ${checked} records documenting a call were checked; Spain and Italy alone hold more`);
});

/**
 * What a result has room for, which is not what the page has room for.
 *
 * A description is written to be read on the page and ran to 238 characters in Spain and 191 in Germany,
 * against the roughly 155 a result shows. The end of it was not shortened by anybody: it was simply not
 * read, by the one reader who had not decided yet whether to open the page.
 */
test("a record's description ends inside what a result shows, in every country", () => {
  const SNIPPET = 155;
  const seen = new Set<string>();
  for (const { snapshot, resource } of entries) {
    const country = "country" in snapshot ? snapshot.country.toLowerCase() : "";
    const route = `${country ? `${country}/` : ""}${recordSlug(country.toUpperCase())}/${resource.id}/`;
    const html = readFileSync(path.join(ROOT, "frontend", "dist", route, "index.html"), "utf8");
    const description = decodeHTML(/<meta name="description" content="([^"]*)"/u.exec(html)?.[1] ?? "");
    seen.add(country || "eu");

    assert.ok(description.length > 0, `${route}: the page offers a result no description at all`);
    assert.ok(
      description.length <= SNIPPET,
      `${route}: the description runs to ${description.length} characters, and a result stops at about ${SNIPPET}`,
    );
    assert.ok(
      !/\s…$/u.test(description),
      `${route}: the description was cut after a space, which shows a result a gap before the ellipsis`,
    );
  }
  assert.equal(seen.size, 6, "the five countries and the European layer were not all covered");
});
