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
  function search(term, filters = {}) {
    const key = JSON.stringify([term, filters]);
    if (!cache.has(key)) {
      if (cache.size > 128) cache.delete(cache.keys().next().value);
      // "any", not a bare list: a list asks for a record that carries every value at once.
      const any = Object.fromEntries(Object.entries(filters).map(([facet, values]) => [facet, { any: values }]));
      const pending = Promise.all(modules.map((pagefind) => pagefind.search(term || null, { filters: any }))).then((all) => ({
        results: all.flatMap((one) => one.results).toSorted((a, b) => b.score - a.score),
        counts: sum(all.map((one) => one.filters)),
      }));
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
  async function query(term, filters, chosen) {
    const [main, ...own] = await Promise.all([
      search(term, filters),
      ...chosen.map((facet) => {
        const rest = { ...filters };
        delete rest[facet];
        return search(term, rest).then((one) => [facet, one.counts[facet] ?? {}]);
      }),
    ]);
    return { results: main.results, counts: { ...main.counts, ...Object.fromEntries(own) } };
  }

  return { search, query, languages };
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
