import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { SEARCH_SLUGS } from "../public/search-scope.js";

/**
 * An empty search is listed in catalogue order — the European layer, then country by country — and so is
 * the list a search page carries for readers without JavaScript (lib/catalogue-order.ts). Before, the
 * empty European search opened on nineteen Austrian records in German, the first bundle to load.
 *
 * Searching itself runs Pagefind in a browser, so what is checked here is what the index is built from:
 * every record page gives its position, the positions follow the list, and the name a reader types is
 * indexed where the official name differs (decisions/042).
 */
const DIST = path.join(import.meta.dirname, "..", "dist");
const page = (url: string) => readFileSync(path.join(DIST, url, "index.html"), "utf8");

const listedRecords = (html: string): string[] => {
  const start = html.indexOf("data-everything");
  assert.ok(start >= 0, "the search page no longer carries its list for readers without JavaScript");
  return [...html.slice(start).matchAll(/<a\b[^>]*href="(\/[^"]+\/)"[^>]*class="[^"]*after:absolute/gu)].map((match) => match[1]!);
};
const orderOf = (url: string): number => {
  const value = /data-pagefind-sort="order:(\d+)"/u.exec(page(url))?.[1];
  assert.ok(value !== undefined, `${url} gives the search index no catalogue position`);
  return Number(value);
};

test("the European search lists the European layer first, then country by country", () => {
  const records = listedRecords(page("search"));
  assert.ok(records.length > 600, `only ${records.length} records listed`);
  assert.match(records[0]!, /^\/resources\//u, "the list must open on the European layer");
  const countries = records.filter((url) => !url.startsWith("/resources/")).map((url) => url.split("/")[1]);
  const runs = countries.filter((country, index) => index === 0 || country !== countries[index - 1]);
  assert.deepEqual(runs, [...new Set(runs)], `each country's records must come together: ${runs.join(" ")}`);
});

test("every record gives the index its place, in the order the list shows", () => {
  const records = listedRecords(page("search"));
  const positions = records.map(orderOf);
  assert.deepEqual(
    positions,
    positions.toSorted((a, b) => a - b),
    "the index order and the listed order disagree",
  );
  assert.equal(new Set(positions).size, positions.length, "two records share one place in the catalogue order");
});

test("a record is indexed under the name readers type when it differs from the official one", () => {
  const html = decodeHTML(page("at/angebote/at-niederlassung-junglandwirte"));
  const indexed = /<span\b[^>]*data-pagefind-index-attrs="data-search-title"[^>]*>/u.exec(html)?.[0] ?? "";
  assert.match(indexed, /data-search-title="[^"]*Niederlassungsprämie/u, "the Austrian 75-01 record must be found as Niederlassungsprämie");
});

test("an empty national search opens on the country's own records, in its language, the European layer last", () => {
  let checked = 0;
  for (const [iso, slug] of Object.entries(SEARCH_SLUGS)) {
    if (iso === "EU") continue;
    const route = `${iso.toLowerCase()}/${slug}`;
    let html: string;
    try {
      html = page(route);
    } catch {
      continue;
    }
    checked += 1;
    const records = listedRecords(html);
    const european = records.findIndex((url) => url.startsWith("/resources/"));
    assert.ok(european !== 0, `${route}: a reader in ${iso} must not open on European records in English (Sol, review of 2.7.0)`);
    if (european > 0) {
      assert.ok(
        records.slice(european).every((url) => url.startsWith("/resources/")),
        `${route}: the European layer comes after the country`,
      );
    }
    const languages = JSON.parse(decodeHTML(/data-languages="([^"]*)"/u.exec(html)?.[1] ?? "[]")) as string[];
    if (languages.length > 1) assert.notEqual(languages[0], "en", `${route}: the country's bundle loads and lists first`);
  }
  assert.ok(checked >= 10, `only ${checked} national search pages were built`);
});
