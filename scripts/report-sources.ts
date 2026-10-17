/**
 * What the series of live checks says, which is not what any one of them says.
 *
 * `npm run report:sources` reads `reports/checks/` — one file per run, every run ever recorded — and answers
 * the four questions a single run cannot:
 *
 *   1. which cited pages are actually gone, as opposed to unread once;
 *   2. whose records those pages are, and which territories nobody has read at all;
 *   3. which hosts are unreliable, as opposed to which links are broken;
 *   4. which runs were readings about this machine rather than about the corpus.
 *
 * It decides nothing on its own. It prints what somebody then has to act on, which for a GONE page
 * means opening it and either correcting the record or marking the resource UNKNOWN — `decisions/015`.
 */
import {
  byHost,
  byTerritory,
  CHECKS_DIR,
  historyOf,
  looksLikeOurSide,
  readRuns,
  territoriesOf,
  territoryOf,
  type TerritoryPages,
  type TerritorySeries,
  type UrlHistory,
  type Verdict,
} from "../src/sources/ledger.ts";
import { collectSourceChecks } from "../src/sources/collect.ts";
import { EDITIONS_DIR, listEditionFiles, loadSnapshots } from "../src/editions.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";

const EXPLAIN: Record<Verdict, string> = {
  GONE: "failed on two different days — the address is gone, the page says it does not exist, or a quote is no longer there. Open it and correct the record",
  UNREACHABLE:
    "never gave a reading, on more than one day — the page may well be fine; the obstacle is the network, the host declining automation, or a page this checker cannot read",
  FLAKY: "has passed, but not on every attempt: another reading failed or was UNCHECKED",
  HEALTHY: "has passed every time it was read",
  NEW: "checked on one day only, so the series cannot say anything yet",
};

const ORDER: Verdict[] = ["GONE", "UNREACHABLE", "FLAKY", "NEW", "HEALTHY"];

/** The country a territory spec belongs to. The European layer is its own group, because it is not a country. */
const countryOf = (territory: string): string => (territory === "eu" ? "EU" : (territory.split("/")[0] ?? "").toUpperCase());

/** How a territory's verdicts read on one line: only what it has, worst first, and nothing that is zero. */
const verdicts = (counts: Record<Verdict, number>): string =>
  ORDER.filter((verdict) => counts[verdict] > 0)
    .map((verdict) => `${counts[verdict]} ${verdict.toLowerCase()}`)
    .join(", ") || "nothing read";

const pad = (text: string, width: number): string => text.padEnd(width, " ");

/**
 * The series territory by territory, grouped by country, worst country first.
 *
 * This is the section somebody acts on. The verdict groups above say which pages of the whole corpus
 * have a problem; this says whose records they are, how much of what each territory cites has ever been
 * read and on how many days — including the pages nobody has read at all, which no single run can
 * report because a run only ever knows what it checked.
 */
function territorySection(series: readonly TerritorySeries[], runs: readonly ReturnType<typeof readRuns>[number][]): string[] {
  const documented = series.filter((entry) => entry.cites.length > 0);
  const covered = documented.filter((entry) => entry.unread.length === 0);
  const silent = series.filter((entry) => entry.cites.length === 0);
  const unattributed = runs.filter((run) => run.results.some((result) => territoriesOf(run, result).length === 0));

  const lines = [
    `### territory by territory: ${covered.length} of ${documented.length} fully read, ${silent.length} with nothing to read`,
    "  a page cited by two territories is counted in both, because a verdict on it is a verdict on both records",
  ];
  if (unattributed.length > 0) {
    lines.push(
      `  ${unattributed.length} run(s) recorded no territory for their results and are missing from these counts: they were taken before a reading said what it was about`,
    );
  }
  lines.push("");

  const countries = [...new Set(series.map((entry) => countryOf(entry.territory)))].toSorted((a, b) => {
    if (a === "EU") return -1;
    if (b === "EU") return 1;
    return a.localeCompare(b);
  });
  for (const country of countries) {
    const group = series.filter((entry) => countryOf(entry.territory) === country);
    const cites = new Set(group.flatMap((entry) => entry.cites));
    const unread = new Set(group.flatMap((entry) => entry.unread));
    const open = group.reduce((total, entry) => total + entry.open.length, 0);
    lines.push(
      `  ${country}: ${group.length} territory(ies), ${cites.size} distinct page(s) cited, ${unread.size} never read, ${open} to act on`,
    );
    const width = Math.max(...group.map((entry) => entry.territory.length));
    for (const entry of group.toSorted((a, b) => a.territory.localeCompare(b.territory))) {
      if (entry.cites.length === 0) {
        lines.push(`    ${pad(entry.territory, width)}  cites nothing: it documents no instrument, so there is nothing to read`);
        continue;
      }
      const when = entry.lastRead === null ? "never read" : `${entry.days} day(s) to ${entry.lastRead}`;
      const of = `${String(entry.read.length).padStart(3)} of ${String(entry.cites.length).padStart(3)} page(s)`;
      lines.push(`    ${pad(entry.territory, width)}  ${of}  ${pad(when, 22)}  ${verdicts(entry.counts)}`);
      for (const history of entry.open) lines.push(`        ${history.verdict}  ${history.url}`);
      for (const url of entry.unread) lines.push(`        UNREAD  ${url}`);
    }
    lines.push("");
  }
  return lines;
}

function render(histories: readonly UrlHistory[], runs: ReturnType<typeof readRuns>, cited: readonly TerritoryPages[]): string[] {
  const lines: string[] = [];
  const days = new Set(runs.map((run) => run.checkedAt.slice(0, 10)));
  /**
   * The pages the corpus cites now. A reading is kept for ever, so the series goes on knowing about a
   * page that has since left every record — the two that left on 2026-10-09 when the records the series
   * sent somebody to correct were corrected. Those are not work: they are the evidence that the work was
   * done. Naming them among the pages to act on is how a list of three real problems becomes a list
   * nobody reads.
   */
  const current = new Set(cited.flatMap((territory) => territory.urls));
  const stillCited = (history: UrlHistory): boolean => current.size === 0 || current.has(history.url);
  lines.push(
    `${runs.length} run(s) recorded on ${days.size} day(s), covering ${histories.length} cited page(s)`,
    `from ${runs[0]?.checkedAt.slice(0, 10) ?? "—"} to ${runs.at(-1)?.checkedAt.slice(0, 10) ?? "—"}`,
    "",
  );

  for (const verdict of ORDER) {
    const group = histories.filter((history) => history.verdict === verdict).filter((history) => stillCited(history));
    const retired = histories.filter((history) => history.verdict === verdict).length - group.length;
    lines.push(`### ${verdict}: ${group.length}`, `  ${EXPLAIN[verdict]}`);
    if (verdict === "FLAKY") {
      const failed = group.filter((history) => history.observations.some((reading) => reading.status === "FAIL")).length;
      lines.push(`  ${failed} with a FAIL; ${group.length - failed} with PASS and UNCHECKED only`);
    }
    if (retired > 0) {
      lines.push(`  ${retired} more no longer cited by any record: the record was corrected, and the readings stay as the evidence of it`);
    }
    // Every page somebody has to do something about is named; the healthy ones are a count.
    if (verdict !== "HEALTHY" && verdict !== "NEW") {
      for (const history of group.toSorted((a, b) => b.observations.length - a.observations.length)) {
        const seen = history.observations.map(
          (observation) => `${observation.day} ${observation.status}${observation.httpStatus === null ? "" : ` ${observation.httpStatus}`}`,
        );
        lines.push(`  ${history.url}`, `      ${seen.join(" · ")}`);
      }
    }
    lines.push("");
  }

  lines.push(...territorySection(byTerritory(runs, cited), runs));

  const suspect = runs.filter((run) => looksLikeOurSide(run));
  lines.push(`### runs that read as a failure of this machine: ${suspect.length}`);
  lines.push("  half or more of what they checked never answered at all, so their totals say nothing about the sources");
  for (const run of suspect) {
    lines.push(
      `  ${run.checkedAt.slice(0, 16).replace("T", " ")} ${run.scope}: ${run.totals.pass} pass, ${run.totals.fail} fail, ${run.totals.unchecked} unchecked`,
    );
  }
  lines.push("");

  const hosts = byHost(runs).filter((host) => host.passes < host.checks);
  lines.push(`### hosts that have not always answered: ${hosts.length}`);
  for (const host of hosts) lines.push(`  ${host.passes}/${host.checks}  ${host.host}`);

  return lines;
}

/**
 * What every territory of the edition cites, which is what its readings are coverage of. It is planned
 * by the same function the checks are planned by, so the report cannot measure coverage of a different
 * list from the one that gets checked. A file that cannot load makes its citations unknown, not empty:
 * the report must refuse to measure them rather than reporting that territory as citing nothing.
 */
export function citedByTerritory(editionsDir = EDITIONS_DIR, edition?: string): TerritoryPages[] {
  const pages = new Map<string, Set<string>>();
  const { snapshots, problems } = loadSnapshots({ editionsDir, edition });
  if (problems.length > 0) {
    throw new Error(
      `cannot measure source coverage: edition files could not be loaded\n${problems.map(({ file, message }) => `${file}: ${message}`).join("\n")}`,
    );
  }
  for (const file of listEditionFiles(editionsDir, edition)) {
    const territory = territoryOf(file);
    if (territory !== null) pages.set(territory, pages.get(territory) ?? new Set<string>());
  }
  for (const snapshot of snapshots) {
    const territory = territoryOf(snapshot.file);
    if (territory === null) continue;
    const urls = pages.get(territory) ?? new Set<string>();
    for (const check of collectSourceChecks([snapshot])) urls.add(check.url);
    pages.set(territory, urls);
  }
  return [...pages.entries()].map(([territory, urls]) => ({ territory, urls: [...urls].toSorted() }));
}

export function reportSources(checksDir = CHECKS_DIR, cited: readonly TerritoryPages[] = []): { lines: string[]; gone: number } {
  const runs = readRuns(checksDir);
  if (runs.length === 0) {
    return { lines: ["no run has been recorded yet: run npm run check:sources, and the series starts there"], gone: 0 };
  }
  const histories = historyOf(runs);
  const current = new Set(cited.flatMap((territory) => territory.urls));
  // The number that means work: a page the series says is gone and some record still points a reader at.
  const gone = histories.filter((history) => history.verdict === "GONE" && (current.size === 0 || current.has(history.url))).length;
  return { lines: render(histories, runs, cited), gone };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const { lines } = reportSources(CHECKS_DIR, citedByTerritory());
    for (const line of lines) console.log(line);
    // Never a failing exit code: this reports on evidence, and a page that died is not a broken build.
    return 0;
  });
}
