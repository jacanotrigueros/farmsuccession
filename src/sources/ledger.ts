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
 * So every run appends one line here, and the question "is this source still there?" is answered from
 * the series rather than from the last reading. The file is committed on purpose: it is the evidence
 * behind what the site claims about its own freshness, and a claim whose evidence is not in the
 * repository is a claim nobody can check.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { CheckReport, CheckStatus, Totals } from "./check.ts";
import { REPORTS_DIR } from "./report.ts";

/** The series lives beside the run reports, so a test pointed at a temporary reports directory keeps its own. */
export const ledgerPathIn = (reportsDir: string = REPORTS_DIR): string => path.join(reportsDir, "source-checks.jsonl");

export const LEDGER_PATH = ledgerPathIn();

/** One URL as one run saw it. Everything that passed is one short object; a failure carries its reason. */
export type LedgerResult = {
  url: string;
  status: CheckStatus;
  httpStatus: number | null;
  /** Only for a result that is not a PASS: the first note of the report, which says what happened. */
  note?: string;
};

/** One run: what was checked, when, and what came back. One line of the ledger. */
export type LedgerRun = {
  checkedAt: string;
  edition: string;
  /** The territory spec the run covered, or "all" for a whole edition. */
  scope: string;
  totals: Totals;
  results: LedgerResult[];
};

const resultOf = (report: CheckReport): LedgerResult => ({
  url: report.url,
  status: report.status,
  httpStatus: report.httpStatus,
  ...(report.status === "PASS" ? {} : { note: report.notes[0] ?? "" }),
});

/** Appends one run. Never rewrites a line: a reading that was taken is not edited afterwards. */
export function appendRun(
  run: { edition: string; scope: string; totals: Totals; reports: readonly CheckReport[]; checkedAt?: string },
  ledgerPath = LEDGER_PATH,
): LedgerRun {
  const entry: LedgerRun = {
    checkedAt: run.checkedAt ?? new Date().toISOString(),
    edition: run.edition,
    scope: run.scope,
    totals: run.totals,
    results: run.reports.map(resultOf),
  };
  mkdirSync(path.dirname(ledgerPath), { recursive: true });
  appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`);
  return entry;
}

/**
 * Whether a parsed line is a run. The ledger is append-only and written by one function, so this is not
 * a schema so much as a refusal to read a file that has been edited into something else by hand.
 */
function isRun(value: unknown): value is LedgerRun {
  if (value === null || typeof value !== "object") return false;
  const run = value as Partial<LedgerRun>;
  return typeof run.checkedAt === "string" && typeof run.scope === "string" && Array.isArray(run.results) && typeof run.totals === "object";
}

/** Every run ever recorded, oldest first. A malformed line stops the read instead of being skipped. */
export function readLedger(ledgerPath = LEDGER_PATH): LedgerRun[] {
  if (!existsSync(ledgerPath)) return [];
  return readFileSync(ledgerPath, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const parsed: unknown = ((): unknown => {
        try {
          return JSON.parse(line);
        } catch (cause) {
          throw new Error(`${path.basename(ledgerPath)} line ${index + 1} is not JSON`, { cause });
        }
      })();
      if (!isRun(parsed)) throw new Error(`${path.basename(ledgerPath)} line ${index + 1} is not a recorded run`);
      return parsed;
    });
}

/**
 * What the series says about one URL.
 *
 * `GONE` is the only verdict that asks somebody to change a record, and it is deliberately the hardest
 * to reach: the page has to have answered with a refusal, or lost its quotes, on two different days.
 * `UNREACHABLE` is the other kind of repeated failure — nobody answered at all — and it is not evidence
 * about the page, because that is exactly what a dropping network looks like from here.
 */
export type Verdict = "HEALTHY" | "FLAKY" | "UNREACHABLE" | "GONE" | "NEW";

export type UrlHistory = {
  url: string;
  verdict: Verdict;
  observations: { day: string; status: CheckStatus; httpStatus: number | null; note?: string }[];
  /** Distinct days on which this URL was checked, which is what a verdict is allowed to rest on. */
  days: number;
};

const dayOf = (iso: string): string => iso.slice(0, 10);

/** A failure that came from an answer, rather than from nobody answering. */
const answered = (result: { status: CheckStatus; httpStatus: number | null }): boolean =>
  result.status === "FAIL" || result.httpStatus !== null;

export function historyOf(runs: readonly LedgerRun[]): UrlHistory[] {
  const byUrl = new Map<string, UrlHistory["observations"]>();
  for (const run of runs) {
    for (const result of run.results) {
      const observations = byUrl.get(result.url) ?? [];
      observations.push({
        day: dayOf(run.checkedAt),
        status: result.status,
        httpStatus: result.httpStatus,
        ...(result.note === undefined ? {} : { note: result.note }),
      });
      byUrl.set(result.url, observations);
    }
  }

  return [...byUrl.entries()].map(([url, observations]) => {
    const days = new Set(observations.map((observation) => observation.day)).size;
    const passes = observations.filter((observation) => observation.status === "PASS").length;
    const verdict = ((): Verdict => {
      if (passes === observations.length) return "HEALTHY";
      if (passes > 0) return "FLAKY";
      if (days < 2) return "NEW";
      return observations.every((observation) => answered(observation)) ? "GONE" : "UNREACHABLE";
    })();
    return { url, verdict, observations, days };
  });
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
