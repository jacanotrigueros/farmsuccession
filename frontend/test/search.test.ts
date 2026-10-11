import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  recordSlug,
  effectiveFilters,
  facetsOf,
  queryFromState,
  regionSlug,
  scopeFromPath,
  searchPath,
  stateFromQuery,
  territorySearchUrl,
} from "../public/search-scope.js";

/**
 * What searching may and may not do.
 *
 * Three promises are worth a test rather than a sentence. **A search cannot widen**: the route fixes the
 * scope and the query string can only narrow it, so no link — however it was built, edited or shared —
 * shows a reader a scheme that does not apply where they are. **Every language reaches every record**: the
 * corpus is published as one bundle per language and a scope loads all the bundles it contains, so the
 * European layer, written in English, is as reachable from a Spanish page as from an English one. And the
 * page is **complete before the search engine is**: everything in scope is in the HTML.
 *
 * The first two are checked here over the built site and the pure contract; the engine itself is exercised
 * in a browser, because that is the only place its WebAssembly runs.
 */
const DIST = path.join(import.meta.dirname, "..", "dist");
const REPOSITORY = path.join(import.meta.dirname, "..", "..");
const EDITIONS = path.join(REPOSITORY, "data", "editions");

type Snapshot = {
  schemaId: string;
  country?: string;
  region?: string;
  hub?: string;
  metadata: { language: string };
  resources: { id: string }[];
};

const edition = readdirSync(EDITIONS).toSorted().toReversed()[0];
assert.ok(edition, "no edition to search");

function snapshots(dir: string): Snapshot[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return snapshots(full);
    return entry.name.endsWith(".json") ? [JSON.parse(readFileSync(full, "utf8")) as Snapshot] : [];
  });
}

const all = snapshots(path.join(EDITIONS, edition));
const countries = [...new Set(all.flatMap((snapshot) => (snapshot.country ? [snapshot.country] : [])))];
const page = (route: string): string => readFileSync(path.join(DIST, route.slice(1), "index.html"), "utf8");

test("every scope has a search page, at the word its own language uses", () => {
  assert.ok(existsSync(path.join(DIST, "search", "index.html")), "no European search page");
  for (const country of countries) {
    const route = searchPath("/", country);
    assert.ok(existsSync(path.join(DIST, route.slice(1), "index.html")), `${country} has no search page at ${route}`);
    assert.equal(scopeFromPath("/", route)?.country, country, `${route} does not read back as the scope of ${country}`);
  }
});

test("a national search is fixed to its country, and a European one is not", () => {
  for (const country of countries) {
    const html = page(searchPath("/", country));
    assert.match(html, /data-inherits="\[&quot;EU&quot;\]"/u, `${country} does not inherit the European layer`);
  }
  assert.match(page("/search/"), /data-inherits="\[\]"/u, "the European layer inherits nothing, because nothing is above it");
});

test("the query string can narrow a search and never widen it", () => {
  // A link that tries to leave the country it was written for: the country is dropped, and so is a
  // territory belonging to somewhere else.
  const asked = stateFromQuery("?q=tierras&country=IT&territory=IT/toscana&territory=ES/galicia&kind=LAND_BANK", "ES");
  assert.equal(asked.q, "tierras");
  assert.deepEqual(asked.selected.territory, ["ES/galicia"], "a territory of another country is not a territory of this one");
  assert.equal(asked.selected.country, undefined, "inside a country, country is not a facet to be chosen");
  assert.deepEqual(asked.selected.kind, ["LAND_BANK"]);

  const filters = effectiveFilters({ country: ["IT"], kind: ["LAND_BANK"] }, "ES", ["EU"]);
  assert.deepEqual(filters.country, ["ES", "EU"], "the scope is written last, so nothing a reader sends can replace it");

  assert.ok(!facetsOf("ES").includes("country"), "a national page does not offer the facet that would let it leave");
  assert.ok(facetsOf(undefined).includes("country"), "the European page does offer it, because there it is a real choice");
  assert.equal(queryFromState({ q: "x", selected: { country: ["IT"] } }, "ES"), "?q=x", "what the route fixes never goes in the URL");
});

test("a territory sends a reader to its own country's search, with itself already chosen", () => {
  assert.equal(territorySearchUrl("/", "ES", "galicia"), "/es/buscar/?territory=ES%2Fgalicia");
  for (const snapshot of all.filter((one) => one.schemaId === "regional-snapshot")) {
    const iso = snapshot.country ?? "";
    const html = page(`/${iso.toLowerCase()}/${regionSlug(iso)}/${snapshot.region}/`);
    assert.ok(
      html.includes(`value="${iso}/${snapshot.region}"`),
      `${snapshot.region} does not pin itself when it sends a reader to search, so the search would answer for the whole country`,
    );
    assert.ok(html.includes(`action="${searchPath("/", iso)}"`), `${snapshot.region} sends a reader somewhere other than its own country`);
  }
});

/** The address of a record, which is under the country that recorded it. */
const recordHref = (resource: { id: string }, snapshot: { country?: string }): string =>
  snapshot.country ? `/${snapshot.country.toLowerCase()}/${recordSlug(snapshot.country)}/${resource.id}/` : `/resources/${resource.id}/`;

test("a search page is complete before any search runs", () => {
  const european = page("/search/");
  for (const snapshot of all) {
    for (const resource of snapshot.resources) {
      assert.ok(european.includes(recordHref(resource, snapshot)), `the European search page does not list ${resource.id}`);
    }
  }

  for (const country of countries) {
    const html = page(searchPath("/", country));
    const inside = all.filter((snapshot) => snapshot.country === country || snapshot.schemaId === "eu-snapshot");
    for (const snapshot of inside) {
      for (const resource of snapshot.resources) {
        assert.ok(
          html.includes(recordHref(resource, snapshot)),
          `the ${country} search page does not list ${resource.id}. Without the index this list is the whole answer.`,
        );
      }
    }
    const elsewhere = all.filter((snapshot) => snapshot.country && snapshot.country !== country);
    for (const snapshot of elsewhere) {
      for (const resource of snapshot.resources) {
        assert.ok(
          !html.includes(recordHref(resource, snapshot)),
          `the ${country} search page lists ${resource.id}, which does not apply there`,
        );
      }
    }
  }
});

test("the search field is not shown until it can search", () => {
  for (const route of ["/search/", ...countries.map((country) => searchPath("/", country))]) {
    const form = /<form[^>]*\bid="search"[^>]*>/u.exec(page(route))?.[0] ?? "";
    assert.match(
      form,
      /\bhidden\b/u,
      `${route} shows its search field in the markup. A field that cannot search yet answers a reader by doing nothing.`,
    );
  }
});

/**
 * Equal recall across languages. Each language is its own bundle, with its own stemmer, and the manifest
 * is what says which languages a scope has to load — so it has to account for every record.
 */
test("every record is in exactly one language bundle, and the manifest says which", () => {
  const manifest = JSON.parse(readFileSync(path.join(DIST, "pagefind", "index.json"), "utf8")) as {
    languages: Record<string, { pages: number; countries: Record<string, number> }>;
  };
  const languages = Object.entries(manifest.languages);
  assert.ok(languages.length > 0, "no language bundles: this check would pass without checking anything");

  const records = all.reduce((total, snapshot) => total + snapshot.resources.length, 0);
  const indexed = languages.reduce((total, [, bundle]) => total + bundle.pages, 0);
  assert.equal(indexed, records, "the bundles together hold fewer records than the edition does");

  for (const [language, bundle] of languages) {
    const entry = JSON.parse(readFileSync(path.join(DIST, "pagefind", language, "pagefind-entry.json"), "utf8")) as {
      languages: Record<string, { page_count: number }>;
    };
    const built = Object.values(entry.languages).reduce((total, { page_count }) => total + page_count, 0);
    assert.equal(built, bundle.pages, `the ${language} bundle does not hold what the manifest promises`);
    assert.deepEqual(
      Object.keys(entry.languages),
      [language],
      `the ${language} bundle holds more than one language, which means one stemmer analysing the other's words`,
    );
  }

  // Every language a record is written in has a bundle, including the one the European layer uses.
  for (const snapshot of all) {
    assert.ok(
      manifest.languages[snapshot.metadata.language],
      `nothing indexes ${snapshot.metadata.language}, so its records cannot be found by typing in it`,
    );
  }
});
