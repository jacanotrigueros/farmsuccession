/**
 * The strict gate for one research pass: `npm run check:territory -- <year> eu | <iso> | <iso>/<region or hub>`.
 *
 * It is what a researcher runs before committing a territory, and it is deliberately harder to satisfy
 * than `npm run validate`:
 *
 *   1. the offline rules, where every error **and every warning** about this territory's edition file or
 *      its brief fails the pass. A warning is a question somebody has to answer before the work is
 *      finished, even though it must not block an unrelated commit;
 *   2. for a region, an answer for every instrument its country brief says a region usually has, so no
 *      pass quietly skips one;
 *   3. the live evidence check of that one file, where a failed citation fails the pass and an UNCHECKED
 *      page is listed for a person to open.
 *
 * Suspected duplicates are listed for review and do not fail: two instruments can share a page.
 *
 * What passing means, exactly: nothing in this territory contradicts itself, nothing published is
 * untraceable, and every quote was found again today. It is not proof of exhaustive coverage, nor that
 * everything described is still operating, nor that a person has reviewed it.
 */
import { briefOf, briefPathFor, instrumentCoverageProblems, loadBriefs, RESEARCH_DIR } from "./briefs.ts";
import { checkSources } from "./check-sources.ts";
import { editionPathFor, EDITIONS_DIR } from "./editions.ts";
import { layerFromSpec } from "./layers.ts";
import { isEntryPoint, runMain } from "./paths.ts";
import { type RunOptions, summarize } from "./sources/check.ts";
import type { Fetcher } from "./sources/fetch.ts";
import { consoleOutput, type Output } from "./sources/report.ts";
import { installIntermediates } from "./sources/tls.ts";
import { loadTerritories, TERRITORIES_PATH } from "./territories.ts";
import { validateEditions } from "./validate.ts";

export type TerritoryCheckOptions = {
  edition: string;
  territory: string;
  editionsDir?: string;
  researchDir?: string;
  territoriesFile?: string;
  reportsDir?: string;
  today?: string;
  fetcher?: Fetcher;
  run?: RunOptions;
  out?: Output;
};

export type TerritoryCheckResult = { passed: boolean; problems: string[]; reviews: string[] };

export async function checkTerritory(options: TerritoryCheckOptions): Promise<TerritoryCheckResult> {
  const out = options.out ?? consoleOutput;
  const editionsDir = options.editionsDir ?? EDITIONS_DIR;
  const researchDir = options.researchDir ?? RESEARCH_DIR;
  const territoriesFile = options.territoriesFile ?? TERRITORIES_PATH;

  const layer = layerFromSpec(options.territory, loadTerritories(territoriesFile));
  const editionPath = editionPathFor(layer);
  const editionFile = `${options.edition}/${editionPath}`;
  const briefFile = `research/${briefPathFor(layer)}`;
  const problems: string[] = [];

  const validation = validateEditions({
    editionsDir,
    researchDir,
    territoriesFile,
    edition: options.edition,
    today: options.today,
  });
  // A warning elsewhere is somebody else's business; a warning here is this pass's business.
  for (const finding of [...validation.errors, ...validation.warnings]) {
    if (finding.file === editionFile || finding.file === briefFile) problems.push(`${finding.file}: ${finding.message}`);
  }

  const { briefs } = loadBriefs(researchDir);
  const brief = briefOf(briefs, layer);
  if (!brief) problems.push(`${briefFile}: missing or not valid against its schema`);
  else if (layer.level === "REGION") {
    const country = briefOf(briefs, { level: "COUNTRY", country: layer.country });
    problems.push(...instrumentCoverageProblems(brief, country).map((problem) => `${briefFile}: ${problem}`));
  }

  const reviews = validation.reviews
    .filter((finding) => finding.file === editionFile)
    .map((finding) => `${finding.file}: ${finding.message}`);
  for (const problem of problems) out.error(`problem  ${problem}`);
  for (const review of reviews) out.log(`review   ${review}`);
  out.log(`offline: ${problems.length} problem(s) and ${reviews.length} for review (not a failure) for ${options.territory}`);

  const sources = await checkSources({
    edition: options.edition,
    filter: editionPath,
    scope: options.territory,
    editionsDir,
    reportsDir: options.reportsDir,
    fetcher: options.fetcher,
    run: options.run,
    out,
  });

  const passed = problems.length === 0 && summarize(sources.reports).fail === 0;
  out.log(passed ? `check:territory passed for ${options.territory}` : `check:territory FAILED for ${options.territory}`);
  return { passed, problems, reviews };
}

if (isEntryPoint(import.meta.url)) {
  runMain(async () => {
    const [edition, territory] = process.argv.slice(2);
    if (!edition || !/^[0-9]{4}$/u.test(edition) || !territory) {
      console.error("usage: npm run check:territory -- <year> eu | <iso> | <iso>/<region or hub>");
      return 2;
    }
    for (const intermediate of installIntermediates()) {
      console.log(`trusting intermediate "${intermediate.subject}" for ${intermediate.servedIncompleteBy.join(", ")}`);
    }
    const result = await checkTerritory({ edition, territory });
    if (!result.passed) console.error("fix the problems above and run it again before committing this territory");
    return result.passed ? 0 : 1;
  });
}
