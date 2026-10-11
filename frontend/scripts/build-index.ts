/**
 * One search bundle per language, and a manifest saying what is in each.
 *
 * Pagefind analyses a page in the language it is written in — that is what stemming is — and it keeps one
 * WebAssembly module, and therefore one language, per instance. So the corpus is published as one bundle
 * per language, holding the record pages written in it, and a search loads the bundles its scope actually
 * contains and queries each with its own stemmer.
 *
 * The two shortcuts both fail, and the previous generation measured them failing rather than guessing:
 * merging indexes across languages searches them all with the main instance's module, which is the wrong
 * stemmer for every language but one, and forcing the whole corpus into a single language does the same
 * thing at build time. German queries lost eleven of twelve results that way, French nine of twenty-seven.
 *
 * The country is a filter inside every bundle, never a folder: a country can span several languages and a
 * language several countries, and only the manifest knows which.
 */
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import * as pagefind from "pagefind";

const DIST = path.join(import.meta.dirname, "..", "dist");
const OUT = path.join(DIST, "pagefind");

/**
 * Pagefind writes three ready-made interfaces into every bundle. This site uses the search API and its own
 * markup, so they are deleted: on this corpus they are most of each bundle's bytes on disk.
 */
const UNUSED = /^pagefind-(ui|component-ui|modular-ui)\.(js|css)$|^pagefind-highlight\.js$/u;

/**
 * Every built record page, with the language it declares and the country it was filed under.
 *
 * A record page is one that declares itself the body of a search result — `data-pagefind-body` — and not
 * one that happens to sit in a particular folder. Records live under the country that recorded them, so
 * there is no one folder to look in, and asking the page what it is was always the better question.
 */
function recordPages(dir = DIST): { url: string; html: string; language: string; country: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return recordPages(full);
    if (entry.name !== "index.html") return [];
    const html = readFileSync(full, "utf8");
    if (!html.includes("data-pagefind-body")) return [];
    const url = `/${path.relative(DIST, dir).split(path.sep).join("/")}/`;
    const language = /<html[^>]*\blang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const country = /data-pagefind-filter="country:([^"]+)"/u.exec(html)?.[1] ?? "";
    if (!language || !country) throw new Error(`${url} has no language or no country: the index could not say where it belongs`);
    return [{ url, html, language, country }];
  });
}

const pages = recordPages();
if (pages.length === 0) throw new Error("no record pages in dist/: run the build before indexing");

rmSync(OUT, { recursive: true, force: true });

const manifest: { languages: Record<string, { pages: number; countries: Record<string, number> }> } = { languages: {} };

for (const language of [...new Set(pages.map((page) => page.language))].toSorted()) {
  const own = pages.filter((page) => page.language === language);
  const { index, errors } = await pagefind.createIndex({});
  if (errors.length > 0 || !index) throw new Error(`pagefind refused to start for ${language}: ${errors.join("; ")}`);

  for (const page of own) {
    const added = await index.addHTMLFile({ url: page.url, content: page.html });
    if (added.errors.length > 0) throw new Error(`${page.url}: ${added.errors.join("; ")}`);
  }

  const folder = path.join(OUT, language);
  const written = await index.writeFiles({ outputPath: folder });
  if (written.errors.length > 0) throw new Error(written.errors.join("; "));
  await index.deleteIndex();

  for (const file of readdirSync(folder)) if (UNUSED.test(file)) rmSync(path.join(folder, file));

  const countries: Record<string, number> = {};
  for (const page of own) countries[page.country] = (countries[page.country] ?? 0) + 1;
  manifest.languages[language] = { pages: own.length, countries };
}

writeFileSync(path.join(OUT, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await pagefind.close();

const total = Object.values(manifest.languages).reduce((sum, { pages: n }) => sum + n, 0);
process.stdout.write(
  `search: ${total} records in ${Object.keys(manifest.languages).length} language bundles (${Object.keys(manifest.languages).join(", ")})\n`,
);
