import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import type { EditionSnapshot } from "../../src/types/edition.ts";
import { recordSlug } from "../public/search-scope.js";
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

test("a record title keeps its full source name and adds territory only to distinguish namesakes", () => {
  assert.ok(entries.length > 0, "no records: a title regression would prove nothing");
  assert.ok(
    [...frequency.values()].some((count) => count > 1),
    "no namesakes: the territorial disambiguation has not been exercised",
  );
  const titles = new Set<string>();
  for (const { snapshot, resource } of entries) {
    const country = "country" in snapshot ? snapshot.country.toLowerCase() : "";
    const route = `${country ? `${country}/` : ""}${recordSlug(country.toUpperCase())}/${resource.id}/`;
    const html = readFileSync(path.join(ROOT, "frontend", "dist", route, "index.html"), "utf8");
    const actual = decodeHTML(/<title>([^<]*)<\/title>/u.exec(html)?.[1] ?? "");
    const name = resource.name + (frequency.get(resource.name)! > 1 ? ` — ${snapshot.officialName}` : "");
    const expected = `${name} · ${words(snapshot.metadata.language).siteName}`;
    assert.equal(
      actual,
      expected,
      `${route}: retain the complete source name; the breadcrumb already identifies the territory. Repeating the full territorial trail made the Bolzano title 161 characters. Qualify namesakes so shorter titles do not make different records indistinguishable.`,
    );
    assert.ok(
      !titles.has(actual),
      `${route}: this title already identifies another record; include enough documented territory to distinguish it`,
    );
    titles.add(actual);
  }
});
