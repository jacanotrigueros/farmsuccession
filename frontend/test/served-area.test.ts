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
