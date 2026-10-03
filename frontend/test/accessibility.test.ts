import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

/**
 * The structural half of accessibility, on every page the build produced.
 *
 * None of this is about how the site looks. A heading level that jumps, an `aria-labelledby` pointing at
 * nothing, two elements sharing an id, a link to a fragment that is not on the page: each one is invisible
 * to somebody reading with their eyes and each one breaks the page for somebody navigating it by landmark,
 * by heading, or by following a reference down to a source and back. They are also exactly the mistakes a
 * later edit makes silently, which is why they are checked here rather than looked for by hand.
 *
 * The audience this site is built for — older readers, readers with low digital literacy, readers on a
 * phone — is the reason this is part of correctness and not a polish pass.
 */
const DIST = path.join(import.meta.dirname, "..", "dist");

function builtPages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

const pages = builtPages().map((file) => ({ file: path.relative(DIST, file), html: readFileSync(file, "utf8") }));

test("the pages to check exist, so an empty run cannot pass as a clean one", () => {
  assert.ok(pages.length > 0, "no HTML in dist/: run npm run build before the tests");
});

test("every page has exactly one first-level heading", () => {
  for (const { file, html } of pages) {
    const ones = html.match(/<h1\b/giu) ?? [];
    assert.equal(ones.length, 1, `${file} has ${ones.length} first-level headings: a page is about one thing`);
  }
});

test("heading levels never skip a step", () => {
  for (const { file, html } of pages) {
    const levels = [...html.matchAll(/<h([1-6])\b/giu)].map(([, level]) => Number(level));
    let previous = 0;
    for (const level of levels) {
      assert.ok(
        previous === 0 ? level === 1 : level <= previous + 1,
        `${file} goes from h${previous} to h${level}: somebody listing the headings of this page would be told a section is inside one that was never announced`,
      );
      previous = level;
    }
  }
});

test("no id appears twice on a page", () => {
  for (const { file, html } of pages) {
    const ids = [...html.matchAll(/\bid="([^"]+)"/giu)].map(([, id]) => id ?? "");
    const seen = new Set<string>();
    for (const id of ids) {
      assert.ok(!seen.has(id), `${file} uses the id "${id}" twice: a reference to it reaches whichever came first, which is a coin toss`);
      seen.add(id);
    }
  }
});

test("every reference to an element on the page reaches one", () => {
  for (const { file, html } of pages) {
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/giu)].map(([, id]) => id ?? ""));
    for (const [, attribute, value] of html.matchAll(/\b(aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/giu)) {
      for (const target of (value ?? "").split(/\s+/u)) {
        assert.ok(ids.has(target), `${file} has ${attribute}="${target}" and no element with that id: the name it promises does not exist`);
      }
    }
    for (const [, fragment] of html.matchAll(/\bhref="#([^"]+)"/giu)) {
      assert.ok(ids.has(fragment ?? ""), `${file} links to #${fragment}, which is not on the page`);
    }
  }
});

test("a navigation landmark is never left to be told apart by guesswork", () => {
  // Two navigations with the same accessible name read identically in a list of landmarks, and a reader
  // using that list has no way to tell which is the site's and which is this page's.
  for (const { file, html } of pages) {
    const names = [...html.matchAll(/<nav\b[^>]*\baria-label="([^"]+)"/giu)].map(([, name]) => name ?? "");
    const unnamed = (html.match(/<nav\b(?![^>]*aria-label)/giu) ?? []).length;
    assert.equal(unnamed, 0, `${file} has ${unnamed} navigation landmark(s) with no name`);
    assert.equal(new Set(names).size, names.length, `${file} has two navigation landmarks with the same name: ${names.join(", ")}`);
  }
});
