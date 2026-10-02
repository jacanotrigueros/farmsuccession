import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";
import { buildPrompt, type PromptDirs, parsePromptArgs } from "../src/prompt.ts";
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
  fakeSource,
  fakeTerritories,
} from "./fixtures.ts";

const territories = fakeTerritories();
const TODAY = "2026-10-02";

function write(dir: string, file: string, content: unknown): void {
  const target = path.join(dir, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(content));
}

/** A repository the prompt can be built from: the real template, fictional briefs and editions. */
function dirsWith(options: { briefs?: boolean; editions?: boolean } = { briefs: true, editions: true }): PromptDirs {
  const root = mkdtempSync(path.join(tmpdir(), "farmsuccession-prompt-"));
  const research = path.join(root, "research");
  const editions = path.join(root, "editions");
  mkdirSync(research, { recursive: true });
  mkdirSync(editions, { recursive: true });
  if (options.briefs) {
    write(research, "eu.json", fakeBrief({ territory: { level: "EU" }, leads: [] }));
    write(research, FAKE_COUNTRY_BRIEF_FILE, fakeCountryBrief());
    write(research, FAKE_BRIEF_FILE, fakeBrief());
  }
  if (options.editions) {
    write(editions, FAKE_COUNTRY_FILE, fakeCountryEdition());
    write(editions, FAKE_EDITION_FILE, fakeEdition());
  }
  // The template is the real one: a prompt proved against a fixture template proves nothing about it.
  return { root: ROOT, research, editions };
}

const promptFor = (territory: string, mode?: "full" | "compact", dirs = dirsWith()): string =>
  buildPrompt({ edition: "2026", territory, today: TODAY, mode }, territories, dirs).text;

test("the command line is read exactly, or refused", () => {
  assert.deepEqual(parsePromptArgs(["2026", "eu"]), { edition: "2026", territory: "eu", mode: "full" });
  assert.deepEqual(parsePromptArgs(["2026", "xa/north-isle", "--compact"]), {
    edition: "2026",
    territory: "xa/north-isle",
    mode: "compact",
  });
  assert.equal(parsePromptArgs(["2026"]), undefined, "a year alone names no territory");
  assert.equal(parsePromptArgs(["26", "eu"]), undefined, "an edition is a four-digit year");
  assert.equal(parsePromptArgs(["2026", "xa", "north-isle"]), undefined, "a region goes with its country as xa/north-isle");
  assert.equal(parsePromptArgs(["2026", "eu", "--quick"]), undefined, "an unknown option is refused, not ignored");
  assert.equal(parsePromptArgs(["2026", "eu", "--Compact"]), undefined, "a mistyped option must not quietly yield the other mode");
});

test("every placeholder of the template is filled", () => {
  for (const territory of ["eu", "xa", "xa/archipelago", "xa/north-isle"]) {
    const text = promptFor(territory);
    assert.deepEqual(text.match(/\{\{\w+\}\}/gu), null, `${territory} leaves a placeholder unfilled, which is an unfinished instruction`);
  }
});

test("the territory is described as the catalogue describes it", () => {
  assert.match(promptFor("eu"), /researching \*\*European Union\*\* \(EU layer\)/u);
  assert.match(promptFor("xa"), /researching \*\*Terra Nostra\*\* \(country XA\)/u);
  assert.match(promptFor("xa/north-isle"), /researching \*\*North Isle\*\* \(region north-isle of XA\)/u);
  assert.match(
    promptFor("xa/archipelago"),
    /researching \*\*Archipelago\*\* \(hub archipelago of XA, grouping north-isle, south-isle\)/u,
    "a hub says which regions it speaks for, because that is what decides whether a resource belongs there",
  );
});

test("the paths the pass must write are the ones the layout defines", () => {
  const text = promptFor("xa/north-isle");
  assert.match(text, /data\/editions\/2026\/regions\/xa\/north-isle\.json/u);
  assert.match(text, /research\/xa\/north-isle\.json/u);
  assert.match(text, /check:territory -- 2026 xa\/north-isle/u, "the check it has to pass is named with this territory");
});

test("a region or hub pass stops without its country brief", () => {
  const withoutBriefs = dirsWith({ editions: true });
  assert.throws(() => promptFor("xa/north-isle", "full", withoutBriefs), /country brief .* is required: research XA before north-isle/u);
  assert.throws(() => promptFor("xa/archipelago", "full", withoutBriefs), /required: research XA before archipelago/u);
  assert.doesNotThrow(() => promptFor("xa", "full", withoutBriefs), "a country pass is where the country brief comes from");
});

test("full mode inlines what a chat cannot open; compact mode names it", () => {
  const full = promptFor("xa/north-isle", "full");
  assert.match(full, /### Edition schema \(schema\/edition\.schema\.json\)/u);
  assert.match(full, /### Country brief \(research\/xa\/country\.json\)/u);
  const compact = promptFor("xa/north-isle", "compact");
  assert.match(compact, /## Repository files to open/u);
  assert.match(compact, /- Country brief: `research\/xa\/country\.json`/u);
  assert.doesNotMatch(compact, /### Edition schema \(/u, "an assistant with the repository reads the schema there");
  assert.ok(compact.length < full.length, "that is the point of compact mode");
  assert.match(compact, /Brief of this territory \(research\/xa\/north-isle\.json\)/u, "what this pass changes is inline either way");
});

test("the resources of the layers above are listed, so the pass does not write them again", () => {
  const text = promptFor("xa/north-isle");
  assert.match(
    text,
    /- countries\/xa\.json: `terra-nostra-establishment-aid` — Establishment aid — https:\/\/example\.test\/establishment-aid/u,
  );
  assert.match(promptFor("eu"), /None: this is the highest layer\./u);
  assert.match(
    promptFor("xa", "full", dirsWith({ briefs: true })),
    /- eu\.json: not written yet for 2026/u,
    "a layer nobody has written yet is said plainly, not left looking empty",
  );
});

test("the example resource is the best-documented one, not a name written in code", () => {
  const dirs = dirsWith();
  const richer = fakeEdition({
    resources: [
      fakeResource(),
      fakeResource({
        id: "north-isle-establishment-aid",
        name: "Establishment aid of North Isle",
        kind: "FINANCIAL_SUPPORT",
        instrumentType: "GRANT",
        purposes: ["FIRST_ESTABLISHMENT"],
        accessUrl: "https://example.test/aid",
        sources: [
          fakeSource({ url: "https://example.test/aid", quotes: ["The premium is 40,000 euros.", "Applications close on 15 October."] }),
        ],
        metrics: [
          {
            measure: "AID_PER_BENEFICIARY_MAX",
            label: "Premium for a first establishment",
            value: 40000,
            unit: "EUR",
            asOf: "2026-09-01",
            sourceUrl: "https://example.test/aid",
          },
        ],
        calls: [{ name: "2026 call", state: "OPEN", opens: "2026-09-01", closes: "2026-10-15", sourceUrl: "https://example.test/aid" }],
      }),
    ],
  });
  write(dirs.editions, FAKE_EDITION_FILE, richer);
  const text = promptFor("xa/north-isle", "full", dirs);
  assert.match(text, /"id": "north-isle-establishment-aid"/u, "the record with quotes, a metric and a call is the one worth imitating");
  assert.doesNotMatch(text, /"id": "north-isle-land-bank",\n {4}"name": "Land bank of North Isle"/u);
});

test("with no data yet, the example says so instead of inventing one", () => {
  assert.match(
    promptFor("xa", "full", dirsWith({ briefs: true })),
    /No example is available yet; follow the schema and the rules above\./u,
  );
});
