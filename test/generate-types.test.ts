import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { normalizeGeneratedNames, renderTypes, TARGETS } from "../scripts/generate-types.ts";
import { ROOT } from "../src/paths.ts";

test("committed types in src/types match the JSON Schemas", async () => {
  for (const { output, content } of await renderTypes()) {
    assert.equal(readFileSync(path.join(ROOT, output), "utf8"), content, `${output} is stale: run npm run types`);
  }
});

test("every schema has a generation target", () => {
  const schemas = readdirSync(path.join(ROOT, "schema"))
    .filter((name) => name.endsWith(".schema.json"))
    .map((name) => `schema/${name}`);
  const targeted = new Set<string>(TARGETS.map(({ schema }) => schema));
  for (const schema of schemas) {
    assert.ok(targeted.has(schema), `${schema} generates no types: add it to TARGETS in scripts/generate-types.ts`);
  }
});

test("a definition whose allOf only adds conditions becomes one interface, keeping its description", () => {
  const generated = [
    "/**",
    " * A public contact.",
    " */",
    "export type ContactPoint = ContactPoint1;",
    "export type Slug = string;",
    "export interface Resource {",
    "  contactPoints?: ContactPoint[];",
    "}",
    "export interface ContactPoint1 {",
    "  value: string;",
    "}",
    "",
  ].join("\n");
  assert.equal(
    normalizeGeneratedNames(generated),
    [
      "export type Slug = string;",
      "export interface Resource {",
      "  contactPoints?: ContactPoint[];",
      "}",
      "/**",
      " * A public contact.",
      " */",
      "export interface ContactPoint {",
      "  value: string;",
      "}",
      "",
    ].join("\n"),
  );
});

test("a snapshot keeps its intersection and its own half is named an identity", () => {
  const generated = ["export type EuSnapshot = SnapshotBase & EuSnapshot1;", "export interface EuSnapshot1 {", "}", ""].join("\n");
  assert.equal(
    normalizeGeneratedNames(generated),
    ["export type EuSnapshot = SnapshotBase & EuIdentity;", "export interface EuIdentity {", "}", ""].join("\n"),
  );
});
