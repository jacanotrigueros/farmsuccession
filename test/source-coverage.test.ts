import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { citedByTerritory } from "../scripts/report-sources.ts";

for (const [name, body] of [
  ["unreadable JSON", "{"],
  ["schema-invalid JSON", "{}"],
]) {
  test(`source coverage refuses ${name} instead of reporting that a territory cites nothing`, (t) => {
    const dir = mkdtempSync(path.join(tmpdir(), "unreadable-coverage-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    mkdirSync(path.join(dir, "2026", "regions", "fr"), { recursive: true });
    writeFileSync(path.join(dir, "2026", "regions", "fr", "corse.json"), body!);
    assert.throws(
      () => citedByTerritory(dir, "2026"),
      /cannot measure source coverage[\s\S]*2026\/regions\/fr\/corse\.json/u,
      "a snapshot that could not be loaded has unknown citations, not zero citations: fail with its path instead of reporting clean coverage of an empty territory",
    );
  });
}
