import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

type Node = {
  description?: string;
  $ref?: string;
  const?: unknown;
  enum?: unknown[];
  type?: string;
  properties?: Record<string, Node>;
  items?: Node;
  oneOf?: Node[];
  allOf?: Node[];
  $defs?: Record<string, Node>;
};

function schemaFiles(): string[] {
  return readdirSync(path.join(ROOT, "schema")).filter((name) => name.endsWith(".schema.json"));
}

function read(name: string): Node {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- schema files are repository content, not external input
  return JSON.parse(readFileSync(path.join(ROOT, "schema", name), "utf8")) as Node;
}

/**
 * A property earns an exemption only when its meaning is already written down somewhere a reader
 * will see it: a `const` is its own explanation, and a `$ref` carries the description of the
 * definition it points at.
 */
function undescribed(node: Node | undefined, trail: string, found: string[] = []): string[] {
  if (!node || typeof node !== "object") return found;
  for (const [name, child] of Object.entries(node.properties ?? {})) {
    const exempt = child.const !== undefined || child.$ref !== undefined;
    if (!child.description && !exempt) found.push(`${trail}.${name}`);
    undescribed(child, `${trail}.${name}`, found);
    undescribed(child.items, `${trail}.${name}[]`, found);
  }
  for (const [name, def] of Object.entries(node.$defs ?? {})) {
    undescribed(def, name, found);
    undescribed(def.items, `${name}[]`, found);
    for (const [i, branch] of (def.oneOf ?? []).entries()) undescribed(branch, `${name}|${branch.type ?? i}`, found);
  }
  for (const [i, branch] of (node.oneOf ?? []).entries()) undescribed(branch, `${trail}|${i}`, found);
  return found;
}

test("every schema property says what it represents", () => {
  for (const name of schemaFiles()) {
    const missing = undescribed(read(name), "(root)");
    assert.deepEqual(
      missing,
      [],
      `${name}: these properties carry no description, so nobody filling the data can know what they mean: ${missing.join(", ")}`,
    );
  }
});

test("no schema sets a default, which would make a missing value look like a stated one", () => {
  for (const name of schemaFiles()) {
    const raw = readFileSync(path.join(ROOT, "schema", name), "utf8");
    assert.ok(
      !/"default"\s*:/.test(raw),
      `${name} sets a default. In a documentary schema a default is indistinguishable from a fact somebody read on a page.`,
    );
  }
});

test("no schema sets maxItems, which the type generator expands into a union of every tuple length", () => {
  for (const name of schemaFiles()) {
    const raw = readFileSync(path.join(ROOT, "schema", name), "utf8");
    assert.ok(
      !/"maxItems"\s*:/.test(raw),
      `${name} sets maxItems. json-schema-to-typescript turns minItems plus maxItems into [T] | [T, T] | … up to the bound, which made Source a twenty-way union. Bound the contents with maxLength instead; minItems on its own yields the useful [T, ...T[]].`,
    );
  }
});

test("every free-text field is bounded, so one record cannot break a page", () => {
  const unbounded: string[] = [];
  const walk = (node: Node | undefined, trail: string): void => {
    if (!node || typeof node !== "object") return;
    if (node.type === "string" && node.enum === undefined && node.const === undefined) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- reading optional numeric keywords off a schema node
      const n = node as { maxLength?: number; pattern?: string; format?: string };
      if (n.maxLength === undefined && n.pattern === undefined && n.format === undefined) unbounded.push(trail);
    }
    for (const [name, child] of Object.entries(node.properties ?? {})) walk(child, `${trail}.${name}`);
    walk(node.items, `${trail}[]`);
    for (const [name, def] of Object.entries(node.$defs ?? {})) walk(def, name);
    for (const [i, branch] of (node.oneOf ?? []).entries()) walk(branch, `${trail}|${i}`);
    for (const [i, branch] of (node.allOf ?? []).entries()) walk(branch, `${trail}&${i}`);
  };
  for (const name of schemaFiles()) walk(read(name), name);
  assert.deepEqual(unbounded, [], `these free-text fields have no maxLength, pattern or format: ${unbounded.join(", ")}`);
});
