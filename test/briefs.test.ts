import assert from "node:assert/strict";
import { test } from "node:test";

import { briefPathFor, checkBrief, instrumentCoverageProblems, layerFromBriefPath } from "../src/briefs.ts";
import { compileSchema } from "../src/schema.ts";
import type { LoadedSnapshot } from "../src/editions.ts";
import type { Layer } from "../src/layers.ts";
import type { ResearchBrief } from "../src/types/research-brief.ts";
import {
  FAKE_BRIEF_FILE,
  FAKE_COUNTRY_FILE,
  fakeBrief,
  fakeCountryBrief,
  fakeCountryEdition,
  fakeLead,
  fakeQuery,
  FAKE_EDITION_FILE,
  fakeEdition,
  fakeResource,
  fakeTerritories,
} from "./fixtures.ts";

const TODAY = "2026-10-02";
const territories = fakeTerritories();
const editions: LoadedSnapshot[] = [
  { file: FAKE_COUNTRY_FILE, data: fakeCountryEdition() },
  { file: FAKE_EDITION_FILE, data: fakeEdition() },
];

/** The problems of one brief, as one string, so a test asserts on what a researcher would read. */
const problems = (brief: ResearchBrief, file = FAKE_BRIEF_FILE, snapshots = editions): string =>
  checkBrief(file, brief, territories, snapshots, TODAY).join(" | ");

test("the fixture every rule here is measured against is a brief the schema accepts", () => {
  const schema = compileSchema("schema/research-brief.schema.json");
  assert.deepEqual(schema.errors(fakeBrief()), [], "a rule proved against a brief the schema rejects proves nothing");
  assert.deepEqual(schema.errors(fakeCountryBrief()), []);
});

test("a brief that agrees with its edition file reports nothing", () => {
  assert.equal(problems(fakeBrief()), "");
});

test("a brief's path, its territory and the catalogue name the same place", () => {
  assert.deepEqual(layerFromBriefPath("eu.json"), { level: "EU" });
  assert.deepEqual(layerFromBriefPath("xa/country.json"), { level: "COUNTRY", country: "XA" });
  assert.deepEqual(layerFromBriefPath("xa/hubs/archipelago.json"), { level: "HUB", country: "XA", hub: "archipelago" });
  assert.deepEqual(layerFromBriefPath("xa/north-isle.json"), { level: "REGION", country: "XA", region: "north-isle" });
  for (const stray of ["north-isle.json", "xa/regions/north-isle.json", "XA/north-isle.json", "xa/north-isle.txt"]) {
    assert.equal(layerFromBriefPath(stray), null, `"${stray}" is not a brief and must not pass as one`);
  }
});

test("every layer's brief has one place to live, and it is the one its path reads back as", () => {
  const layers: Layer[] = [
    { level: "EU" },
    { level: "COUNTRY", country: "XA" },
    { level: "HUB", country: "XA", hub: "archipelago" },
    { level: "REGION", country: "XA", region: "north-isle" },
  ];
  for (const layer of layers) assert.deepEqual(layerFromBriefPath(briefPathFor(layer)), layer);
});

test("a brief filed in the wrong place is reported, not read as the territory it sits in", () => {
  assert.match(problems(fakeBrief(), "xa/south-isle.json"), /does not match its location/u);
  assert.match(problems(fakeBrief(), "notes.json"), /path is not eu.json/u);
});

test("the territory of a brief has to exist in the catalogue, at the level it claims", () => {
  assert.match(problems(fakeBrief({ territory: { level: "REGION", country: "XA", region: "nowhere" } })), /is not a region of XA/u);
  assert.match(problems(fakeBrief({ territory: { level: "HUB", country: "XA", hub: "nowhere" } })), /is not a hub of XA/u);
  assert.match(
    problems(fakeBrief({ territory: { level: "HUB", country: "XA", hub: "mainland" } }), "xa/hubs/mainland.json"),
    /groups a single region; use the brief of "mainland"/u,
    "a hub of one region is that region, and two briefs for one territory is two memories of it",
  );
  assert.match(problems(fakeBrief({ language: "es" })), /language "es" must be "en" for this territory/u);
});

test("nothing in a brief is dated after the day it was written", () => {
  assert.match(problems(fakeBrief({ updatedOn: "2026-11-01" })), /updatedOn 2026-11-01 is in the future/u);
  assert.match(problems(fakeBrief({ leads: [fakeLead({ checkedOn: "2026-11-01" })] })), /checkedOn 2026-11-01 is in the future/u);
});

test("an identifier is used once in a brief", () => {
  assert.match(problems(fakeBrief({ leads: [fakeLead(), fakeLead()] })), /duplicate lead id "island-land-bank"/u);
  assert.match(problems(fakeBrief({ queries: [fakeQuery(), fakeQuery()] })), /duplicate query id "land-bank"/u);
});

test("only a country brief writes a query with a region to fill in", () => {
  const withPlaceholder = fakeBrief({ queries: [fakeQuery({ query: "{region} land bank" })] });
  assert.match(problems(withPlaceholder), /only a country brief may use \{region\}/u);
  assert.equal(problems(fakeCountryBrief(), "xa/country.json"), "", "the country brief is where one query covers every region");
});

test("a lead admitted as a resource names one a reader of this territory can see", () => {
  const sibling = fakeBrief({ leads: [fakeLead({ resourceId: "south-isle-land-bank" })] });
  assert.match(
    problems(sibling),
    /is ADMITTED as "south-isle-land-bank", which is no resource of this territory or of a territory it inherits from/u,
    "a reader of North Isle never sees South Isle, so the id means a different instrument",
  );
  const inherited = fakeBrief({
    leads: [fakeLead({ resourceId: "terra-nostra-establishment-aid" })],
    territory: { level: "COUNTRY", country: "XA" },
  });
  assert.doesNotMatch(problems(inherited, "xa/country.json"), /is ADMITTED as/u, "a country brief may admit its own national resource");
});

test("every published resource came in through a lead the brief admitted", () => {
  const extra = {
    file: FAKE_EDITION_FILE,
    data: fakeEdition({ resources: [fakeResource(), fakeResource({ id: "north-isle-training", name: "Island training course" })] }),
  };
  assert.match(
    problems(fakeBrief(), FAKE_BRIEF_FILE, [extra]),
    /resource "north-isle-training" has no ADMITTED lead in this brief; record how it was found/u,
    "a resource nobody can trace is a resource nobody can re-verify",
  );
});

/** A region brief answering the one instrument its country expects, as found. */
const checked = (extra: Record<string, unknown>): ResearchBrief =>
  fakeBrief({ instrumentChecks: [{ expectedId: "regional-land-bank", status: "FOUND", checkedOn: "2026-09-20", ...extra }] });

test("an instrument check answers once and points at a lead that was admitted", () => {
  assert.equal(problems(checked({ leadId: "island-land-bank" })), "", "found, as the lead that became the resource");
  assert.match(problems(checked({ leadId: "nobody" })), /is FOUND as lead "nobody", which is not an ADMITTED lead of this brief/u);
  assert.match(problems(checked({ checkedOn: "2026-11-01" })), /checkedOn 2026-11-01 is in the future/u);
  const twice = fakeBrief({
    instrumentChecks: [
      { expectedId: "regional-land-bank", status: "FOUND", checkedOn: "2026-09-20", leadId: "island-land-bank" },
      { expectedId: "regional-land-bank", status: "NOT_FOUND", checkedOn: "2026-09-21", reason: "Looked again and found nothing." },
    ],
  });
  assert.match(problems(twice), /instrument check "regional-land-bank" is answered twice/u);
});

test("a country brief lists each expected instrument once", () => {
  const instrument = fakeCountryBrief().expectedInstruments?.[0];
  assert.ok(instrument);
  const twice = fakeCountryBrief({ expectedInstruments: [instrument, instrument] });
  assert.match(problems(twice, "xa/country.json"), /duplicate expected instrument id "regional-land-bank"/u);
});

test("closing a region's pass requires an answer for every instrument its country expects", () => {
  const country = fakeCountryBrief();
  const unanswered = instrumentCoverageProblems(fakeBrief(), country);
  assert.equal(unanswered.length, 1);
  assert.match(
    unanswered.join(" | "),
    /expected instrument "regional-land-bank" \(A regional land bank\) has no instrumentChecks answer/u,
    "an unanswered instrument is work in progress for the gate to stop, not a broken brief",
  );
  assert.equal(problems(fakeBrief()), "", "which is why the brief itself is still valid");
  const answered = fakeBrief({
    instrumentChecks: [{ expectedId: "regional-land-bank", status: "FOUND", checkedOn: "2026-09-20", leadId: "island-land-bank" }],
  });
  assert.deepEqual(instrumentCoverageProblems(answered, country), []);
  const invented = fakeBrief({
    instrumentChecks: [{ expectedId: "regional-dragon-register", status: "NOT_FOUND", checkedOn: "2026-09-20", reason: "There is none." }],
  });
  assert.match(
    instrumentCoverageProblems(invented, country).join(" | "),
    /instrument check "regional-dragon-register" matches no expectedInstruments id of the country brief/u,
  );
});
