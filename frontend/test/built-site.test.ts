import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

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
 * The site ships one script, and this is the whole of its licence: on the search page, that one file, from
 * this host, deferred, and never written into the page. A page somebody reads that acquires a script has
 * broken the promise; so has an inline one, which cannot be read before it runs or audited afterwards.
 */
test("the only pages that ship JavaScript are the search pages, and only that one file", () => {
  for (const { file, html } of pages) {
    const tags = [...html.matchAll(/<script\b[^>]*>/giu)].map(([tag]) => tag);
    if (!file.endsWith(path.join("search", "index.html"))) {
      assert.equal(tags.length, 0, `${file} carries a script: every page but the search page is read without JavaScript`);
      continue;
    }
    assert.equal(tags.length, 1, `${file} carries ${tags.length} scripts; the search page is allowed exactly one`);
    assert.match(
      tags[0] ?? "",
      /src="\/search\.js"/u,
      `${file} loads something other than /search.js: the enhancement is one first-party file, served as it was written`,
    );
    const written = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/giu)].map(([, body]) => (body ?? "").trim());
    assert.deepEqual(written, [""], `${file} has an inline script, which cannot be read before it runs or audited afterwards`);
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
 * The promise now has to survive a dependency. The search engine is somebody else's code running in the
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
  const assets = new Set(
    readdirSync(path.join(import.meta.dirname, "..", "public"), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => `/${entry.name}`),
  );
  for (const { file, html } of pages) {
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](\/[^"'#]*)/giu)) {
      assert.ok(built.has(href ?? "") || assets.has(href ?? ""), `${file} links ${href}, which the build did not produce`);
    }
  }
});

test("a page says it is unreviewed exactly when its data says so", () => {
  const editions = readdirSync(path.join(REPOSITORY, "data", "editions"))
    .toSorted()
    .toReversed();
  const edition = editions[0];
  assert.ok(edition, "no edition to render");
  const eu = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "editions", edition, "eu.json"), "utf8")) as {
    review: { status: string };
  };
  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "no home page was built");
  const warned = home.html.includes("Nobody has reviewed this page yet");
  assert.equal(
    warned,
    eu.review.status === "DRAFT",
    "the warning that nobody has reviewed a page is the one thing a reader has to be told first, and it has to follow the data",
  );
});

test("a page declares the language its text is actually written in", () => {
  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "no home page was built");
  assert.match(home.html, /<html lang="en"/u, "the European layer is written in English, and a screen reader has to be told");
});
