import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

/**
 * A record that lists the same call twice shows a reader two "you can apply" panels that cannot be told
 * apart, as the Pays de la Loire DJA did in 2.0.1 (one call copied, name, state and source identical).
 * Two calls of one record are two rounds or two windows, so they must differ in something a reader can see.
 */
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : full.endsWith(".json") ? [full] : [];
  });

type Resource = { id: string; calls?: Record<string, unknown>[] };

const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, inner: unknown) =>
    inner && typeof inner === "object" && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner as Record<string, unknown>).toSorted(([a], [b]) => a.localeCompare(b)))
      : inner,
  );

test("a record lists each of its calls once", () => {
  const records = files(path.join(ROOT, "data", "editions")).flatMap(
    (file) => (JSON.parse(readFileSync(file, "utf8")) as { resources?: Resource[] }).resources ?? [],
  );
  const withCalls = records.filter(({ calls }) => (calls?.length ?? 0) > 1);
  assert.ok(withCalls.length > 0, "no record has more than one call, so this check proved nothing");
  const repeated = withCalls.filter(({ calls = [] }) => new Set(calls.map(canonical)).size !== calls.length);
  assert.deepEqual(
    repeated.map(({ id }) => id),
    [],
    "the same call is listed twice: remove the copy, or say what makes the two rounds different",
  );
});
