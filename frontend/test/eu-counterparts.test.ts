/**
 * Every national record a European card points to exists in that country's file, and every European record
 * named exists in Europe's: a link between two records must not outlive either of them.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { EU_COUNTERPARTS } from "../src/lib/eu-counterparts.ts";

const REPOSITORY = path.resolve(import.meta.dirname, "..", "..");
const edition = readdirSync(path.join(REPOSITORY, "data", "editions"))
  .toSorted()
  .at(-1)!;
const ids = (file: string): Set<string> =>
  new Set((JSON.parse(readFileSync(file, "utf8")) as { resources: { id: string }[] }).resources.map(({ id }) => id));

test("every European counterpart names records that exist", () => {
  const europe = ids(path.join(REPOSITORY, "data", "editions", edition, "eu.json"));
  for (const [euId, countries] of Object.entries(EU_COUNTERPARTS)) {
    assert.ok(europe.has(euId), `${euId}: not a European record of edition ${edition}`);
    for (const [country, national] of Object.entries(countries)) {
      const file = path.join(REPOSITORY, "data", "editions", edition, "countries", `${country.toLowerCase()}.json`);
      assert.ok(existsSync(file), `${euId}: no country file for ${country}`);
      const here = ids(file);
      for (const id of national ?? []) assert.ok(here.has(id), `${euId}: ${country} has no record ${id}`);
    }
  }
});
