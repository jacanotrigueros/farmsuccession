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

export type Language = "en" | "es";

const isLanguage = (value: string): value is Language => value === "en" || value === "es";

/**
 * Narrows a language recorded in the data to one the site can actually write, and throws otherwise. A
 * territory published in a language whose words nobody wrote would otherwise render as English chrome
 * around text in another language: a page nobody reviewed, which the build is the right place to catch.
 */
export function asLanguage(language: string): Language {
  if (!isLanguage(language)) {
    throw new Error(
      `no words are written in "${language}": add that language to words.ts and vocabulary.ts before publishing a territory in it`,
    );
  }
  return language;
}

/**
 * A stored date as a reader reads it. UTC, because an ISO date carries no time: parsed as local time, a
 * date can slip to the previous day west of Greenwich, which would quietly misreport the day a source was
 * read.
 */
export const dateIn = (iso: string, language: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(asLanguage(language), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** A figure in the reader's own convention, keeping whatever precision the source published. */
export const numberIn = (value: number, language: string): string =>
  value.toLocaleString(asLanguage(language), { maximumFractionDigits: 2 });

/** An amount of money, which has a symbol and a convention of its own in each language. */
export const moneyIn = (value: number, language: string): string =>
  value.toLocaleString(asLanguage(language), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });

/** Several things in one sentence, joined the way the language joins them: "a, b and c", "a, b y c". */
export const listIn = (items: readonly string[], language: string): string =>
  new Intl.ListFormat(asLanguage(language), { style: "long", type: "conjunction" }).format(items);
