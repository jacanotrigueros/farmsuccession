/**
 * The sitemap, written from the pages the build actually produced.
 *
 * It reads `dist/` rather than the routes, because a sitemap that is generated from the same intentions
 * as the site can agree with them and still be wrong about what was published. Enumerating the built
 * files cannot: a page that exists is in it, a page that does not cannot be.
 *
 * `lastmod` is a date the data gives or it is absent. A territory page and a record page carry the day
 * their territory's file says it was published; the home page, the project pages and the search pages
 * carry nothing, because nothing in the corpus says when they last changed and a date invented here
 * would be a claim about freshness — the one claim this project cannot make up (`decisions/025`).
 */
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIST = path.join(import.meta.dirname, "..", "dist");

/**
 * The corpus module is written for the site, where Vite replaces `__REPOSITORY_ROOT__` with the path the
 * config computes. A script run by node has to supply it, and then import the module dynamically, because
 * a static import would be hoisted above the line that defines it. The alternative was to work out each
 * page's address here, which would be a second implementation of the URL contract `decisions/024` exists
 * to keep in one place.
 */
Object.assign(globalThis, { __REPOSITORY_ROOT__: path.join(import.meta.dirname, "..", "..") });
const { href, recordHref, records, territoriesOf } = await import("../src/lib/corpus.ts");
const SITE = "https://farmsuccession.eu";

/** Every page of the built site, as the path a reader would type. */
function builtPages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(full);
    if (entry.name !== "index.html") return [];
    return [`/${path.relative(DIST, path.dirname(full)).split(path.sep).join("/")}/`.replace("//", "/")];
  });
}

/** The day the corpus says each page's evidence was published, for the pages the corpus is about. */
function published(): Map<string, string> {
  const dates = new Map<string, string>();
  for (const territory of territoriesOf()) dates.set(href(territory.layer), territory.data.published);
  for (const { resource, territory } of records()) dates.set(recordHref(resource.id), territory.data.published);
  return dates;
}

const escape = (text: string): string => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function sitemap(pages: readonly string[], dates: Map<string, string>): string {
  const entries = [...pages].toSorted().map((page) => {
    const lastmod = dates.get(page);
    return [`  <url>`, `    <loc>${escape(SITE + page)}</loc>`, ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []), `  </url>`].join(
      "\n",
    );
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

const pages = builtPages();
if (pages.length === 0) throw new Error("no pages in dist/: run the build before writing the sitemap");
// The 404 is served for addresses that do not exist, so it is not an address to offer anybody.
const offered = pages.filter((page) => page !== "/404/");
writeFileSync(path.join(DIST, "sitemap.xml"), sitemap(offered, published()));
console.log(`sitemap.xml lists ${offered.length} page(s)`);
