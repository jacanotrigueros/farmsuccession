/**
 * The description a search result carries; matching excerpts are the build's own marked text.
 *
 * A record written in another language than the page shows its summary even for a typed query: a reader
 * searching in Spanish who reaches an English record usually matched it through the site's translated
 * labels, and a fragment of that label list, or of English prose, explains less than what the record offers.
 * @param {{meta?: {summary?: string, language?: string}, excerpt: string}} result @param {string} term
 * @param {string} [pageLanguage] the language the search page is written in
 * @returns {{format: "text" | "html", value: string}}
 */
export const resultDescription = (result, term, pageLanguage) =>
  term.trim() && (!pageLanguage || !result.meta?.language || result.meta.language === pageLanguage)
    ? { format: "html", value: result.excerpt }
    : { format: "text", value: result.meta?.summary ?? "" };

/**
 * The record's prose keeps its own language; kind, status and other controls keep the page's.
 * @param {{querySelector: (selector: string) => {setAttribute: (name: string, value: string) => void} | null}} row
 * @param {{meta?: {language?: string}}} result
 */
export function setResultLanguage(row, result) {
  const language = result.meta?.language ?? "";
  for (const selector of ["[data-result-link]", "[data-result-excerpt]", "[data-result-operator]", "[data-result-area]"]) {
    row.querySelector(selector)?.setAttribute("lang", language);
  }
}
