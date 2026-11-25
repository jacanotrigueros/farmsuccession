import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

/**
 * "Free" is a claim like any other, so it needs the source's words. Open web content never says it is
 * free: a page that asks for no login or payment shows only that nothing was asked of whoever looked,
 * which is not a statement anybody can quote. The EU records and Spain's had drifted apart on this — three
 * EU pages were FREE on that kind of observation while a Spanish course needed "¿Son gratuitos? Sí" — and
 * the founder settled it on 25 Nov 2026: FREE needs a quote, in any of the languages the sources are in.
 */
const SAYS_FREE =
  /gratu[iíï]t|gratis|sin coste|sin costo|sin cargo|no requiere el pago|precio público: no|sense cost|kostenlos|kostenfrei|unentgeltlich|ohne kosten|gebührenfrei|free of charge|\bfree\b|at no cost|no cost|kosteloo?s|kosteloze|zonder kosten|senza costi|nessun costo|sem custos|isent[oa] de|sans frais|aucun frais|pas de frais/iu;

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : full.endsWith(".json") ? [full] : [];
  });

type Resource = { id: string; accessCostType?: string; sources: { quotes: string[] }[] };

test("a record marked free quotes its source saying so", () => {
  const free = files(path.join(ROOT, "data", "editions")).flatMap((file) =>
    ((JSON.parse(readFileSync(file, "utf8")) as { resources?: Resource[] }).resources ?? []).filter(
      (resource) => resource.accessCostType === "FREE",
    ),
  );
  assert.ok(free.length > 0, "no record is marked FREE, so this check proved nothing");
  const unquoted = free.filter((resource) => !resource.sources.some(({ quotes }) => quotes.some((quote) => SAYS_FREE.test(quote))));
  assert.deepEqual(
    unquoted.map(({ id }) => id),
    [],
    "marked FREE with no quote that says so: quote the source, or record ACCESS_COST as not published",
  );
});
