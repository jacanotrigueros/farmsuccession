/**
 * What the series of live checks says, which is not what any one of them says.
 *
 * `npm run report:sources` reads `reports/checks/` — one file per run, every run ever recorded — and answers
 * the three questions a single run cannot:
 *
 *   1. which cited pages are actually gone, as opposed to unread once;
 *   2. which hosts are unreliable, as opposed to which links are broken;
 *   3. which runs were readings about this machine rather than about the corpus.
 *
 * It decides nothing on its own. It prints what somebody then has to act on, which for a GONE page
 * means opening it and either correcting the record or marking the resource UNKNOWN — `decisions/015`.
 */
import { byHost, CHECKS_DIR, historyOf, looksLikeOurSide, readRuns, type UrlHistory, type Verdict } from "../src/sources/ledger.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";

const EXPLAIN: Record<Verdict, string> = {
  GONE: "answered with a refusal, or lost its quotes, on more than one day — open it and correct the record",
  UNREACHABLE: "nobody answered, on more than one day — the page may be fine; the obstacle is the network or the host's policy",
  FLAKY: "has both passed and failed — a reading, not a verdict",
  HEALTHY: "has passed every time it was read",
  NEW: "checked on one day only, so the series cannot say anything yet",
};

const ORDER: Verdict[] = ["GONE", "UNREACHABLE", "FLAKY", "NEW", "HEALTHY"];

function render(histories: readonly UrlHistory[], runs: ReturnType<typeof readRuns>): string[] {
  const lines: string[] = [];
  const days = new Set(runs.map((run) => run.checkedAt.slice(0, 10)));
  lines.push(
    `${runs.length} run(s) recorded on ${days.size} day(s), covering ${histories.length} cited page(s)`,
    `from ${runs[0]?.checkedAt.slice(0, 10) ?? "—"} to ${runs.at(-1)?.checkedAt.slice(0, 10) ?? "—"}`,
    "",
  );

  for (const verdict of ORDER) {
    const group = histories.filter((history) => history.verdict === verdict);
    lines.push(`### ${verdict}: ${group.length}`, `  ${EXPLAIN[verdict]}`);
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

export function reportSources(checksDir = CHECKS_DIR): { lines: string[]; gone: number } {
  const runs = readRuns(checksDir);
  if (runs.length === 0) {
    return { lines: ["no run has been recorded yet: run npm run check:sources, and the series starts there"], gone: 0 };
  }
  const histories = historyOf(runs);
  return { lines: render(histories, runs), gone: histories.filter((history) => history.verdict === "GONE").length };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const { lines } = reportSources();
    for (const line of lines) console.log(line);
    // Never a failing exit code: this reports on evidence, and a page that died is not a broken build.
    return 0;
  });
}
