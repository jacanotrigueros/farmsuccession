/**
 * The languages the site writes in, and how it writes the things that are not words: dates, numbers,
 * quantities and lists.
 *
 * A date is stored as `2026-09-28` because that is what a machine can order and compare. It is not what a
 * reader reads, and "consultada el 2026-09-28" is a code showing through a page. So every date a reader
 * sees goes through here, while the `<time datetime>` beside it keeps the stored form for anything that
 * parses the page.
 *
 * The same goes for figures: `20405` is the value the source published, `20.405` is how it is written in
 * Spanish and `20,405` in English. Getting that wrong does not merely look foreign, it misreads the number
 * by three orders of magnitude for anybody who knows the other convention.
 */

import { localeOf } from "../../public/locale.js";
export { dateIn, numberIn } from "../../public/locale.js";

export const LANGUAGES = ["en", "es", "de", "fr", "it", "pt", "nl", "ro"] as const;
export type Language = (typeof LANGUAGES)[number];

const isLanguage = (value: string): value is Language => LANGUAGES.some((language) => language === value);

/**
 * Narrows a language recorded in the data to one the site can actually write, and throws otherwise. A
 * territory published in a language whose words nobody wrote would otherwise render as English chrome
 * around text in another language: a page nobody reviewed, which the build is the right place to catch.
 */
export function asLanguage(language: string): Language {
  // A locale (`de-AT`) writes its language's words; only its dates and numbers differ.
  const primary = language.split("-")[0] ?? language;
  if (!isLanguage(primary)) {
    throw new Error(
      `no words are written in "${language}": add that language to words.ts and vocabulary.ts before publishing a territory in it`,
    );
  }
  return primary;
}

/**
 * A country as a reader of this page names it: "Germany" on an English page, "Alemania" on a Spanish one.
 * A territory's own `officialName` is written in its own language ("Deutschland", "Nederland"), which is
 * right on that country's page and wrong on a list read in another language, where the reader looks for
 * the word they know. The names come from the runtime's CLDR data, not from a table of ours, so every
 * language the site writes gets every country without anybody translating them by hand.
 */
export const countryNameIn = (iso: string, language: string): string =>
  new Intl.DisplayNames([localeOf(language)], { type: "region", fallback: "code" }).of(iso) ?? iso;

/** An amount of money, which has a symbol and a convention of its own in each language. */
export const moneyIn = (value: number, language: string): string =>
  value.toLocaleString(localeOf(language), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });

/** Several things in one sentence, joined the way the language joins them: "a, b and c", "a, b y c". */
export const listIn = (items: readonly string[], language: string): string =>
  new Intl.ListFormat(localeOf(language), { style: "long", type: "conjunction" }).format(items);
