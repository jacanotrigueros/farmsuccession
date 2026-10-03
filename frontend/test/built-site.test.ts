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

test("no page ships JavaScript", () => {
  for (const { file, html } of pages) {
    assert.doesNotMatch(html, /<script/iu, `${file} carries a script: the site is read without JavaScript, by design`);
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

test("no page stores anything in the reader's browser", () => {
  for (const { file, html } of pages) {
    assert.doesNotMatch(html, /document\.cookie|localStorage|sessionStorage|indexedDB/u, `${file} touches browser storage`);
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
