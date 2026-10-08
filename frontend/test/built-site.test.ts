import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { regionSlug, SEARCH_SLUGS } from "../public/search-scope.js";
import { words } from "../src/lib/words.ts";

/**
 * What the built pages may and may not contain. These are the promises the site makes to a reader on a
 * phone on a rural connection, and they are the kind that get broken by accident months later — one
 * component that pulls a font from a CDN, one integration that ships a runtime — so they are assertions
 * rather than intentions.
 *
 * It reads `dist/`, so `npm run check` builds before it tests.
 */
const DIST = path.join(import.meta.dirname, "..", "dist");
const REPOSITORY = path.join(import.meta.dirname, "..", "..");

function builtPages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

const pages = builtPages().map((file) => ({ file: path.relative(DIST, file), html: readFileSync(file, "utf8") }));

test("the build produced pages at all, so an empty run cannot pass as a clean one", () => {
  assert.ok(pages.length > 0, "no HTML in dist/: run npm run build before the tests");
});

/**
 * The whole licence the site gives JavaScript: a page may load a file only because of something it
 * actually carries, and never inline.
 *
 * `/search.js` fills in a list that is already complete; `/apply.js` answers "can I apply now?" again for
 * the reader's own day, from dates that are already on the page. Both only re-say something the HTML has
 * already said, and neither is how anything gets read. An inline script would break the other half of the
 * promise, because it cannot be read before it runs or audited afterwards.
 */
test("a page ships JavaScript only for what it actually carries", () => {
  for (const { file, html } of pages) {
    const allowed = new Set<string>();
    if (html.includes("data-search")) allowed.add("/search.js");
    if (html.includes('class="apply')) allowed.add("/apply.js");

    for (const [, src] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/giu)) {
      assert.ok(
        allowed.has(src ?? ""),
        `${file} loads ${src}, and nothing on it needs that: a page that is only read is read without JavaScript`,
      );
    }
    const written = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/giu)].map(([, body]) => (body ?? "").trim());
    assert.ok(
      written.every((body) => body === ""),
      `${file} has an inline script, which cannot be read before it runs or audited afterwards`,
    );
  }
});

/** The `rel` values that make the browser fetch something. `canonical` and `alternate` only name a URL. */
const FETCHING = new Set(["stylesheet", "preload", "prefetch", "preconnect", "dns-prefetch", "modulepreload", "icon", "manifest"]);

test("no page asks the reader's browser for anything from another host", () => {
  // A link to an official page is the point of the site; a *request* to another host is not, because it
  // costs the reader bytes they did not ask for and tells that host they were here.
  const subresource = /<(?:img|iframe|source|video|audio|embed|object|script)\b[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\//giu;
  for (const { file, html } of pages) {
    assert.equal(html.match(subresource), null, `${file} loads a subresource from another host`);
    for (const [tag] of html.matchAll(/<link\b[^>]*>/giu)) {
      const rel = /\brel\s*=\s*["']([^"']+)/iu.exec(tag)?.[1]?.toLowerCase() ?? "";
      const href = /\bhref\s*=\s*["']([^"']+)/iu.exec(tag)?.[1] ?? "";
      const offHost = /^(https?:)?\/\//u.test(href);
      const fetches = rel.split(/\s+/u).some((value) => FETCHING.has(value));
      assert.ok(!(offHost && fetches), `${file} fetches ${href} from another host as rel="${rel}"`);
    }
  }
});

const STORAGE = /document\.cookie|localStorage|sessionStorage|indexedDB/u;

test("no page stores anything in the reader's browser", () => {
  for (const { file, html } of pages) {
    assert.doesNotMatch(html, STORAGE, `${file} touches browser storage`);
  }
});

/**
 * The promise has to survive a dependency. The search engine is somebody else's code running in the
 * reader's browser, so what it may do is checked rather than assumed — and checked in `dist/`, which is
 * what a reader would receive, not in the package it was built from.
 */
test("nothing the site ships to a browser stores anything there", () => {
  const scripts = (function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".js") ? [full] : [];
    });
  })(DIST);

  assert.ok(
    scripts.some((file) => path.basename(file) === "search.js"),
    "no search.js in dist/: the enhancement is missing, and this check would pass without checking anything",
  );
  for (const file of scripts) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      STORAGE,
      `${path.relative(DIST, file)} touches browser storage. Nothing a reader is sent may keep anything on their machine, this project's own code or anybody else's.`,
    );
  }
});

test("every link inside the site reaches a page the build produced", () => {
  const built = new Set(pages.map(({ file }) => `/${file.replace(/index\.html$/u, "")}`));
  const PUBLIC = path.join(import.meta.dirname, "..", "public");
  const assets = new Set(
    (function walk(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [`/${path.relative(PUBLIC, full).split(path.sep).join("/")}`];
      });
    })(PUBLIC),
  );
  for (const { file, html } of pages) {
    for (const [, link] of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](\/[^"'#]*)/giu)) {
      // A query narrows what a page shows; it does not name a different page.
      const href = (link ?? "").split("?")[0] ?? "";
      assert.ok(built.has(href) || assets.has(href), `${file} links ${href}, which the build did not produce`);
    }
  }
});

/**
 * The home page counts the drafts rather than warning about one file, because it is about all of them;
 * every page about a single territory or record carries the warning itself. Either way the claim has to
 * follow the data, which is the one thing a reader cannot check for themselves.
 */
test("a page says what has not been reviewed, and the count follows the data", () => {
  const editions = readdirSync(path.join(REPOSITORY, "data", "editions"))
    .toSorted()
    .toReversed();
  const edition = editions[0];
  assert.ok(edition, "no edition to render");

  const files = (function walk(dir: string): { review: { status: string } }[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".json") ? [JSON.parse(readFileSync(full, "utf8")) as { review: { status: string } }] : [];
    });
  })(path.join(REPOSITORY, "data", "editions", edition));
  const drafts = files.filter(({ review }) => review.status === "DRAFT").length;

  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "no home page was built");
  const said = /All (\d+) files are drafts|(\d+) of (\d+) files are drafts/u.exec(home.html);
  assert.ok(said, "the home page does not say how much of the edition nobody has checked yet");
  const counted = Number(said[1] ?? said[2]);
  assert.equal(counted, drafts, `the home page says ${counted} drafts and the edition has ${drafts}`);

  const eu = pages.find(({ file }) => file === path.join("resources", "eu-cap-network-generational-renewal", "index.html"));
  assert.ok(eu, "no European record page was built");
  assert.ok(
    eu.html.includes("Nobody has reviewed this page yet"),
    "a record page of a draft file does not carry the warning, which is the first thing its reader is owed",
  );
});

/**
 * Two namespaces that must not become one.
 *
 * The pages a country has of its own — searching, the project, its history — are a closed list this
 * repository writes. The territories under it are an open list the catalogue grows, one more with every
 * research pass. Published side by side, the first territory slug that happens to equal one of those
 * words takes the page, in whichever language it happens. So everything below a country lives under one
 * segment of its own, and this is the check that it stays there.
 */
test("a territory never shares a namespace with a page of the site", () => {
  const catalogue = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "territories.json"), "utf8")) as {
    jurisdictions: Record<string, { lang: string }>;
  };
  const countries = Object.entries(catalogue.jurisdictions).filter(([iso]) => iso !== "EU");
  assert.ok(countries.length > 0, "no country in the catalogue: this check would pass without checking anything");

  for (const [iso, { lang }] of countries) {
    const text = words(lang);
    const own = new Set([text.aboutSlug, text.historySlug, SEARCH_SLUGS[iso] ?? "", regionSlug(iso)]);
    const published = new Set(
      pages
        .map(({ file }) => file.split(path.sep))
        .filter((parts) => parts[0] === iso.toLowerCase() && parts.length > 2)
        .map((parts) => parts[1] ?? ""),
    );
    for (const segment of published) {
      assert.ok(
        own.has(segment),
        `/${iso.toLowerCase()}/${segment}/ sits beside this country's own pages. A territory belongs under /${iso.toLowerCase()}/${regionSlug(iso)}/, or the day a territory is called "${text.aboutSlug}" it takes that page.`,
      );
    }
    assert.ok(published.has(regionSlug(iso)), `${iso} published no territory under /${iso.toLowerCase()}/${regionSlug(iso)}/`);
  }
});

test("a page declares the language its text is actually written in", () => {
  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "no home page was built");
  assert.match(home.html, /<html lang="en"/u, "the European layer is written in English, and a screen reader has to be told");
});
