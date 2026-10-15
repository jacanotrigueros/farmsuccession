import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { liveSummary, replaceSummary, START, END } from "../scripts/live-checks-summary.ts";
import { citedByTerritory } from "../scripts/report-sources.ts";
import { ROOT } from "../src/paths.ts";
import { readRuns, type LedgerRun } from "../src/sources/ledger.ts";

test("the freshness paragraph is the committed ledger, not a hand-maintained count", () => {
  const document = readFileSync(path.join(ROOT, "research", "live-checks.md"), "utf8");
  const paragraph = liveSummary(readRuns(), citedByTerritory());
  assert.ok(
    document.includes(START) && document.includes(END),
    "the current ledger paragraph needs generated boundaries; run node scripts/live-checks-summary.ts --write after adding them",
  );
  const recorded = document
    .slice(document.indexOf(START) + START.length, document.indexOf(END))
    .replace(/\s+/gu, " ")
    .trim();
  assert.equal(
    recorded,
    paragraph,
    "the freshness paragraph is stale: run node scripts/live-checks-summary.ts --write; a committed run must not leave a claim about a different series",
  );
});

const run = (day: string): LedgerRun => ({
  checkedAt: `${day}T12:00:00Z`,
  edition: "2026",
  scope: "eu",
  totals: { pass: 1, fail: 0, unchecked: 1 },
  results: [
    { url: "https://example.org/retired", status: "PASS", httpStatus: 200 },
    { url: "https://example.org/current", status: "UNCHECKED", httpStatus: null, territories: ["eu"] },
  ],
});

test("a summary separates all observed URLs, current citations and unchecked outcomes", () => {
  const summary = liveSummary(
    [run("2026-01-01"), run("2026-01-02")],
    [
      { territory: "eu", urls: ["https://example.org/current"] },
      { territory: "es", urls: [] },
    ],
  );
  assert.match(summary, /2 runs on 2 UTC days/u, "runs and calendar days count different things");
  assert.match(
    summary,
    /observing 2 distinct URLs: 1 HEALTHY, 0 FLAKY, 1 UNREACHABLE/u,
    "history must retain retired URLs without pretending they are current work",
  );
  assert.match(summary, /1 are still cited/u, "the current corpus must be distinguished from the ledger's history");
  assert.match(summary, /1 no longer cited URLs/u, "retired evidence must not disappear from the account of the series");
  assert.match(summary, /Checked includes UNCHECKED outcomes/u, "a network failure is a check, not proof a page was read");
  assert.throws(() => liveSummary([], []), /no ledger runs/u, "an empty history must not masquerade as freshness");
});

test("regeneration replaces only one marked paragraph", () => {
  const document = `Before\n${START}\nold\n${END}\nAfter`;
  assert.equal(
    replaceSummary(document, "new"),
    `Before\n${START}\n\nnew\n\n${END}\nAfter`,
    "regeneration must preserve the historical readings around the current summary",
  );
  assert.throws(
    () => replaceSummary("unmarked", "new"),
    /exactly one ordered/u,
    "missing boundaries must fail instead of overwriting history",
  );
});
