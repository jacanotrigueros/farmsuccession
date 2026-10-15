/** The same language rules for built text and for counts rewritten in the reader's browser. */
/** @type {Record<string, string>} */
const LOCALES = { en: "en", es: "es", de: "de", fr: "fr", it: "it", pt: "pt-PT" };

/** @param {string} language */
export function localeOf(language) {
  const locale = LOCALES[language];
  if (!locale) throw new Error(`no locale for ${language}: write its formatting rules before publishing it`);
  return locale;
}

/**
 * These six languages use two noun forms here. French zero and decimals below two use the first;
 * French and Romance "many" categories use the same second form as "other" for these nouns and units.
 * @param {number} value @param {string} language @returns {0 | 1}
 */
export const pluralIndex = (value, language) => (new Intl.PluralRules(localeOf(language)).select(value) === "one" ? 0 : 1);

/** @param {number} value @param {string} language */
export const numberIn = (value, language) => value.toLocaleString(localeOf(language), { maximumFractionDigits: 2 });

/** @param {number} value @param {readonly [string, string]} forms @param {string} language */
export const counted = (value, forms, language) => `${numberIn(value, language)} ${forms[pluralIndex(value, language)]}`;
