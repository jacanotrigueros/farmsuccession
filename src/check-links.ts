/**
 * The reachability check: `npm run check:links [-- <year>]`.
 *
 * It asks of every address the repository points at whether it still answers — access links, sources,
 * the portals named in a coverage method, the sources the territorial catalogue rests on — and nothing
 * about what they say. A link that drops a reader into a 404 costs the project more than a stale figure,
 * because it is the first thing anybody notices.
 *
 * Like the evidence check it reaches the network and never gates a commit. The difference between the
 * two is deliberate: this one covers more addresses and proves less about each.
 *
 * Exit code 1 when an address is gone, 0 otherwise.
 */
import type { CheckOptions } from "./check-sources.ts";
import { loadSnapshots } from "./editions.ts";
import { isEntryPoint, runMain } from "./paths.ts";
import { type CheckReport, runChecks, summarize } from "./sources/check.ts";
import { collectLinkChecks } from "./sources/collect.ts";
import { fetchPage } from "./sources/fetch.ts";
import { consoleOutput, renderReport, renderTotals, writeReport } from "./sources/report.ts";
import { installIntermediates } from "./sources/tls.ts";
import { loadTerritories } from "./territories.ts";

export type LinkCheckResult = { planned: number; reports: CheckReport[]; reportFile: string };

export async function checkLinks(options: CheckOptions & { territoriesFile?: string } = {}): Promise<LinkCheckResult> {
  const out = options.out ?? consoleOutput;
  const territories = loadTerritories(options.territoriesFile);
  const { snapshots, problems } = loadSnapshots({ editionsDir: options.editionsDir, edition: options.edition });
  for (const problem of problems) out.error(`skipped ${problem.file}: ${problem.message}`);

  const planned = collectLinkChecks(snapshots, territories);
  out.log(`checking ${planned.length} address(es)`);
  const reports = await runChecks(planned, options.fetcher ?? fetchPage, {
    ...options.run,
    onReport: (report) => {
      out.log(renderReport(report));
    },
  });

  const totals = summarize(reports);
  const reportFile = writeReport("links", { totals, reports }, options.reportsDir);
  out.log(`${renderTotals(totals)} — full report in ${reportFile}`);
  return { planned: planned.length, reports, reportFile };
}

if (isEntryPoint(import.meta.url)) {
  runMain(async () => {
    installIntermediates();
    const { reports } = await checkLinks({ edition: process.argv[2] });
    return summarize(reports).fail ? 1 : 0;
  });
}
