/**
 * Integrates an answer from an assistant that cannot run commands: `npm run ingest -- <answer.md>`.
 *
 * The research process asks for the two files as fenced JSON blocks, each preceded by its repository
 * path, so that a chat with access to nothing can still take part in the research. This command turns
 * that answer into files: it takes the blocks whose path the edition layout defines, refuses everything
 * else, writes them formatted, and then runs the whole offline gate.
 *
 * It is deliberately not clever. It does not merge, patch or reconcile: it writes what the answer said
 * and lets the checks judge it, because an ingestion that quietly fixed a draft would be publishing a
 * record nobody wrote. Git is the undo — read `git diff` before committing.
 *
 * It uses the repository's own formatter, which is a development dependency: this is a maintainer's
 * command, run in a checkout, never part of anything published.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { format, resolveConfig } from "prettier";

import { layerFromBriefPath } from "./briefs.ts";
import { identityFromPath } from "./editions.ts";
import { errorMessage } from "./errors.ts";
import { jsonDamage } from "./json-damage.ts";
import { isEntryPoint, ROOT, runMain } from "./paths.ts";
import { validateEditions, type ValidationResult } from "./validate.ts";

export type IngestBlock = { file: string; json: string };

const EDITIONS_PREFIX = "data/editions/";
const RESEARCH_PREFIX = "research/";
/**
 * A repository path written in prose, which is how the answer labels each block: something with a
 * directory in it, ending in `.json`. Deliberately wider than the paths a pass may write, so a block
 * labelled `schema/edition.schema.json` is refused out loud instead of skipped in silence — an answer
 * trying to write somewhere it should not is something the maintainer wants to see.
 */
const PATH_MENTION = /[\w.-]+(?:\/[\w.-]+)+\.json/gu;
const FENCE = /^```(?:json)?[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gmu;

/**
 * A path an answer may write: an edition file or a research brief, nothing else. Both are decided by
 * the same functions the loaders use, so there is one definition of where a file belongs and ingestion
 * cannot drift from it.
 */
export function isIngestablePath(file: string): boolean {
  if (file.startsWith(EDITIONS_PREFIX)) return identityFromPath(file.slice(EDITIONS_PREFIX.length)) !== null;
  if (file.startsWith(RESEARCH_PREFIX)) return layerFromBriefPath(file.slice(RESEARCH_PREFIX.length)) !== null;
  return false;
}

/**
 * The fenced blocks of an answer, each labelled with the last repository path mentioned before it. A
 * block with no path in front of it is an example or an excerpt and is skipped in silence; a block
 * labelled with a path the layout does not define is refused out loud, because that is a draft trying
 * to write somewhere it should not.
 */
export function extractBlocks(markdown: string): { blocks: IngestBlock[]; problems: string[] } {
  const blocks: IngestBlock[] = [];
  const problems: string[] = [];
  let previousEnd = 0;
  for (const match of markdown.matchAll(FENCE)) {
    const label = markdown.slice(previousEnd, match.index).match(PATH_MENTION)?.at(-1);
    previousEnd = match.index + match[0].length;
    if (label === undefined) continue;
    if (!isIngestablePath(label)) problems.push(`${label}: not an edition file or a research brief path, refused`);
    else if (blocks.some((block) => block.file === label)) problems.push(`${label}: appears in more than one block, refused`);
    else blocks.push({ file: label, json: match[1] ?? "" });
  }
  if (blocks.length === 0 && problems.length === 0) {
    problems.push("no fenced JSON block preceded by an edition or research-brief path was found");
  }
  return { blocks, problems };
}

export type IngestResult = { written: string[]; problems: string[]; validation?: ValidationResult };

/**
 * `root` is required and has no default, because this function writes files. A default would mean a
 * caller that forgot to pass one — a test, most likely — writing into the repository itself, and a
 * fictional edition file landing in `data/` is the kind of mistake nobody notices for weeks. The type
 * prevents it, rather than a note asking somebody to remember.
 */
export async function ingest(markdown: string, options: { root: string; territoriesFile?: string; today?: string }): Promise<IngestResult> {
  const { root } = options;
  const { blocks, problems } = extractBlocks(markdown);

  const parsed = blocks.flatMap((block) => {
    // A repeated key is kept silently by the parser, and the file is rewritten from the parsed value, so
    // the duplicate would disappear before any later check could see it. Refuse the block instead.
    const damage = jsonDamage(block.json, block.file).filter((found) => found.type !== "invalid-json");
    if (damage.length > 0) {
      problems.push(...damage.map((found) => `${block.file}: ${found.message}`));
      return [];
    }
    try {
      return [{ file: block.file, data: JSON.parse(block.json) as unknown }];
    } catch (error) {
      problems.push(`${block.file}: not valid JSON: ${errorMessage(error)}`);
      return [];
    }
  });
  // Nothing is written when anything was refused: half an answer on disk is worse than none.
  if (problems.length > 0) return { written: [], problems };

  // Everything is formatted before anything is written, for the same reason.
  const formatted = await Promise.all(
    parsed.map(async ({ file, data }) => {
      const target = path.join(root, file);
      const config = await resolveConfig(target);
      return { file, target, text: await format(JSON.stringify(data, null, 2), { ...config, filepath: target }) };
    }),
  );
  for (const { target, text } of formatted) {
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, text);
  }

  return {
    written: formatted.map(({ file }) => file),
    problems,
    validation: validateEditions({
      editionsDir: path.join(root, "data/editions"),
      researchDir: path.join(root, "research"),
      ...(options.territoriesFile === undefined ? {} : { territoriesFile: options.territoriesFile }),
      ...(options.today === undefined ? {} : { today: options.today }),
    }),
  };
}

/** The territory a written edition file is about, as `check:territory` wants it named. */
export function territorySpecOf(file: string): string | undefined {
  if (!file.startsWith(EDITIONS_PREFIX)) return undefined;
  const identity = identityFromPath(file.slice(EDITIONS_PREFIX.length));
  if (!identity) return undefined;
  const place = identity.country?.toLowerCase() ?? "eu";
  const leaf = identity.hub ?? identity.region;
  return leaf === undefined ? place : `${place}/${leaf}`;
}

if (isEntryPoint(import.meta.url)) {
  runMain(async () => {
    const answer = process.argv[2];
    if (!answer) {
      console.error("usage: npm run ingest -- <saved answer.md>");
      return 2;
    }
    const result = await ingest(readFileSync(answer, "utf8"), { root: ROOT });
    for (const problem of result.problems) console.error(`refused  ${problem}`);
    for (const file of result.written) console.log(`written  ${file}`);
    const { validation } = result;
    if (!validation) return 1;

    for (const review of validation.reviews) console.log(`review   ${review.file}: ${review.message}`);
    for (const warning of validation.warnings) console.warn(`warning  ${warning.file}: ${warning.message}`);
    for (const error of validation.errors) console.error(`error    ${error.file}: ${error.message}`);
    console.log(
      `validation: ${validation.errors.length} error(s), ${validation.warnings.length} warning(s), ${validation.reviews.length} for review`,
    );
    // The offline gate is only half of it: the quotes have not been read back from their pages yet.
    for (const file of result.written) {
      const [, edition] = /^data\/editions\/(\d{4})\//u.exec(file) ?? [];
      const territory = territorySpecOf(file);
      if (edition !== undefined && territory !== undefined) console.log(`next     npm run check:territory -- ${edition} ${territory}`);
    }
    console.log("then     read git diff, and commit");
    return validation.errors.length > 0 ? 1 : 0;
  });
}
