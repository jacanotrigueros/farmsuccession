import assert from "node:assert/strict";
import { test } from "node:test";

import { renderReport } from "../scripts/report.ts";
import { FAKE_BRIEF_FILE, FAKE_COUNTRY_BRIEF_FILE, FAKE_COUNTRY_FILE, FAKE_EDITION_FILE } from "./fixtures.ts";
import { fakeBrief, fakeCountryBrief, fakeCountryEdition, fakeEdition, fakeLead } from "./fixtures.ts";

const edition = (data = fakeEdition()) => [{ file: FAKE_EDITION_FILE, data }];
const briefs = (brief = fakeBrief()) => [
  { file: FAKE_BRIEF_FILE, brief },
  { file: FAKE_COUNTRY_BRIEF_FILE, brief: fakeCountryBrief() },
];

test("the report says what was looked for and not found, with the reason", () => {
  const brief = fakeBrief({
    instrumentChecks: [
      {
        expectedId: "regional-land-bank",
        status: "NOT_FOUND",
        reason: "The island portal lists plots of the national bank only, which is not a bank of its own",
        checkedOn: "2026-09-27",
      },
    ],
  });
  const text = renderReport("2026", edition(), briefs(brief));
  assert.match(
    text,
    /A regional land bank — \*\*looked for, not found\*\*: The island portal lists plots of the national bank only, which is not a bank of its own\./u,
  );
  assert.match(text, /- \*\*A regional land bank\*\* — 0 found, 1 looked for and not found, of 1 territory that answered/u);
});

test("a lead left out keeps its reason, because the rejections are what a second pass needs", () => {
  const brief = fakeBrief({
    leads: [fakeLead({ id: "island-market", name: "Island farmers' market", status: "REJECTED", reason: "A market, not access to land" })],
  });
  const text = renderReport("2026", edition(), briefs(brief));
  assert.match(text, /Considered and left out — 1 lead:/u);
  assert.match(text, /- Island farmers' market — A market, not access to land\./u);
});

test("a territory with no brief is reported as having none, not as having nothing to say", () => {
  const text = renderReport("2026", edition(), []);
  assert.match(text, /_No research brief, so how this territory was searched is not recorded\._/u);
});

test("a file that publishes nothing says so, because an empty territory is a finding", () => {
  const text = renderReport("2026", edition(fakeEdition({ resources: [], news: [] })), briefs());
  assert.match(text, /Publishes nothing, which is a finding rather than a gap/u);
});

test("higher layers come first, so a reader meets a territory after what it inherits", () => {
  const text = renderReport(
    "2026",
    [
      { file: FAKE_EDITION_FILE, data: fakeEdition() },
      { file: FAKE_COUNTRY_FILE, data: fakeCountryEdition() },
    ],
    briefs(),
  );
  assert.ok(text.indexOf("### Terra Nostra") < text.indexOf("### North Isle"), "the country is described before its region");
});
