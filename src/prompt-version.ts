/**
 * Which research prompt a record followed.
 *
 * A file drafted with an assistant records the version of the process it was given
 * (`metadata.generatedBy.promptVersion`), and this repository keeps every one of those versions whole.
 * Together that means a record written months ago can be read against the instructions it actually had,
 * which is the difference between judging old work and judging it fairly.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { ROOT } from "./paths.ts";
import type { EditionSnapshot } from "./types/edition.ts";

export const PROMPTS_DIR = path.join(ROOT, "prompts");
export const PROMPT_PATH = path.join(PROMPTS_DIR, "research-territory.md");
export const PROMPT_VERSIONS_DIR = path.join(PROMPTS_DIR, "versions");

const VERSION_LINE = /^Prompt version: (\d+\.\d+\.\d+)$/mu;

/** The version a prompt file declares in its own text, which is the single source of truth for it. */
export function promptVersionOf(promptPath: string): string {
  const version = VERSION_LINE.exec(readFileSync(promptPath, "utf8"))?.[1];
  if (!version) throw new Error(`${path.relative(ROOT, promptPath)} has no "Prompt version: x.y.z" line`);
  return version;
}

export const currentPromptVersion = (promptPath = PROMPT_PATH): string => promptVersionOf(promptPath);

/** Negative, zero or positive, comparing `x.y.z` versions numerically rather than as strings. */
export function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/**
 * Every prompt version this repository can show, oldest first: the superseded ones kept in
 * `prompts/versions/` and the current one. Read from the files themselves rather than from their names,
 * so a snapshot renamed by hand cannot quietly claim to be a version it is not.
 */
export function knownPromptVersions(promptPath = PROMPT_PATH, versionsDir = PROMPT_VERSIONS_DIR): string[] {
  const snapshots = readdirSync(versionsDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => promptVersionOf(path.join(versionsDir, name)));
  return [...new Set([...snapshots, currentPromptVersion(promptPath)])].toSorted(compareVersions);
}

/**
 * A draft produced with an assistant has to say which version of the process it followed, and that
 * version has to be one this repository keeps. A version it cannot show is a record nobody can read
 * against its own instructions, which includes any version newer than the current prompt. A file
 * written by a person followed no prompt and needs none.
 */
export function checkPromptVersion(data: EditionSnapshot, known: readonly string[]): string[] {
  const problems: string[] = [];
  for (const generator of data.metadata.generatedBy) {
    const { tool, promptVersion } = generator;
    if (tool === "PERSON") continue;
    if (promptVersion === undefined) {
      problems.push(`metadata.generatedBy.promptVersion is required for a file drafted with ${tool}`);
      continue;
    }
    if (!known.includes(promptVersion)) {
      problems.push(
        `metadata.generatedBy.promptVersion ${promptVersion} is not a version this repository keeps (${known.join(", ")}), so the instructions it followed cannot be read`,
      );
    }
  }
  return problems;
}
