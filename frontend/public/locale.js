/** The same language rules for built text and for counts rewritten in the reader's browser. */
/** @type {Record<string, string>} */
const LOCALES = {
  en: "en",
  es: "es",
  de: "de",
  fr: "fr",
  it: "it",
  pt: "pt-PT",
  nl: "nl",
  ro: "ro-RO",
  el: "el-GR",
  pl: "pl-PL",
  hu: "hu-HU",
  hr: "hr-HR",
};

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
 * Which of a word table's forms a count takes: [one, other] for most languages, [one, few, many] for Polish
 * and Croatian. Polish puts 5+ in "many" and fractions in "other" (the "few" form); Croatian has no "many",
 * so its "other" (5 and up) takes the third form. French zero and decimals below two use the first form.
 * The built pages and the script that rewrites a count after a filter both ask here, so a narrowed list
 * never says «15 zasoby» where the page said «15 zasobów».
 * @param {number} value @param {string} language @param {number} [forms] how many forms the table has
 * @returns {number}
 */
export const formIndex = (value, language, forms = 2) => {
  const locale = localeOf(language);
  const form = new Intl.PluralRules(locale).select(value);
  if (form === "one") return 0;
  const third = form === "many" || (form === "other" && locale.startsWith("hr-"));
  return forms > 2 && third ? 2 : 1;
};

/** @param {number} value @param {string} language */
export const numberIn = (value, language) => value.toLocaleString(localeOf(language), { maximumFractionDigits: 2 });

/**
 * Two forms ([one, other]) for most languages; Polish and Croatian give three ([one, few, many]):
 * 1 gospodarstwo, 2 gospodarstwa, 5 gospodarstw; 1 gospodarstvo, 2 gospodarstva, 5 gospodarstava.
 * Polish fractions ("other") take the "few" form. Hungarian repeats one form: 5 gazdaság.
 * @param {number} value @param {readonly string[]} forms @param {string} language
 */
export const counted = (value, forms, language) => {
  const locale = localeOf(language);
  const form = new Intl.PluralRules(locale).select(value);
  // Romanian puts “de” between the number and noun for counts such as 20 and 100.
  const separator = locale.startsWith("ro-") && form === "other" ? " de " : " ";
  return `${numberIn(value, language)}${separator}${forms[formIndex(value, language, forms.length)]}`;
};

/** Format a source's calendar day without shifting it into the previous day in another time zone.
 * @param {string} iso @param {string} language @param {"long"|"short"} month
 */
export const dateIn = (iso, language, month = "long") =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(localeOf(language), {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  });
