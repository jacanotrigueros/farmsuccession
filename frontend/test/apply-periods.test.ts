import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import type { Call, Resource } from "../../src/types/edition.ts";
import { APPLY_RANK, applyKey } from "../public/apply.js";
import { recordSlug } from "../public/search-scope.js";
import { dateIn } from "../src/lib/language.ts";
import { words } from "../src/lib/words.ts";

const ROOT = path.join(import.meta.dirname, "..", "..");
const DIST = path.join(ROOT, "frontend", "dist");
const EDITIONS = path.join(ROOT, "data", "editions");
const edition = readdirSync(EDITIONS).toSorted().at(-1);
assert.ok(edition, "no edition to check application answers against");

type Snapshot = { country?: string; metadata: { language: string }; resources: Resource[] };
function snapshots(dir: string): Snapshot[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? snapshots(file) : entry.name.endsWith(".json") ? [JSON.parse(readFileSync(file, "utf8")) as Snapshot] : [];
  });
}

const records = snapshots(path.join(EDITIONS, edition)).flatMap((snapshot) =>
  snapshot.resources.map((resource) => ({ resource, country: snapshot.country, language: snapshot.metadata.language })),
);
const htmlOf = (resource: Resource, country?: string): string =>
  readFileSync(
    path.join(DIST, country ? `${country.toLowerCase()}/${recordSlug(country)}` : "resources", resource.id, "index.html"),
    "utf8",
  );
const blocksOf = (html: string) => [...html.matchAll(/<section\b([^>]*\bdata-apply-answers="[^"]*"[^>]*)>([\s\S]*?)<\/section>/gu)];
const attribute = (attributes: string, name: string): string | undefined => new RegExp(`\\b${name}="([^"]*)"`, "u").exec(attributes)?.[1];

test("there are documented periods to check, including records with several calls", () => {
  assert.ok(
    records.some(({ resource }) => (resource.calls?.length ?? 0) > 1),
    "no multi-call record: this regression would prove nothing",
  );
});

for (const { resource, country, language } of records.filter(({ resource }) => (resource.calls?.length ?? 0) > 1)) {
  test(`${resource.id}: every call gets its own named answer and browser payload`, () => {
    // The periods a reader can apply through come first, then upcoming, then closed; ties keep the file's
    // order (decisions/042). The build answers for its own day, as this test does.
    const today = new Date().toISOString().slice(0, 10);
    const rank = (call: Call) => APPLY_RANK[applyKey(call, resource.status, today) as keyof typeof APPLY_RANK];
    const calls = resource.calls!.toSorted((a, b) => rank(a) - rank(b));
    const blocks = blocksOf(htmlOf(resource, country));
    assert.equal(
      blocks.length,
      calls.length,
      `${resource.id}: ${calls.length} documented calls need ${calls.length} headline answers; array position must not hide a period`,
    );
    const carried = blocks.map((block) => JSON.parse(decodeHTML(attribute(block[1] ?? "", "data-apply-call") ?? "null")) as Call);
    assert.deepEqual(carried, calls, `${resource.id}: the browser must receive every call, open ones first, not a selected call`);

    for (const [index, call] of calls.entries()) {
      const attributes = blocks[index]?.[1] ?? "";
      const body = decodeHTML(blocks[index]?.[2] ?? "");
      assert.ok(body.includes(call.name), `${resource.id}: answer ${index + 1} does not name the call it answers`);
      const consulted = resource.sources.find((source) => source.url === call.sourceUrl)?.consultedOn;
      assert.ok(consulted, `${resource.id}: ${call.name} has no source consultation date`);
      const checked = words(language).checkedOn.replace("{date}", dateIn(consulted, language));
      assert.ok(
        body.replaceAll(/<[^>]*>/gu, "").includes(checked),
        `${resource.id}: ${call.name} must show its own source's consultation date`,
      );
      for (const date of [call.opens, call.closes].filter((date): date is string => date !== undefined)) {
        assert.ok(body.includes(`datetime="${date}"`), `${resource.id}: ${call.name} lost its own documented date ${date}`);
      }
      const answers = JSON.parse(decodeHTML(attribute(attributes, "data-apply-answers") ?? "null")) as Record<string, { text: string }>;
      assert.equal(
        answers.openByDates?.text,
        words(language).applyOpenByDates.replace("{date}", call.closes ? dateIn(call.closes, language) : ""),
        `${resource.id}: ${call.name} must refresh with its own translated deadline, not another call's`,
      );
    }
    assert.equal(
      [...htmlOf(resource, country).matchAll(/<script[^>]*\bsrc="\/apply\.js"/gu)].length,
      1,
      `${resource.id}: all answers share one date-refresh script, not one script per call`,
    );
  });
}

test("one-call records still render one answer and active records without calls invent none", () => {
  for (const { resource, country } of records) {
    const count = resource.calls?.length ?? 0;
    if (count === 1) assert.equal(blocksOf(htmlOf(resource, country)).length, 1, `${resource.id}: one call still needs one answer`);
    if (count === 0 && resource.status === "ACTIVE") {
      assert.equal(blocksOf(htmlOf(resource, country)).length, 0, `${resource.id}: no documented call must not become an invented answer`);
    }
  }
});

test("resources without a documented call describe availability rather than inventing an application question", () => {
  let checked = 0;
  for (const { resource, country, language } of records.filter(({ resource }) => !resource.calls?.length)) {
    const blocks = blocksOf(htmlOf(resource, country));
    if (blocks.length === 0) continue;
    const body = decodeHTML(blocks[0]![2]!);
    const heading = /<h2\b[^>]*>([\s\S]*?)<\/h2>/u.exec(body)?.[1]?.trim();
    assert.equal(heading, words(language).availabilityTitle, `${resource.id}: no call means no application-period question`);
    checked++;
  }
  assert.ok(checked > 0, "announced and unconfirmed records must be inspected too");
});

test("a record whose later call is open answers with it first", () => {
  // The Balearic FOGAIBA record lists its closed 2025 call before its 2026 one; a reader asking "can I apply?"
  // read "no" first while the same page documented an open period.
  const balearic = records.find(({ resource }) => resource.id === "illes-balears-fogaiba-creacion-empresas-jovenes-agricultores");
  assert.ok(balearic, "the Balearic FOGAIBA record is gone; choose another record with a closed call listed before an open one");
  const blocks = blocksOf(htmlOf(balearic.resource, balearic.country));
  const tones = blocks.map((block) => attribute(block[1] ?? "", "data-tone"));
  const firstNo = tones.indexOf("no");
  const lastYes = tones.lastIndexOf("yes");
  if (lastYes >= 0 && firstNo >= 0) assert.ok(lastYes < firstNo, `an open period must come before a closed one: ${tones.join(", ")}`);
});

test("the answer to whether a reader can apply comes before what the resource offers", () => {
  // On a phone the answer sat a screen below the title, after the summary and the buttons, while a green
  // "active" tag above the title read like a yes (decisions/042).
  let checked = 0;
  for (const { resource, country, language } of records) {
    const html = htmlOf(resource, country);
    const answer = html.search(/<section\b[^>]*\bdata-apply-answers=/u);
    if (answer < 0) continue;
    const offers = html.indexOf(`>${words(language).offersTitle}<`);
    assert.ok(offers > answer, `${resource.id}: the application answer must precede "${words(language).offersTitle}"`);
    checked++;
  }
  assert.ok(checked > 0, "no record answers whether a reader can apply, so this check proved nothing");
});
