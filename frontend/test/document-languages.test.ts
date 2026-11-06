import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
const ROOT = path.join(DIST, "..", "..");
const catalogue = JSON.parse(readFileSync(path.join(ROOT, "data", "territories.json"), "utf8")) as {
  jurisdictions: Record<string, { lang: string }>;
};
const everyCopy = Object.entries(catalogue.jurisdictions).map(([country, { lang }]) => ({
  language: lang,
  home: country === "EU" ? "/" : `/${country.toLowerCase()}/`,
}));
/** The first jurisdiction in the catalogue that writes a language owns that language's document. */
const languages = everyCopy.filter(({ language }, index) => everyCopy.findIndex((copy) => copy.language === language) === index);
const copies = everyCopy.filter((copy) => !languages.includes(copy));
const origin = "https://farmsuccession.eu";
const read = (route: string) => readFileSync(path.join(DIST, route, "index.html"), "utf8");
const alternates = (html: string) =>
  [...html.matchAll(/<link\b[^>]*\bhreflang="([^"]+)"[^>]*>/gu)].map(([tag, language]) => ({
    language: language!,
    href: /\bhref="([^"]+)"/u.exec(tag)?.[1],
    rel: /\brel="([^"]+)"/u.exec(tag)?.[1],
  }));

for (const kind of ["about", "history"] as const) {
  test(`${kind}: every translation names itself and all its reciprocal language versions`, () => {
    const versions = languages.map(({ language, home }) => ({
      language,
      route: `${home}${words(language)[kind === "about" ? "aboutSlug" : "historySlug"]}/`,
    }));
    assert.equal(
      versions.length,
      6,
      "the six-language document group changed: review which pages are genuine translations before extending it",
    );
    const english = versions.find(({ language }) => language === "en");
    assert.ok(english, "the English document is the existing default, not the European directory homepage");
    const expected = [
      ...versions.map(({ language, route }) => ({ language, href: origin + route, rel: "alternate" })),
      { language: "x-default", href: origin + english.route, rel: "alternate" },
    ].sort((a, b) => a.language.localeCompare(b.language));
    for (const { language, route } of versions) {
      const html = read(route);
      assert.deepEqual(
        alternates(html).sort((a, b) => a.language.localeCompare(b.language)),
        expected,
        `${route}: this is a translated document, not a different country's directory. Publish the complete reciprocal group, including itself; partial or country-homepage links misidentify what the alternative contains.`,
      );
      assert.ok(html.includes(`<html lang="${language}">`), `${route}: an alternate must identify the language its own document uses`);
      assert.ok(
        html.includes(`rel="canonical" href="${origin + route}"`),
        `${route}: a translation remains canonical to itself, not to English`,
      );
      assert.doesNotMatch(
        html,
        /name="robots" content="noindex/u,
        `${route}: a noindex page cannot be offered as an indexable language version`,
      );
    }
  });
}

for (const kind of ["about", "history"] as const) {
  test(`${kind}: a second country writing the same language repeats the document instead of translating it`, () => {
    const slug = (language: string) => words(language)[kind === "about" ? "aboutSlug" : "historySlug"];
    for (const { language, home } of copies) {
      const original = languages.find((version) => version.language === language);
      assert.ok(original, `${home}: no country owns the ${language} document this copy repeats`);
      const html = read(`${home}${slug(language)}/`);
      assert.ok(
        html.includes(`rel="canonical" href="${origin}${original.home}${slug(language)}/"`),
        `${home}${slug(language)}/: a copy in a language another country already writes names that document as its original`,
      );
      assert.equal(
        alternates(html).length,
        0,
        `${home}${slug(language)}/: a copy offering language versions would put two ${language} pages in one translation group`,
      );
    }
  });
}

function pages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? pages(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

test("territories, records and utilities never become translations by sharing a template", () => {
  // Compute the allowlist independently of earlier tests: node:test must not rely on their execution order.
  const allowed = new Set(
    languages.flatMap(({ language, home }) => [`${home}${words(language).aboutSlug}/`, `${home}${words(language).historySlug}/`]),
  );
  let checked = 0;
  for (const file of pages()) {
    const route = "/" + path.relative(DIST, file).replace(/index\.html$/u, "");
    if (allowed.has(route)) continue;
    checked++;
    assert.deepEqual(
      alternates(readFileSync(file, "utf8")),
      [],
      `${route}: different countries document different instruments; a shared layout does not make their pages translations`,
    );
  }
  assert.ok(checked > 0, "no other pages: the exclusion of territorial translations was never tested");
});
