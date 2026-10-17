import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { SEARCH_SLUGS } from "../public/search-scope.js";
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

/**
 * The reader who searched and found nothing is the only person who can say where this directory has a
 * hole, and they are the one person about to leave. The two sections above them need somebody who
 * already knows an answer: a resource exists, or a record is wrong. This one needs only the question.
 *
 * It asks for one sentence and an optional place, and never for a name, an address or an account.
 */
test("every language asks the reader who found nothing what they came for", () => {
  for (const { file, language } of reportPages) {
    const html = readFileSync(file, "utf8");
    const text = words(language);
    const at = html.indexOf('id="looking"');
    assert.ok(at > 0, `${file} never asks what a reader came for: a search that found nothing has nowhere to go`);

    const section = html.slice(at);
    assert.ok(section.includes(text.reportLookingTitle), `${file} asks the third question in another language`);
    assert.match(section, /name="detail"[^>]*required/u, `${file} would accept a report that says nothing`);
    assert.match(section, /name="where"/u, `${file} cannot be told where the reader was looking`);
    assert.doesNotMatch(
      section,
      /name="email"|name="account"|type="email"/iu,
      `${file} asks for a way to reply that this form has never needed`,
    );
    assert.ok(
      section.includes(`data-subject="${text.reportMailSubjectLooking}"`),
      `${file} files a gap under the same subject as something else, so no inbox can tell them apart`,
    );
  }
});

/**
 * And the way in. A section nobody is sent to is a section nobody uses: the moment a search says it
 * found nothing is the moment to offer it, in the language of that page, pointing at that page's own
 * intake. The link is written into the page rather than built at runtime, so it still goes somewhere
 * useful if the script never runs.
 */
test("a search that found nothing offers the reader the way to say so", () => {
  const searchPages = [
    { file: path.join(DIST, "search", "index.html"), language: "en", country: "" },
    ...Object.entries(catalogue.jurisdictions)
      .filter(([iso]) => iso !== "EU")
      .map(([iso, { lang }]) => {
        const slug = SEARCH_SLUGS[iso as keyof typeof SEARCH_SLUGS];
        assert.ok(slug, `${iso} has no search slug, so this test would look for a page that cannot exist`);
        return { file: path.join(DIST, iso.toLowerCase(), slug, "index.html"), language: lang, country: `${iso.toLowerCase()}/` };
      }),
  ];
  assert.equal(searchPages.length, 6, "the catalogue no longer has the six language surfaces this test expects");

  for (const { file, language, country } of searchPages) {
    const html = readFileSync(file, "utf8");
    const text = words(language);
    assert.ok(html.includes(text.reportLookingForm), `${file} lets a reader who found nothing leave without a word`);
    assert.ok(
      html.includes(`href="/${country}${text.reportSlug}/?type=looking"`),
      `${file} points a reader at the wrong intake page, or at one in another language`,
    );
    assert.match(html, /<script[^>]*src="\/search\.js"/u, `${file} never loads the script that reveals the offer`);
  }
});
