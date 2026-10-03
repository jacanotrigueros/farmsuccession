import assert from "node:assert/strict";
import { test } from "node:test";

import { compileDefinition } from "../src/schema.ts";
import type { Call, EditionSnapshot, Metric, NewsItem, Resource } from "../src/types/edition.ts";
import { checkSemantics } from "../src/validate-edition.ts";
import { FAKE_EDITION_FILE, fakeEdition, fakeResource, fakeSource, fakeTerritories } from "./fixtures.ts";

const TODAY = "2026-10-02";
const territories = fakeTerritories();

/** The errors of one file, as one string, so a test asserts on what a researcher would read. */
function errorsOf(data: EditionSnapshot, file = FAKE_EDITION_FILE): string {
  return checkSemantics(file, data, territories, TODAY)
    .errors.map((finding) => finding.message)
    .join(" | ");
}

function warningsOf(data: EditionSnapshot, file = FAKE_EDITION_FILE): string {
  return checkSemantics(file, data, territories, TODAY)
    .warnings.map((finding) => finding.message)
    .join(" | ");
}

/** The fixture with one resource replaced, which is what most rules are about. */
const withResource = (overrides: Partial<Resource>): EditionSnapshot => fakeEdition({ resources: [fakeResource(overrides)] });
const withCall = (call: Partial<Call>): EditionSnapshot =>
  withResource({ calls: [{ name: "2026 call", state: "OPEN", sourceUrl: "https://example.test/land-bank", ...call }] });
const withMetric = (metric: Partial<Metric>): EditionSnapshot =>
  withResource({
    metrics: [
      {
        measure: "BUDGET_TOTAL",
        label: "Budget of the 2026 call",
        value: 1500000,
        unit: "EUR",
        asOf: "2026-09-01",
        sourceUrl: "https://example.test/land-bank",
        ...metric,
      },
    ],
  });

test("a file that agrees with itself reports nothing", () => {
  assert.equal(errorsOf(fakeEdition()), "");
  assert.equal(warningsOf(fakeEdition()), "");
});

test("the fixture every rule here is measured against is a file the schema accepts", () => {
  const schema = compileDefinition("schema/edition.schema.json", "regionalSnapshot");
  assert.deepEqual(schema.errors(fakeEdition()), [], "a semantic rule proved against a file the schema rejects proves nothing");
});

test("a file is about the territory its path, its fields and the catalogue all name", () => {
  assert.match(errorsOf(fakeEdition(), "2025/regions/xa/north-isle.json"), /edition "2026" does not match directory "2025"/u);
  assert.match(errorsOf(fakeEdition({ region: "south-isle" })), /region "south-isle" does not match its location \(north-isle\)/u);
  assert.match(errorsOf(fakeEdition({ country: "XB" }), "2026/regions/xb/north-isle.json"), /"XB" is not a jurisdiction/u);
  assert.match(errorsOf(fakeEdition({ officialName: "Northern Isle" })), /officialName "Northern Isle" must be "North Isle"/u);
  assert.match(errorsOf(fakeEdition({ metadata: { ...fakeEdition().metadata, language: "es" } })), /language "es" must be "en"/u);
});

test("a hub file must be a hub of several regions, and a region file must not name one", () => {
  const hub = { ...fakeEdition(), schemaId: "hub-snapshot", hub: "mainland", region: undefined, officialName: "Mainland" };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a deliberately wrong shape is what this rule exists to reject
  assert.match(errorsOf(hub as unknown as EditionSnapshot, "2026/hubs/xa/mainland.json"), /groups a single region; write its resources/u);
  assert.match(
    errorsOf(fakeEdition({ region: "archipelago", officialName: "Archipelago" }), "2026/regions/xa/archipelago.json"),
    /is not a region of XA; it is a hub, use one of: north-isle, south-isle/u,
  );
});

test("a resource may not be wider or narrower than the file it sits in", () => {
  assert.match(errorsOf(withResource({ scope: { level: "NATIONAL" } })), /scope NATIONAL does not belong in a regional-snapshot/u);
  assert.equal(errorsOf(withResource({ scope: { level: "LOCAL", area: "Port village" } })), "");
});

test("nothing may be dated after the day the file was written, or the day it was read", () => {
  assert.match(errorsOf(fakeEdition({ published: "2026-11-01" })), /published 2026-11-01 is in the future/u);
  assert.match(errorsOf(withResource({ lastEvidenceDate: "2026-11-01" })), /lastEvidenceDate 2026-11-01 is in the future/u);
  assert.match(errorsOf(withMetric({ asOf: "2026-11-01" })), /asOf 2026-11-01 is in the future/u);
  const late = withResource({ sources: [fakeSource({ consultedOn: "2026-09-30" })] });
  assert.match(errorsOf(late), /consultedOn 2026-09-30 is after published 2026-09-27/u);
  const early = withResource({ sources: [fakeSource({ consultedOn: "2025-12-31" })] });
  assert.match(errorsOf(early), /consultedOn 2025-12-31 is before edition 2026/u);
});

const reviewed = (reviewedOn: string): EditionSnapshot =>
  fakeEdition({ review: { status: "REVIEWED", reviewedBy: "A reviewer", reviewedOn } });

test("a review covers the whole file or it is not a review", () => {
  assert.equal(errorsOf(reviewed("2026-09-25")), "", "a review signed after the last consultation covers it");
  assert.match(errorsOf(reviewed("2026-09-19")), /is before the last consultation \(2026-09-20\)/u);
  assert.match(errorsOf(reviewed("2026-09-28")), /is after published 2026-09-27/u);
});

test("what the file says it searched has to match what it carries", () => {
  const coverage = fakeEdition().coverage;
  assert.match(
    errorsOf(fakeEdition({ coverage: { ...coverage, status: "NOT_STARTED" } })),
    /NOT_STARTED cannot carry resources or news.*NOT_STARTED cannot list discovery methods/su,
  );
  assert.equal(errorsOf(fakeEdition({ coverage: { ...coverage, status: "NOT_STARTED", methods: [] }, resources: [], news: [] })), "");
  assert.match(errorsOf(fakeEdition({ coverage: { ...coverage, methods: [] } })), /PARTIAL requires at least one discovery method/u);
});

test("an identifier is used once in a file", () => {
  assert.match(errorsOf(fakeEdition({ resources: [fakeResource(), fakeResource()] })), /resource "north-isle-land-bank": duplicate id/u);
});

test("every page a resource leans on is one of its own sources", () => {
  assert.match(errorsOf(withResource({ accessUrl: "https://example.test/elsewhere" })), /accessUrl must be one of its sources/u);
  assert.match(
    errorsOf(withResource({ sources: [fakeSource(), fakeSource()] })),
    /source https:\/\/example.test\/land-bank is listed twice/u,
  );
  assert.match(
    errorsOf(withMetric({ sourceUrl: "https://example.test/elsewhere" })),
    /cites https:\/\/example.test\/elsewhere, which is not/u,
  );
  assert.match(
    errorsOf(withCall({ sourceUrl: "https://example.test/elsewhere" })),
    /cites https:\/\/example.test\/elsewhere, which is not/u,
  );
});

test("a contact detail is published by the source that is cited for it", () => {
  const contact = {
    channel: "PHONE",
    label: "Land office",
    value: "+34 900 000 000",
    sourceUrl: "https://example.test/land-bank",
  } as const;
  assert.match(errorsOf(withResource({ contactPoints: [contact] })), /value is not present in the cited source quotes/u);
  const quoted = withResource({
    contactPoints: [contact],
    sources: [fakeSource({ quotes: ["Call the land office on +34 900 000 000."] })],
  });
  assert.equal(errorsOf(quoted), "", "a quote that carries the number is what makes it citable");
  const form = withResource({
    contactPoints: [
      { channel: "FORM", label: "Request form", value: "https://example.test/land-bank", sourceUrl: "https://example.test/land-bank" },
    ],
  });
  assert.equal(errorsOf(form), "", "a form is published by being the page itself, so no quote can show it");
});

test("a record describes itself with its own evidence, not with the file's", () => {
  assert.match(
    errorsOf(withResource({ whoCanUseIt: "Applicants may apply for the 25.000 euro payment." })),
    /whoCanUseIt states 25\.000 euro, which no quote, metric, date or URL of the resource supports/u,
  );
  // The other record of the same file carries the figure; this one still may not borrow it, because a
  // paraphrase that needs another record's evidence is a paraphrase about another instrument.
  const two = fakeEdition({
    resources: [
      fakeResource({ whoCanUseIt: "Applicants may apply for the 25.000 euro payment." }),
      fakeResource({
        id: "north-isle-establishment-aid",
        name: "Establishment aid of North Isle",
        kind: "FINANCIAL_SUPPORT",
        accessUrl: "https://example.test/north-aid",
        sources: [fakeSource({ url: "https://example.test/north-aid", quotes: ["The payment is 25.000 euros."] })],
      }),
    ],
  });
  assert.match(errorsOf(two), /whoCanUseIt states 25\.000 euro/u);
});

test("a measure keeps its unit, so the same figure compares across territories", () => {
  assert.match(errorsOf(withMetric({ unit: "HECTARES" })), /is in HECTARES; use EUR/u);
  assert.equal(errorsOf(withMetric({ measure: "LAND_AREA", unit: "HECTARES", label: "Area offered" })), "");
  assert.match(errorsOf(withMetric({ measure: "LAND_AREA", unit: "PARCELS", label: "Area offered" })), /is in PARCELS; use HECTARES/u);
  const other = withMetric({ measure: "OTHER", unit: "PEOPLE", label: "Something no listed measure describes" });
  assert.equal(errorsOf(other), "", "OTHER takes any unit, which is the price of having an escape hatch");
  assert.match(warningsOf(other), /uses OTHER; check whether/u);
});

test("a call's state is what its source showed on the day it was read", () => {
  assert.equal(errorsOf(withCall({ opens: "2026-09-01", closes: "2026-09-25" })), "", "open on the consultation date");
  assert.match(errorsOf(withCall({ opens: "2026-09-25", closes: "2026-09-01" })), /closes before it opens/u);
  assert.match(errorsOf(withCall({ opens: "2026-09-25" })), /OPEN but opens on 2026-09-25, after the consultation \(2026-09-20\)/u);
  assert.match(errorsOf(withCall({ closes: "2026-09-10" })), /OPEN but closed on 2026-09-10, before the consultation/u);
  assert.match(errorsOf(withCall({ state: "UPCOMING" })), /UPCOMING and needs its opening date/u);
  assert.match(errorsOf(withCall({ state: "UPCOMING", opens: "2026-09-10" })), /UPCOMING but opened on 2026-09-10/u);
  assert.equal(errorsOf(withCall({ state: "UPCOMING", opens: "2026-09-25" })), "");
  assert.match(errorsOf(withCall({ state: "NOT_PUBLISHED", closes: "2026-09-25" })), /NOT_PUBLISHED but carries dates/u);
  assert.match(errorsOf(withCall({ state: "CLOSED", opens: "2026-09-25" })), /CLOSED but opens on 2026-09-25/u);
});

test("an OPEN call cannot sit on a resource that is not operating", () => {
  const unknown = fakeEdition({
    resources: [
      fakeResource({ status: "UNKNOWN", calls: [{ name: "2026 call", state: "OPEN", sourceUrl: "https://example.test/land-bank" }] }),
    ],
  });
  assert.match(errorsOf(unknown), /is OPEN, which requires status ACTIVE/u);
});

test("a call that closed before its published deadline is asked about, not rejected", () => {
  assert.match(
    warningsOf(withCall({ state: "CLOSED", closes: "2026-09-25" })),
    /CLOSED although it closes on 2026-09-25.*confirm the page says it closed early/u,
  );
  assert.equal(errorsOf(withCall({ state: "CLOSED", closes: "2026-09-25" })), "");
});

test("the date a page shows is not the date it was read", () => {
  assert.match(warningsOf(withResource({ lastEvidenceDate: "2026-09-20" })), /equals a consultation or publication date/u);
  assert.match(warningsOf(withResource({ lastEvidenceDate: "2026-09-27" })), /equals a consultation or publication date/u);
  assert.equal(warningsOf(withResource({ lastEvidenceDate: "2026-09-15" })), "");
});

test("a resource called ACTIVE whose page has shown nothing for years is asked about", () => {
  assert.match(warningsOf(withResource({ lastEvidenceDate: "2024-09-26" })), /ACTIVE, but the latest date its page shows is 2024-09-26/u);
  assert.equal(warningsOf(withResource({ lastEvidenceDate: "2024-09-28" })), "", "two years is the line");
  assert.equal(
    warningsOf(withResource({ status: "HISTORICAL", lastEvidenceDate: "2024-09-26" })),
    "",
    "a historical record is meant to be old",
  );
});

test("a repeated quote in one source is worth a look", () => {
  const repeated = withResource({ sources: [fakeSource({ quotes: ["The same line", "The same line"] })] });
  assert.match(warningsOf(repeated), /repeats a quote/u);
});

test("the news of an edition is the news of its year, up to the day it was published", () => {
  const item: NewsItem = {
    id: "land-bank-opened",
    date: "2026-05-04",
    type: "LAUNCH",
    headline: "The land bank starts taking offers",
    summary: "The regional government opened the land bank to offers of land.",
    sources: [fakeSource({ consultedOn: "2026-09-20" })],
  };
  assert.equal(errorsOf(fakeEdition({ news: [item] })), "");
  assert.match(errorsOf(fakeEdition({ news: [{ ...item, date: "2025-05-04" }] })), /date 2025-05-04 is outside edition 2026/u);
  assert.match(errorsOf(fakeEdition({ news: [{ ...item, date: "2026-09-30" }] })), /date 2026-09-30 is after published 2026-09-27/u);
  assert.match(errorsOf(fakeEdition({ news: [item, item] })), /news "land-bank-opened": duplicate id/u);
});
