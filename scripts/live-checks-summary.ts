/** The current ledger paragraph is generated, so a new run cannot leave yesterday's totals in prose. */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ROOT, isEntryPoint, runMain } from "../src/paths.ts";
import { byTerritory, historyOf, readRuns, type LedgerRun, type TerritoryPages, type Verdict } from "../src/sources/ledger.ts";
import { citedByTerritory } from "./report-sources.ts";

export const START = "<!-- source-series:start -->";
export const END = "<!-- source-series:end -->";
const FILE = path.join(ROOT, "research", "live-checks.md");

export function liveSummary(runs: readonly LedgerRun[], cited: readonly TerritoryPages[]): string {
  if (!runs.length) throw new Error("no ledger runs: an empty series cannot support a freshness paragraph");
  const histories = historyOf(runs);
  const days = [...new Set(runs.map((run) => run.checkedAt.slice(0, 10)))].toSorted();
  const counts = (verdict: Verdict, group = histories) => group.filter((history) => history.verdict === verdict).length;
  const urls = new Set(cited.flatMap((territory) => territory.urls));
  const current = histories.filter((history) => urls.has(history.url));
  const series = byTerritory(runs, cited).filter((territory) => territory.cites.length > 0);
  const fullyRead = series.filter((territory) => territory.unread.length === 0).length;
  return (
    `As of ${days.at(-1)}, the committed source-check series holds ${runs.length} runs on ${days.length} UTC days ` +
    `(${days[0]} to ${days.at(-1)}), observing ${histories.length} distinct URLs: ` +
    `${counts("HEALTHY")} HEALTHY, ${counts("FLAKY")} FLAKY, ${counts("UNREACHABLE")} UNREACHABLE, ${counts("GONE")} GONE and ${counts("NEW")} NEW. ` +
    `Of those, ${current.length} are still cited by the current corpus: ${counts("HEALTHY", current)} HEALTHY, ` +
    `${counts("FLAKY", current)} FLAKY, ${counts("UNREACHABLE", current)} UNREACHABLE, ${counts("GONE", current)} GONE and ${counts("NEW", current)} NEW; ` +
    `${histories.length - current.length} no longer cited URLs remain in the history. ` +
    `All cited pages have been checked at least once for ${fullyRead} of ${series.length} territories that cite evidence; ` +
    `${cited.filter((territory) => territory.urls.length === 0).length} territories cite none. ` +
    `Checked includes UNCHECKED outcomes and does not mean a page was successfully read. ` +
    `These verdicts follow decision 025; they do not establish current availability or a human review.`
  );
}

export function replaceSummary(document: string, paragraph: string): string {
  const start = document.indexOf(START);
  const end = document.indexOf(END);
  if (start < 0 || end < start || document.indexOf(START, start + 1) !== -1 || document.indexOf(END, end + 1) !== -1) {
    throw new Error("live-checks.md needs exactly one ordered source-series marker pair: refuse to overwrite unrelated prose");
  }
  return document.slice(0, start + START.length) + "\n\n" + paragraph + "\n\n" + document.slice(end);
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const paragraph = liveSummary(readRuns(), citedByTerritory());
    if (process.argv.includes("--write")) {
      writeFileSync(FILE, replaceSummary(readFileSync(FILE, "utf8"), paragraph));
    } else console.log(paragraph);
    return 0;
  });
}
