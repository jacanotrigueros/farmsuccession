import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { checkTerritory } from "../src/check-territory.ts";
import { normalizeHtml } from "../src/sources/document.ts";
import type { FetchedPage } from "../src/sources/fetch.ts";
import type { EditionSnapshot } from "../src/types/edition.ts";
import type { ResearchBrief } from "../src/types/research-brief.ts";
import {
  FAKE_BRIEF_FILE,
  FAKE_COUNTRY_BRIEF_FILE,
  FAKE_COUNTRY_FILE,
  FAKE_EDITION_FILE,
  fakeBrief,
  fakeCountryBrief,
  fakeCountryEdition,
  fakeEdition,
  fakeResource,
  fakeTerritories,
} from "./fixtures.ts";

const TODAY = "2026-10-02";
const NO_WAIT = { perHostDelayMs: 0, sleep: (): Promise<void> => Promise.resolve() };
const QUOTE = "The land bank lists plots offered for rent.";
/** Long enough that a quote which is genuinely gone is reported as gone. */
const BODY = `${QUOTE} Owners register the land they are not working and people looking for land apply through the same form, which the office answers in order of arrival and publishes each quarter.`;
/** The same page after it was rewritten: as much text as before, and no longer carrying the quote. */
const REWRITTEN =
  "This page is about the opening hours of the regional office now, how to reach it by bus, and which forms can be handed in there without an appointment. Nothing on it concerns land any more, and the register has moved.";

const answers =
  (text: string) =>
  (url: string): Promise<FetchedPage> =>
    Promise.resolve({
      httpStatus: 200,
      finalUrl: url,
      contentType: "text/html",
      document: normalizeHtml(`<title>A page</title><p>${text}</p>`),
      error: null,
      elapsedMs: 4,
    });

/** One file where the commands look for it, creating the directories on the way. */
function write(dir: string, file: string, content: unknown): void {
  const target = path.join(dir, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(content));
}

/** A repository holding one country and one region, with their briefs, as the gate expects to find them. */
function repository(overrides: { edition?: EditionSnapshot; brief?: ResearchBrief; countryBrief?: ResearchBrief } = {}): {
  editionsDir: string;
  researchDir: string;
  territoriesFile: string;
  reportsDir: string;
} {
  const root = mkdtempSync(path.join(tmpdir(), "farmsuccession-territory-"));
  const editionsDir = path.join(root, "editions");
  const researchDir = path.join(root, "research");
  const territoriesFile = path.join(root, "territories.json");
  writeFileSync(territoriesFile, JSON.stringify(fakeTerritories()));
  write(editionsDir, FAKE_COUNTRY_FILE, fakeCountryEdition());
  write(editionsDir, FAKE_EDITION_FILE, overrides.edition ?? fakeEdition());
  write(researchDir, FAKE_COUNTRY_BRIEF_FILE, overrides.countryBrief ?? fakeCountryBrief());
  write(researchDir, FAKE_BRIEF_FILE, overrides.brief ?? fakeBrief());
  return { editionsDir, researchDir, territoriesFile, reportsDir: path.join(root, "reports") };
}

const answered = fakeBrief({
  instrumentChecks: [{ expectedId: "regional-land-bank", status: "FOUND", checkedOn: "2026-09-20", leadId: "island-land-bank" }],
});

/** Runs the gate over one territory of a temporary repository. */
const gate = async (
  dirs: ReturnType<typeof repository>,
  options: { territory?: string; text?: string } = {},
): Promise<{ passed: boolean; problems: string[]; reviews: string[]; lines: string[] }> => {
  const lines: string[] = [];
  const result = await checkTerritory({
    edition: "2026",
    territory: options.territory ?? "xa/north-isle",
    ...dirs,
    today: TODAY,
    fetcher: answers(options.text ?? BODY),
    run: NO_WAIT,
    out: { log: (line) => void lines.push(line), error: (line) => void lines.push(`error: ${line}`) },
  });
  return { ...result, lines };
};

test("a territory whose file, brief and pages all agree passes", async () => {
  const result = await gate(repository({ brief: answered }));
  assert.deepEqual(result.problems, []);
  assert.equal(result.passed, true);
  assert.match(result.lines.join("\n"), /check:territory passed for xa\/north-isle/u);
});

test("an instrument the country brief expects and the region never answered fails the pass", async () => {
  const result = await gate(repository());
  assert.match(result.problems.join(" | "), /expected instrument "regional-land-bank" .* has no instrumentChecks answer/u);
  assert.equal(result.passed, false, "a pass that skips an instrument its country expects is not a finished pass");
});

test("a quote that is gone fails the pass", async () => {
  const result = await gate(repository({ brief: answered }), { text: REWRITTEN });
  assert.equal(result.passed, false);
  assert.match(result.lines.join("\n"), /MISSING: "The land bank lists plots offered for rent."/u);
});

test("a warning about this territory fails the pass, although it never fails a commit", async () => {
  // lastEvidenceDate equal to the consultation date is a warning: the researcher used the day they read
  // the page instead of a date the page shows.
  const dirs = repository({ brief: answered, edition: fakeEdition({ resources: [fakeResource({ lastEvidenceDate: "2026-09-20" })] }) });
  const result = await gate(dirs);
  assert.match(result.problems.join(" | "), /equals a consultation or publication date/u);
  assert.equal(result.passed, false, "a question somebody has to answer before the work is finished");
});

test("a territory with no brief at all is reported as such", async () => {
  const dirs = repository({ brief: answered });
  const result = await gate(dirs, { territory: "xa/south-isle" });
  assert.match(result.problems.join(" | "), /research\/xa\/south-isle.json: missing or not valid against its schema/u);
  assert.equal(result.passed, false);
});

test("a territory the catalogue does not know stops the gate instead of passing it", async () => {
  const dirs = repository({ brief: answered });
  await assert.rejects(gate(dirs, { territory: "xa/atlantis" }), /"atlantis" is neither a region nor a hub of XA/u);
  await assert.rejects(gate(dirs, { territory: "xz" }), /"xz" is not a jurisdiction in the territory catalogue/u);
  await assert.rejects(gate(dirs, { territory: "eu/north-isle" }), /the EU layer has no regions/u);
});

test("a problem in another territory is not this territory's problem", async () => {
  // South Isle has no brief at all, which is a problem of South Isle and of nobody else.
  const dirs = repository({ brief: answered });
  const other = path.join(dirs.editionsDir, "2026/regions/xa/south-isle.json");
  mkdirSync(path.dirname(other), { recursive: true });
  writeFileSync(
    other,
    JSON.stringify(
      fakeEdition({
        region: "south-isle",
        officialName: "South Isle",
        resources: [fakeResource({ id: "south-isle-land-bank" })],
      }),
    ),
  );
  const result = await gate(dirs);
  assert.deepEqual(result.problems, [], "North Isle is finished whatever state its neighbour is in");
  assert.equal(result.passed, true);
});
