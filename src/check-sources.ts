/**
 * The evidence check: `npm run check:sources [-- <year>]`.
 *
 * It reads every page a record cites and looks for the quotes recorded against it. This is the check
 * that makes the rest mean something: a citation nobody ever re-reads is a claim, not evidence.
 *
 * It goes out to the network, so it is never part of `npm run check` and never gates a commit. A portal
 * being down is not a reason to refuse a commit, which is exactly why UNCHECKED is an answer of its own:
 * this run could not read the page, and that is neither a pass nor a failure.
 *
 * Exit code 1 when a citation failed, 0 otherwise.
 */
import { loadSnapshots } from "./editions.ts";
import { isEntryPoint, runMain } from "./paths.ts";
import { type CheckReport, type RunOptions, runChecks, summarize } from "./sources/check.ts";
import { collectSourceChecks } from "./sources/collect.ts";
import { type Fetcher, fetchPage } from "./sources/fetch.ts";
import { checksDirIn, recordRun } from "./sources/ledger.ts";
import { consoleOutput, type Output, renderReport, renderTotals, writeReport } from "./sources/report.ts";
import { installIntermediates } from "./sources/tls.ts";

export type SourceCheckResult = { planned: number; reports: CheckReport[]; reportFile: string };

/**
 * `fetcher`, `editionsDir` and `reportsDir` default to the network and the repository, and exist as
 * parameters so the whole command can be exercised without a single request leaving the machine.
 * `run` carries the politeness settings — how many hosts at a time, how long between two requests to
 * one host — which a long run may want to slow down and a test wants to skip altogether.
 */
export type CheckOptions = {
  edition?: string;
  /** A path fragment to narrow the run to, so one territory can be checked without the other ninety. */
  filter?: string;
  /** What to call this run in the record. A territory spec reads better there than the path it filtered on. */
  scope?: string;
  editionsDir?: string;
  reportsDir?: string;
  fetcher?: Fetcher;
  run?: RunOptions;
  out?: Output;
};

export async function checkSources(options: CheckOptions = {}): Promise<SourceCheckResult> {
  const out = options.out ?? consoleOutput;
  const { snapshots, problems } = loadSnapshots({ editionsDir: options.editionsDir, edition: options.edition, filter: options.filter });
  // A file that does not load is a matter for `npm run validate`; here it only explains a short run.
  for (const problem of problems) out.error(`skipped ${problem.file}: ${problem.message}`);

  const planned = collectSourceChecks(snapshots);
  out.log(`checking ${planned.length} page(s) cited by ${snapshots.length} edition file(s)`);
  const reports = await runChecks(planned, options.fetcher ?? fetchPage, {
    ...options.run,
    onReport: (report) => {
      // Printed as they arrive: a run over hundreds of pages is not something to watch in silence.
      out.log(renderReport(report));
    },
  });

  const totals = summarize(reports);
  const reportFile = writeReport("sources", { totals, reports }, options.reportsDir);
  // Recorded before the totals are printed, so a run interrupted afterwards is still part of the series.
  recordRun(
    { edition: options.edition ?? "", scope: options.scope ?? options.filter ?? "all", totals, reports },
    checksDirIn(options.reportsDir),
  );
  out.log(`${renderTotals(totals)} — full report in ${reportFile}`);
  return { planned: planned.length, reports, reportFile };
}

if (isEntryPoint(import.meta.url)) {
  runMain(async () => {
    // Only a process that is about to make requests needs the portals' missing intermediates.
    for (const intermediate of installIntermediates()) {
      console.log(`trusting intermediate "${intermediate.subject}" for ${intermediate.servedIncompleteBy.join(", ")}`);
    }
    const { reports } = await checkSources({ edition: process.argv[2] });
    return summarize(reports).fail ? 1 : 0;
  });
}
