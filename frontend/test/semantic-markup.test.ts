import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";

import { decodeHTML } from "entities";

import { dateIn } from "../src/lib/language.ts";
import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
function files(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file, suffix) : entry.name.endsWith(suffix) ? [file] : [];
  });
}
const pages = files(DIST, ".html").map((file) => ({ file, html: decodeHTML(readFileSync(file, "utf8")) }));
const attr = (tag: string, name: string) => new RegExp(`\\b${name}="([^"]*)"`, "u").exec(tag)?.[1];
const tagWithId = (html: string, id: string) => new RegExp(`<[^>]*\\bid="${id}"[^>]*>`, "u").exec(html)?.[0];

test("inherited English descriptions keep English while the surrounding French card keeps French", () => {
  const { html } = pages.find(({ file }) => file.endsWith(path.join("fr", "index.html")))!;
  assert.ok(html, "no French country page: there is no inherited-language case to test");
  const card = [...html.matchAll(/<li\b[^>]*data-kind="[^"]+"[^>]*>([\s\S]*?)<\/li>/gu)].find((match) =>
    match[1]?.includes("/resources/eu-cap-network-generational-renewal/"),
  )?.[1];
  assert.ok(
    card,
    "the French page no longer lists this inherited European record: replace this case with another real inherited description",
  );
  const titleLink = /<a\b[^>]*href="\/resources\/eu-cap-network-generational-renewal\/"[^>]*>/u.exec(card)?.[0] ?? "";
  const description = /<\/h[234]>\s*(<p\b[^>]*>)/u.exec(card)?.[1] ?? "";
  assert.equal(attr(titleLink, "lang"), "en", "an untranslated English title must not inherit the French page's pronunciation");
  assert.equal(
    attr(description, "lang"),
    "en",
    "decision 006 preserves English prose; its paragraph needs English, not a translated description",
  );
  assert.ok(
    card.includes(words("fr").record[0]) || card.includes("Réseau"),
    "the card's interface labels must remain in the reader's language",
  );
});

test("the actual Pagefind fragments carry each record's language for live result markup", () => {
  const fragments = files(path.join(DIST, "pagefind"), ".pf_fragment");
  assert.ok(fragments.length > 0, "no Pagefind fragments: HTML metadata alone cannot prove the search result receives it");
  const checked = new Set<string>();
  for (const file of fragments) {
    // Pagefind 1.5.2 writes gzipped JSON after this signature; inspect the built data the browser reads.
    const raw = gunzipSync(readFileSync(file)).toString("utf8");
    assert.ok(
      raw.startsWith("pagefind_dcd"),
      `${file}: the Pagefind fragment format changed; inspect it rather than passing an empty scan`,
    );
    const fragment = JSON.parse(raw.slice("pagefind_dcd".length)) as { url: string; meta: { language?: string } };
    const language = path.relative(path.join(DIST, "pagefind"), file).split(path.sep)[0]!;
    checked.add(language);
    assert.equal(
      fragment.meta.language,
      language,
      `${fragment.url}: the result needs its record language; the search page's language describes its controls, not its multilingual results`,
    );
  }
  assert.equal(checked.size, 6, "not every language bundle's delivered metadata was checked");
});

test("the date that qualifies an application answer is a time element, not only formatted prose", () => {
  let checked = 0;
  for (const { file, html } of pages) {
    const language = attr(/<html\b[^>]*>/u.exec(html)?.[0] ?? "", "lang")!;
    for (const [, , body] of html.matchAll(/<section\b([^>]*\bdata-apply-answers="[^"]*"[^>]*)>([\s\S]*?)<\/section>/gu)) {
      checked++;
      const [before, after] = words(language).checkedOn.split("{date}");
      const time = [...body!.matchAll(/<time datetime="([^"]+)">([^<]+)<\/time>/gu)].find(([, iso, written]) =>
        body!.includes(`${before}<time datetime="${iso}">${written}</time>${after ?? ""}`),
      );
      assert.ok(
        time,
        `${file}: the source consultation date beside the answer must be a time element too; marking opening and closing dates does not mark when the evidence was read`,
      );
      assert.equal(time[2], dateIn(time[1]!, language), `${file}: the machine-readable consultation date and the reader's date disagree`);
    }
  }
  assert.ok(checked > 0, "no application answers: the qualification date was never checked");
});

test("search landmarks are named by the same visible text that explains them", () => {
  let checked = 0;
  for (const { file, html } of pages) {
    for (const [tag] of html.matchAll(/<form\b[^>]*\brole="search"[^>]*>/gu)) {
      checked++;
      const id = attr(tag, "aria-labelledby");
      assert.ok(id, `${file}: name the search landmark from its visible label; the six searches on the 404 page otherwise sound identical`);
      assert.ok(tagWithId(html, id!), `${file}: aria-labelledby names ${id}, which does not exist`);
    }
    const fallback = /<aside\b[^>]*\bdata-search-fallback\b[^>]*>/u.exec(html)?.[0];
    if (fallback) {
      const id = attr(fallback, "aria-labelledby");
      assert.ok(id && tagWithId(html, id), `${file}: the unexecuted-search explanation is an unnamed complementary landmark`);
    }
  }
  assert.ok(checked > 0, "no search forms: landmark naming was never checked");
});

test("the document has one main heading and never skips a heading level", () => {
  assert.ok(pages.length > 0, "no built pages: the heading scan proved nothing");
  for (const { file, html } of pages) {
    const rendered = html.replaceAll(/<template\b[^>]*>[\s\S]*?<\/template>/gu, "");
    const levels = [...rendered.matchAll(/<h([1-6])\b/gu)].map(([, level]) => Number(level));
    assert.equal(levels.filter((level) => level === 1).length, 1, `${file}: one document needs one main heading`);
    assert.equal(levels[0], 1, `${file}: the outline starts with its main heading`);
    for (let index = 1; index < levels.length; index++) {
      assert.ok(
        levels[index]! <= levels[index - 1]! + 1,
        `${file}: h${levels[index - 1]} jumps to h${levels[index]}; heading level describes structure, not text size`,
      );
    }
  }
});

test("a served-area description keeps its source language beside the translated scope label", () => {
  const { html } = pages.find(({ file }) => file.endsWith(path.join("search", "index.html")))!;
  assert.ok(
    /<span lang="es"[^>]*>Seis zonas regables oficiales de las provincias de Cáceres y Badajoz<\/span>/u.test(html),
    "the English search fallback must label BOTREX’s Spanish served-area prose as Spanish; marking only its title does not mark the area",
  );
});
