import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { reportSources } from "../scripts/report-sources.ts";
import type { CheckReport } from "../src/sources/check.ts";
import {
  byHost,
  byTerritory,
  fileNameOf,
  historyOf,
  type LedgerRun,
  looksLikeOurSide,
  readRuns,
  recordRun,
  territoriesOf,
  territoryOf,
} from "../src/sources/ledger.ts";

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

const ledger = (): string => path.join(mkdtempSync(path.join(tmpdir(), "ledger-")), "checks");

test("a run writes a file of its own and can never overwrite another", () => {
  const file = ledger();
  recordRun(
    {
      edition: "2026",
      scope: "fr/occitanie",
      totals: { pass: 1, fail: 0, unchecked: 0 },
      reports: [report("https://a.example/", "PASS", 200)],
      checkedAt: "2026-10-08T20:00:00.000Z",
    },
    file,
  );
  recordRun(
    {
      edition: "2026",
      scope: "fr/bretagne",
      totals: { pass: 0, fail: 0, unchecked: 1 },
      reports: [report("https://b.example/", "UNCHECKED", null, "no response")],
      checkedAt: "2026-10-09T09:00:00.000Z",
    },
    file,
  );

  const runs = readRuns(file);
  assert.equal(runs.length, 2, "a second run replaced the first instead of joining the series");
  assert.equal(runs[0]?.scope, "fr/occitanie", "the series is not in the order it was taken");
  assert.equal(runs[0]?.results[0]?.note, undefined, "a page that passed carries a reason it does not have");
  assert.equal(runs[1]?.results[0]?.note, "no response", "a page that did not pass lost the reason why");

  const files = readdirSync(file).toSorted();
  assert.deepEqual(
    files,
    ["20261008T200000000Z--fr-occitanie.json", "20261009T090000000Z--fr-bretagne.json"],
    "two runs did not write two files named after the instant and the scope, so the directory no longer sorts by time",
  );
  assert.equal(
    readFileSync(path.join(file, files[0] ?? ""), "utf8")
      .trim()
      .split("\n").length,
    1,
    "a run is one line of JSON in its own file",
  );
  assert.equal(fileNameOf(runs[0] ?? { checkedAt: "", scope: "" }), files[0], "the name a run would be given is not the name it has");

  // The guarantee the whole shape exists for: nothing one run writes can touch what another run wrote.
  assert.throws(
    () =>
      recordRun(
        {
          edition: "2026",
          scope: "fr/occitanie",
          totals: { pass: 0, fail: 0, unchecked: 0 },
          reports: [],
          checkedAt: "2026-10-08T20:00:00.000Z",
        },
        file,
      ),
    /EEXIST/u,
    "a run overwrote a reading that had already been taken",
  );
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

/**
 * The rule the second day of the real series found, on 2026-10-09. Fourteen pages had failed twice by
 * then and eleven of them had only ever refused an automated request or served a page this checker
 * cannot read: `barriosproductores.madrid.es` and `bretagne.bzh` answering 403, Bolzano answering 200
 * with a page that needs a browser. Calling those GONE would have sent somebody to rewrite eleven
 * correct records. A reading that could not read the page is UNCHECKED, and UNCHECKED never counts
 * towards GONE, whatever status code arrived with it — `decisions/007`.
 */
test("a host refusing an automaton is never read as a dead page, however often it refuses", () => {
  const refused = historyOf([
    run("2026-10-08T20:00:00.000Z", [report("https://portal.example/", "UNCHECKED", 403, "HTTP 403: host refused an automated request")]),
    run("2026-10-09T09:00:00.000Z", [report("https://portal.example/", "UNCHECKED", 403, "HTTP 403: host refused an automated request")]),
  ]);
  assert.equal(
    refused[0]?.verdict,
    "UNREACHABLE",
    "a host declining automation was read as evidence that the citation is dead, which would send somebody to rewrite a correct record",
  );

  const unreadable = historyOf([
    run("2026-10-08T20:00:00.000Z", [report("https://shell.example/", "UNCHECKED", 200, "content type application/pdf could not be read")]),
    run("2026-10-09T09:00:00.000Z", [report("https://shell.example/", "UNCHECKED", 200, "content type application/pdf could not be read")]),
  ]);
  assert.equal(unreadable[0]?.verdict, "UNREACHABLE", "a page that answered but could not be read was counted as a page that is gone");

  const mixed = historyOf([
    run("2026-10-08T20:00:00.000Z", [report("https://half.example/", "FAIL", 404, "HTTP 404")]),
    run("2026-10-09T09:00:00.000Z", [report("https://half.example/", "UNCHECKED", null, "no response")]),
  ]);
  assert.equal(mixed[0]?.verdict, "UNREACHABLE", "one failure and one silence were counted as a failure on two days");
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
    recordRun(
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

/**
 * The second lesson of the series, learnt on 2026-10-09: a verdict nobody can attribute is a verdict
 * nobody acts on. Several of the first runs were sweeps of a whole edition, and all any of them could
 * say was "all" — so "one cited page of 494 is gone" named no record, no territory and no country.
 * Attribution is per reading, because that is the only level at which it is a fact rather than a
 * reconstruction.
 */
test("a territory is read from where its pages are cited, not from how the run was invoked", () => {
  assert.equal(territoryOf("2026/eu.json#x"), "eu");
  assert.equal(territoryOf("2026/countries/es.json#es-cultiva"), "es");
  assert.equal(territoryOf("2026/regions/es/aragon.json#aragon-ayuda"), "es/aragon");
  assert.equal(territoryOf("2026/hubs/es/canarias.json#news:x"), "es/canarias");
  assert.equal(territoryOf("whatever.json#x"), null, "a reference nobody recognises was filed under a territory anyway");
});

test("a sweep of the whole edition still records whose pages it read", () => {
  const file = ledger();
  const shared: CheckReport = {
    ...report("https://shared.example/", "PASS", 200),
    citedBy: ["2026/countries/es.json#a", "2026/regions/es/aragon.json#b"],
  };
  const { run: recorded } = recordRun(
    {
      edition: "2026",
      scope: "all",
      totals: { pass: 2, fail: 0, unchecked: 0 },
      reports: [shared, { ...report("https://only-pt.example/", "PASS", 200), citedBy: ["2026/regions/pt/algarve.json#c"] }],
      checkedAt: "2026-10-09T09:00:00.000Z",
    },
    file,
  );
  assert.deepEqual(
    recorded.results[0]?.territories,
    ["es", "es/aragon"],
    "a whole-edition sweep recorded no territory for a page, so its verdict belongs to nobody",
  );

  const series = byTerritory(readRuns(file), [
    { territory: "es", urls: ["https://shared.example/"] },
    { territory: "es/aragon", urls: ["https://shared.example/", "https://never-read.example/"] },
    { territory: "pt/algarve", urls: ["https://only-pt.example/"] },
    // A region that documents no instrument at all, which three of the real ones do.
    { territory: "it", urls: [] },
  ]);
  const of = (territory: string): (typeof series)[number] | undefined => series.find((entry) => entry.territory === territory);
  assert.equal(of("es")?.read.length, 1);
  assert.equal(of("es/aragon")?.read.length, 1, "a page cited by two territories was counted in one of them only");
  assert.deepEqual(
    of("es/aragon")?.unread,
    ["https://never-read.example/"],
    "a page a territory cites and no run has ever read is not reported as unread",
  );
  assert.equal(of("pt/algarve")?.unread.length, 0);
  assert.deepEqual({ cites: of("it")?.cites, read: of("it")?.read, lastRead: of("it")?.lastRead }, { cites: [], read: [], lastRead: null });
});

test("a run taken before attribution is read at the scope it recorded, and a sweep at none", () => {
  const territory = run("2026-10-08T20:00:00.000Z", [report("https://a.example/", "PASS", 200)]);
  const result = territory.results[0] ?? { url: "", status: "PASS" as const, httpStatus: null };
  assert.deepEqual(
    territoriesOf(territory, result),
    ["fr/occitanie"],
    "a per-territory run from before attribution lost the territory its own name records",
  );
  assert.deepEqual(
    territoriesOf({ ...territory, scope: "all" }, result),
    [],
    "a sweep that recorded no attribution was given one anyway, which invents a fact about where a page is cited",
  );
});

/**
 * What happened on 2026-10-09, an hour after the series produced its first three verdicts. Two of the
 * three records were corrected by dropping the page: a Navarre news feed that could never keep its
 * quote, and a Zaragoza procedure page that is gone. The readings stay for ever, so the series went on
 * reporting both as GONE — work nobody has to do, at the top of the list of work somebody does.
 */
test("a page no record cites any more is evidence, not work", () => {
  const file = ledger();
  for (const day of ["2026-10-08T20:00:00.000Z", "2026-10-09T09:00:00.000Z"]) {
    recordRun(
      {
        edition: "2026",
        scope: "es/navarra",
        totals: { pass: 0, fail: 2, unchecked: 0 },
        reports: [
          { ...report("https://feed.example/", "FAIL", 200, "1 of 1 quote(s) not found"), citedBy: ["2026/regions/es/navarra.json#a"] },
          { ...report("https://still.example/", "FAIL", 404, "HTTP 404"), citedBy: ["2026/regions/es/navarra.json#b"] },
        ],
        checkedAt: day,
      },
      file,
    );
  }

  // The corpus as it stands now: the feed left the record, the other page is still cited.
  const { lines, gone } = reportSources(file, [{ territory: "es/navarra", urls: ["https://still.example/"] }]);
  const text = lines.join("\n");
  assert.equal(gone, 1, "a page that left every record is still counted as a record to correct");
  assert.match(text, /### GONE: 1/u);
  assert.match(text, /1 more no longer cited by any record/u, "the reading that proves the work was done is not accounted for at all");
  assert.match(text, /https:\/\/still\.example\//u);
  assert.doesNotMatch(text, /https:\/\/feed\.example\//u, "a page nobody cites any more is named among the pages to act on");
});

test("the report names the territories nobody has read, which no single run can", () => {
  const file = ledger();
  recordRun(
    {
      edition: "2026",
      scope: "es/aragon",
      totals: { pass: 1, fail: 0, unchecked: 0 },
      reports: [{ ...report("https://aragon.example/", "PASS", 200), citedBy: ["2026/regions/es/aragon.json#a"] }],
      checkedAt: "2026-10-09T09:00:00.000Z",
    },
    file,
  );
  const text = reportSources(file, [
    { territory: "es/aragon", urls: ["https://aragon.example/"] },
    { territory: "it/sicilia", urls: ["https://sicilia.example/"] },
    { territory: "it", urls: [] },
  ]).lines.join("\n");
  assert.match(text, /### territory by territory: 1 of 2 fully read, 1 with nothing to read/u);
  assert.match(text, /es\/aragon\s+1 of\s+1 page\(s\)/u, "a territory that was read is not reported with how much of it was read");
  assert.match(text, /it\/sicilia\s+0 of\s+1 page\(s\)\s+never read/u, "a territory whose evidence nobody has ever checked is not named");
  assert.match(text, /UNREAD\s+https:\/\/sicilia\.example\//u, "the page nobody has read is not named, so nobody can go and read it");
  assert.match(text, /it\s+cites nothing/u, "a territory that documents nothing is reported as unread, which it will be for ever");
});
