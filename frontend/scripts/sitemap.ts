/**
 * The sitemap, written from the pages the build actually produced.
 *
 * It reads `dist/` rather than the routes, because a sitemap that is generated from the same intentions
 * as the site can agree with them and still be wrong about what was published. Enumerating the built
 * files cannot: a page that exists is in it, a page that does not cannot be.
 *
 * Edition publication dates describe the entire territory file. A sitemap entry needs a date for the
 * individual page's material content, so the build omits lastmod while it has no such history.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIST = path.join(import.meta.dirname, "..", "dist");
const SITE = "https://farmsuccession.eu";

/**
 * Every page of the built site that asks to be offered, as the path a reader would type.
 *
 * A page that carries `noindex` is skipped — a search page, which is not a document of its own, and a
 * region that documented nothing itself, whose list is its country's list. So is a page whose canonical
 * names another address: Austria's project and history pages repeat Germany's and say so, and offering
 * the copy would contradict it. The rule is read off the page rather than worked out again here: the page
 * already decided, and a sitemap that decided separately would be free to disagree with it.
 */
function builtPages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(full);
    if (entry.name !== "index.html") return [];
    const html = readFileSync(full, "utf8");
    if (/<meta\s+name="robots"\s+content="noindex/u.test(html)) return [];
    const page = `/${path.relative(DIST, path.dirname(full)).split(path.sep).join("/")}/`.replace("//", "/");
    const canonical = /<link\s+rel="canonical"\s+href="([^"]+)"/u.exec(html)?.[1];
    if (canonical !== undefined && canonical !== SITE + page) return [];
    return [page];
  });
}

const escape = (text: string): string => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function sitemap(pages: readonly string[]): string {
  const entries = [...pages].toSorted().map(
    (page) => `  <url>
    <loc>${escape(SITE + page)}</loc>
  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

const pages = builtPages();
if (pages.length === 0) throw new Error("no pages in dist/: run the build before writing the sitemap");
// The 404 is served for addresses that do not exist, so it is not an address to offer anybody.
const offered = pages.filter((page) => page !== "/404/");
writeFileSync(path.join(DIST, "sitemap.xml"), sitemap(offered));
console.log(`sitemap.xml lists ${offered.length} page(s)`);
