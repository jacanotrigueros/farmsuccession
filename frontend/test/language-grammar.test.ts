import assert from "node:assert/strict";
import { test } from "node:test";

import { readFileSync } from "node:fs";
import path from "node:path";

import { localeOf } from "../public/locale.js";
import { dateIn, moneyIn, numberIn } from "../src/lib/language.ts";
import { quantity, stateLabel } from "../src/lib/vocabulary.ts";
import { counted, words } from "../src/lib/words.ts";

const forms = {
  en: ["0 resources", "1 resource", "2 resources"],
  es: ["0 recursos", "1 recurso", "2 recursos"],
  de: ["0 Angebote", "1 Angebot", "2 Angebote"],
  fr: ["0 ressource", "1 ressource", "2 ressources"],
  it: ["0 risorse", "1 risorsa", "2 risorse"],
  pt: ["0 recursos", "1 recurso", "2 recursos"],
  nl: ["0 vermeldingen", "1 vermelding", "2 vermeldingen"],
};
for (const [language, expected] of Object.entries(forms)) {
  test(`${language}: zero, one and two use that language's noun forms`, () => {
    assert.deepEqual(
      [0, 1, 2].map((count) => counted(count, words(language).record, language)),
      expected,
      `${language}: French zero takes the singular, while European Portuguese zero takes the plural; testing only one and two lets an English rule pass`,
    );
  });
}

test("French quantities below two keep the singular unit", () => {
  assert.deepEqual(
    [0, 1, 1.5, 2].map((value) => quantity(value, "HECTARES", "fr")),
    ["0 hectare", "1 hectare", "1,5 hectare", "2 hectares"],
    "a decimal value is not automatically plural in French; use the language's cardinal rules rather than value === 1",
  );
});

test("Portugal's money and numbers use European Portuguese, not the default Brazilian locale", () => {
  assert.equal(
    moneyIn(1000, "pt"),
    "1000\u00a0€",
    "the Portugal tree places the euro after the amount; plain pt resolves to Brazilian formatting",
  );
  assert.equal(numberIn(1234.5, "pt"), "1234,5", "Portugal does not write this four-digit figure as Brazilian 1.234,5");
  assert.equal(dateIn("2026-09-28", "pt"), "28 de setembro de 2026", "locale selection must not change the day the source was read");
});

test("Dutch writes money, figures and dates the Dutch way", () => {
  assert.equal(moneyIn(1000, "nl"), "€ 1.000", "Dutch puts the euro sign before the amount and groups thousands with a dot");
  assert.equal(numberIn(1234.5, "nl"), "1.234,5", "a Dutch decimal comma, not an English point");
  assert.equal(dateIn("2026-09-28", "nl"), "28 september 2026", "Dutch month names are written in lower case");
});

test("an Austrian locale writes German the Austrian way and still reads German words", () => {
  assert.equal(dateIn("2027-01-15", "de-AT"), "15. Jänner 2027", "Austria says Jänner; the German default would print Januar");
  assert.equal(dateIn("2027-01-15", "de"), "15. Januar 2027", "Germany keeps Januar");
  assert.equal(moneyIn(1000, "de-AT"), "€ 1.000", "Austria puts the euro sign before the amount");
  assert.equal(words("de-AT").aboutSlug, words("de").aboutSlug, "a locale formats differently but writes the same words as its language");
  assert.throws(
    () => dateIn("2027-01-15", "de-AT-x"),
    /no locale/u,
    "a tag that is not a site language and a country is refused, not guessed",
  );
  assert.throws(() => dateIn("2027-01-15", "xx-AT"), /no locale/u, "a country tag of a language the site does not write is refused");
});

test("French and Italian state adjectives agree with the resource they describe", () => {
  assert.match(
    stateLabel("ANNOUNCED_NOT_OPERATING", "fr"),
    /annoncée.*opérationnelle/u,
    "ressource is feminine: annoncé and opérationnel cannot describe it",
  );
  assert.match(stateLabel("DISCONTINUED", "fr"), /supprimée/u, "the feminine ressource stays feminine when its operation ends");
  assert.match(
    stateLabel("ANNOUNCED_NOT_OPERATING", "it"),
    /annunciata.*operativa/u,
    "risorsa is feminine: annunciato and operativo cannot describe it",
  );
  assert.match(stateLabel("HISTORICAL", "it"), /storica/u, "a historical risorsa is storica, not storico");
  assert.match(stateLabel("DISCONTINUED", "it"), /soppressa/u, "a discontinued risorsa is soppressa, not soppresso");
});

test("German intake keeps the catalogue's name for an Angebot", () => {
  const text = words("de");
  assert.doesNotMatch(
    [text.reportTitle, text.reportMissingTitle, text.reportNameLabel, text.reportRecordLabel, text.reportContactLead].join(" "),
    /Ressource/u,
    "German cards and filters call it an Angebot; the reporting form must not teach Ressource as a second name for the same record",
  );
});

/**
 * The mirror of the test above, which is the test that caused the bug.
 *
 * German cards call a record an Angebot, so the test above forbids the word Ressource anywhere in the
 * German intake. It names `reportRecordLabel`, and on 15 October a replace satisfied it. French
 * `reportRecordLabel` said "Ressource" too, so the replace landed there as well, and the French intake
 * began labelling a record "Angebot" — between "Territoire" and "Page FarmSuccession" — in the box that
 * tells a reader what is about to be sent on their behalf, and in the email itself. It shipped.
 *
 * Nothing guarded the other direction, so this is that guard. It is drawn between these two languages
 * and no others because they are the only pair in the vocabulary that shares nothing: between Spanish
 * and Portuguese, or English and French, a repeated string is usually a cognate, and the same rule
 * there would need a list of sixty exceptions that nobody would keep true.
 */
test("no French string is a German one, because a word landing in the wrong language still ships", () => {
  const fr = words("fr") as unknown as Record<string, unknown>;
  const de = words("de") as unknown as Record<string, unknown>;
  const shared = Object.entries(fr)
    .filter(([key, value]) => typeof value === "string" && value !== "" && de[key] === value)
    .map(([key]) => key)
    .toSorted();

  assert.deepEqual(
    shared,
    ["siteName"],
    "French and German share no vocabulary, so the site's own name is the only string that may be identical in both — even a title template differs, because French spaces its colon. Anything else here is a replace aimed at one language that landed in the other.",
  );
});

test("answers about a resource do not refer to a masculine call that does not exist", () => {
  assert.match(words("fr").applyAnnounced, /la ressource.*annoncée/u, "the no-call answer describes a feminine ressource, not an appel");
  assert.match(words("fr").applyHistorical, /la ressource/u, "French il cannot refer back to the feminine ressource");
  assert.match(words("it").applyAnnounced, /la risorsa.*annunciata/u, "the no-call answer describes a feminine risorsa, not a bando");
});

test("the country split names its counted resources without guessing an article or an adjective ending", () => {
  for (const language of ["en", "es", "de", "fr", "it", "pt", "nl"]) {
    assert.equal(
      words(language).applicableSplit,
      `{where}${words(language).labelSeparator}{own} + {inherited}.`,
      `${language}: a count without a noun forced uninflected participles and forms such as pour France and per Italia; use a named count after the territory instead`,
    );
  }
});

test("every locale in the catalogue is its own language written for one country, and can be formatted", () => {
  const catalogue = JSON.parse(readFileSync(path.join(import.meta.dirname, "..", "..", "data", "territories.json"), "utf8")) as {
    jurisdictions: Record<string, { lang: string; locale?: string }>;
  };
  const withLocale = Object.entries(catalogue.jurisdictions).filter(([, { locale }]) => locale !== undefined);
  assert.ok(
    withLocale.some(([iso]) => iso === "AT"),
    "Austria no longer asks for its own locale, so this test proves nothing",
  );
  for (const [iso, { lang, locale }] of withLocale) {
    assert.equal(locale!.split("-")[0], lang, `${iso}: a locale formats the jurisdiction's own language, never another one`);
    assert.equal(locale!.split("-")[1], iso, `${iso}: a locale names the jurisdiction's own country`);
    assert.equal(localeOf(locale!), locale, `${iso}: the site can format in ${locale}`);
  }
});
