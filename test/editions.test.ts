import assert from "node:assert/strict";
import { test } from "node:test";

import { identityFromPath, loadSnapshots, SCOPE_LEVELS_BY_SNAPSHOT } from "../src/editions.ts";

test("a file's location says which territory and year it must be about", () => {
  assert.deepEqual(identityFromPath("2026/eu.json"), { edition: "2026", schemaId: "eu-snapshot" });
  assert.deepEqual(identityFromPath("2026/countries/es.json"), {
    edition: "2026",
    schemaId: "country-snapshot",
    country: "ES",
  });
  assert.deepEqual(identityFromPath("2026/hubs/es/canarias.json"), {
    edition: "2026",
    schemaId: "hub-snapshot",
    country: "ES",
    hub: "canarias",
  });
  assert.deepEqual(identityFromPath("2026/regions/es/galicia.json"), {
    edition: "2026",
    schemaId: "regional-snapshot",
    country: "ES",
    region: "galicia",
  });
});

test("Windows path separators read the same as POSIX ones", () => {
  assert.deepEqual(identityFromPath("2026\\regions\\es\\galicia.json"), {
    edition: "2026",
    schemaId: "regional-snapshot",
    country: "ES",
    region: "galicia",
  });
});

test("a file the layout does not define has no identity, rather than a guessed one", () => {
  for (const stray of [
    "eu.json",
    "notayear/eu.json",
    "2026/regions/es.json",
    "2026/regions/ES/galicia.json",
    "2026/countries/esp.json",
    "2026/provinces/es/lugo.json",
    "2026/regions/es/galicia.txt",
    "2026/eu/extra.json",
  ]) {
    assert.equal(identityFromPath(stray), null, `"${stray}" is not an edition file and must not pass as one`);
  }
});

test("an edition nobody has written fails loudly instead of reporting no problems", () => {
  assert.throws(
    () => loadSnapshots({ edition: "1999" }),
    /1999: cannot be listed/u,
    "a check that silently passes over a directory that is not there says nothing is wrong with data nobody wrote",
  );
});

test("a resource may only be as wide as the file it sits in", () => {
  assert.deepEqual(SCOPE_LEVELS_BY_SNAPSHOT["eu-snapshot"], ["EU"]);
  assert.deepEqual(SCOPE_LEVELS_BY_SNAPSHOT["country-snapshot"], ["NATIONAL"]);
  assert.deepEqual(
    SCOPE_LEVELS_BY_SNAPSHOT["hub-snapshot"],
    ["REGIONAL"],
    "a hub layer holds what applies to every one of its regions, so nothing narrower belongs there",
  );
  assert.deepEqual(
    SCOPE_LEVELS_BY_SNAPSHOT["regional-snapshot"],
    ["REGIONAL", "SUBREGIONAL", "LOCAL"],
    "only a region file can hold a provincial or municipal resource",
  );
});
