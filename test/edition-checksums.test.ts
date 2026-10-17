import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const fixture = () => {
  const dir = mkdtempSync(path.join(tmpdir(), "edition-bytes-"));
  mkdirSync(path.join(dir, "2026", "countries"), { recursive: true });
  mkdirSync(path.join(dir, "2027"));
  writeFileSync(path.join(dir, "2026", "eu.json"), '{"n":1}\r\n');
  writeFileSync(path.join(dir, "2026", "countries", "zz.json"), '{"n":2}\n');
  writeFileSync(path.join(dir, "2027", "eu.json"), '{"different":true}\n');
  writeFileSync(path.join(dir, "2026", "README.txt"), "not an edition JSON file");
  return dir;
};

test("edition checksums use sorted paths and hash exactly the selected edition's bytes", async () => {
  const { editionChecksums } = await import("../scripts/edition-checksums.ts");
  assert.equal(
    editionChecksums(fixture(), "2026"),
    "087445c6a1d220ff86f021220758657911eb16065256ea54fab1604225b91e7b  2026/countries/zz.json\n" +
      "fa65258420e1a8944c7d3c8b18e811aed7ebefcdaeb5fc548196d0cf8c8dd78c  2026/eu.json\n",
    "a checksum manifest must identify sorted file paths and original bytes, including CRLF; another edition or a JSON re-serialization is a different object",
  );
});

test("equivalent JSON with different bytes changes its digest, while filesystem dates do not", async () => {
  const { editionChecksums } = await import("../scripts/edition-checksums.ts");
  const dir = fixture();
  const file = path.join(dir, "2026", "eu.json");
  const before = readFileSync(file);
  const first = editionChecksums(dir, "2026");
  assert.deepEqual(readFileSync(file), before, "measuring an edition must never rewrite the evidence it is meant to identify");
  utimesSync(file, new Date("2028-01-01T00:00:00Z"), new Date("2028-01-01T00:00:00Z"));
  assert.equal(editionChecksums(dir, "2026"), first, "a file date is not part of its content checksum");
  writeFileSync(file, '{"n":1}\n');
  const second = editionChecksums(dir, "2026");
  assert.notEqual(second, first, "same JSON values do not mean the same published bytes");
  assert.ok(
    second.includes("cedf74272c9fc8db5448283a93277e7e7eb7534b71df3bd8ab35fd9b1b73404c  2026/eu.json"),
    "the LF variant must have its own standard SHA-256 digest, not a canonical JSON digest",
  );
});

test("a missing, empty or malformed edition cannot produce a successful empty manifest", async () => {
  const { editionChecksums } = await import("../scripts/edition-checksums.ts");
  const dir = fixture();
  mkdirSync(path.join(dir, "2025"));
  assert.throws(() => editionChecksums(dir, "../2026"), /four-digit edition/u, "an edition argument must not choose another directory");
  assert.throws(() => editionChecksums(dir, "2025"), /no JSON files/u, "an empty checksum list must not look like a checked edition");
  assert.throws(() => editionChecksums(dir, "2024"), /cannot be listed/u, "a missing edition must stay an error, as decision 009 requires");
});

test("the command requires one explicit edition and writes no manifest on a usage error", () => {
  const script = path.join(import.meta.dirname, "..", "scripts", "edition-checksums.ts");
  for (const args of [[], ["2026", "unexpected"]]) {
    const result = spawnSync(process.execPath, [script, ...args], { cwd: tmpdir(), encoding: "utf8" });
    assert.equal(result.status, 1, "usage errors must not be reported as successful checksum generation");
    assert.equal(result.stdout, "", "a partial or empty manifest on stdout can be mistaken for a valid one");
    assert.match(result.stderr, /usage:/u, "the caller needs to know which explicit edition argument was missing or ambiguous");
  }
});
