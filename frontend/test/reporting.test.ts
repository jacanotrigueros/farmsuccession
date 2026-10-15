import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
const REPOSITORY = path.join(import.meta.dirname, "..", "..");
const catalogue = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "territories.json"), "utf8")) as {
  jurisdictions: Record<string, { lang: string }>;
};

const reportPages = [
  { file: path.join(DIST, words("en").reportSlug, "index.html"), language: "en" },
  ...Object.entries(catalogue.jurisdictions)
    .filter(([iso]) => iso !== "EU")
    .map(([iso, { lang }]) => ({ file: path.join(DIST, iso.toLowerCase(), words(lang).reportSlug, "index.html"), language: lang })),
];

test("every site language has a public intake page that stays out of search indexes", () => {
  assert.equal(reportPages.length, 6, "the catalogue no longer has the six language surfaces this test expects");
  for (const { file, language } of reportPages) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /<meta name="robots" content="noindex, follow">/u, `${file} is an editorial utility, not a document to index`);
    assert.ok(html.includes(words(language).reportTitle), `${file} is not written in its own language`);
    assert.match(html, /action="mailto:contact@farmsuccession\.eu"/u, `${file} has no transport when JavaScript is unavailable`);
    assert.match(html, /<script[^>]*src="\/report\.js"/u, `${file} never loads the first-party enhancement that structures the email`);
  }
});

test("a new-resource report asks for a public URL and a reason, not an account", () => {
  for (const { file } of reportPages) {
    const html = readFileSync(file, "utf8");
    const section = html.slice(html.indexOf('id="missing"'), html.indexOf('id="correction"'));
    assert.match(section, /name="source"[^>]*type="url"[^>]*required/u, `${file} can accept a resource with no public page`);
    assert.match(section, /name="detail"[^>]*required/u, `${file} can accept a resource with no explanation`);
    assert.doesNotMatch(
      section,
      /name="email"|name="account"|github\.com/iu,
      `${file} asks a local contributor for an account the task does not need`,
    );
  }
});

test("the reporting enhancement contains no endpoint, token or browser storage", () => {
  const script = readFileSync(path.join(DIST, "report.js"), "utf8");
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|github\.com|api\.github|token|localStorage|sessionStorage|document\.cookie/iu);
  assert.match(script, /mailto:contact@farmsuccession\.eu/u);
});
