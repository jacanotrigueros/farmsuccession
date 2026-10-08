/**
 * What a search covers, and how a search is written in a URL.
 *
 * Pure functions: no DOM, no index, nothing that only exists in a browser. The same file is read by the
 * pages when they are built, by the script in the reader's browser, and by the tests — because a contract
 * that is implemented twice is a contract that disagrees with itself the first time somebody changes one
 * of them.
 *
 *   /search/                  Europe: everything published
 *   /{cc}/{slug}/             One country and the layers it inherits, with the slug in that country's language
 *   /{cc}/{regions}/{slug}/   One territory inside that country, under a segment of its own
 *
 * **The route fixes the scope and the query string can only narrow it.** On a national route a `country`
 * parameter is ignored and a territory of another country is dropped, so no link, however it was built or
 * edited, can show a reader a scheme that does not apply where they are.
 *
 * Every value in a URL is a code from the schema, never a translated word: a shared link has to survive
 * being opened in another language.
 */

/** The word for searching, in the language of each country. Europe is the site's own layer, in English. */
/** @typedef {Record<string, string[]>} Selected */
/** @typedef {{ q?: string, selected?: Selected }} State */

/** @type {Record<string, string>} */
export const SEARCH_SLUGS = { EU: "search", ES: "buscar", FR: "rechercher", IT: "cerca", PT: "pesquisar", DE: "suchen" };

/**
 * The segment every territory inside a country sits under, in that country's language.
 *
 * It exists to keep two namespaces apart. Without it a region and a page of the site compete for the
 * same shape — `/es/proyecto/` is the page about the project, and the day a region is called that, the
 * region takes it. A country's territories are an open list the catalogue can grow; the site's own pages
 * are a closed one, and the open list is the one that has to be fenced.
 */
/** @type {Record<string, string>} */
export const REGION_SLUGS = { ES: "regiones", FR: "regions", IT: "regioni", PT: "regioes", DE: "regionen" };

/** @param {string} country */
export const regionSlug = (country) => REGION_SLUGS[country] ?? "regions";

/**
 * The facets a reader can choose from, as the schema's own codes. Country is not one of them inside a
 * country: there the route already fixed it, and offering it would be offering to leave.
 */
export const FACETS = ["kind", "status", "scope", "profile", "territory", "country"];

/** @param {string | null | undefined} scopeCountry */
export const facetsOf = (scopeCountry) => FACETS.filter((facet) => !(scopeCountry && facet === "country"));

/** Where a scope lives. `root` is the site's base, which is "/" today and may not always be. */
/** @param {string} root @param {string | null | undefined} country */
export const searchPath = (root, country) =>
  country ? `${root}${country.toLowerCase()}/${SEARCH_SLUGS[country] ?? SEARCH_SLUGS.EU}/` : `${root}${SEARCH_SLUGS.EU}/`;

/** The scope a path names, or nothing when the path is not a search page. */
/** @param {string} root @param {string} pathname @returns {{ country: string | null } | undefined} */
export function scopeFromPath(root, pathname) {
  if (!pathname.startsWith(root)) return undefined;
  const rest = pathname.slice(root.length);
  if (rest === `${SEARCH_SLUGS.EU}/`) return { country: null };
  for (const [code, slug] of Object.entries(SEARCH_SLUGS)) {
    if (code !== "EU" && rest === `${code.toLowerCase()}/${slug}/`) return { country: code };
  }
  return undefined;
}

/** What a query string asks for, within a scope that it cannot widen. */
/** @param {string} search @param {string | null | undefined} scopeCountry @returns {{ q: string, selected: Selected }} */
export function stateFromQuery(search, scopeCountry) {
  const parameters = new URLSearchParams(search);
  /** @type {Selected} */
  const selected = {};
  for (const facet of facetsOf(scopeCountry)) {
    let values = [...new Set(parameters.getAll(facet).filter(Boolean))];
    if (scopeCountry && facet === "territory") values = values.filter((value) => value.startsWith(`${scopeCountry}/`));
    if (values.length > 0) selected[facet] = values;
  }
  return { q: (parameters.get("q") ?? "").trim(), selected };
}

/** The query string of a state, never carrying what the route already fixes. */
/** @param {State} state @param {string | null | undefined} scopeCountry */
export function queryFromState({ q = "", selected = {} }, scopeCountry) {
  const parameters = new URLSearchParams();
  if (q.trim()) parameters.set("q", q.trim());
  for (const facet of facetsOf(scopeCountry)) for (const value of selected[facet] ?? []) parameters.append(facet, value);
  const query = parameters.toString();
  return query ? `?${query}` : "";
}

/**
 * The filters actually sent to the index. On a national route the scope — the country and the layers it
 * inherits — is written last, so it overrides anything a reader or a link tried to put there.
 */
/** @param {Selected} selected @param {string | null | undefined} scopeCountry @param {string[]} inherits @returns {Selected} */
export function effectiveFilters(selected, scopeCountry, inherits = []) {
  /** @type {Selected} */
  const filters = {};
  for (const facet of facetsOf(scopeCountry)) if (selected[facet]?.length) filters[facet] = [...selected[facet]];
  if (scopeCountry) filters.country = [scopeCountry, ...inherits.filter((code) => code !== scopeCountry)];
  return filters;
}

/** @param {string} root @param {State & { country?: string | null }} where */
export const searchUrl = (root, { country = null, q = "", selected = {} } = {}) =>
  searchPath(root, country) + queryFromState({ q, selected }, country);

/** Where a territory sends a reader who wants to search: its own country, with itself already chosen. */
/** @param {string} root @param {string} country @param {string} territory */
export const territorySearchUrl = (root, country, territory) =>
  searchUrl(root, { country, selected: { territory: [`${country}/${territory}`] } });
