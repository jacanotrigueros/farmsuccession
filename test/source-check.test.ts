import assert from "node:assert/strict";
import { test } from "node:test";

import { evaluate, fetchWithRetry, type PlannedCheck, runChecks, summarize } from "../src/sources/check.ts";
import { collectLinkChecks, collectSourceChecks } from "../src/sources/collect.ts";
import { normalizeHtml } from "../src/sources/document.ts";
import type { FetchedPage } from "../src/sources/fetch.ts";
import { renderReport, renderTotals } from "../src/sources/report.ts";
import {
  FAKE_COUNTRY_FILE,
  FAKE_EDITION_FILE,
  fakeCountryEdition,
  fakeEdition,
  fakeResource,
  fakeSource,
  fakeTerritories,
} from "./fixtures.ts";

const URL_UNDER_CHECK = "https://example.test/land-bank";

/** What one request came back with, without any request having been made. */
function answered(overrides: Partial<FetchedPage> = {}): FetchedPage {
  return {
    httpStatus: 200,
    finalUrl: URL_UNDER_CHECK,
    contentType: "text/html",
    // A page with as much text as a real one: under 200 characters the shell guard takes over, which
    // is the subject of its own test rather than something every other test should be fighting.
    document: normalizeHtml(
      "<title>Land bank</title><p>The land bank lists plots offered for rent. Owners register the land they are not " +
        "working and people looking for land apply through the same form. The office answers applications in order of " +
        "arrival and publishes the plots awarded each quarter.</p>",
    ),
    error: null,
    elapsedMs: 12,
    ...overrides,
  };
}

const planned = (quotes: string[] = []): PlannedCheck => ({ url: URL_UNDER_CHECK, quotes, citedBy: ["2026/regions/xa/north-isle.json#a"] });

test("a page that answers and still carries its quotes passes", () => {
  const report = evaluate(planned(["The land bank lists plots offered for rent"]), answered());
  assert.equal(report.status, "PASS");
  assert.deepEqual(report.notes, []);
  assert.deepEqual(
    report.quotes.map((quote) => quote.foundIn),
    ["text"],
  );
});

test("a quote that is no longer on the page is a failure, and says which", () => {
  const report = evaluate(planned(["It lists holdings for sale"]), answered());
  assert.equal(report.status, "FAIL");
  assert.match(renderReport(report), /MISSING: "It lists holdings for sale"/u);
  assert.match(renderReport(report), /cited by: 2026\/regions\/xa\/north-isle.json#a/u, "a failure has to say whose evidence it was");
});

test("an address that is gone fails; a host having a bad day does not", () => {
  assert.equal(evaluate(planned(), answered({ httpStatus: 404, document: null })).status, "FAIL");
  assert.equal(evaluate(planned(), answered({ httpStatus: 410, document: null })).status, "FAIL");
  assert.equal(evaluate(planned(), answered({ httpStatus: 503, document: null })).status, "UNCHECKED");
  assert.equal(evaluate(planned(), answered({ httpStatus: 500, document: null })).status, "UNCHECKED");
});

test("a host refusing automation is not evidence that the page changed", () => {
  for (const httpStatus of [403, 429]) {
    const report = evaluate(planned(["anything"]), answered({ httpStatus, document: null }));
    assert.equal(report.status, "UNCHECKED");
    assert.match(report.notes.join(" "), /host refused an automated request/u);
  }
});

test("no response at all is unchecked, with the reason attached", () => {
  const report = evaluate(planned(), answered({ httpStatus: null, document: null, error: "fetch failed (ENOTFOUND)" }));
  assert.equal(report.status, "UNCHECKED");
  assert.match(report.notes.join(" "), /no response: fetch failed \(ENOTFOUND\)/u);
});

test("a bot challenge is recognised before the status code it arrives with", () => {
  const challenge = answered({
    httpStatus: 403,
    finalUrl: "https://validate.perfdrive.com/?ssa=1",
    document: normalizeHtml("<p>Verify you are human</p>"),
  });
  const report = evaluate(planned(["anything"]), challenge);
  assert.equal(report.status, "UNCHECKED");
  assert.match(report.notes.join(" "), /bot challenge \(validate.perfdrive.com\) instead of the page/u, "more useful than HTTP 403");
});

test("a page that answers 200 and says it does not exist is a failure", () => {
  const soft = answered({ document: normalizeHtml("<title>Error 404 - Page introuvable</title><p>Rien ici</p>") });
  const report = evaluate(planned(), soft);
  assert.equal(report.status, "FAIL");
  assert.match(report.notes.join(" "), /its title says it does not exist/u);
});

test("a shell a script fills in later says nothing about the quotes", () => {
  const shell = answered({ document: normalizeHtml("<title>Land bank</title><p>Loading…</p>") });
  const report = evaluate(planned(["The land bank lists plots offered for rent"]), shell);
  assert.equal(report.status, "UNCHECKED");
  assert.match(report.notes.join(" "), /probably rendered by JavaScript/u);
});

test("a redirect is noted, not failed, because the evidence may well be there", () => {
  const moved = answered({ finalUrl: "https://example.test/land-bank/2026" });
  const report = evaluate(planned(["The land bank lists plots offered for rent"]), moved);
  assert.equal(report.status, "PASS");
  assert.match(report.notes.join(" "), /redirects to https:\/\/example.test\/land-bank\/2026; consider citing the final page/u);
  const sameWithSlash = answered({ finalUrl: "https://www.example.test/land-bank/" });
  assert.deepEqual(evaluate(planned(), sameWithSlash).notes, [], "www and a trailing slash are the same page");
});

/** No pause at all: how long the retry waits is the caller's business, not part of the rule. */
const noPause = (): Promise<void> => Promise.resolve();

test("only a request that got no answer is retried", async () => {
  let attempts = 0;
  const timeout = (): Promise<FetchedPage> => {
    attempts += 1;
    return Promise.resolve(answered({ httpStatus: null, document: null, error: `timeout ${attempts}` }));
  };
  const page = await fetchWithRetry(URL_UNDER_CHECK, timeout, noPause, 0);
  assert.equal(attempts, 2, "a small portal that times out deserves one second chance");
  assert.match(page.error ?? "", /timeout 2 \(also on first attempt: timeout 1\)/u, "both failures are reported, not just the last");

  attempts = 0;
  const notFound = (): Promise<FetchedPage> => {
    attempts += 1;
    return Promise.resolve(answered({ httpStatus: 404, document: null }));
  };
  await fetchWithRetry(URL_UNDER_CHECK, notFound, noPause, 0);
  assert.equal(attempts, 1, "a status code is an answer, and asking again would not change it");
});

test("one host is visited one request at a time, with a pause between them", async () => {
  const events: string[] = [];
  const checks: PlannedCheck[] = [
    { url: "https://one.test/a", quotes: [], citedBy: [] },
    { url: "https://one.test/b", quotes: [], citedBy: [] },
    { url: "https://two.test/c", quotes: [], citedBy: [] },
  ];
  const fetcher = (url: string): Promise<FetchedPage> => {
    events.push(`fetch ${url}`);
    return Promise.resolve(answered({ finalUrl: url }));
  };
  const sleep = (ms: number): Promise<void> => {
    events.push(`sleep ${ms}`);
    return Promise.resolve();
  };
  const reports = await runChecks(checks, fetcher, { sleep, perHostDelayMs: 1500 });
  assert.deepEqual(
    reports.map((report) => report.url),
    checks.map((check) => check.url),
    "the answers come back against the citations, not in the order the hosts finished",
  );
  const oneTest = events.filter((event) => event.includes("one.test") || event.startsWith("sleep"));
  assert.deepEqual(oneTest, ["fetch https://one.test/a", "sleep 1500", "fetch https://one.test/b"]);
});

test("a page cited by several records is read once and reports every citation", () => {
  const snapshots = [
    { file: FAKE_EDITION_FILE, data: fakeEdition() },
    {
      file: "2026/regions/xa/south-isle.json",
      data: fakeEdition({
        region: "south-isle",
        officialName: "South Isle",
        resources: [fakeResource({ id: "south-isle-land-bank", sources: [fakeSource({ quotes: ["Another line of the same page"] })] })],
      }),
    },
  ];
  const checks = collectSourceChecks(snapshots);
  assert.equal(checks.length, 1, "one URL, one visit");
  assert.deepEqual(checks[0]?.citedBy, [
    "2026/regions/xa/north-isle.json#north-isle-land-bank",
    "2026/regions/xa/south-isle.json#south-isle-land-bank",
  ]);
  assert.equal(checks[0]?.quotes.length, 2, "both records' quotes are checked against the one page");
});

test("the link check covers every address the repository points at, the catalogue included", () => {
  const snapshots = [{ file: FAKE_COUNTRY_FILE, data: fakeCountryEdition() }];
  const urls = new Set(collectLinkChecks(snapshots, fakeTerritories()).map((check) => check.url));
  assert.ok(urls.has("https://example.test/establishment-aid"), "the access link a reader follows");
  assert.ok(urls.has("https://example.test/portal"), "a portal named in a coverage method");
  assert.ok(urls.has("https://example.test/territory"), "the source the territorial model rests on");
  assert.deepEqual(
    collectLinkChecks(snapshots, fakeTerritories()).flatMap((check) => check.quotes),
    [],
    "the link check asks whether an address answers, not what it says",
  );
});

test("the totals say how much of the run proved anything", () => {
  const reports = [
    evaluate(planned(["The land bank lists plots offered for rent"]), answered()),
    evaluate(planned(["gone"]), answered()),
    evaluate(planned(), answered({ httpStatus: 503, document: null })),
  ];
  assert.deepEqual(summarize(reports), { pass: 1, fail: 1, unchecked: 1 });
  assert.equal(renderTotals(summarize(reports)), "1 pass, 1 fail, 1 unchecked");
});
