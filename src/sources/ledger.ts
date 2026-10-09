/**
 * Keeping every live check, so that a run can be read against the others instead of on its own.
 *
 * A run is a reading taken at a moment, from one machine, on one network. That was always written down
 * — `decisions/007` says UNCHECKED is an answer and not a softer failure — but nothing kept the
 * readings, so the honest consequence could not be acted on. `reports/sources.json` is overwritten by
 * the next run, and what survived was a sentence somebody typed into a document.
 *
 * On 2026-10-08 a sweep of the nineteen French territories came back with 53 PASS, 0 FAIL and 36
 * UNCHECKED, which reads like a corpus full of dead links. Occitanie, 0 of 14 that evening, answered 14
 * of 14 a few minutes later; Bretagne went the other way, 6 of 8 and then 0 of 8; `curl` got 200 from
 * all of them throughout. Nothing was wrong with France. The network here was dropping, and no single
 * run could have said so — only two runs disagreeing could.
 *
 * So every run writes a file of its own under `reports/checks/`, and the question "is this source still
 * there?" is answered from the series rather than from the last reading. They are committed on purpose:
 * they are the evidence behind what the site claims about its own freshness, and a claim whose evidence
 * is not in the repository is a claim nobody can check.
 *
 * One file per run rather than one growing file, for two reasons and the second is the serious one. A
 * run over the whole edition is about 53 KB, which in a single appended file is 53 KB that only ever
 * grows; and an append that size is not atomic — POSIX guarantees it only up to PIPE_BUF, 4 KB — so two
 * checks running at once would interleave and quietly destroy both records. A run that writes its own
 * new file shares nothing with any other run, and a record nobody needs can be deleted without the rest
 * losing their meaning.
 *
 * Each reading also records which territories cite the page, because the series is read by whoever has
 * to correct a record and records belong to territories. A sweep that only said "all" could report that
 * one page of five hundred was gone without being able to say whose page it was: on 2026-10-09, 347 of
 * the 502 pages the series had seen had only ever been read by such a sweep. Those three sweeps stay
 * unattributed, because a reading that was taken is not edited afterwards. `decisions/026`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { CheckReport, CheckStatus, Totals } from "./check.ts";
import { REPORTS_DIR } from "./report.ts";

/** Where the runs are kept. A test pointed at a temporary reports directory keeps its own series. */
export const checksDirIn = (reportsDir: string = REPORTS_DIR): string => path.join(reportsDir, "checks");

export const CHECKS_DIR = checksDirIn();

/** One URL as one run saw it. Everything that passed is one short object; a failure carries its reason. */
export type LedgerResult = {
  url: string;
  status: CheckStatus;
  httpStatus: number | null;
  /** Only for a result that is not a PASS: the first note of the report, which says what happened. */
  note?: string;
  /**
   * The territories whose records cite this page, as territory specs: `eu`, `es`, `es/aragon`. A page
   * cited from two territories belongs to both, because the verdict on it is a verdict on both records.
   *
   * It is kept per result rather than per run because the alternative is a sweep of the whole edition
   * that can only ever say "all", and 69% of this series was read that way: nothing in those readings
   * can say which of their pages were Spain's.
   */
  territories?: string[];
};

/**
 * The territory a citation came from. The planner records who cites each page as `<edition file>#<id>`,
 * and the file's own path is the territory: `2026/eu.json`, `2026/countries/es.json`,
 * `2026/regions/es/aragon.json`, `2026/hubs/es/canarias.json`.
 *
 * Returns null rather than guessing, so a reference this does not recognise is counted as unattributed
 * instead of being filed under a territory that may not exist.
 */
export function territoryOf(citedBy: string): string | null {
  const parts = (citedBy.split("#")[0] ?? "")
    .replace(/\.json$/u, "")
    .split("/")
    .filter((part) => part !== "" && !/^\d{4}$/u.test(part));
  const [kind, iso, slug] = parts;
  if (kind === "eu" && iso === undefined) return "eu";
  if (kind === "countries" && iso !== undefined && slug === undefined) return iso;
  if ((kind === "regions" || kind === "hubs") && iso !== undefined && slug !== undefined) return `${iso}/${slug}`;
  return null;
}

/** Whether a string is a territory spec, which is what lets an older run's scope stand in for attribution. */
const isSpec = (scope: string): boolean => /^(?:eu|[a-z]{2}(?:\/[a-z0-9-]+)?)$/u.test(scope);

/**
 * What a reading was about. A result records it; a run taken before results did falls back to its own
 * scope, which is the right answer for the per-territory runs and no answer at all for the sweeps —
 * `decisions/026`. Readings are never edited afterwards, so the sweeps stay unattributed for good.
 */
export function territoriesOf(run: LedgerRun, result: LedgerResult): string[] {
  if (result.territories && result.territories.length > 0) return result.territories;
  return isSpec(run.scope) ? [run.scope] : [];
}

/** One run: what was checked, when, and what came back. One file of the series. */
export type LedgerRun = {
  checkedAt: string;
  edition: string;
  /** The territory spec the run covered, or "all" for a whole edition. */
  scope: string;
  totals: Totals;
  results: LedgerResult[];
};

const resultOf = (report: CheckReport): LedgerResult => {
  const territories = [...new Set(report.citedBy.map(territoryOf).filter((spec): spec is string => spec !== null))].toSorted();
  return {
    url: report.url,
    status: report.status,
    httpStatus: report.httpStatus,
    ...(report.status === "PASS" ? {} : { note: report.notes[0] ?? "" }),
    ...(territories.length > 0 ? { territories } : {}),
  };
};

/**
 * What a run is called: the instant it was taken, then what it covered. Sorting the directory by name
 * sorts it by time, and a person looking for "the sweep of the whole edition last Tuesday" can find it
 * without opening anything.
 */
export const fileNameOf = (run: Pick<LedgerRun, "checkedAt" | "scope">): string => {
  const stamp = run.checkedAt.replaceAll(/[-:]/gu, "").replace(".", "");
  const scope = run.scope.replaceAll(/[^a-z0-9]+/giu, "-").toLowerCase();
  return `${stamp}--${scope}.json`;
};

/**
 * Writes one run as a file of its own, and refuses to overwrite one.
 *
 * `wx` is the whole point: a reading that was taken is never edited afterwards, and two runs that
 * somehow chose the same name would otherwise silently become one. The instant carries milliseconds, so
 * a collision means the same run being recorded twice, which is a bug worth hearing about.
 */
export function recordRun(
  run: { edition: string; scope: string; totals: Totals; reports: readonly CheckReport[]; checkedAt?: string },
  checksDir = CHECKS_DIR,
): { run: LedgerRun; file: string } {
  const entry: LedgerRun = {
    checkedAt: run.checkedAt ?? new Date().toISOString(),
    edition: run.edition,
    scope: run.scope,
    totals: run.totals,
    results: run.reports.map(resultOf),
  };
  mkdirSync(checksDir, { recursive: true });
  const file = path.join(checksDir, fileNameOf(entry));
  writeFileSync(file, `${JSON.stringify(entry)}\n`, { flag: "wx" });
  return { run: entry, file };
}

/**
 * Whether a parsed file is a run. Each one is written by a single function, so this is not a schema so
 * much as a refusal to read a file that has been edited into something else by hand.
 */
function isRun(value: unknown): value is LedgerRun {
  if (value === null || typeof value !== "object") return false;
  const run = value as Partial<LedgerRun>;
  return typeof run.checkedAt === "string" && typeof run.scope === "string" && Array.isArray(run.results) && typeof run.totals === "object";
}

/** Every run ever recorded, oldest first. A malformed file stops the read instead of being skipped. */
export function readRuns(checksDir = CHECKS_DIR): LedgerRun[] {
  if (!existsSync(checksDir)) return [];
  return readdirSync(checksDir)
    .filter((name) => name.endsWith(".json"))
    .toSorted()
    .map((name) => {
      const parsed: unknown = ((): unknown => {
        try {
          return JSON.parse(readFileSync(path.join(checksDir, name), "utf8"));
        } catch (cause) {
          throw new Error(`${name} is not JSON`, { cause });
        }
      })();
      if (!isRun(parsed)) throw new Error(`${name} is not a recorded run`);
      return parsed;
    })
    .toSorted((a, b) => a.checkedAt.localeCompare(b.checkedAt));
}

/**
 * What the series says about one URL.
 *
 * `GONE` is the only verdict that asks somebody to change a record, and it is deliberately the hardest
 * to reach: the page has to have *failed* on two different days — an address that is gone, a page saying
 * it does not exist, or a quote that is no longer there.
 *
 * Every other repeated failure is `UNREACHABLE`, and the second day of this series is why that is drawn
 * where it is. On 2026-10-09 the same corpus was swept again and fourteen pages had now failed twice;
 * eleven of them had answered `403` to an automated request, or answered `200` with a page this checker
 * cannot read. Those are facts about a host's policy and about this checker, not about the citation —
 * `decisions/007` — and calling them GONE would have sent somebody to rewrite eleven correct records.
 * An UNCHECKED reading never counts towards GONE, whatever status code arrived with it.
 */
export type Verdict = "HEALTHY" | "FLAKY" | "UNREACHABLE" | "GONE" | "NEW";

export type UrlHistory = {
  url: string;
  verdict: Verdict;
  observations: { day: string; status: CheckStatus; httpStatus: number | null; note?: string }[];
  /** Distinct days on which this URL was checked, which is what a verdict is allowed to rest on. */
  days: number;
  /** Every territory any run attributed this page to, so a verdict can be read where it has consequences. */
  territories: string[];
};

const dayOf = (iso: string): string => iso.slice(0, 10);

export function historyOf(runs: readonly LedgerRun[]): UrlHistory[] {
  const byUrl = new Map<string, { observations: UrlHistory["observations"]; territories: Set<string> }>();
  for (const run of runs) {
    for (const result of run.results) {
      const seen = byUrl.get(result.url) ?? { observations: [], territories: new Set<string>() };
      seen.observations.push({
        day: dayOf(run.checkedAt),
        status: result.status,
        httpStatus: result.httpStatus,
        ...(result.note === undefined ? {} : { note: result.note }),
      });
      for (const territory of territoriesOf(run, result)) seen.territories.add(territory);
      byUrl.set(result.url, seen);
    }
  }

  return [...byUrl.entries()].map(([url, { observations, territories }]) => {
    const days = new Set(observations.map((observation) => observation.day)).size;
    const passes = observations.filter((observation) => observation.status === "PASS").length;
    // The days it actually failed on, which is what GONE rests on. An UNCHECKED day is not one of them,
    // whatever status code came with it: that is the whole of `decisions/007`.
    const failedOn = new Set(observations.filter((observation) => observation.status === "FAIL").map((observation) => observation.day))
      .size;
    const verdict = ((): Verdict => {
      if (passes === observations.length) return "HEALTHY";
      if (passes > 0) return "FLAKY";
      if (failedOn >= 2) return "GONE";
      if (days < 2) return "NEW";
      return "UNREACHABLE";
    })();
    return { url, verdict, observations, days, territories: [...territories].toSorted() };
  });
}

/**
 * What the series says about one territory: how much of its evidence has been read, on how many days,
 * and which of its pages somebody has to act on.
 *
 * This is the unit a verdict is acted on in. A page is GONE or UNREACHABLE on its own, but the record
 * that has to be corrected belongs to a territory, and "1 of 494 pages is gone" tells nobody whose
 * afternoon that is. A page cited by two territories is counted in both.
 */
export type TerritorySeries = {
  territory: string;
  /** The pages this territory cites today, from the data rather than from the ledger. Empty: it documents nothing. */
  cites: string[];
  /** The distinct pages of its own that any run has read, so a country can be counted without double-counting. */
  read: string[];
  /** The pages it cites that no run has ever read. The gap a single run cannot see, because a run only knows what it checked. */
  unread: string[];
  /** Distinct days on which something of this territory's was read. */
  days: number;
  /** The last day a page of this territory's was read, or null for a territory no run has reached. */
  lastRead: string | null;
  counts: Record<Verdict, number>;
  /** Its pages that are neither healthy nor too new to judge: what somebody has to do something about. */
  open: UrlHistory[];
};

/** What a territory cites now, which is what its readings are coverage *of*. */
export type TerritoryPages = { territory: string; urls: readonly string[] };

const noCounts = (): Record<Verdict, number> => ({ HEALTHY: 0, FLAKY: 0, UNREACHABLE: 0, GONE: 0, NEW: 0 });

/**
 * The series grouped by territory, worst first.
 *
 * `cited` is the corpus as it stands — what each territory cites today — and it is what makes two
 * different silences tell apart. A territory that cites twelve pages and has had none read is a gap
 * somebody has to close; a territory that cites nothing has nothing to read, and three of them do:
 * Italy nationally, Oeste e Vale do Tejo and Península de Setúbal document no instrument at all. The
 * ledger alone cannot distinguish them, and would report both as unread every run, for ever.
 */
export function byTerritory(runs: readonly LedgerRun[], cited: readonly TerritoryPages[] = []): TerritorySeries[] {
  const histories = historyOf(runs);
  type Seen = { read: Set<string>; days: Set<string>; counts: Record<Verdict, number>; open: UrlHistory[] };
  const series = new Map<string, Seen>();
  const of = (territory: string): Seen => {
    const seen = series.get(territory) ?? { read: new Set<string>(), days: new Set<string>(), counts: noCounts(), open: [] };
    series.set(territory, seen);
    return seen;
  };
  for (const { territory } of cited) of(territory);

  /**
   * Whether a reading is still about this territory's evidence. A reading is kept for ever, so a page a
   * record dropped — because the series said it was gone and somebody corrected the record — stays in
   * the series and would otherwise be counted against that territory for the rest of the project. It is
   * the evidence the work was done, not work; it belongs in the readings and not in the totals.
   */
  const corpus = new Map(cited.map(({ territory, urls }) => [territory, new Set(urls)]));
  const about = (territory: string, url: string): boolean => corpus.get(territory)?.has(url) ?? corpus.size === 0;

  for (const history of histories) {
    for (const territory of history.territories) {
      if (!about(territory, history.url)) continue;
      const seen = of(territory);
      seen.read.add(history.url);
      for (const observation of history.observations) seen.days.add(observation.day);
      seen.counts[history.verdict] += 1;
      if (history.verdict !== "HEALTHY" && history.verdict !== "NEW") seen.open.push(history);
    }
  }

  const rank = (entry: TerritorySeries): number =>
    entry.counts.GONE * 1000 + entry.counts.UNREACHABLE * 100 + entry.unread.length * 10 + entry.counts.FLAKY;
  return [...series.entries()]
    .map(([territory, seen]) => {
      const cites = [...(cited.find((entry) => entry.territory === territory)?.urls ?? [])].toSorted();
      return {
        territory,
        cites,
        read: [...seen.read].toSorted(),
        unread: cites.filter((url) => !seen.read.has(url)),
        days: seen.days.size,
        lastRead: [...seen.days].toSorted().at(-1) ?? null,
        counts: seen.counts,
        open: seen.open.toSorted((a, b) => a.url.localeCompare(b.url)),
      };
    })
    .toSorted((a, b) => rank(b) - rank(a) || a.read.length - b.read.length || a.territory.localeCompare(b.territory));
}

/**
 * A run whose failures are all transport failures, in bulk, is a reading about this machine rather than
 * about the sources. Saying so is the point: a total that nobody can qualify gets quoted as if it were
 * a measurement of the corpus.
 */
export const looksLikeOurSide = (run: LedgerRun): boolean => {
  const checked = run.results.length;
  const silent = run.results.filter((result) => result.status === "UNCHECKED" && result.httpStatus === null).length;
  return checked >= 4 && silent >= checked / 2;
};

/** The reliability of one host across the series, which is what tells a flaky portal from a flaky link. */
export function byHost(runs: readonly LedgerRun[]): { host: string; checks: number; passes: number }[] {
  const hosts = new Map<string, { checks: number; passes: number }>();
  for (const run of runs) {
    for (const result of run.results) {
      let host = "";
      try {
        host = new URL(result.url).host;
      } catch {
        host = result.url;
      }
      const seen = hosts.get(host) ?? { checks: 0, passes: 0 };
      seen.checks += 1;
      if (result.status === "PASS") seen.passes += 1;
      hosts.set(host, seen);
    }
  }
  return [...hosts.entries()]
    .map(([host, seen]) => ({ host, checks: seen.checks, passes: seen.passes }))
    .toSorted((a, b) => a.passes / a.checks - b.passes / b.checks || b.checks - a.checks);
}
