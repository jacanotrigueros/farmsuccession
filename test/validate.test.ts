import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import type { EditionSnapshot, NewsItem, RegionalSnapshot } from "../src/types/edition.ts";
import { checkEdition } from "../src/validate-edition.ts";
import { validateEditions } from "../src/validate.ts";
import {
  FAKE_COUNTRY_FILE,
  FAKE_EDITION_FILE,
  fakeCountryEdition,
  fakeEdition,
  fakeResource,
  fakeSource,
  fakeTerritories,
} from "./fixtures.ts";

const territories = fakeTerritories();
const SOUTH_ISLE_FILE = "2026/regions/xa/south-isle.json";

/** The other region of the same hub, which inherits nothing from North Isle and is inherited by nobody. */
const southIsle = (overrides: Partial<RegionalSnapshot> = {}): EditionSnapshot =>
  fakeEdition({
    region: "south-isle",
    officialName: "South Isle",
    summary: "What South Isle documents for people taking over or starting a holding.",
    resources: [
      fakeResource({
        id: "south-isle-land-bank",
        name: "Land bank of South Isle",
        accessUrl: "https://example.test/south-land-bank",
        sources: [fakeSource({ url: "https://example.test/south-land-bank" })],
      }),
    ],
    ...overrides,
  });

const edition = (...files: Array<[string, EditionSnapshot]>): Array<{ file: string; data: EditionSnapshot }> =>
  files.map(([file, data]) => ({ file, data }));

const messages = (findings: Array<{ file: string; message: string }>): string => findings.map((finding) => finding.message).join(" | ");

const news = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  id: "land-bank-opened",
  date: "2026-05-04",
  type: "LAUNCH",
  headline: "The land bank starts taking offers",
  summary: "The government opened the land bank to offers of land.",
  sources: [fakeSource({ consultedOn: "2026-09-20" })],
  ...overrides,
});

test("an identifier is used once in an edition, not once per file", () => {
  const twice = edition([FAKE_EDITION_FILE, fakeEdition()], [SOUTH_ISLE_FILE, southIsle({ resources: fakeEdition().resources })]);
  assert.match(messages(checkEdition(twice, territories).errors), /resource id "north-isle-land-bank" is already used in 2026\/regions/u);
  const sharedNews = edition([FAKE_EDITION_FILE, fakeEdition({ news: [news()] })], [SOUTH_ISLE_FILE, southIsle({ news: [news()] })]);
  assert.match(messages(checkEdition(sharedNews, territories).errors), /news id "land-bank-opened" is already used in/u);
});

/** The whole edition, with one news item of North Isle linking the resource `id`. */
const linked = (id: string): Array<{ file: string; data: EditionSnapshot }> =>
  edition(
    [FAKE_COUNTRY_FILE, fakeCountryEdition()],
    [SOUTH_ISLE_FILE, southIsle()],
    [FAKE_EDITION_FILE, fakeEdition({ news: [news({ resourceIds: [id] })] })],
  );

test("news may link only what a reader of that file can see", () => {
  assert.equal(messages(checkEdition(linked("north-isle-land-bank"), territories).errors), "", "its own resource");
  assert.equal(messages(checkEdition(linked("terra-nostra-establishment-aid"), territories).errors), "", "a resource of the country above");
  assert.match(
    messages(checkEdition(linked("south-isle-land-bank"), territories).errors),
    /links resource "south-isle-land-bank", which is not in this file or a higher layer/u,
    "a reader of North Isle never sees South Isle, so the link would go nowhere",
  );
});

test("a file may describe a figure of a layer it inherits, and only of a layer it inherits", () => {
  // The country's aid, quoted in the country's file. A region may not copy that fact into its own file,
  // so checking its summary against its own file alone would leave it nothing true to say.
  const aid = fakeCountryEdition({
    resources: [
      fakeResource({
        id: "terra-nostra-establishment-aid",
        name: "Establishment aid",
        kind: "FINANCIAL_SUPPORT",
        scope: { level: "NATIONAL" },
        accessUrl: "https://example.test/establishment-aid",
        sources: [fakeSource({ url: "https://example.test/establishment-aid", quotes: ["The base payment is 25.000 euros."] })],
      }),
    ],
  });
  const summary = "North Isle inherits the national establishment aid, whose base payment is 25.000 euros.";
  const inheriting = edition([FAKE_COUNTRY_FILE, aid], [FAKE_EDITION_FILE, fakeEdition({ summary })]);
  assert.equal(messages(checkEdition(inheriting, territories).errors), "", "a region reads what it inherits");

  const alone = edition([FAKE_EDITION_FILE, fakeEdition({ summary })]);
  assert.match(
    messages(checkEdition(alone, territories).errors),
    /summary states 25\.000 euros, which no quote, metric, date or URL of this file or of a layer it inherits supports/u,
    "without the country file the figure has no evidence anywhere a reader of this file can see",
  );

  const fromSibling = edition([SOUTH_ISLE_FILE, southIsle({ resources: aid.resources })], [FAKE_EDITION_FILE, fakeEdition({ summary })]);
  assert.match(
    messages(checkEdition(fromSibling, territories).errors),
    /summary states 25\.000 euros/u,
    "a sibling region is a different territory, so its evidence proves nothing here",
  );
});

test("the same access page in two files is listed for review, never failed", () => {
  const sharedWithCountry = edition(
    [FAKE_COUNTRY_FILE, fakeCountryEdition()],
    [
      FAKE_EDITION_FILE,
      fakeEdition({
        resources: [
          fakeResource({
            accessUrl: "https://example.test/establishment-aid",
            sources: [fakeSource({ url: "https://example.test/establishment-aid" })],
          }),
        ],
      }),
    ],
  );
  const report = checkEdition(sharedWithCountry, territories);
  assert.equal(messages(report.errors), "", "two instruments can share one page, which only a person can judge");
  assert.match(
    messages(report.reviews),
    /shares its access page https:\/\/example.test\/establishment-aid with "terra-nostra-establishment-aid"/u,
  );

  const siblings = edition(
    [FAKE_EDITION_FILE, fakeEdition()],
    [SOUTH_ISLE_FILE, southIsle({ resources: [fakeResource({ id: "south-isle-land-bank" })] })],
  );
  assert.match(messages(checkEdition(siblings, territories).reviews), /shares its access page .* with "north-isle-land-bank"/u);
});

test("prose that names an identifier a reader cannot use is an error", () => {
  const named = fakeEdition({
    summary: "The resource north-isle-land-bank is described in data/editions/2026/regions/xa/north-isle.json.",
  });
  assert.match(
    messages(checkEdition(edition([FAKE_EDITION_FILE, named]), territories).errors),
    /shows readers the internal reference/u,
    "a reader sees names and pages, never an id or where the data is filed",
  );
});

/** Writes a catalogue and some edition files to a temporary tree, the way the command finds them. */
/**
 * A repository of its own for one test, every directory of it: naming only the editions would leave the
 * research briefs defaulting to the real `research/`, so the test would quietly judge the project's own
 * data and pass or fail on what the repository happens to hold that day.
 */
function repository(files: Array<[string, EditionSnapshot]>): { editionsDir: string; researchDir: string; territoriesFile: string } {
  const root = mkdtempSync(path.join(tmpdir(), "farmsuccession-validate-"));
  const territoriesFile = path.join(root, "territories.json");
  writeFileSync(territoriesFile, JSON.stringify(fakeTerritories()));
  const editionsDir = path.join(root, "editions");
  const researchDir = path.join(root, "research");
  mkdirSync(researchDir, { recursive: true });
  for (const [file, data] of files) {
    const target = path.join(editionsDir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, JSON.stringify(data));
  }
  return { editionsDir, researchDir, territoriesFile };
}

test("the gate reports how many files it checked, so a run over nothing is not a clean run", () => {
  const { editionsDir, researchDir, territoriesFile } = repository([
    [FAKE_COUNTRY_FILE, fakeCountryEdition()],
    [FAKE_EDITION_FILE, fakeEdition()],
  ]);
  const result = validateEditions({ editionsDir, researchDir, territoriesFile, today: "2026-10-02" });
  assert.equal(result.files, 2);
  assert.deepEqual(result.errors, [], messages(result.errors));
  assert.deepEqual(result.warnings, []);
});

test("the gate reports a file the layout does not define instead of ignoring it", () => {
  const { editionsDir, researchDir, territoriesFile } = repository([["2026/notes.json", fakeEdition()]]);
  const result = validateEditions({ editionsDir, researchDir, territoriesFile, today: "2026-10-02" });
  assert.equal(result.files, 1);
  assert.match(messages(result.errors), /is not in a place the edition layout defines/u);
});

test("the gate finds the damage the parser hides before reading anything as data", () => {
  const { editionsDir, researchDir, territoriesFile } = repository([[FAKE_EDITION_FILE, fakeEdition()]]);
  // A second "summary" key: JSON.parse keeps the last and the first is lost, with nothing failing.
  const damaged = JSON.stringify(fakeEdition()).replace(/^\{/u, '{"summary": "The text somebody actually wrote.",');
  writeFileSync(path.join(editionsDir, FAKE_EDITION_FILE), damaged);
  const result = validateEditions({ editionsDir, researchDir, territoriesFile, today: "2026-10-02" });
  assert.match(messages(result.errors), /\[duplicate-key\].*key "summary" is repeated/u);
});

test("the gate runs the rules of one file and of the whole edition together", () => {
  const { editionsDir, researchDir, territoriesFile } = repository([
    [FAKE_EDITION_FILE, fakeEdition({ officialName: "Northern Isle" })],
    [SOUTH_ISLE_FILE, southIsle({ resources: fakeEdition().resources })],
  ]);
  const result = validateEditions({ editionsDir, researchDir, territoriesFile, today: "2026-10-02" });
  assert.match(messages(result.errors), /officialName "Northern Isle" must be "North Isle"/u, "a rule about one file");
  assert.match(messages(result.errors), /is already used in/u, "and a rule about the edition");
});
