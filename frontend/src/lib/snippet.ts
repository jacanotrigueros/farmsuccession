/** About what a search result shows of a description before it cuts. */
export const SNIPPET = 155;

/**
 * Text that ends inside what a result shows, after an optional lead. A sentence that ends is better than
 * one cut off: it stops at the last full stop, colon or semicolon in the room when what it leaves is still
 * at least half of it, and only otherwise cuts at a word.
 */
export function snippet(text: string, lead = ""): string {
  const room = SNIPPET - lead.length;
  if (text.length <= room) return lead + text;
  const clause = /^(.*[.:;])\s/su.exec(text.slice(0, room + 1))?.[1];
  if (clause && clause.length >= room / 2) return lead + clause.replace(/[:;]$/u, ".");
  const cut = text.slice(0, room - 1);
  const atWord = cut.includes(" ") ? cut.slice(0, cut.lastIndexOf(" ")) : cut;
  return `${lead}${atWord.replace(/[\s,;:·—-]+$/u, "")}…`;
}
