import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { searchPath } from "../public/search-scope.js";

const DIST = path.join(import.meta.dirname, "..", "dist");
function pages(dir: string): { url: string; html: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? pages(file)
      : entry.name === "index.html"
        ? [{ url: `/${path.relative(DIST, dir).split(path.sep).join("/")}/`, html: readFileSync(file, "utf8") }]
        : [];
  });
}
const built = pages(DIST);
const records = built.filter(({ html }) => html.includes("data-pagefind-body"));
const europe = built.find(({ url }) => url === "/search/")!;
const countries = [
  ...new Set(records.flatMap(({ html }) => [...html.matchAll(/data-pagefind-meta="country:([^"]+)"/gu)].map((m) => m[1]!))),
].filter((c) => c !== "EU");

test("every country facet returns exactly its national search, including inherited records", () => {
  assert.ok(countries.length > 0 && records.length > 0, "no countries or records: a cumulative-facet check would prove nothing");
  for (const country of countries) {
    const national = built.find(({ url }) => url === searchPath("/", country));
    assert.ok(national, `${country}: no national search to compare with`);
    const listed = records
      .filter(({ url }) => national.html.includes(`href="${url}"`))
      .map(({ url }) => url)
      .toSorted();
    const indexed = records
      .filter(({ html }) => html.includes(`data-pagefind-filter="country:${country}"`))
      .map(({ url }) => url)
      .toSorted();
    assert.deepEqual(
      indexed,
      listed,
      `${country}: selecting a country must retain its European records, just as its national search does (decision 001)`,
    );
    const label = [...europe.html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gu)].find((m) =>
      m[1]?.includes(`name="country" value="${country}"`),
    )?.[1];
    assert.ok(label, `${country}: the country facet is missing`);
    const count = /data-count[^>]*>\s*(\d+)/u.exec(decodeHTML(label))?.[1];
    assert.equal(Number(count), listed.length, `${country}: the initial facet count must count inherited records too`);
  }
});

test("an inherited record keeps one indexed page and its original country metadata", () => {
  const shared = records.filter(({ html }) => html.includes('data-pagefind-meta="country:EU"'));
  assert.ok(shared.length > 0, "no shared records: this regression would prove nothing");
  assert.equal(new Set(records.map(({ url }) => url)).size, records.length, "country facets must not duplicate record pages");
  for (const record of shared) {
    assert.ok(
      record.html.includes('data-pagefind-filter="country:EU"'),
      `${record.url}: widening membership must not erase its European origin`,
    );
  }
});
