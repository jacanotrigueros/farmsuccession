import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { checkLinks } from "../src/check-links.ts";
import { checkSources } from "../src/check-sources.ts";
import { normalizeHtml } from "../src/sources/document.ts";
import type { FetchedPage } from "../src/sources/fetch.ts";
import type { EditionSnapshot } from "../src/types/edition.ts";
import { FAKE_EDITION_FILE, fakeEdition, fakeResource, fakeSource, fakeTerritories } from "./fixtures.ts";

/** A page holding `text`, answered as a real server would answer. */
function page(url: string, text: string, status = 200): FetchedPage {
  return {
    httpStatus: status,
    finalUrl: url,
    contentType: "text/html",
    document: status === 200 ? normalizeHtml(`<title>A page</title><p>${text}</p>`) : null,
    error: null,
    elapsedMs: 5,
  };
}

/** A repository of one edition file, with somewhere for a report to land. */
function repository(data: EditionSnapshot = fakeEdition()): { editionsDir: string; reportsDir: string; territoriesFile: string } {
  const root = mkdtempSync(path.join(tmpdir(), "farmsuccession-live-"));
  const editionsDir = path.join(root, "editions");
  const target = path.join(editionsDir, FAKE_EDITION_FILE);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(data));
  const territoriesFile = path.join(root, "territories.json");
  writeFileSync(territoriesFile, JSON.stringify(fakeTerritories()));
  return { editionsDir, reportsDir: path.join(root, "reports"), territoriesFile };
}

/** Collects what a command would have printed, instead of printing it. */
function recorder(): { out: { log: (line: string) => void; error: (line: string) => void }; lines: string[] } {
  const lines: string[] = [];
  return {
    lines,
    out: {
      log: (line) => void lines.push(line),
      error: (line) => void lines.push(`error: ${line}`),
    },
  };
}

const QUOTE = "The land bank lists plots offered for rent.";
/** Enough text that a missing quote is a changed page rather than an unrendered shell. */
const BODY = `${QUOTE} Owners register land they are not working and people looking for land apply through the same form, which the office answers in order of arrival.`;
const OTHER_BODY =
  "This page now says something else entirely, about another subject: the opening hours of the regional office, how to reach it by bus, and which forms can be handed in there without an appointment.";
/** No waiting between requests: politeness is proved in the check's own tests, not re-proved here. */
const NO_WAIT = { perHostDelayMs: 0, sleep: () => Promise.resolve() };

test("the evidence check reads each cited page and finds its quotes again", async () => {
  const { editionsDir, reportsDir } = repository();
  const { out, lines } = recorder();
  const result = await checkSources({
    editionsDir,
    reportsDir,
    out,
    run: NO_WAIT,
    fetcher: (url) => Promise.resolve(page(url, BODY)),
  });
  assert.equal(result.planned, 1);
  assert.deepEqual(
    result.reports.map((report) => report.status),
    ["PASS"],
  );
  assert.match(lines.join("\n"), /1 pass, 0 fail, 0 unchecked/u);
});

test("a quote that is gone fails the run and names the record that cited it", async () => {
  const { editionsDir, reportsDir } = repository();
  const { out, lines } = recorder();
  const result = await checkSources({
    editionsDir,
    reportsDir,
    out,
    run: NO_WAIT,
    fetcher: (url) => Promise.resolve(page(url, OTHER_BODY)),
  });
  assert.deepEqual(
    result.reports.map((report) => report.status),
    ["FAIL"],
  );
  assert.match(lines.join("\n"), /MISSING: "The land bank lists plots offered for rent."/u);
  assert.match(lines.join("\n"), /cited by: 2026\/regions\/xa\/north-isle.json#north-isle-land-bank/u);
});

test("a portal that could not be read is unchecked, and does not fail the run", async () => {
  const { editionsDir, reportsDir } = repository();
  const { out } = recorder();
  const result = await checkSources({
    editionsDir,
    reportsDir,
    out,
    run: NO_WAIT,
    fetcher: (url) => Promise.resolve({ ...page(url, "", 503), document: null }),
  });
  assert.deepEqual(
    result.reports.map((report) => report.status),
    ["UNCHECKED"],
  );
});

test("the full result is written where a person can go through it afterwards", async () => {
  const { editionsDir, reportsDir } = repository();
  const { out } = recorder();
  const result = await checkSources({ editionsDir, reportsDir, out, run: NO_WAIT, fetcher: (url) => Promise.resolve(page(url, BODY)) });
  const written: unknown = JSON.parse(readFileSync(result.reportFile, "utf8"));
  assert.ok(written !== null && typeof written === "object");
  const report = written as { checkedAt: string; totals: { pass: number }; reports: Array<{ url: string }> };
  assert.match(report.checkedAt, /^\d{4}-\d{2}-\d{2}T/u, "a report of a live check is worthless without the day it ran");
  assert.equal(report.totals.pass, 1);
  assert.equal(report.reports[0]?.url, "https://example.test/land-bank");
});

test("the link check asks about every address, including ones carrying no quotes", async () => {
  const data = fakeEdition({
    resources: [
      fakeResource({
        accessUrl: "https://example.test/apply",
        sources: [
          fakeSource({ url: "https://example.test/apply" }),
          fakeSource({ url: "https://example.test/rules", quotes: ["Rules of the register"] }),
        ],
      }),
    ],
  });
  const { editionsDir, reportsDir, territoriesFile } = repository(data);
  const { out } = recorder();
  const result = await checkLinks({
    editionsDir,
    reportsDir,
    territoriesFile,
    out,
    run: NO_WAIT,
    fetcher: (url) => Promise.resolve(page(url, BODY)),
  });
  const urls = result.reports.map((report) => report.url).toSorted();
  assert.deepEqual(urls, [
    "https://example.test/apply",
    "https://example.test/portal",
    "https://example.test/rules",
    "https://example.test/territory",
  ]);
  assert.deepEqual(
    result.reports.flatMap((report) => report.quotes),
    [],
    "reachability says nothing about what a page contains, so no quote is looked for",
  );
});

test("an address that is gone fails the link check", async () => {
  const { editionsDir, reportsDir, territoriesFile } = repository();
  const { out } = recorder();
  const result = await checkLinks({
    editionsDir,
    reportsDir,
    territoriesFile,
    out,
    run: NO_WAIT,
    fetcher: (url) => Promise.resolve(page(url, "", url.endsWith("/land-bank") ? 404 : 200)),
  });
  const gone = result.reports.filter((report) => report.status === "FAIL");
  assert.deepEqual(
    gone.map((report) => report.url),
    ["https://example.test/land-bank"],
  );
});
