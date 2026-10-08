import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { reportSources } from "../scripts/report-sources.ts";
import type { CheckReport } from "../src/sources/check.ts";
import { appendRun, byHost, historyOf, looksLikeOurSide, readLedger, type LedgerRun } from "../src/sources/ledger.ts";

/**
 * The rules this file protects are the ones the French sweep of 2026-10-08 taught, and all of them say
 * the same thing in different words: a verdict about a source comes from the series, never from the run
 * in front of you. They are tests rather than notes because the tempting mistake — treating the last
 * reading as the truth — is the one somebody makes at the end of a long run.
 */

const report = (url: string, status: CheckReport["status"], httpStatus: number | null, note = ""): CheckReport => ({
  url,
  status,
  httpStatus,
  finalUrl: url,
  elapsedMs: 1,
  notes: note ? [note] : [],
  quotes: [],
  citedBy: ["2026/regions/fr/occitanie.json#x"],
});

const run = (checkedAt: string, reports: CheckReport[]): LedgerRun => ({
  checkedAt,
  edition: "2026",
  scope: "fr/occitanie",
  totals: {
    pass: reports.filter((one) => one.status === "PASS").length,
    fail: reports.filter((one) => one.status === "FAIL").length,
    unchecked: reports.filter((one) => one.status === "UNCHECKED").length,
  },
  results: reports.map((one) => ({
    url: one.url,
    status: one.status,
    httpStatus: one.httpStatus,
    ...(one.status === "PASS" ? {} : { note: one.notes[0] ?? "" }),
  })),
});

const ledger = (): string => path.join(mkdtempSync(path.join(tmpdir(), "ledger-")), "source-checks.jsonl");

test("a run is appended and never rewrites the ones before it", () => {
  const file = ledger();
  appendRun(
    {
      edition: "2026",
      scope: "fr/occitanie",
      totals: { pass: 1, fail: 0, unchecked: 0 },
      reports: [report("https://a.example/", "PASS", 200)],
      checkedAt: "2026-10-08T20:00:00.000Z",
    },
    file,
  );
  appendRun(
    {
      edition: "2026",
      scope: "fr/bretagne",
      totals: { pass: 0, fail: 0, unchecked: 1 },
      reports: [report("https://b.example/", "UNCHECKED", null, "no response")],
      checkedAt: "2026-10-09T09:00:00.000Z",
    },
    file,
  );

  const runs = readLedger(file);
  assert.equal(runs.length, 2, "a second run replaced the first instead of being added to it");
  assert.equal(runs[0]?.scope, "fr/occitanie", "the series is not in the order it was recorded");
  assert.equal(readFileSync(file, "utf8").trim().split("\n").length, 2, "one run is one line, so the file stays appendable");
  assert.equal(runs[0]?.results[0]?.note, undefined, "a page that passed carries a reason it does not have");
  assert.equal(runs[1]?.results[0]?.note, "no response", "a page that did not pass lost the reason why");
});

test("a page is only gone when it answered badly on more than one day", () => {
  const url = "https://gone.example/";
  const once = historyOf([run("2026-10-08T20:00:00.000Z", [report(url, "FAIL", 404, "HTTP 404")])]);
  assert.equal(once[0]?.verdict, "NEW", "one reading decided that a page was gone, which is what a bad afternoon looks like");

  const twice = historyOf([
    run("2026-10-08T20:00:00.000Z", [report(url, "FAIL", 404, "HTTP 404")]),
    run("2026-10-09T09:00:00.000Z", [report(url, "FAIL", 404, "HTTP 404")]),
  ]);
  assert.equal(twice[0]?.verdict, "GONE", "a page that refused on two different days is still not being reported");

  const sameDay = historyOf([
    run("2026-10-08T20:00:00.000Z", [report(url, "FAIL", 404, "HTTP 404")]),
    run("2026-10-08T20:30:00.000Z", [report(url, "FAIL", 404, "HTTP 404")]),
  ]);
  assert.equal(sameDay[0]?.verdict, "NEW", "two readings half an hour apart were counted as two days");
});

test("silence is never read as a dead page, however often it repeats", () => {
  const url = "https://silent.example/";
  const histories = historyOf([
    run("2026-10-08T20:00:00.000Z", [report(url, "UNCHECKED", null, "no response: fetch failed (EAI_AGAIN)")]),
    run("2026-10-09T09:00:00.000Z", [report(url, "UNCHECKED", null, "no response: fetch failed (UND_ERR_CONNECT_TIMEOUT)")]),
    run("2026-10-10T09:00:00.000Z", [report(url, "UNCHECKED", null, "no response: fetch failed (EAI_AGAIN)")]),
  ]);
  assert.equal(
    histories[0]?.verdict,
    "UNREACHABLE",
    "a page nobody could reach was called gone. Nothing answered, so nothing was learnt about the page: this is what a dropping network looks like from here.",
  );
});

test("a page that has ever passed is flaky, not broken", () => {
  const url = "https://bretagne.example/";
  const histories = historyOf([
    run("2026-10-08T20:00:00.000Z", [report(url, "PASS", 200)]),
    run("2026-10-08T22:00:00.000Z", [report(url, "UNCHECKED", 403, "HTTP 403: host refused an automated request")]),
    run("2026-10-09T09:00:00.000Z", [report(url, "UNCHECKED", null, "no response")]),
  ]);
  assert.equal(histories[0]?.verdict, "FLAKY", "a page that answered correctly once is being reported as a problem with the record");
});

/**
 * The run this check is built from: nineteen French territories, 53 PASS, 0 FAIL, 36 UNCHECKED, and
 * every one of those 36 a transport failure. Quoted as a measurement it says the corpus is rotting;
 * read against the next run, which passed, it says the network dropped.
 */
test("a run where most pages never answered is marked as a reading about this machine", () => {
  const silent = run("2026-10-08T22:00:00.000Z", [
    report("https://a.example/", "UNCHECKED", null, "no response"),
    report("https://b.example/", "UNCHECKED", null, "no response"),
    report("https://c.example/", "UNCHECKED", null, "no response"),
    report("https://d.example/", "PASS", 200),
  ]);
  assert.ok(looksLikeOurSide(silent), "a run that could not reach three pages of four is being quoted as if it measured them");

  const refused = run("2026-10-08T22:00:00.000Z", [
    report("https://a.example/", "UNCHECKED", 403, "HTTP 403"),
    report("https://b.example/", "UNCHECKED", 403, "HTTP 403"),
    report("https://c.example/", "UNCHECKED", 403, "HTTP 403"),
    report("https://d.example/", "PASS", 200),
  ]);
  assert.ok(!looksLikeOurSide(refused), "hosts refusing automation is a fact about those hosts, not about this machine");

  const small = run("2026-10-08T22:00:00.000Z", [report("https://a.example/", "UNCHECKED", null, "no response")]);
  assert.ok(!looksLikeOurSide(small), "one page that did not answer is not evidence of anything at all");
});

test("a host is weighed across every run, so a flaky portal is told from a broken link", () => {
  const hosts = byHost([
    run("2026-10-08T20:00:00.000Z", [
      report("https://portal.example/a", "PASS", 200),
      report("https://portal.example/b", "UNCHECKED", null),
    ]),
    run("2026-10-09T09:00:00.000Z", [report("https://portal.example/a", "PASS", 200), report("https://steady.example/x", "PASS", 200)]),
  ]);
  const portal = hosts.find((host) => host.host === "portal.example");
  assert.deepEqual({ ...portal }, { host: "portal.example", checks: 3, passes: 2 });
  assert.equal(hosts[0]?.host, "portal.example", "the least reliable host is not reported first, where somebody would look");
});

test("the report says what has to be acted on, and says nothing when nothing has been recorded", () => {
  const empty = reportSources(path.join(mkdtempSync(path.join(tmpdir(), "ledger-")), "nothing.jsonl"));
  assert.match(empty.lines[0] ?? "", /no run has been recorded yet/u, "an empty series reads as a clean one");

  const file = ledger();
  for (const day of ["2026-10-08T20:00:00.000Z", "2026-10-09T09:00:00.000Z"]) {
    appendRun(
      {
        edition: "2026",
        scope: "fr/occitanie",
        totals: { pass: 1, fail: 1, unchecked: 0 },
        reports: [report("https://ok.example/", "PASS", 200), report("https://gone.example/", "FAIL", 404, "HTTP 404")],
        checkedAt: day,
      },
      file,
    );
  }
  const { lines, gone } = reportSources(file);
  assert.equal(gone, 1);
  const text = lines.join("\n");
  assert.match(text, /### GONE: 1/u);
  assert.match(text, /https:\/\/gone\.example\//u, "a page the series says is gone is not named, so nobody can act on it");
  assert.doesNotMatch(text, /https:\/\/ok\.example\//u, "a page that has always passed is listed among the ones to act on");
});
