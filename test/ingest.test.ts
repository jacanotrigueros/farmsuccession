import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { extractBlocks, ingest, isIngestablePath, territorySpecOf } from "../src/ingest.ts";
import { fakeBrief, fakeEdition, fakeTerritories } from "./fixtures.ts";

/** An answer in the shape the process asks for: a path, then the file as a fenced JSON block. */
const answer = (...files: Array<[string, unknown]>): string =>
  files
    .map(([file, content]) => `Here is \`${file}\`:\n\n\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\`\n`)
    .join("\nAnd then:\n\n");

const EDITION_FILE = "data/editions/2026/regions/xa/north-isle.json";
const BRIEF_FILE = "research/xa/north-isle.json";

/** A repository with the fictional catalogue in place, so ingestion is followed by the real gate. */
function repository(): { root: string; territoriesFile: string } {
  const root = mkdtempSync(path.join(tmpdir(), "farmsuccession-ingest-"));
  mkdirSync(path.join(root, "data/editions"), { recursive: true });
  mkdirSync(path.join(root, "research"), { recursive: true });
  const territoriesFile = path.join(root, "territories.json");
  writeFileSync(territoriesFile, JSON.stringify(fakeTerritories()));
  return { root, territoriesFile };
}

test("a path the layout does not define is refused, not written somewhere else", () => {
  assert.equal(isIngestablePath(EDITION_FILE), true);
  assert.equal(isIngestablePath(BRIEF_FILE), true);
  assert.equal(isIngestablePath("research/eu.json"), true);
  assert.equal(isIngestablePath("data/editions/2026/countries/xa.json"), true);
  assert.equal(isIngestablePath("schema/edition.schema.json"), false, "a draft does not get to rewrite the contract it is checked against");
  assert.equal(isIngestablePath("package.json"), false);
  assert.equal(isIngestablePath("data/editions/2026/provinces/xa/somewhere.json"), false, "a place the layout does not define");
  assert.equal(isIngestablePath("research/xa/regions/north-isle.json"), false);
});

test("each block is the file whose path precedes it", () => {
  const { blocks, problems } = extractBlocks(answer([EDITION_FILE, fakeEdition()], [BRIEF_FILE, fakeBrief()]));
  assert.deepEqual(problems, []);
  assert.deepEqual(
    blocks.map((block) => block.file),
    [EDITION_FILE, BRIEF_FILE],
  );
});

test("a block with no path in front of it is an example, and is skipped in silence", () => {
  const withExample = `Here is what a resource looks like:\n\n\`\`\`json\n{ "id": "an-example" }\n\`\`\`\n\n${answer([EDITION_FILE, fakeEdition()])}`;
  const { blocks, problems } = extractBlocks(withExample);
  assert.deepEqual(problems, []);
  assert.deepEqual(
    blocks.map((block) => block.file),
    [EDITION_FILE],
  );
});

test("an answer that writes nowhere useful says so", () => {
  assert.match(extractBlocks("I could not find anything.").problems.join(" "), /no fenced JSON block preceded by an edition/u);
  const twice = answer([EDITION_FILE, fakeEdition()], [EDITION_FILE, fakeEdition()]);
  assert.match(extractBlocks(twice).problems.join(" "), /appears in more than one block/u);
});

test("a block aimed at a file this command does not write is refused out loud", () => {
  const atTheSchema = extractBlocks(answer(["schema/edition.schema.json", {}]));
  assert.deepEqual(atTheSchema.blocks, [], "a draft does not rewrite the contract it is checked against");
  assert.match(atTheSchema.problems.join(" "), /schema\/edition.schema.json: not an edition file or a research brief path/u);
  assert.match(
    extractBlocks(answer(["data/territories.json", {}])).problems.join(" "),
    /data\/territories.json: not an edition file or a research brief path/u,
    "the catalogue is not something a research pass changes",
  );
});

test("an answer is written as the files it names, formatted", async () => {
  const { root, territoriesFile } = repository();
  const result = await ingest(answer([EDITION_FILE, fakeEdition()], [BRIEF_FILE, fakeBrief()]), {
    root,
    territoriesFile,
    today: "2026-10-02",
  });
  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.written, [EDITION_FILE, BRIEF_FILE]);
  const written = readFileSync(path.join(root, EDITION_FILE), "utf8");
  assert.equal(written.at(-1), "\n", "formatted like every other file in the repository");
  assert.equal(JSON.parse(written).officialName, "North Isle");
});

test("nothing is written when any block is refused", async () => {
  const { root, territoriesFile } = repository();
  const broken = `Here is \`${EDITION_FILE}\`:\n\n\`\`\`json\n{ "officialName": "North Isle",\n\`\`\`\n\n${answer([BRIEF_FILE, fakeBrief()])}`;
  const result = await ingest(broken, { root, territoriesFile, today: "2026-10-02" });
  assert.match(result.problems.join(" "), /not valid JSON/u);
  assert.deepEqual(result.written, [], "half an answer on disk is worse than none");
  assert.equal(result.validation, undefined);
});

test("a repeated key is refused before the parser can hide it", async () => {
  const { root, territoriesFile } = repository();
  const duplicated = `\`${BRIEF_FILE}\`:\n\n\`\`\`json\n{\n  "language": "en",\n  "language": "es"\n}\n\`\`\`\n`;
  const result = await ingest(duplicated, { root, territoriesFile, today: "2026-10-02" });
  assert.match(result.problems.join(" "), /key "language" is repeated/u);
  assert.deepEqual(result.written, [], "writing it back would lose the first value with nothing to show for it");
});

test("what was written is then judged by the whole gate, not by ingestion", async () => {
  const { root, territoriesFile } = repository();
  const result = await ingest(answer([EDITION_FILE, fakeEdition({ officialName: "Northern Isle" })]), {
    root,
    territoriesFile,
    today: "2026-10-02",
  });
  assert.deepEqual(result.written, [EDITION_FILE], "ingestion writes what the answer said");
  const messages = (result.validation?.errors ?? []).map((finding) => finding.message).join(" | ");
  assert.match(messages, /officialName "Northern Isle" must be "North Isle"/u, "and the gate is what refuses it");
});

test("the next step names the territory that was written", () => {
  assert.equal(territorySpecOf(EDITION_FILE), "xa/north-isle");
  assert.equal(territorySpecOf("data/editions/2026/countries/xa.json"), "xa");
  assert.equal(territorySpecOf("data/editions/2026/hubs/xa/archipelago.json"), "xa/archipelago");
  assert.equal(territorySpecOf("data/editions/2026/eu.json"), "eu");
  assert.equal(territorySpecOf(BRIEF_FILE), undefined, "a brief is not checked against pages of its own");
});
