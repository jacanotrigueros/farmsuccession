import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { errorMessage } from "./errors.ts";

/**
 * Every `.json` file under `dir`, or under `dir/subdir`, as sorted POSIX-style paths relative to
 * `dir`.
 *
 * A directory that is not there is an error naming it, never an empty list. Turning it into one
 * would make `validate --edition 2027` report that nothing is wrong with an edition nobody has
 * written, and a check that passes over no files is worse than no check. An edition that exists and
 * holds nothing yet is a different thing, and that is what an empty list means.
 */
export function listJsonFiles(dir: string, subdir?: string): string[] {
  const start = subdir ? path.join(dir, subdir) : dir;
  try {
    return readdirSync(start, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"))
      .toSorted();
  } catch (error) {
    throw new Error(`${start}: cannot be listed: ${errorMessage(error)}`, { cause: error });
  }
}

/** Parses one JSON file. The error names the file and keeps the original as its cause. */
export function readJson(dir: string, relativePath: string): unknown {
  try {
    return JSON.parse(readFileSync(path.join(dir, relativePath), "utf8"));
  } catch (error) {
    throw new Error(`${relativePath}: not readable JSON: ${errorMessage(error)}`, { cause: error });
  }
}
