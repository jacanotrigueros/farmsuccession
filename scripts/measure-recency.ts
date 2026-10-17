/**
 * What a rule about recency would actually change, before anybody adopts one.
 *
 * `decisions/025` says a page that has passed once is FLAKY rather than GONE, however often it fails
 * afterwards. The obvious objection is that one old success should not protect a page forever, and the
 * obvious repair is to let failures after the last success count. This measures that repair against the
 * series instead of arguing about it: the candidate rule is that a history with a PASS becomes GONE when
 * actual FAIL readings land on two distinct UTC days *later than its most recent PASS*. An UNCHECKED
 * reading neither proves a failure nor resets the clock — `decisions/007`.
 *
 * It reads the committed runs and reaches nothing over the network. It decides nothing and writes no
 * ledger: it prints what the repair would move, which on 18 October 2026 was nothing at all. The reason
 * the full `checkedAt` is read rather than a history's `day` is that two readings of one page on one day
 * cannot be ordered by a date.
 */
import { EDITIONS_DIR, loadSnapshots } from "../src/editions.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";
import { collectSourceChecks } from "../src/sources/collect.ts";
import { CHECKS_DIR, historyOf, readRuns, type Verdict } from "../src/sources/ledger.ts";

export type RecencyMeasurement = {
  /** How much evidence there is, which is the first thing that qualifies everything below. */
  runs: number;
  days: string[];
  /** Every URL the series has ever read, against the ones the edition still cites. A verdict about a page
   * nobody cites any more is evidence of a correction, not a thing to act on. */
  observedUrls: number;
  currentCitations: number;
  /** FLAKY is a mixed history, and a mixture of PASS and UNCHECKED is not a mixture of PASS and FAIL. */
  mixed: { withFail: number; onlyUnchecked: number };
  /** The verdicts of the pages the edition still cites, which is what a rule change would act on. */
  currentVerdicts: Record<Verdict, number>;
  /** Every page the candidate rule would move, with the readings that moved it. */
  changes: { url: string; lastPass: string; failedOn: string[] }[];
};

export function recencyMeasurement(options: { checksDir?: string; editionsDir?: string; edition?: string } = {}): RecencyMeasurement {
  const { checksDir = CHECKS_DIR, editionsDir = EDITIONS_DIR, edition = "2026" } = options;
  const runs = readRuns(checksDir);
  if (runs.length === 0) throw new Error(`${checksDir}: no recorded runs, so there is nothing to measure`);

  const { snapshots, problems } = loadSnapshots({ editionsDir, edition });
  if (problems.length > 0) {
    throw new Error(`cannot say which pages are still cited\n${problems.map(({ file, message }) => `${file}: ${message}`).join("\n")}`);
  }
  const cited = new Set(collectSourceChecks(snapshots).map(({ url }) => url));

  /** Every reading of every page, in the order they were taken, with the time and not only the day. */
  const readings = new Map<string, { at: string; status: string }[]>();
  for (const run of runs) {
    for (const result of run.results) {
      const seen = readings.get(result.url) ?? [];
      seen.push({ at: run.checkedAt, status: result.status });
      readings.set(result.url, seen);
    }
  }

  const mixed = { withFail: 0, onlyUnchecked: 0 };
  const changes: RecencyMeasurement["changes"] = [];
  const currentVerdicts: Record<Verdict, number> = { HEALTHY: 0, FLAKY: 0, UNREACHABLE: 0, GONE: 0, NEW: 0 };

  let observedUrls = 0;
  for (const history of historyOf(runs)) {
    observedUrls += 1;
    if (cited.has(history.url)) currentVerdicts[history.verdict] += 1;
    const taken = (readings.get(history.url) ?? []).toSorted((a, b) => a.at.localeCompare(b.at));

    if (history.verdict === "FLAKY" && cited.has(history.url)) {
      if (taken.some(({ status }) => status === "FAIL")) mixed.withFail += 1;
      else mixed.onlyUnchecked += 1;
    }

    const lastPass = taken.findLast(({ status }) => status === "PASS")?.at;
    if (lastPass === undefined || history.verdict === "GONE") continue;
    const failedOn = [...new Set(taken.filter(({ at, status }) => at > lastPass && status === "FAIL").map(({ at }) => at.slice(0, 10)))];
    if (failedOn.length >= 2) changes.push({ url: history.url, lastPass, failedOn });
  }

  return {
    runs: runs.length,
    observedUrls,
    days: [...new Set(runs.map(({ checkedAt }) => checkedAt.slice(0, 10)))].toSorted(),
    currentCitations: cited.size,
    mixed,
    currentVerdicts,
    changes,
  };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    console.log(JSON.stringify(recencyMeasurement(), null, 2));
    return 0;
  });
}
