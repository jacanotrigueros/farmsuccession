/** The description a search result carries; matching excerpts are the build's own marked text. */
/** @param {{meta?: {summary?: string}, excerpt: string}} result @param {string} term
 * @returns {{format: "text" | "html", value: string}}
 */
export const resultDescription = (result, term) =>
  term.trim() ? { format: "html", value: result.excerpt } : { format: "text", value: result.meta?.summary ?? "" };

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
