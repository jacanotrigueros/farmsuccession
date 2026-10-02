/**
 * The part of a URL that identifies a page: host without `www.`, path without a trailing slash,
 * and the query, which often selects the actual procedure. The scheme is ignored.
 */
export function canonicalPage(value: string): string {
  const url = new URL(value);
  return `${url.host.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}${url.search}`;
}

/** True when two URLs name the same page, ignoring scheme, `www.` and a trailing slash. */
export function samePage(a: string, b: string): boolean {
  return canonicalPage(a) === canonicalPage(b);
}
