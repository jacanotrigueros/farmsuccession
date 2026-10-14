/** The description a search result carries; matching excerpts are the build's own marked text. */
/** @param {{meta?: {summary?: string}, excerpt: string}} result @param {string} term
 * @returns {{format: "text" | "html", value: string}}
 */
export const resultDescription = (result, term) =>
  term.trim() ? { format: "html", value: result.excerpt } : { format: "text", value: result.meta?.summary ?? "" };
