import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { recencyMeasurement } from "../scripts/measure-recency.ts";

/**
 * A measurement that finds nothing proves nothing until it is shown finding something.
 *
 * `npm run measure:recency` reports that letting failures after the last success count would move zero
 * pages in the committed series. That is only evidence for keeping `decisions/025` if the measurement
 * would have moved a page that deserved moving — otherwise "zero" is indistinguishable from a broken
 * script. So these build the series the repository does not contain and check both halves of the rule:
 * two answered failures after a success move a page, and readings nobody could take never do.
 */
const run = (checkedAt: string, url: string, status: string) => ({
  checkedAt,
  edition: "2026",
  scope: "all",
  totals: { checked: 1, pass: status === "PASS" ? 1 : 0, fail: status === "FAIL" ? 1 : 0, unchecked: status === "UNCHECKED" ? 1 : 0 },
  results: [{ url, status, httpStatus: status === "PASS" ? 200 : 404, ...(status === "PASS" ? {} : { note: "" }) }],
});

function seriesOf(readings: [string, string][]): string {
  const dir = mkdtempSync(path.join(tmpdir(), "recency-"));
  const url = "https://example.invalid/a-page";
  for (const [at, status] of readings) {
    writeFileSync(path.join(dir, `${at.replaceAll(/[:-]/gu, "")}--all.json`), JSON.stringify(run(at, url, status)));
  }
  return dir;
}

/** The edition is read only to say which pages are still cited, and these pages never were. */
const measure = (dir: string) => recencyMeasurement({ checksDir: dir });

test("two answered failures after the last success are what the candidate rule is for", () => {
  const dir = seriesOf([
    ["2026-10-08T10:00:00.000Z", "PASS"],
    ["2026-10-09T10:00:00.000Z", "FAIL"],
    ["2026-10-13T10:00:00.000Z", "FAIL"],
  ]);
  const { changes } = measure(dir);
  assert.equal(changes.length, 1, "a page that failed on two days after its last success was not reported");
  assert.deepEqual(changes[0]?.failedOn, ["2026-10-09", "2026-10-13"], "the days that moved it are not the days it failed");
});

test("a page nobody could read has not failed, however many times nobody could read it", () => {
  const dir = seriesOf([
    ["2026-10-08T10:00:00.000Z", "PASS"],
    ["2026-10-09T10:00:00.000Z", "UNCHECKED"],
    ["2026-10-13T10:00:00.000Z", "UNCHECKED"],
  ]);
  assert.deepEqual(measure(dir).changes, [], "an unread page was counted as a failure, which decision 007 forbids");
});

test("two failures on one day are one day, because a date cannot order two readings", () => {
  const dir = seriesOf([
    ["2026-10-08T10:00:00.000Z", "PASS"],
    ["2026-10-09T10:00:00.000Z", "FAIL"],
    ["2026-10-09T18:00:00.000Z", "FAIL"],
  ]);
  assert.deepEqual(measure(dir).changes, [], "a single bad day was enough to condemn a page");
});

test("a failure before the last success is history, not a verdict", () => {
  const dir = seriesOf([
    ["2026-10-08T10:00:00.000Z", "FAIL"],
    ["2026-10-09T10:00:00.000Z", "FAIL"],
    ["2026-10-13T10:00:00.000Z", "PASS"],
  ]);
  assert.deepEqual(measure(dir).changes, [], "a page that answered last was moved by failures that came before it");
});

test("a series nobody recorded fails loudly instead of measuring nothing", () => {
  assert.throws(
    () => measure(mkdtempSync(path.join(tmpdir(), "recency-empty-"))),
    /no recorded runs/u,
    "an empty directory measured as a clean result",
  );
});
