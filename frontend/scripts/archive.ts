/**
 * How one published page becomes a page of an archived edition (decisions/038).
 *
 * An archived edition is the site as it was published, rebuilt from the tag it was published at and kept
 * under `/<edition>/`. Its pages are not regenerated with today's templates: they are what readers saw,
 * which is what decisions/016 says an edition is. Only what has to change for it to live beside the
 * current edition changes:
 *
 * - every address inside the site gains the edition's prefix, so a reader stays inside that edition;
 * - addresses of the search stay as they are: an index built for an edition stores the addresses of that
 *   edition's current pages, so an archived search would send readers out of the archive without saying
 *   so. Search lives in the current edition, and the notice says it;
 * - the page asks not to be indexed and names no canonical or language alternates, so search engines
 *   keep offering the current edition, which is the one a reader should act on;
 * - a notice opens the page, styled by a stylesheet of the current site, because decisions/034 forbids
 *   inline styles and the archived page's own stylesheet knows nothing about archives.
 */
import { scopeFromPath } from "../public/search-scope.js";

export type ArchiveNotice = { edition: string; path: string; notice: string; link: string };

const escape = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** Whether an address inside the site belongs to the search, which stays in the current edition. */
export function staysCurrent(address: string): boolean {
  const pathname = address.split(/[?#]/u)[0] ?? address;
  return scopeFromPath("/", pathname) !== undefined || pathname.startsWith("/pagefind/");
}

/** One address as the archived page must write it. Absolute and protocol-relative addresses are untouched. */
export function archivedAddress(address: string, edition: string): string {
  if (!address.startsWith("/") || address.startsWith("//") || staysCurrent(address)) return address;
  return `/${edition}${address}`;
}

/** The archived version of one built page. */
export function archivePage(html: string, notice: ArchiveNotice): string {
  const banner =
    `<div class="fs-archive" role="note"><p>${escape(notice.notice)} ` +
    `<a href="${escape(notice.path)}">${escape(notice.link)}</a></p></div>`;
  return html
    .replaceAll(/<link\b[^>]*\brel="(?:canonical|alternate)"[^>]*>/gu, "")
    .replaceAll(/<meta\b[^>]*\bname="robots"[^>]*>/gu, "")
    .replaceAll(
      /\b(href|src|action|poster)="([^"]*)"/gu,
      (_, attribute: string, value: string) => `${attribute}="${archivedAddress(value, notice.edition)}"`,
    )
    .replaceAll(
      /\bsrcset="([^"]*)"/gu,
      (_, value: string) =>
        `srcset="${value
          .split(",")
          .map((part) => part.trim().replace(/^\S+/u, (url) => archivedAddress(url, notice.edition)))
          .join(", ")}"`,
    )
    .replace("</head>", `<meta name="robots" content="noindex"><link rel="stylesheet" href="/archive.css"></head>`)
    .replace(/<body\b[^>]*>/u, (body) => `${body}${banner}`);
}

/** Files of a built edition that an archive leaves out: the search and what belongs to the site as a whole. */
export function leftOut(relative: string): boolean {
  const posix = relative.split("\\").join("/");
  if (["sitemap.xml", "robots.txt", "CNAME", "404.html"].includes(posix)) return true;
  if (posix.startsWith("pagefind/")) return true;
  return posix.endsWith("index.html") && staysCurrent(`/${posix.slice(0, -"index.html".length)}`);
}
