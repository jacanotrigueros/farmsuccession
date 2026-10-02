/**
 * How a live check reports: readable lines while it runs, and the whole result as JSON afterwards.
 *
 * A run over a few hundred sources produces more than anybody reads in a terminal, so the console gets
 * what needs acting on and the file keeps everything, including what passed.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { CheckReport, Totals } from "./check.ts";
import { ROOT } from "../paths.ts";

/** One report: its status line, its notes, the quotes that were not found, and who cites it. */
export function renderReport(report: CheckReport): string {
  const lines = [`[${report.status}] ${report.httpStatus ?? "---"} ${report.url}`];
  for (const note of report.notes) lines.push(`    note: ${note}`);
  for (const quote of report.quotes.filter((match) => match.foundIn === null)) lines.push(`    MISSING: "${quote.quote}"`);
  // Who cites it is what a person needs to act, and only when there is something to act on.
  if (report.status !== "PASS") lines.push(`    cited by: ${report.citedBy.join(", ")}`);
  return lines.join("\n");
}

export function renderTotals(totals: Totals): string {
  return `${totals.pass} pass, ${totals.fail} fail, ${totals.unchecked} unchecked`;
}

export const REPORTS_DIR = path.join(ROOT, "reports");

/** Writes the full machine-readable result as `<reportsDir>/<name>.json` and returns the path. */
export function writeReport(name: string, content: object, reportsDir = REPORTS_DIR): string {
  mkdirSync(reportsDir, { recursive: true });
  const file = path.join(reportsDir, `${name}.json`);
  writeFileSync(file, `${JSON.stringify({ checkedAt: new Date().toISOString(), ...content }, null, 2)}\n`);
  return file;
}

/** Where a command writes its lines. A test collects them instead of printing them. */
export type Output = { log: (line: string) => void; error: (line: string) => void };

export const consoleOutput: Output = {
  log: (line) => {
    console.log(line);
  },
  error: (line) => {
    console.error(line);
  },
};
