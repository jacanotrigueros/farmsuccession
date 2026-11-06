/** The same language rules for built text and for counts rewritten in the reader's browser. */
/** @type {Record<string, string>} */
const LOCALES = { en: "en", es: "es", de: "de", fr: "fr", it: "it", pt: "pt-PT", nl: "nl" };

/**
 * The locale to format in. A site language uses its own conventions; a tag of a site language and a
 * country (`de-AT`, from a jurisdiction's `locale` in the catalogue) uses that country's, so an Austrian
 * page says Jänner while a German one says Januar. Anything else is refused rather than guessed.
 * @param {string} language
 */
export function localeOf(language) {
  const locale = LOCALES[language];
  if (locale) return locale;
  const [, primary] = /^([a-z]{2})-[A-Z]{2}$/u.exec(language) ?? [];
  if (primary && LOCALES[primary]) return language;
  throw new Error(`no locale for ${language}: write its formatting rules before publishing it`);
}

/**
 * These seven languages use two noun forms here. French zero and decimals below two use the first;
 * French and Romance "many" categories use the same second form as "other" for these nouns and units.
 * @param {number} value @param {string} language @returns {0 | 1}
 */
export const pluralIndex = (value, language) => (new Intl.PluralRules(localeOf(language)).select(value) === "one" ? 0 : 1);

/** @param {number} value @param {string} language */
export const numberIn = (value, language) => value.toLocaleString(localeOf(language), { maximumFractionDigits: 2 });

/** @param {number} value @param {readonly [string, string]} forms @param {string} language */
export const counted = (value, forms, language) => `${numberIn(value, language)} ${forms[pluralIndex(value, language)]}`;
