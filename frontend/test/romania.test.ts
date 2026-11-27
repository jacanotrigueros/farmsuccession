import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadSnapshots } from "../../src/editions.ts";
import { snapshotLayer } from "../../src/layers.ts";
import { loadTerritories } from "../../src/territories.ts";
import { fakeCountryEdition, fakeEdition, fakeResource } from "../../test/fixtures.ts";
import { recordSlug, regionSlug, scopeFromPath, searchPath, stateFromQuery } from "../public/search-scope.js";
import { asLanguage, dateIn } from "../src/lib/language.ts";
import { publicSnapshots } from "../src/lib/publication.ts";
import { territorySearchNames } from "../src/lib/search-names.ts";
import { counted, words } from "../src/lib/words.ts";

test("an edition needs its country file and a domestic resource before offering the country", () => {
  const country = { file: "2026/countries/ro.json", data: fakeCountryEdition({ country: "RO", resources: [] }) };
  const leaf = { file: "2026/regions/ro/cluj.json", data: fakeEdition({ country: "RO", region: "cluj", resources: [] }) };
  const documented = { ...leaf, data: { ...leaf.data, resources: [fakeResource()] } };
  assert.deepEqual(publicSnapshots([country, leaf]), []);
  assert.deepEqual(publicSnapshots([documented]), []);
  assert.deepEqual(publicSnapshots([country, documented]), [country, documented]);
  assert.deepEqual(publicSnapshots([country, { ...documented, data: { ...documented.data, edition: "2027" } }]), []);
});

test("a search scope does not request a Pagefind bundle for an empty language", async () => {
  Object.assign(globalThis, { __REPOSITORY_ROOT__: fileURLToPath(new URL("../../", import.meta.url)) });
  const { bundleLanguages } = await import("../src/lib/catalogue-order.ts");
  const empty = fakeCountryEdition({ country: "RO", resources: [] });
  const withResources = { ...empty, resources: [fakeResource()] };
  const territory = (data: typeof empty) => ({ file: "2026/countries/ro.json", data, layer: snapshotLayer(data) });
  const lang = () => "ro";
  assert.deepEqual(bundleLanguages([territory(empty)], lang), []);
  assert.deepEqual(bundleLanguages([territory(empty), territory(withResources)], lang), ["ro"]);
});

test("Romanian routes, search scope and counted labels work with the shared interface", () => {
  assert.equal(searchPath("/", "RO"), "/ro/cauta/");
  assert.equal(regionSlug("RO"), "teritorii");
  assert.equal(recordSlug("RO"), "resurse");
  assert.deepEqual(scopeFromPath("/", "/ro/cauta/"), { country: "RO" });
  assert.deepEqual(stateFromQuery("?q=OJFIR+Cluj&country=NL&territory=RO/cluj&territory=NL/limburg", "RO"), {
    q: "OJFIR Cluj",
    selected: { territory: ["RO/cluj"] },
  });
  assert.equal(asLanguage("ro-RO"), "ro");
  assert.throws(() => asLanguage("sk"), /no words/u);
  assert.equal(dateIn("2026-11-26", "ro"), "26 noiembrie 2026");
  assert.deepEqual(
    [0, 1, 2, 20, 42].map((n) => counted(n, words("ro").record, "ro")),
    ["0 resurse", "1 resursă", "2 resurse", "20 de resurse", "42 de resurse"],
  );
});

test("Hungarian aliases apply to the three Romanian leaves without changing the page language", () => {
  const catalogue = loadTerritories();
  for (const [region, name] of [
    ["covasna", "Kovászna megye"],
    ["harghita", "Hargita megye"],
    ["mures", "Maros megye"],
  ] as const) {
    assert.deepEqual(territorySearchNames({ level: "REGION", country: "RO", region }, catalogue), [name]);
  }
  assert.deepEqual(territorySearchNames({ level: "REGION", country: "RO", region: "cluj" }, catalogue), []);
  assert.deepEqual(territorySearchNames({ level: "COUNTRY", country: "RO" }, catalogue), []);
});

test("prepared countries stay out of public routes, selectors and search filters", () => {
  const { snapshots } = loadSnapshots({});
  const current = snapshots
    .map(({ data }) => data.edition)
    .toSorted()
    .at(-1);
  const thisYear = snapshots.filter(({ data }) => data.edition === current);
  const withLocalResources = new Set(
    thisYear.flatMap(({ data }) => (data.schemaId !== "eu-snapshot" && data.resources.length > 0 ? [data.country] : [])),
  );
  const dist = new URL("../dist/", import.meta.url);
  const read = (path: string) => readFileSync(new URL(path, dist), "utf8");
  const excluded = thisYear.filter(({ data }) => data.schemaId === "country-snapshot" && !withLocalResources.has(data.country));
  for (const { data } of excluded) {
    if (data.schemaId !== "country-snapshot") continue;
    const prefix = `${data.country.toLowerCase()}/`;
    assert.equal(existsSync(new URL(prefix, dist)), false, prefix);
    for (const page of ["index.html", "eu/index.html", "search/index.html", "sitemap.xml"]) {
      assert.ok(!read(page).includes(`/${prefix}`), `${page}: exposed a prepared country`);
    }
    assert.ok(!read("search/index.html").includes(`value="${data.country}"`), "country facet exposed a prepared country");
    assert.ok(!read("search/index.html").includes(`value="${data.country}/`), "territory facet exposed a prepared country");
    assert.ok(!read("pagefind/index.json").includes(`"${data.country}"`), "manifest exposed a prepared country");
  }
});
