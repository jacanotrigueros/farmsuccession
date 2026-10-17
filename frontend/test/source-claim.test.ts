import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

const DIST = path.join(import.meta.dirname, "..", "dist");
function pages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? pages(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}
const visible = (html: string): string =>
  decodeHTML(html.replaceAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gu, "").replaceAll(/<[^>]*>/gu, ""))
    .replaceAll(/\s+/gu, " ")
    .trim();
const containing = (html: string, tag: string): string =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gu"))].find(([, body]) =>
    body!.includes("data-source-claim"),
  )?.[1] ?? "";
const claims = (html: string): string[] =>
  [...html.matchAll(/<span\b[^>]*\bdata-source-claim\b[^>]*>([\s\S]*?)<\/span>/gu)].map(([, body]) =>
    decodeHTML(body!.replaceAll(/<[^>]*>/gu, ""))
      .replaceAll(/\s+/gu, " ")
      .trim(),
  );

test("the home badge and every footer render the same source claim for their language", () => {
  const home = readFileSync(path.join(DIST, "index.html"), "utf8");
  const [hero, footer] = home.split(/<footer\b/u);
  const heroClaims = claims(hero!);
  const footerClaims = claims(footer!);
  assert.equal(
    heroClaims.length,
    1,
    "the home badge must use the shared source claim; a short independent trust label can overstate what the footer explains",
  );
  assert.equal(footerClaims.length, 1, "the footer must use the same source claim instead of defining verification independently");
  assert.ok(heroClaims[0], "an empty shared claim gives the reader no account of the evidence");
  assert.equal(
    heroClaims[0],
    footerClaims[0],
    "the two surfaces must describe the same checks; shared data is ineffective if a template appends its own promise",
  );

  assert.equal(visible(containing(hero!, "li")), heroClaims[0], "the badge must not append a separate assurance to the shared claim");
  assert.equal(visible(containing(footer!, "p")), footerClaims[0], "the footer must not append a separate assurance to the shared claim");

  const byLanguage = new Map<string, string>();
  for (const file of pages()) {
    const html = readFileSync(file, "utf8");
    const language = /<html\b[^>]*\blang="([^"]+)"/u.exec(html)?.[1];
    const footer = html.split(/<footer\b/u)[1] ?? "";
    const rendered = claims(footer);
    assert.equal(rendered.length, 1, `${file}: every footer needs the shared explanation, including non-English pages`);
    assert.ok(language && rendered[0], `${file}: no language or no visible source claim was checked`);
    assert.equal(visible(containing(footer, "p")), rendered[0], `${file}: the footer must not extend the shared claim independently`);
    const previous = byLanguage.get(language!);
    if (previous) assert.equal(rendered[0], previous, `${file}: the source claim must not change with page type or territory`);
    byLanguage.set(language!, rendered[0]!);
  }
  assert.equal(byLanguage.size, 6, "the shared source claim was not checked in all six languages");
});
