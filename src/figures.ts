import type { EditionSnapshot, Metric, Resource } from "./types/edition.ts";

/**
 * The unit of a figure: every unit a metric can declare, plus the two that only ever appear in
 * prose. A percentage is how most aid is actually described ("up to 90 % of eligible spend") and no
 * metric can hold one; square metres appear when a municipal plot is measured.
 */
export type FigureUnit = Metric["unit"] | "PERCENT" | "SQUARE_METRES";

/**
 * One figure, read from reader-facing text or from the evidence of the file.
 *
 * A date is its own kind rather than three numbers. Reading "28 de setembro de 2026" as 28, 9 and
 * 2026 looks thorough and is close to useless: a day and a month are two-digit numbers that almost
 * any evidence contains, so they match by accident, and the month never matches at all when the page
 * writes its name instead of its number. Compared as one date against the dates of the file, a
 * deadline is either supported or invented.
 *
 * `year` is absent when the text gives none ("closes on 15 October"), `unit` when the text states
 * none or states one that cannot be read safely. An absent part matches anything, because a figure
 * whose unit was guessed wrong would be reported as invented, and a check that cries wolf is a check
 * researchers learn to skip.
 *
 * `text` is the figure as it was written, so a report can quote what to look for on the page instead
 * of a normalised number nobody will find there.
 */
export type Figure =
  | { readonly kind: "DATE"; readonly year?: number; readonly month: number; readonly day: number; readonly text: string }
  | { readonly kind: "QUANTITY"; readonly value: number; readonly unit?: FigureUnit; readonly text: string };

/**
 * Month names in the languages the editions are written in — Spanish, Catalan, Galician, French,
 * Italian, Portuguese, German and English — with the unaccented spellings pages also use. A month
 * written as a word is the normal way a date reaches reader text, so a name missing from this list
 * is a date read as loose numbers.
 */
const MONTH_NAMES: readonly (readonly string[])[] = [
  ["enero", "gener", "xaneiro", "janvier", "gennaio", "janeiro", "januar", "january"],
  ["febrero", "febrer", "febreiro", "février", "fevrier", "febbraio", "fevereiro", "februar", "february"],
  ["marzo", "març", "marc", "mars", "março", "marco", "märz", "marz", "march"],
  ["abril", "avril", "aprile", "april"],
  ["mayo", "maig", "maio", "mai", "maggio", "may"],
  ["junio", "juny", "xuño", "xuno", "juin", "giugno", "junho", "juni", "june"],
  ["julio", "juliol", "xullo", "juillet", "luglio", "julho", "juli", "july"],
  ["agosto", "agost", "août", "aout", "august"],
  ["septiembre", "setiembre", "setembre", "setembro", "septembre", "settembre", "september"],
  ["octubre", "outubro", "octobre", "ottobre", "oktober", "october"],
  ["noviembre", "novembre", "novembro", "november"],
  ["diciembre", "desembre", "decembro", "décembre", "decembre", "dicembre", "dezembro", "dezember", "december"],
];

const MONTH_NUMBER = new Map(MONTH_NAMES.flatMap((names, index) => names.map((name) => [name, index + 1] as const)));
const MONTH_ALTERNATION = [...MONTH_NUMBER.keys()].toSorted((a, b) => b.length - a.length).join("|");

/** A date, unless the parts are not a real day of a real month, in which case they are not one. */
function readDate(text: string, year: string | undefined, month: number, day: number): Figure | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { kind: "DATE", ...(year ? { year: Number(year) } : {}), month, day, text: text.trim() };
}

type DateForm = { readonly regex: RegExp; readonly read: (groups: readonly (string | undefined)[], text: string) => Figure | null };

/**
 * How a date can be written: ISO, `31/12/2026` and the `06.08.2026` of decrees and German pages by
 * position, or a spelled month, which allows the full stop German puts after the day, the preposition
 * each language puts before the month and the one it puts before the year.
 *
 * The dotted form is two digits, two digits and four, and no more: loosen it and "7.1/2026" becomes
 * July 2026 and "13.00.00" becomes a date in a year nobody will reach. A grouped amount
 * ("11.200.000,00") never fits that shape either.
 */
const DATE_FORMS: readonly DateForm[] = [
  {
    regex: /(?<![\d-])(\d{4})-(\d{2})-(\d{2})(?![\d-])/gu,
    read: (groups, text) => readDate(text, groups[0], Number(groups[1]), Number(groups[2])),
  },
  {
    regex: /(?<![\d/])(\d{1,2})\/(\d{1,2})\/(\d{4})(?![\d/])/gu,
    read: (groups, text) => readDate(text, groups[2], Number(groups[1]), Number(groups[0])),
  },
  {
    regex: /(?<![\d.])(\d{2})\.(\d{2})\.(\d{4})(?!\d)/gu,
    read: (groups, text) => readDate(text, groups[2], Number(groups[1]), Number(groups[0])),
  },
  {
    regex: new RegExp(
      `(?<![\\p{L}\\d])(\\d{1,2})\\.?\\s+(?:de\\s+|d'|di\\s+|dello\\s+)?(${MONTH_ALTERNATION})(?![\\p{L}])` +
        `(?:\\s+(?:de\\s+|del\\s+|di\\s+|do\\s+|dell'|of\\s+)?(\\d{4}))?`,
      "giu",
    ),
    read: (groups, text) => readDate(text, groups[2], MONTH_NUMBER.get((groups[1] ?? "").toLowerCase()) ?? 0, Number(groups[0])),
  },
];

/**
 * The units that can be read from prose without guessing: `€`, `%` and `m²` are unambiguous symbols,
 * and the words are spelled out in the languages the editions use.
 *
 * Deliberately absent, and each one for a reason seen in the real corpus: `h`, because pages write
 * opening times as "09h00"; `ha`, because it is also a verb in Spanish, Italian and Portuguese
 * ("2024 ha ricevuto"); and "años"/"anni"/"ans", which is an age as often as a duration. A figure
 * read with the wrong unit is reported as invented, so an ambiguous abbreviation is worth less than
 * no unit at all.
 */
const UNIT_WORDS: readonly (readonly [FigureUnit, readonly string[]])[] = [
  ["EUR", ["€", "euro", "euros", "eur"]],
  ["PERCENT", ["%"]],
  ["SQUARE_METRES", ["m2", "m²"]],
  ["HOURS", ["hora", "horas", "heure", "heures", "ora", "ore", "hour", "hours", "stunde", "stunden"]],
  ["HECTARES", ["hectárea", "hectáreas", "hectarea", "hectareas", "hectare", "hectares", "hectàrees", "ettaro", "ettari", "hektar"]],
];

const UNIT_BY_WORD = new Map(UNIT_WORDS.flatMap(([unit, words]) => words.map((word) => [word, unit] as const)));
const UNIT_ALTERNATION = [...UNIT_BY_WORD.keys()]
  .toSorted((a, b) => b.length - a.length)
  .map((word) => word.replaceAll(/[$()*+.?[\\\]^{|}]/gu, "\\$&"))
  .join("|");

/**
 * A number of two or more digits, with the unit written next to it when there is one.
 *
 * Two digits is the floor because a lone digit is almost always a counted word ("in 2 instalments"),
 * and reporting those would bury the figures that matter. Digits glued to letters are codes rather
 * than figures (MR404A, A919), which the boundaries on both sides exclude.
 */
const QUANTITY = new RegExp(`(?<![\\p{L}\\d])(\\d(?:[\\d.,]*\\d)?)\\s*(${UNIT_ALTERNATION})?(?![\\p{L}\\d])`, "giu");

/**
 * The number as the page means it. "20.405", "20,405" and "20405" are one figure, because which
 * separator groups thousands is a convention that changes between pages, not a difference in the
 * amount. Trailing zero cents go for the same reason: 1.500 and 1.500,00 are the same figure to a
 * reader checking it. No amount in the real corpus has non-zero cents, so leaving the
 * decimal-separator ambiguity unresolved costs nothing, and the figure stays the one on the page.
 */
function amount(written: string): number {
  return Number(written.replace(/[.,]00$/u, "").replaceAll(/[.,]/gu, ""));
}

/** Every figure one text states: the dates as dates, then the numbers the dates did not use. */
export function figuresIn(text: string): Figure[] {
  const figures: Figure[] = [];
  let remaining = text;
  for (const form of DATE_FORMS) {
    remaining = remaining.replaceAll(form.regex, (match: string, ...groups: (string | undefined)[]) => {
      const date = form.read(groups, match);
      if (!date) return match;
      figures.push(date);
      return " ".repeat(match.length);
    });
  }
  for (const [match, written, unit] of remaining.matchAll(QUANTITY)) {
    if (!written || written.replaceAll(/[.,]/gu, "").length < 2) continue;
    const known = unit === undefined ? undefined : UNIT_BY_WORD.get(unit.toLowerCase());
    figures.push({ kind: "QUANTITY", value: amount(written), ...(known ? { unit: known } : {}), text: match.trim() });
  }
  return figures;
}

/**
 * What a figure has to match exactly, and the part where an unknown value is compatible with
 * anything: the year of a date, the unit of a quantity. Both sides are read the same way, so prose
 * that gives no year still matches a dated deadline and prose that gives no unit still matches a
 * metric, while "90 %" and a budget of 90 no longer pass for each other.
 */
function comparison(figure: Figure): { group: string; refinement: string } {
  if (figure.kind === "DATE") {
    const monthDay = `${String(figure.month).padStart(2, "0")}-${String(figure.day).padStart(2, "0")}`;
    return { group: `date ${monthDay}`, refinement: figure.year === undefined ? "" : String(figure.year) };
  }
  return { group: `number ${figure.value}`, refinement: figure.unit ?? "" };
}

/** The figures of the evidence, indexed so a figure of the text is looked up in one step. */
export type EvidenceFigures = ReadonlyMap<string, ReadonlySet<string>>;

/**
 * The evidence read generously, where the text is read literally. Two readings are added to what the
 * evidence literally says, and both only ever let a figure through, never report one:
 *
 * - a date also stands for its year as a number, because prose cites a year without the rest of the
 *   date ("the 2026 call"). Its month and day stand for nothing — reading those as numbers is what
 *   let an invented "15 hectares" pass because some source happened to be consulted on the 15th;
 * - an eight-digit number also stands for the date it spells, because official pages publish one
 *   ("DATA PUBBLICAZIONE 20261002") and a researcher who paraphrases it as 2 October has quoted the
 *   page faithfully. Reading it the other way round would invent dates out of amounts, so the text
 *   never does.
 */
export function evidenceOf(figures: Iterable<Figure>): EvidenceFigures {
  const index = new Map<string, Set<string>>();
  const add = (group: string, refinement: string): void => {
    const refinements = index.get(group) ?? new Set<string>();
    refinements.add(refinement);
    index.set(group, refinements);
  };
  for (const figure of figures) {
    const { group, refinement } = comparison(figure);
    add(group, refinement);
    if (figure.kind === "DATE" && figure.year !== undefined) add(`number ${figure.year}`, "");
    if (figure.kind === "QUANTITY") {
      const spelled = /^(\d{4})(\d{2})(\d{2})$/u.exec(String(figure.value));
      const date = spelled ? readDate(figure.text, spelled[1], Number(spelled[2]), Number(spelled[3])) : null;
      if (date) add(comparison(date).group, comparison(date).refinement);
    }
  }
  return index;
}

/** Whether the evidence states this figure: the same date, or the same number in a compatible unit. */
export function isSupported(evidence: EvidenceFigures, figure: Figure): boolean {
  const { group, refinement } = comparison(figure);
  const refinements = evidence.get(group);
  if (!refinements) return false;
  return refinement === "" || refinements.has("") || refinements.has(refinement);
}

/** The dates a field of the file states, read the same way as a date written in prose. */
function dateFigures(dates: ReadonlyArray<string | undefined>): Figure[] {
  return dates.flatMap((value) => (value === undefined ? [] : figuresIn(value)));
}

/**
 * Every figure the evidence of some resources states: quotes, source and access URLs, metric values
 * with their unit and date, call names and windows, consultation and evidence dates.
 */
function resourceEvidence(resources: readonly Resource[], extra: readonly Figure[]): EvidenceFigures {
  const figures: Figure[] = [...extra];
  for (const resource of resources) {
    figures.push(...figuresIn(resource.accessUrl), ...dateFigures([resource.lastEvidenceDate]));
    for (const source of resource.sources) {
      figures.push(...figuresIn(source.url), ...source.quotes.flatMap(figuresIn), ...dateFigures([source.consultedOn]));
    }
    for (const metric of resource.metrics ?? []) {
      figures.push({ kind: "QUANTITY", value: metric.value, unit: metric.unit, text: `${metric.value} ${metric.unit}` });
      figures.push(...dateFigures([metric.asOf]));
    }
    for (const call of resource.calls ?? []) figures.push(...figuresIn(call.name), ...dateFigures([call.opens, call.closes]));
  }
  return evidenceOf(figures);
}

const RESOURCE_TEXT_FIELDS = ["name", "whatItOffers", "whoCanUseIt", "howToAccess", "notes"] as const;

/**
 * Figures written in free text that nothing in the file supports. An invented amount, deadline or
 * percentage in a paraphrase is as serious as an invented quote, and harder to spot: the quote is
 * checked against the page, the paraphrase is not.
 *
 * A resource's own text may use its own evidence. News may use its own sources and date plus any
 * evidence in the file. The summary and the limitations may use any evidence in the file. The edition
 * year and the publication date are always allowed.
 */
export function unsupportedFigures(data: EditionSnapshot): string[] {
  const problems: string[] = [];
  const always = [...figuresIn(data.edition), ...dateFigures([data.published])];
  const report = (label: string, text: string, evidence: EvidenceFigures): void => {
    const missing = new Map<string, string>();
    for (const figure of figuresIn(text)) {
      if (!isSupported(evidence, figure)) missing.set(comparison(figure).group, figure.text);
    }
    if (missing.size) {
      problems.push(`${label} states ${[...missing.values()].join(", ")}, which no quote, metric, date or URL of the file supports`);
    }
  };

  for (const resource of data.resources) {
    const evidence = resourceEvidence([resource], always);
    for (const field of RESOURCE_TEXT_FIELDS) {
      const text = resource[field];
      if (text) report(`resource "${resource.id}": ${field}`, text, evidence);
    }
  }

  const newsEvidence = data.news.flatMap((item) => [
    ...dateFigures([item.date]),
    ...item.sources.flatMap((source) => [
      ...figuresIn(source.url),
      ...source.quotes.flatMap(figuresIn),
      ...dateFigures([source.consultedOn]),
    ]),
  ]);
  const fileEvidence = resourceEvidence(data.resources, [...always, ...newsEvidence]);
  for (const item of data.news) {
    report(`news "${item.id}": headline`, item.headline, fileEvidence);
    report(`news "${item.id}": summary`, item.summary, fileEvidence);
  }
  report("summary", data.summary, fileEvidence);
  for (const limitation of data.limitations) report("limitations", limitation, fileEvidence);
  return problems;
}
