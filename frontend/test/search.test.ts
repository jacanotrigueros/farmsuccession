import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

/**
 * What searching may and may not do.
 *
 * Two promises are worth a test rather than a sentence. A search never widens: from a territory it can
 * only reach what applies there, and that has to be true of the index itself, not of a rule somebody
 * remembers to apply. And whatever language a reader types in, the same records are reachable — a reader
 * in Galicia should find the European layer, which is written in English, as readily as a reader of the
 * European page finds it.
 *
 * The third is the one the other two rest on: the page is complete without the search engine. Everything
 * in scope is in the HTML, so a reader whose browser never runs the enhancement, or whose connection drops
 * the index, still gets the whole answer.
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
  resources: { id: string; name: string }[];
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

/** Where a territory's own page lives, which is also where its search page hangs. */
function at(snapshot: Snapshot): string {
  const iso = snapshot.country?.toLowerCase() ?? "";
  if (snapshot.schemaId === "eu-snapshot") return "/";
  if (snapshot.schemaId === "country-snapshot") return `/${iso}/`;
  return `/${iso}/${snapshot.hub ?? snapshot.region ?? ""}/`;
}

const pageAt = (route: string): string => readFileSync(path.join(DIST, route.slice(1), "search", "index.html"), "utf8");

test("every territory has a search page", () => {
  for (const snapshot of all) {
    assert.ok(existsSync(path.join(DIST, at(snapshot).slice(1), "search", "index.html")), `${at(snapshot)} has no search page`);
  }
});

/**
 * The scope is in the markup, so this can be read rather than run: a territory's page asks the index for
 * the layers it inherits and for no others.
 */
test("a search reaches what applies where the reader is, and nothing else", () => {
  const europe = all.find((snapshot) => snapshot.schemaId === "eu-snapshot");
  assert.ok(europe, "no European layer");

  for (const snapshot of all) {
    const scope = /data-scope="([^"]*)"/u.exec(pageAt(at(snapshot)))?.[1] ?? "";
    const asked: string[] = JSON.parse(scope.replaceAll("&quot;", '"').replaceAll("&#91;", "[").replaceAll("&#93;", "]"));

    if (snapshot.schemaId === "eu-snapshot") {
      assert.deepEqual(asked, [], "the European layer has nothing above it, so it searches the whole catalogue");
      continue;
    }

    const iso = snapshot.country?.toLowerCase() ?? "";
    assert.ok(asked.includes("/"), `${at(snapshot)} cannot reach the European layer, which applies everywhere`);
    assert.ok(asked.includes(`/${iso}/`), `${at(snapshot)} cannot reach its own country`);
    assert.ok(asked.includes(at(snapshot)), `${at(snapshot)} cannot reach its own records`);
    // Anything else it asks for may only be a grouping it belongs to, which is the one layer between a
    // country and a region.
    const strangers = asked.filter((layer) => layer !== "/" && layer !== `/${iso}/` && layer !== at(snapshot));
    for (const layer of strangers) {
      const grouping = all.find((other) => at(other) === layer);
      assert.ok(
        grouping?.schemaId === "hub-snapshot",
        `${at(snapshot)} asks for ${layer}, which it does not inherit. A search that widens shows somebody a scheme they cannot use.`,
      );
    }
  }
});

test("a search page is complete before any search runs", () => {
  for (const snapshot of all) {
    if (snapshot.schemaId === "eu-snapshot") continue; // The European page lists the whole catalogue; checked below.
    const html = pageAt(at(snapshot));
    for (const resource of snapshot.resources) {
      assert.ok(
        html.includes(`/resources/${resource.id}/`),
        `the search page of ${at(snapshot)} does not list ${resource.id}. Without the enhancement this list is the whole answer.`,
      );
    }
  }
});

test("the European search page lists every record of the edition", () => {
  const html = pageAt("/");
  for (const snapshot of all) {
    for (const resource of snapshot.resources) {
      assert.ok(html.includes(`/resources/${resource.id}/`), `the European search page does not list ${resource.id}`);
    }
  }
});

test("the search field is not shown until it can search", () => {
  for (const snapshot of all) {
    const form = /<form[^>]*\bid="search"[^>]*>/u.exec(pageAt(at(snapshot)))?.[0] ?? "";
    assert.match(
      form,
      /\bhidden\b/u,
      `${at(snapshot)} shows its search field in the markup. A field that cannot search yet is worse than no field: it answers a reader by doing nothing.`,
    );
  }
});

/**
 * Equal recall across languages, which is why each language gets an index of the whole catalogue rather
 * than of the pages written in it.
 */
test("every language of the catalogue can reach every record", () => {
  const languages = [...new Set(all.map((snapshot) => snapshot.metadata.language))].toSorted();
  const records = all.reduce((total, snapshot) => total + snapshot.resources.length, 0);
  assert.ok(languages.length > 0 && records > 0, "nothing to index: this check would pass without checking anything");

  for (const language of languages) {
    const entry = path.join(DIST, "pagefind", language, "pagefind-entry.json");
    assert.ok(existsSync(entry), `no search index for ${language}, which is a language this edition publishes`);
    const built = JSON.parse(readFileSync(entry, "utf8")) as { languages: Record<string, { page_count: number }> };
    const counted = Object.values(built.languages).reduce((total, { page_count }) => total + page_count, 0);
    assert.equal(
      counted,
      records,
      `the ${language} index holds ${counted} of the ${records} records. A reader typing in one language would reach fewer records than a reader typing in another.`,
    );
  }
});
