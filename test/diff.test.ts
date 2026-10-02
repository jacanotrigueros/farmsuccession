import assert from "node:assert/strict";
import { test } from "node:test";

import { continuityWarnings, diffEditions, renderDiff } from "../src/diff.ts";
import type { LoadedSnapshot } from "../src/editions.ts";
import type { Resource } from "../src/types/edition.ts";
import { fakeEdition, fakeResource, fakeSource } from "./fixtures.ts";

const FILE_2025 = "2025/regions/xa/north-isle.json";
const FILE_2026 = "2026/regions/xa/north-isle.json";

/** One territory in one year, holding the resources given. */
const edition = (file: string, year: string, resources: Resource[]): LoadedSnapshot => ({
  file,
  data: fakeEdition({ edition: year, published: `${year}-09-27`, resources }),
});

const diffOf = (before: Resource[], after: Resource[]) =>
  diffEditions("2025", [edition(FILE_2025, "2025", before)], "2026", [edition(FILE_2026, "2026", after)]);

const messages = (findings: Array<{ file: string; message: string }>): string => findings.map((finding) => finding.message).join(" | ");

test("a record kept with the same id and nothing new to say is not a change", () => {
  const diff = diffOf([fakeResource()], [fakeResource()]);
  assert.deepEqual([diff.added, diff.removed, diff.changed], [[], [], []]);
});

test("what a reader would notice between two editions is listed", () => {
  const before = fakeResource({
    metrics: [
      {
        measure: "BUDGET_TOTAL",
        label: "Budget of the call",
        value: 2000000,
        unit: "EUR",
        asOf: "2025-09-01",
        sourceUrl: "https://example.test/land-bank",
      },
    ],
    calls: [{ name: "2025 call", state: "OPEN", sourceUrl: "https://example.test/land-bank" }],
  });
  const after = fakeResource({
    name: "Land bank and holding register of North Isle",
    status: "ANNOUNCED_NOT_OPERATING",
    metrics: [
      {
        measure: "BUDGET_TOTAL",
        label: "Budget of the call",
        value: 1000000,
        unit: "EUR",
        asOf: "2026-09-01",
        sourceUrl: "https://example.test/land-bank",
      },
    ],
    calls: [{ name: "2026 call", state: "UPCOMING", opens: "2026-11-01", sourceUrl: "https://example.test/land-bank" }],
  });
  const [changed] = diffOf([before], [after]).changed;
  assert.ok(changed);
  assert.deepEqual(changed.changes, [
    "status ACTIVE → ANNOUNCED_NOT_OPERATING",
    'renamed from "Land bank of North Isle"',
    "BUDGET_TOTAL 2000000 → 1000000 EUR",
    'new call "2026 call" (UPCOMING)',
    'call "2025 call" is no longer listed',
  ]);
});

test("a budget that is published again unchanged is not news", () => {
  const metrics: Resource["metrics"] = [
    {
      measure: "BUDGET_TOTAL",
      label: "Budget of the call",
      value: 2000000,
      unit: "EUR",
      asOf: "2026-09-01",
      sourceUrl: "https://example.test/land-bank",
    },
  ];
  assert.deepEqual(diffOf([fakeResource({ metrics })], [fakeResource({ metrics })]).changed, []);
});

test("a record that simply disappears is a warning, because an id outlives the instrument", () => {
  const diff = diffOf([fakeResource(), fakeResource({ id: "north-isle-training", name: "Island training" })], [fakeResource()]);
  assert.deepEqual(
    diff.removed.map((item) => item.id),
    ["north-isle-training"],
  );
  assert.match(
    messages(continuityWarnings(diff)),
    /resource "north-isle-training" is in edition 2025 and not in 2026: keep its id, with status DISCONTINUED or HISTORICAL if it ended/u,
  );
});

test("a record kept as discontinued is exactly what that warning asks for", () => {
  const diff = diffOf([fakeResource()], [fakeResource({ status: "DISCONTINUED" })]);
  assert.deepEqual(continuityWarnings(diff), []);
  assert.deepEqual(diff.changed[0]?.changes, ["status ACTIVE → DISCONTINUED"]);
});

test("the same page coming back under a new id is a warning, not an addition to celebrate", () => {
  const renamed = fakeResource({ id: "north-isle-land-register", name: "Land register of North Isle" });
  const diff = diffOf([fakeResource()], [renamed]);
  assert.deepEqual(diff.renamedIds, [
    { previousId: "north-isle-land-bank", id: "north-isle-land-register", file: FILE_2026, url: "https://example.test/land-bank" },
  ]);
  assert.match(messages(continuityWarnings(diff)), /is reached by the page of "north-isle-land-bank" in 2025/u);
  assert.doesNotMatch(messages(continuityWarnings(diff)), /keep its id, with status DISCONTINUED/u, "it did not disappear; it was renamed");
});

test("two records that share a page are not a rename when both are still there", () => {
  const sharing = fakeResource({ id: "north-isle-advice", name: "Succession advice", sources: [fakeSource()] });
  const diff = diffOf([fakeResource()], [fakeResource(), sharing]);
  assert.deepEqual(diff.renamedIds, [], "the old id is still in the newer edition, so nothing was renamed");
});

test("the report says what it covers, including when nothing happened", () => {
  const text = renderDiff(diffOf([fakeResource()], [fakeResource({ status: "UNKNOWN" })]));
  assert.match(text, /^# Changes from 2025 to 2026$/mu);
  assert.match(text, /^## Added \(0\)\n\nNone\.$/mu);
  assert.match(text, /^## Changed \(1\)\n\n- `north-isle-land-bank` Land bank of North Isle: status ACTIVE → UNKNOWN$/mu);
  assert.match(text, /^## News recorded in 2026 \(0\)$/mu);
});
