/**
 * Searching several language bundles as one index.
 *
 * One corpus, one bundle per language, the country as a filter. A scope loads the bundles of the languages
 * that are actually inside it and queries them together; every language keeps its own stemmer, which is
 * the whole reason the bundles are separate.
 *
 * Three things here are forced by how Pagefind 1.5.2 works, each measured rather than assumed:
 *
 *  - **Each bundle is loaded through its own import of its own `pagefind.js`.** The glue that wasm-bindgen
 *    generates keeps one WebAssembly instance per module and reuses it, so two languages loaded through
 *    one module quietly share the first one's stemmer — or, with enough languages, corrupt its memory.
 *  - **Never merge indexes across languages.** A merged index is searched with the main instance's module,
 *    which is documented upstream, and which means the wrong stemmer for every language but one.
 *  - **`filters()` is called once per bundle.** A search only downloads the filter data of the facets it
 *    was asked about, so without that call the counts of every other facet are simply missing — which is
 *    what once made a faceted search show zeroes next to options that had results.
 *
 * No DOM in here: the same functions run in the browser and in a test.
 */

import { localToday, rankedPeriods } from "./apply.js";

const NEAREST_FIRST = ["REGION", "HUB", "COUNTRY", "EU"];

const wordsIn = (text) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
const foldedWords = (text) => wordsIn(text.normalize("NFD").replace(/\p{M}/gu, ""));

/**
 * Pagefind's prefix fallback can match an untyped initial, such as "N." for "Niederlassungsprämie".
 * Check each hit's matched positions in its original fragment. Keep stemmed words and typed initials.
 */
async function documentedResults(term, results, openOn) {
  const typed = new Set(wordsIn(term));
  const queryWords = new Set(foldedWords(term));
  const matched = [];
  // The engine must inspect every hit before counting results. Limit the fragment reads in flight.
  const batchSize = 20;
  for (let start = 0; start < results.length; start += batchSize) {
    const batch = await Promise.all(
      results.slice(start, start + batchSize).map(async (hit) => {
        const { raw_content: content, filters, meta } = await hit.data();
        const indexed = content.includes("\u200B") ? content.split("\u200B") : content.split(/\s+/u);
        const matchesTerm = !term || hit.words.some((at) => wordsIn(indexed[at] ?? "").some((word) => word.length > 1 || typed.has(word)));
        const matchesPeriod = !openOn || rankedPeriods(JSON.parse(meta?.periods ?? "[]"), openOn).some(({ key }) => key === "openByDates");
        const hasMatch = matchesTerm && matchesPeriod;
        const wordsInRecord = hasMatch && queryWords.size > 1 ? new Set(foldedWords(content)) : null;
        const complete = wordsInRecord !== null && [...queryWords].every((word) => wordsInRecord.has(word));
        return { hit, filters, hasMatch, complete };
      }),
    );
    matched.push(...batch.filter(({ hasMatch }) => hasMatch));
  }
  return matched;
}

/**
 * @param {{ bundles: string, languages: string[], importModule?: (url: string) => Promise<any> }} options
 */
export async function createEngine({ bundles, languages, importModule = (url) => import(url) }) {
  const folder = (language) => `${bundles}${language}/`;

  const modules = await Promise.all(
    languages.map(async (language) => {
      const pagefind = await importModule(`${folder(language)}pagefind.js`);
      await pagefind.options({ basePath: folder(language) });
      await pagefind.init();
      await pagefind.filters();
      return pagefind;
    }),
  );

  const cache = new Map();

  /** One query across every bundle of the scope, merged by score the way Pagefind merges its own indexes. */
  function search(term, filters = {}, today = localToday()) {
    const { openCalls, ...indexedFilters } = filters;
    const openOn = openCalls?.includes("OPEN") ? today : undefined;
    const key = JSON.stringify([term, filters, openOn]);
    if (!cache.has(key)) {
      if (cache.size > 128) cache.delete(cache.keys().next().value);
      // "any", not a bare list: a list asks for a record that carries every value at once.
      // The index only identifies candidates with a closing date. It never freezes an opening state.
      if (openOn) indexedFilters.datedCall = ["YES"];
      const any = Object.fromEntries(Object.entries(indexedFilters).map(([facet, values]) => [facet, { any: values }]));
      // With no words there is no relevance to rank by: every bundle lists its records in catalogue order and
      // the bundles follow each other in the scope's order, the European layer's first — the same order as
      // the list the page carries for readers without JavaScript (lib/catalogue-order.ts).
      const options = term ? { filters: any } : { filters: any, sort: { order: "asc" } };
      const pending = Promise.all(modules.map((pagefind) => pagefind.search(term || null, options))).then(async (all) => {
        const results = all.flatMap((one) => one.results);
        const counts = () => sum(all.map((one) => one.filters));
        if (!term && !openOn) return { results, counts: counts() };

        const matched = await documentedResults(term, results, openOn);
        if (matched.length === 0) return { results: [], counts: {} };
        return {
          results: (term ? matched.toSorted((a, b) => Number(b.complete) - Number(a.complete) || b.hit.score - a.hit.score) : matched).map(
            ({ hit }) => hit,
          ),
          counts: matched.length === results.length ? counts() : countResults(matched),
        };
      });
      // A failed search is not remembered: asking again after a dropped connection has to try again.
      pending.catch(() => cache.delete(key));
      cache.set(key, pending);
    }
    return cache.get(key);
  }

  /**
   * The results, and counts a reader can act on.
   *
   * Inside one facet the options are alternatives, so the count of a facet the reader has already chosen
   * from has to come from a query without that choice — otherwise every unchosen option in it reads zero.
   * That is one extra query per chosen facet, in parallel, and the cache usually answers them.
   */
  async function query(term, filters, chosen, today = localToday()) {
    const mainQuery =
      !term && filters.territory?.length
        ? Promise.all(NEAREST_FIRST.map((layer) => search(term, { ...filters, documentaryLayer: [layer] }, today))).then((layers) => ({
            results: layers.flatMap(({ results }) => results),
            counts: sum(layers.map(({ counts }) => counts)),
          }))
        : search(term, filters, today);
    const [main, ...own] = await Promise.all([
      mainQuery,
      ...chosen
        .filter((facet) => facet !== "openCalls")
        .map((facet) => {
          const rest = { ...filters };
          delete rest[facet];
          return search(term, rest, today).then((one) => [facet, one.counts[facet] ?? {}]);
        }),
    ]);
    return { results: main.results, counts: { ...main.counts, ...Object.fromEntries(own) } };
  }

  return { search, query, languages };
}

/** A discarded result must not inflate a facet. Each record contributes once per distinct value. */
function countResults(results) {
  const total = {};
  for (const { filters } of results) {
    for (const [facet, values] of Object.entries(filters)) {
      total[facet] ??= {};
      for (const value of new Set(values)) total[facet][value] = (total[facet][value] ?? 0) + 1;
    }
  }
  return total;
}

function sum(all) {
  const total = {};
  for (const counts of all) {
    for (const [facet, values] of Object.entries(counts ?? {})) {
      for (const [value, howMany] of Object.entries(values)) {
        total[facet] ??= {};
        total[facet][value] = (total[facet][value] ?? 0) + howMany;
      }
    }
  }
  return total;
}
