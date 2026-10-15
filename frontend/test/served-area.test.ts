import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import type { EditionSnapshot } from "../../src/types/edition.ts";
import { resourcePlace } from "../public/resource-place.js";
import { searchPath, recordSlug, regionSlug } from "../public/search-scope.js";
import { words } from "../src/lib/words.ts";

const ROOT = path.join(import.meta.dirname, "..", "..");
const DIST = path.join(ROOT, "frontend", "dist");
const EDITIONS = path.join(ROOT, "data", "editions");
const edition = readdirSync(EDITIONS).toSorted().at(-1);
assert.ok(edition, "no edition: a served-area regression would prove nothing");
function read(dir: string): EditionSnapshot[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? read(file)
      : entry.name.endsWith(".json")
        ? [JSON.parse(readFileSync(file, "utf8")) as EditionSnapshot]
        : [];
  });
}
const snapshots = read(path.join(EDITIONS, edition));
const htmlAt = (route: string) => readFileSync(path.join(DIST, route, "index.html"), "utf8");

test("cards name the documented served area without replacing their containing territory", () => {
  let checked = 0;
  for (const snapshot of snapshots) {
    if (!("country" in snapshot)) continue;
    const inside = "region" in snapshot ? snapshot.region : "hub" in snapshot ? snapshot.hub : undefined;
    const route = `${snapshot.country.toLowerCase()}/${inside ? `${regionSlug(snapshot.country)}/${inside}/` : ""}`;
    for (const resource of snapshot.resources.filter((record) => record.scope.area)) {
      checked++;
      for (const [page, language] of [
        [route, snapshot.metadata.language],
        [searchPath("/", snapshot.country), snapshot.metadata.language],
        ["search/", "en"],
      ]) {
        const html = htmlAt(page!);
        const card = [...html.matchAll(/<li\b[^>]*data-kind="[^"]+"[^>]*>([\s\S]*?)<\/li>/gu)].find((match) =>
          match[1]?.includes(`/${resource.id}/`),
        )?.[1];
        assert.ok(card, `${resource.id}: no card at ${page}`);
        const text = decodeHTML(card);
        assert.ok(
          text.includes(resource.scope.area!),
          `${resource.id}: a card saying only ${snapshot.officialName} hides its documented served area ${resource.scope.area}`,
        );
        assert.ok(text.includes(snapshot.officialName), `${resource.id}: the served area must not erase its containing territory`);
        assert.ok(text.includes(words(language!).reachRow), `${resource.id}: the served area needs the page language's existing label`);
      }
      const record = decodeHTML(htmlAt(`${snapshot.country.toLowerCase()}/${recordSlug(snapshot.country)}/${resource.id}/`));
      assert.ok(
        record.includes(`data-pagefind-meta="area:${resource.scope.area}"`),
        `${resource.id}: live search needs the same served area in its metadata`,
      );
    }
  }
  assert.ok(checked > 0, "no served areas: the regression would prove nothing");
});

test("the separator before a value is the one its own language uses", () => {
  for (const language of ["en", "es", "de", "it", "pt"]) {
    assert.equal(
      words(language).labelSeparator,
      ": ",
      language + " introduces a value with a plain colon; only French puts a space before it",
    );
  }
  // Written as an escape because the character is invisible in a diff and a plain space would look right.
  assert.equal(
    words("fr").labelSeparator,
    "\u00a0: ",
    "French puts a no-breaking space before a colon, and it must not be an ordinary one",
  );
  assert.equal(
    resourcePlace("France \u00b7 Auvergne-Rh\u00f4ne-Alpes", "Rh\u00f4ne-Alpes", words("fr").reachRow, words("fr").labelSeparator),
    "France \u00b7 Auvergne-Rh\u00f4ne-Alpes \u00b7 P\u00e9rim\u00e8tre\u00a0: Rh\u00f4ne-Alpes",
    "a template that writes its own colon cannot know which language it is in",
  );
});

test("French punctuation keeps the space its typography gives it, and that space never breaks", () => {
  // Before a colon the space is the ordinary non-breaking one; before ; ? ! and inside guillemets it is
  // the thin one. Both are invisible, so an edit that types a normal space looks correct and is not.
  const strings = Object.entries(words("fr")).filter(([, value]) => typeof value === "string") as [string, string][];
  assert.ok(strings.length > 100, "no French strings read: this check would prove nothing");

  for (const [key, value] of strings) {
    assert.doesNotMatch(value, / [:;?!]/u, `fr.${key} has an ordinary space before punctuation that French never lets break`);
    assert.doesNotMatch(value, /\u00a0[;?!]/u, `fr.${key} uses the wide space before ; ? or !, where French uses the thin one`);
    assert.doesNotMatch(value, /\u202f:/u, "French puts the ordinary non-breaking space before a colon, not the thin one");
  }

  for (const language of ["en", "es", "de", "it", "pt"]) {
    for (const [key, value] of Object.entries(words(language))) {
      if (typeof value !== "string") continue;
      assert.doesNotMatch(value, /[\u00a0\u202f][:;?!]/u, `${language}.${key} spaces its punctuation the French way`);
    }
  }
});

test("served-area text keeps the territory and treats source words as plain text", () => {
  assert.equal(
    resourcePlace("Germany · Baden-Württemberg", "Südbaden", "Area served"),
    "Germany · Baden-Württemberg · Area served: Südbaden",
    "a subregional service must not read as serving its entire containing region",
  );
  assert.equal(resourcePlace("France", undefined, "Zone desservie"), "France", "missing served-area data must not be invented");
  assert.equal(
    resourcePlace("Portugal", "A & B <district>", "Área abrangida"),
    "Portugal · Área abrangida: A & B <district>",
    "source prose stays plain text; callers must escape it as text, never markup",
  );
});
