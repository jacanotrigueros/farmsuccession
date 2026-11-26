import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mock, test } from "node:test";

import { applyKey, rankedPeriods } from "../public/apply.js";

const dist = new URL("../dist/", import.meta.url);
const fetchNetwork = globalThis.fetch;
mock.method(globalThis, "fetch", async (input: URL | Request | string, init?: RequestInit) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.protocol !== "file:") return fetchNetwork(input, init);
  const type = url.pathname.endsWith(".wasm") ? "application/wasm" : "application/octet-stream";
  return new Response(await readFile(url), { headers: { "Content-Type": type } });
});

const moduleUrl = new URL("search-engine.js", dist);
const { createEngine } = await import(moduleUrl.href);
const engine = await createEngine({ bundles: new URL("pagefind/", dist).href, languages: ["en", "de", "es", "fr", "it", "nl", "pt"] });

type Fragment = { raw_url: string; meta: Record<string, string>; filters: { documentaryLayer: string[] } };
type Hit = { data(): Promise<Fragment> };

test("the search index gives a result each period's dated source and the record's own answer", async () => {
  const { results } = await engine.query("", { territory: ["ES/aragon"], kind: ["FINANCIAL_SUPPORT"] }, []);
  const fragments = (await Promise.all(results.map((hit: Hit) => hit.data()))) as Fragment[];
  const aragon = fragments.find(({ raw_url }) => raw_url.endsWith("/aragon-establecimiento-jovenes-agricultores/"));
  assert.ok(aragon?.meta.periods, "an operating grant card needs the call that determines whether a reader can apply");
  const periods = JSON.parse(aragon.meta.periods) as Parameters<typeof rankedPeriods>[0];
  assert.equal(periods.length, 1, "a card must carry each documented call once");
  assert.equal(periods[0]?.checked, "2026-11-25", "a call must retain its own source's reading date");
  assert.equal(periods[0]?.call.name, "Convocatoria 2026", "a named call must stay identifiable on the result card");
  assert.equal(
    rankedPeriods(periods, "2026-11-26")[0]?.key,
    "closed",
    "the card must answer about the call rather than the grant's operating status",
  );

  const closes = { name: "A documented call", state: "OPEN", closes: "2026-11-26" };
  for (const day of ["2026-11-26", "2026-11-27"]) {
    assert.equal(
      rankedPeriods([{ call: closes, checked: "2026-11-25" }], day)[0]?.key,
      applyKey(closes, "ACTIVE", day),
      "result cards and detail pages must give the same answer on both sides of a closing date",
    );
  }
});

test("a no-text territory selection puts native and inherited scopes in order of proximity", async () => {
  const { results } = await engine.query("", { territory: ["ES/gran-canaria"] }, ["territory"]);
  const fragments = (await Promise.all(results.map((hit: Hit) => hit.data()))) as Fragment[];
  const layers = [...new Set(fragments.flatMap(({ filters }) => filters.documentaryLayer))];
  assert.deepEqual(
    layers,
    ["REGION", "HUB", "COUNTRY", "EU"],
    "a reader who chose an island needs island and grouping records before wider records",
  );
  const unscoped = await engine.query("", {}, []);
  assert.match((await unscoped.results[0].data()).raw_url, /^\/resources\//u, "the European default must still open with the EU layer");
});

test("an unknown word with matches only on untyped initials has no results or facet counts", async () => {
  const unknown = await engine.query("zzfarmnoresultzz", {}, []);
  assert.deepEqual(
    unknown,
    { results: [], counts: {} },
    "an initial that the reader did not type must not create results or invite filtering",
  );
  const valid = await engine.query("safer bretagne", {}, []);
  assert.match(
    (await valid.results[0].data()).raw_url,
    /\/bretagne-safer-bretagne\/$/u,
    "valid queries must keep Pagefind's matching and ranking",
  );
});

test("Niederlassungsprämie retains the Austrian grant and discards hits matching only an untyped initial", async () => {
  const { results } = await engine.query("Niederlassungsprämie", {}, []);
  const fragments = (await Promise.all(results.map((hit: Hit) => hit.data()))) as Fragment[];
  const urls = fragments.map(({ raw_url }) => raw_url);
  assert.ok(
    urls.includes("/at/angebote/at-niederlassung-junglandwirte/"),
    "a match through the grant's indexed search name must survive the check",
  );
  assert.ok(
    !urls.includes("/it/risorse/puglia-banca-terra-quadro-normativo/"),
    "a genuine hit elsewhere must not let a separate record matched only by 'n.' surface",
  );
});

test("filtered results keep the engine's scores and order and count only the remaining matches", async () => {
  const hit = (id: string, score: number, raw_content: string, country: string) => ({
    id,
    score,
    words: [0],
    data: async () => ({ raw_content, filters: { country: [country, country] } }),
  });
  const initial = hit("untyped", 10, "N.", "IT");
  const ordinary = hit("word", 5, "Niederlassungsprämie.", "AT");
  const stem = hit("stem", 5, "Niederlassung", "DE");
  const mockEngine = await createEngine({
    bundles: "/pagefind/",
    languages: ["de"],
    importModule: async () => ({
      options() {},
      init() {},
      filters() {},
      search: () => ({ results: [initial, ordinary, stem], filters: { country: { IT: 1, AT: 1, DE: 1 } } }),
    }),
  });
  assert.deepEqual(
    await mockEngine.query("Niederlassungsprämie", {}, []),
    { results: [ordinary, stem], counts: { country: { AT: 1, DE: 1 } } },
    "rejecting an incidental initial must preserve tied scores and omit that hit from the facet totals",
  );
  assert.deepEqual(
    (await mockEngine.query("N. Niederlassungsprämie", {}, [])).results,
    [initial, ordinary, stem],
    "an initial explicitly typed as a word must remain eligible",
  );
});

test("complete written matches precede partial hits without changing scores or dropping results", async () => {
  const hit = (id: string, score: number, raw_content: string) => ({
    id,
    score,
    words: [0],
    data: async () => ({ raw_content, filters: {} }),
  });
  const partial = hit("partial", 10, "Bretagne");
  const complete = hit("complete", 5, "SAFER, Brétagne");
  const another = hit("another", 5, "Bretagne SAFER");
  const prefix = hit("prefix", 4, "Bretagne SAFERs");
  const mockEngine = await createEngine({
    bundles: "/pagefind/",
    languages: ["fr"],
    importModule: async () => ({
      options() {},
      init() {},
      filters() {},
      search: () => ({ results: [partial, complete, another, prefix], filters: {} }),
    }),
  });
  assert.deepEqual(
    (await mockEngine.query("safer bretagne", {}, [])).results,
    [complete, another, partial, prefix],
    "all written words must come first; keep Pagefind's order, scores and partial hits within their groups",
  );
  assert.deepEqual(
    (await mockEngine.query("bretagne", {}, [])).results,
    [partial, complete, another, prefix],
    "a single written word must keep the existing Pagefind order",
  );
});
