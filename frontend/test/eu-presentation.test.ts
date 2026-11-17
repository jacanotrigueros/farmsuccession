/**
 * The translated cards of European records stay translations of what the record says today.
 *
 * A card in Spanish on `/es/` is only honest while it translates the English the record carries. When the
 * record's text changes, its translation is a second version nobody checked against a source, so the
 * build stops it here instead of publishing it — and a record added without translations would show in
 * English inside every other language's page, which is what the translations exist to prevent.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { EU_PRESENTATION } from "../src/lib/eu-presentation.ts";

const REPOSITORY = path.resolve(import.meta.dirname, "..", "..");
const edition = readdirSync(path.join(REPOSITORY, "data", "editions"))
  .toSorted()
  .at(-1)!;
const europe = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "editions", edition, "eu.json"), "utf8")) as {
  resources: { id: string; whatItOffers: string }[];
};
const LANGUAGES = ["es", "de", "fr", "it", "pt", "nl"] as const;

test("every European record has a card in every other language, translating its current English", () => {
  for (const { id, whatItOffers } of europe.resources) {
    const entry = EU_PRESENTATION[id];
    assert.ok(entry, `${id}: no translated card; add one to eu-presentation.ts before publishing the record`);
    assert.equal(entry.translates, whatItOffers, `${id}: the record's English changed; translate the new text in eu-presentation.ts`);
    for (const language of LANGUAGES) {
      const card = entry[language];
      assert.ok(card?.name && card.offers, `${id}: no ${language} card`);
    }
  }
});

test("no translated card is left for a record Europe no longer publishes", () => {
  const ids = new Set(europe.resources.map(({ id }) => id));
  for (const id of Object.keys(EU_PRESENTATION)) assert.ok(ids.has(id), `${id}: translated card for a record that no longer exists`);
});
