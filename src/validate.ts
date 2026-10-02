/**
 * The offline gate: `npm run validate [-- <year>]`.
 *
 * It checks the territorial catalogue, every edition file against its schema, the rules one file has to
 * satisfy on its own and the rules that span one edition, and then every research brief against its own
 * schema and against the editions it claims to have produced. Nothing here reaches the network, so it is
 * the check that runs before every commit; the live checks on sources and links are separate commands,
 * because a portal being down is not a reason to refuse a commit.
 *
 * An error means something cannot be true and the exit code is 1. A warning asks a person to look and
 * does not fail. A review is a suspected duplicate only a person can judge and does not fail either.
 *
 * It says how many files it checked, so a run over nothing cannot read as a clean run.
 */
import { checkBrief, listBriefFiles, loadBriefs, RESEARCH_DIR } from "./briefs.ts";
import { EDITIONS_DIR, listEditionFiles, loadSnapshots, type LoadedSnapshot } from "./editions.ts";
import { damageInFile, damageInTree, type JsonDamage } from "./json-damage.ts";
import { isEntryPoint, runMain } from "./paths.ts";
import { loadTerritories, TERRITORIES_PATH } from "./territories.ts";
import { checkEdition, checkSemantics, type Finding } from "./validate-edition.ts";

export type ValidationResult = { files: number; briefs: number; errors: Finding[]; warnings: Finding[]; reviews: Finding[] };

/** The edition a file belongs to is the year its path starts with, which `identityFromPath` enforces. */
const editionOf = (file: string): string => file.slice(0, 4);

/** A brief is reported by its path in the repository, so a finding says which file to open. */
const briefLabel = (file: string): string => `research/${file}`;

/**
 * `editionsDir`, `researchDir`, `territoriesFile` and `today` default to the repository and the clock,
 * and are parameters so a test can run the whole gate over a fictional territory on a day of its choosing.
 */
export function validateEditions(
  options: { editionsDir?: string; researchDir?: string; territoriesFile?: string; edition?: string; today?: string } = {},
): ValidationResult {
  const editionsDir = options.editionsDir ?? EDITIONS_DIR;
  const researchDir = options.researchDir ?? RESEARCH_DIR;
  const territoriesFile = options.territoriesFile ?? TERRITORIES_PATH;
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const territories = loadTerritories(territoriesFile);

  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const reviews: Finding[] = [];

  // Damage the parser hides, before anything is read as data: a duplicated key loses the value written
  // first, and a file with a pasted fragment appended still describes a territory somebody researched.
  const reportDamage = (damage: JsonDamage, label = damage.file): void => {
    const where = damage.line === undefined ? "" : ` (line ${damage.line})`;
    errors.push({ file: label, message: `[${damage.type}]${where} ${damage.message}` });
  };
  for (const damage of damageInTree(editionsDir)) reportDamage(damage);
  for (const damage of damageInTree(researchDir)) reportDamage(damage, briefLabel(damage.file));
  for (const damage of damageInFile(territoriesFile, "data/territories.json")) reportDamage(damage);

  const { snapshots, problems } = loadSnapshots({ editionsDir, edition: options.edition });
  errors.push(...problems);

  const byEdition = new Map<string, LoadedSnapshot[]>();
  for (const snapshot of snapshots) {
    const report = checkSemantics(snapshot.file, snapshot.data, territories, today);
    errors.push(...report.errors);
    warnings.push(...report.warnings);
    const edition = editionOf(snapshot.file);
    byEdition.set(edition, [...(byEdition.get(edition) ?? []), snapshot]);
  }

  for (const group of byEdition.values()) {
    const report = checkEdition(group, territories);
    errors.push(...report.errors);
    warnings.push(...report.warnings);
    reviews.push(...report.reviews);
  }

  // Briefs are checked against every edition, not only the one asked for: a lead admitted in 2026 points
  // at a resource of the 2026 file, and narrowing the run to another year would turn that into an error.
  const all = options.edition === undefined ? snapshots : loadSnapshots({ editionsDir }).snapshots;
  const loaded = loadBriefs(researchDir);
  errors.push(...loaded.problems.map(({ file, message }) => ({ file: briefLabel(file), message })));
  for (const { file, brief } of loaded.briefs) {
    errors.push(...checkBrief(file, brief, territories, all, today).map((message) => ({ file: briefLabel(file), message })));
  }

  return {
    files: listEditionFiles(editionsDir, options.edition).length,
    briefs: listBriefFiles(researchDir).length,
    errors,
    warnings,
    reviews,
  };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const edition = process.argv[2];
    const result = validateEditions({ edition });
    for (const review of result.reviews) console.log(`review   ${review.file}: ${review.message}`);
    for (const warning of result.warnings) console.warn(`warning  ${warning.file}: ${warning.message}`);
    for (const error of result.errors) console.error(`error    ${error.file}: ${error.message}`);
    const where = edition ? ` in ${edition}` : "";
    console.log(
      `${result.files} edition file(s)${where} and ${result.briefs} research brief(s) checked: ` +
        `${result.errors.length} error(s), ${result.warnings.length} warning(s), ${result.reviews.length} for review`,
    );
    return result.errors.length ? 1 : 0;
  });
}
