/**
 * The measurements behind the decisions in `decisions/`:
 *
 *   npm run measure -- figures  [editionsDir]
 *   npm run measure -- units    [editionsDir]
 *   npm run measure -- language [editionsDir]
 *
 * Every number quoted in a decision record comes from here, so a threshold can be re-argued against a
 * corpus instead of against preference. It reports distributions and never a verdict: what to do with
 * them is what the records are for.
 *
 * It reads the same functions the checks use — `figuresIn`, `foreignWordCounts`, `readerTexts` — rather
 * than its own copies, so a measurement cannot drift away from the rule it justifies.
 */
import { EDITIONS_DIR, type LoadedSnapshot, loadSnapshots } from "../src/editions.ts";
import { type Figure, figuresIn } from "../src/figures.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";
import { readerTexts } from "../src/reader-text.ts";
import { FOREIGN_WORDS_LIMIT, foreignWordCounts, LANGUAGE_NAMES } from "../src/text-hygiene.ts";

/** One piece of text to measure, with the language it is written in and whether it is a quote. */
type Text = { text: string; language: string; quote: boolean };

export function textsOf(snapshots: readonly LoadedSnapshot[]): Text[] {
  const texts: Text[] = [];
  for (const { data } of snapshots) {
    const language = data.metadata.language;
    for (const [, text] of readerTexts(data)) texts.push({ text, language, quote: false });
    for (const resource of data.resources) {
      for (const source of resource.sources) {
        for (const quote of source.quotes) texts.push({ text: quote, language, quote: true });
      }
    }
    for (const item of data.news) {
      for (const source of item.sources) {
        for (const quote of source.quotes) texts.push({ text: quote, language, quote: true });
      }
    }
  }
  return texts;
}

const percent = (part: number, whole: number): string => (whole === 0 ? "n/a" : `${((part / whole) * 100).toFixed(1)} %`);

const histogram = (values: readonly number[]): string =>
  [...new Set(values)]
    .toSorted((a, b) => a - b)
    .map((value) => `${value}→${values.filter((other) => other === value).length}`)
    .join(" ");

/**
 * How a date is written, judged from the figure's own text, which is what the page said. Decision 005
 * turns on this: a date spelled out in words cannot be matched as three numbers.
 */
function dateForm(figure: Figure): string {
  if (figure.kind !== "DATE") return "not a date";
  if (/^\d{4}-\d{2}-\d{2}/u.test(figure.text)) return "ISO (2026-10-01)";
  if (figure.text.includes("/")) return "slashed (01/10/2026)";
  if (/^\d{2}\.\d{2}\.\d{4}/u.test(figure.text)) return "dotted (01.10.2026)";
  return "spelled (1 October 2026)";
}

/** An amount without the unit written after it, so its decimal part can be read. */
const written = (figure: Figure): string => figure.text.replace(/\s*(?:€|eur|euros?)$/iu, "").trim();

/** How many words a text has, for splitting the misplacement simulation by length. */
const wordCount = (text: string): number => (text.match(/\p{L}+/gu) ?? []).length;

/** Decision 005: what a figure in real text turns out to be. */
function measureFigures(texts: readonly Text[]): void {
  for (const quote of [false, true]) {
    const group = texts.filter((text) => text.quote === quote);
    const figures = group.flatMap(({ text }) => figuresIn(text));
    const dates = figures.filter((figure) => figure.kind === "DATE");
    console.log(`\n### ${quote ? "quotes" : "reader-facing prose"}: ${group.length} text(s), ${figures.length} figure(s)`);
    console.log(`  dates: ${dates.length}, of which without a year: ${dates.filter((date) => date.year === undefined).length}`);
    const forms = new Map<string, number>();
    for (const date of dates) forms.set(dateForm(date), (forms.get(dateForm(date)) ?? 0) + 1);
    for (const [form, count] of [...forms].toSorted((a, b) => b[1] - a[1])) console.log(`    ${form}: ${count}`);
    const quantities = figures.filter((figure) => figure.kind === "QUANTITY");
    const withUnit = quantities.filter((figure) => figure.unit !== undefined);
    console.log(
      `  quantities: ${quantities.length}, with a unit the text states: ${withUnit.length} (${percent(withUnit.length, quantities.length)})`,
    );
  }
  /**
   * Decision 005 drops a trailing ",00" and treats every other separator as thousands, which would read
   * "1.234,56 €" as 123456. This is the check that no real amount has cents to lose: it looks only at
   * figures the text itself marks as money, so a dotted date or an article number cannot be miscounted
   * as a decimal.
   */
  const amounts = texts.flatMap(({ text }) => figuresIn(text)).filter((figure) => figure.kind === "QUANTITY" && figure.unit === "EUR");
  const withCents = amounts.filter((amount) => /[.,]\d{2}$/u.test(written(amount)) && !/[.,]00$/u.test(written(amount)));
  console.log(`\namounts in euros: ${amounts.length}, of them with a non-zero decimal part: ${withCents.length}`);
  for (const amount of withCents.slice(0, 5)) console.log(`  ${amount.text}`);
}

/** Decision 005: which units actually appear, in prose and in the metrics of the data. */
function measureUnits(texts: readonly Text[], snapshots: readonly LoadedSnapshot[]): void {
  const counts = new Map<string, number>();
  for (const { text } of texts) {
    for (const figure of figuresIn(text)) {
      if (figure.kind !== "QUANTITY") continue;
      const unit = figure.unit ?? "(none stated)";
      counts.set(unit, (counts.get(unit) ?? 0) + 1);
    }
  }
  console.log("\n### units read from text");
  for (const [unit, count] of [...counts].toSorted((a, b) => b[1] - a[1])) console.log(`  ${unit}: ${count}`);

  const metrics = snapshots.flatMap(({ data }) => data.resources.flatMap((resource) => resource.metrics ?? []));
  const byUnit = new Map<string, number>();
  const byMeasure = new Map<string, number>();
  for (const metric of metrics) {
    byUnit.set(metric.unit, (byUnit.get(metric.unit) ?? 0) + 1);
    byMeasure.set(metric.measure, (byMeasure.get(metric.measure) ?? 0) + 1);
  }
  console.log(`\n### units of the ${metrics.length} metric(s) in the data`);
  for (const [unit, count] of [...byUnit].toSorted((a, b) => b[1] - a[1])) console.log(`  ${unit}: ${count}`);
  console.log("\n### measures used");
  for (const [name, count] of [...byMeasure].toSorted((a, b) => b[1] - a[1])) console.log(`  ${name}: ${count}`);
}

/**
 * Decision 006: how close correctly written prose comes to reading as another language, and how much of
 * a misplaced text the threshold catches. The second half is simulated by scoring each real text as if
 * it had been left in a file of each other language, which is exactly the mistake being guarded against.
 */
function measureLanguage(texts: readonly Text[]): void {
  const prose = texts.filter((text) => !text.quote);
  const languages = Object.keys(LANGUAGE_NAMES);

  for (const keepNameParticles of [true, false]) {
    const own = prose.map(({ text, language }) => foreignWordCounts(text, language, { keepNameParticles })[0]?.words.length ?? 0);
    const misplaced = prose.flatMap(({ text, language }) =>
      languages
        .filter((other) => other !== language)
        .map((other) => ({ score: foreignWordCounts(text, other, { keepNameParticles })[0]?.words.length ?? 0, words: wordCount(text) })),
    );
    const long = misplaced.filter((entry) => entry.words >= 20);
    console.log(`\n### name particles ${keepNameParticles ? "kept" : "removed (what the check does)"}`);
    console.log(`  correctly written prose, highest foreign-word count: ${histogram(own)}`);
    for (const threshold of [2, 3, 4]) {
      const all = misplaced.filter((entry) => entry.score >= threshold).length;
      const caught = long.filter((entry) => entry.score >= threshold).length;
      const mark = threshold === FOREIGN_WORDS_LIMIT ? " <- the threshold in force" : "";
      console.log(
        `  threshold ${threshold}: catches ${percent(all, misplaced.length)} of misplaced text, ${percent(caught, long.length)} of 20+ words${mark}`,
      );
    }
  }
  console.log(`\nmeasured over ${prose.length} piece(s) of prose and ${prose.length * (languages.length - 1)} simulated misplacements`);
}

const MEASUREMENTS = ["figures", "units", "language"] as const;
type Measurement = (typeof MEASUREMENTS)[number];
const isMeasurement = (value: string): value is Measurement => MEASUREMENTS.some((name) => name === value);

export function measure(what: string, editionsDir = EDITIONS_DIR): number {
  if (!isMeasurement(what)) {
    console.error(`usage: npm run measure -- ${MEASUREMENTS.join(" | ")} [editionsDir]`);
    return 2;
  }
  const { snapshots, problems } = loadSnapshots({ editionsDir });
  for (const problem of problems) console.error(`skipped ${problem.file}: ${problem.message}`);
  const texts = textsOf(snapshots);
  console.log(`${snapshots.length} edition file(s) in ${editionsDir}, ${texts.length} text(s) to measure`);
  if (what === "figures") measureFigures(texts);
  if (what === "units") measureUnits(texts, snapshots);
  if (what === "language") measureLanguage(texts);
  return 0;
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => measure(process.argv[2] ?? "", process.argv[3]));
}
