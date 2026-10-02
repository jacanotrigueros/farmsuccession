/**
 * Faults in the strings of an edition file or a research brief that the schema cannot see and that
 * drafts really carried: a stray control character, text decoded with the wrong encoding, markup or a
 * placeholder left in, a tracking link, and a sentence written in a language other than the
 * territory's.
 *
 * Every string is checked for control characters, broken encoding and edge spaces, whatever it holds.
 * The rules about how prose is written — spacing, markup, placeholders, language — leave quotes and
 * search queries alone: a quote is copied from the page as it stands, and a query is typed into a
 * search engine, not read by anybody.
 *
 * Problems are addressed by JSON pointer rather than by a label, because this walk knows nothing
 * about the document it is given and has to work the same for an edition and for a brief. The checks
 * that do know the shape of an edition name the resource instead (see `reader-text.ts`).
 */

/** The languages of the catalogue, by the `lang` of each jurisdiction in `data/territories.json`. */
export const LANGUAGE_NAMES: Record<string, string> = {
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
};

/**
 * Function words per language. A word counts as foreign only when it is not also a word of the
 * text's own language, so "de" is foreign in Italian but not in French.
 */
const FUNCTION_WORDS: Record<string, ReadonlySet<string>> = {
  de: words(
    "der die das den dem des ein eine einer eines und oder zu zum zur im in auf mit ohne für von vom bei nach aus über unter ist sind war auch noch schon wie mehr aber nicht sich sein seine wenn werden wird",
  ),
  en: words(
    "the a an and or of to in on for with without by from at is are was be also still already as more but not this that these their its when where which should must have has been",
  ),
  es: words(
    "el la los las un una unos unas y o de del al que en para por con sin sobre entre hasta desde pero también aún ya está están es son ser fue según como más muy no se su sus este esta estos estas lo le les cuando donde porque hay aunque mediante sino",
  ),
  fr: words(
    "le la les un une des et ou de du au aux en dans pour par avec sans sur entre que qui ne pas plus est sont été être aussi encore déjà comme mais se ce cette ces son sa ses leur lorsque où il ils elle si ma mon",
  ),
  it: words(
    "il lo la i gli le un una uno e ed o di del della dei degli delle al alla ai agli alle da dal dalla in nel nella nei con su sul sulla per tra fra che non si è sono anche ancora già più come ma se questo questa quando dove perché ogni essere però",
  ),
  pt: words(
    "o a os as um uma e ou de do da dos das ao aos em no na nos nas para por com sem sobre entre até que não se é são está estão também ainda já como mais mas seu sua seus suas este esta quando onde porque pelo pela muito",
  ),
};

function words(list: string): ReadonlySet<string> {
  return new Set(list.split(" "));
}

/**
 * How many distinct foreign function words make a text read as another language.
 *
 * Measured, not chosen: across the 2,085 pieces of prose in the 101 real editions, no text correctly
 * written in its own language reaches two — 84 reach exactly one, always a coincidence ("es" and "an"
 * are German words as well as Spanish and English ones). A sentence left in the wrong language scores
 * far higher: at two, 99 % of real sentences of twenty words or more are caught. Two is therefore the
 * first value above the noise, and the margin is one word, which is why the particles of official
 * names are taken out below before counting.
 */
const FOREIGN_WORDS_LIMIT = 2;

/** The property names that hold a URL. There is no `httpsUrl` property: that is the schema's type. */
const URL_KEYS = new Set(["url", "accessUrl", "sourceUrl"]);
/** Strings that are not prose: a search query is typed into a search engine, not read. */
const NOT_PROSE_KEYS = new Set([...URL_KEYS, "query"]);

/**
 * Characters that must never reach the page: the C0 and C1 ranges, including the tabs and newlines
 * that come with text copied out of a PDF, and the invisible spaces and joiners that survive a copy
 * from a web page. U+FFFD is the replacement character, which means the text was already lost once.
 */
// oxlint-disable-next-line no-control-regex -- finding control characters is the point of the rule
const CONTROL = /[\u0000-\u001F\u007F-\u009F​-‍⁠﻿�]/u;
/** UTF-8 read as Latin-1 or Windows-1252: "Ã©" for "é", "â€™" for "’", "Â " for a no-break space. */
const MOJIBAKE = /Ã[\u0080-¿]|â€|â‚¬|Â[ -¿]/u;
const MARKUP = /<\/?[a-z][a-z\d]*(?:\s[^<>]*)?\/?>|&(?:[a-z]+|#\d+|#x[\da-f]+);|\*\*|\]\(|^#{1,6}\s|`/imu;
const PLACEHOLDER = /\b(?:TODO|TBD|FIXME|XXX)\b|[Ll]orem ipsum/u;
const TRACKING = /[?&](?:utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|_ga|_gl)=|#:~:text=/iu;
const WORD = /\p{L}+(?:['’-]\p{L}+)*/gu;
/** Links, paths and names in quotation marks may be in any language. */
const NOT_OWN_WORDS = /https?:\/\/\S+|\S+\/\S*|«[^»]*»|“[^”]*”|„[^“”]*[“”]|"[^"]*"/gu;
/**
 * A particle inside an official name: the "do" of "Consellería do Medio Rural", the "del" of
 * "Institut Català del Sòl". Spanish prose about Galicia, Catalonia or the Basque Country carries
 * these constantly, and they are part of the body's name, not the language of the sentence. Taking
 * them out costs almost nothing in sensitivity — 99.0 % to 98.8 % of long misplaced sentences — and
 * removes the one false alarm the real corpus comes closest to.
 */
const NAME_PARTICLE = /(?<=\p{Lu}[\p{L}-]*[,;:]?\s)\p{Ll}{1,4}(?=\s\p{Lu})/gu;

/**
 * Every problem in `data` — a parsed edition file or brief — whose prose is written in `language`,
 * each as "<JSON pointer>: <what is wrong>".
 */
export function textProblems(data: unknown, language: string): string[] {
  const problems: string[] = [];
  walk(data, "", "", false, (pointer, key, inQuote, text) => {
    for (const problem of stringProblems(text, key, inQuote, language)) problems.push(`${pointer || "/"}: ${problem}`);
  });
  return problems;
}

type Visit = (pointer: string, key: string, inQuote: boolean, text: string) => void;

function walk(value: unknown, pointer: string, key: string, inQuote: boolean, visit: Visit): void {
  if (typeof value === "string") visit(pointer, key, inQuote, value);
  else if (Array.isArray(value)) {
    // An array keeps its property's key and quote state: the strings of `quotes` are still quotes.
    value.forEach((item, index) => walk(item, `${pointer}/${index}`, key, inQuote, visit));
  } else if (value && typeof value === "object") {
    for (const [child, item] of Object.entries(value)) {
      walk(item, `${pointer}/${escapeKey(child)}`, child, inQuote || child === "quotes", visit);
    }
  }
}

const escapeKey = (key: string): string => key.replaceAll("~", "~0").replaceAll("/", "~1");

function stringProblems(text: string, key: string, inQuote: boolean, language: string): string[] {
  const problems: string[] = [];
  const control = CONTROL.exec(text);
  if (control) problems.push(`contains the invisible or control character U+${codePoint(control[0])}; keep text on one line and retype it`);
  const broken = MOJIBAKE.exec(text);
  if (broken) problems.push(`contains "${broken[0]}", text decoded with the wrong encoding; copy it again as UTF-8`);
  if (!text.trim()) return [...problems, "is empty"];
  if (text !== text.trim()) problems.push("starts or ends with a space");
  if (URL_KEYS.has(key)) {
    if (/\s/u.test(text)) problems.push("is a URL with a space in it");
    const tracking = TRACKING.exec(text);
    if (tracking) problems.push(`is a URL with the tracking or highlight part "${tracking[0]}"; cite the plain address`);
  }
  if (inQuote || NOT_PROSE_KEYS.has(key)) return problems;
  if (/ {2}/u.test(text)) problems.push("has two spaces in a row");
  const markup = MARKUP.exec(text);
  if (markup) problems.push(`contains the markup "${markup[0]}"; the site shows text as written`);
  const placeholder = PLACEHOLDER.exec(text);
  if (placeholder) problems.push(`contains the placeholder "${placeholder[0]}"`);
  const foreign = foreignLanguage(text, language);
  if (foreign) {
    const found = foreign.words.map((word) => `"${word}"`).join(", ");
    problems.push(
      `reads as ${LANGUAGE_NAMES[foreign.language]} (${found}), not ${LANGUAGE_NAMES[language]}; prose is written in the territory's language and only quotes keep the language of the page`,
    );
  }
  return problems;
}

const codePoint = (char: string): string => (char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0");

/**
 * The catalogue language `text` slips into, judged by its function words: at least
 * `FOREIGN_WORDS_LIMIT` distinct words of that language that are not words of `language`, and the
 * language with the most of them when several qualify. Undefined when the text reads as its own
 * language, or when `language` has no word list.
 *
 * What this cannot do, and no threshold would fix: tell Galician or Catalan from Spanish. They share
 * most of their function words with it, so a paragraph left in the language of a Spanish region reads
 * as Spanish here. The check is for a text left in another of the catalogue's six languages, which is
 * the mistake that actually happens when one researcher works through several countries.
 */
export function foreignLanguage(text: string, language: string): { language: string; words: string[] } | undefined {
  const own = FUNCTION_WORDS[language];
  if (!own) return undefined;
  const prose = text.replaceAll(NOT_OWN_WORDS, " ").replaceAll(NAME_PARTICLE, " ");
  const tokens = new Set(
    (prose.match(WORD) ?? [])
      // Codes and acronyms in capitals (TO_CHECK, UPA, SRE01) are not words of any language.
      .filter((token) => token !== token.toUpperCase())
      .map((token) => token.toLowerCase())
      .filter((token) => token.length > 1 && !own.has(token)),
  );
  let best: { language: string; words: string[] } | undefined;
  for (const [other, list] of Object.entries(FUNCTION_WORDS)) {
    if (other === language) continue;
    const found = [...tokens].filter((token) => list.has(token));
    if (found.length >= FOREIGN_WORDS_LIMIT && found.length > (best?.words.length ?? 0)) best = { language: other, words: found };
  }
  return best;
}
