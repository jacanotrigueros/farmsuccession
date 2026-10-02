/**
 * Damage to a JSON file that no schema ever gets to see, because the parser hides it.
 *
 * - `duplicate-key`: a key repeated inside one object. `JSON.parse` accepts it and keeps only the last
 *   value, so the earlier text is lost without anything failing. This is the one that matters: a
 *   duplicated `quotes` or `sources` key silently drops the evidence that was written first.
 * - `trailing-content`: a complete value followed by more text, which is what an object with a pasted
 *   copy of part of itself appended looks like. Reported together with the parse error, to say where
 *   the first value ended.
 * - `invalid-json`: the file does not parse at all.
 *
 * Braces are counted inside the scan rather than by line heuristics, because a brace inside a quoted
 * string is ordinary text and the same key name in two different objects is perfectly valid.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { errorMessage } from "./errors.ts";
import { listJsonFiles } from "./json-files.ts";

export type JsonDamage = {
  file: string;
  type: "invalid-json" | "trailing-content" | "duplicate-key";
  message: string;
  line?: number;
};

const lineAt = (content: string, index: number): number => content.slice(0, index).split("\n").length;

/**
 * The index of the closing quote of the string that opens at `start`, honouring backslash escapes, or
 * the end of the content when it is never closed.
 *
 * Both scans below depend on this and on nothing else about strings: everything inside one is text, so
 * a brace, a bracket or a comma in a URL or a quotation is not structure.
 */
function endOfString(content: string, start: number): number {
  for (let index = start + 1; index < content.length; index += 1) {
    if (content[index] === "\\") index += 1;
    else if (content[index] === '"') return index;
  }
  return content.length;
}

/** Just past the end of the first complete top-level value, or undefined when it never closes. */
function firstValueEnd(content: string): number | undefined {
  let depth = 0;
  for (let index = 0; index < content.length; index += 1) {
    switch (content[index]) {
      case '"':
        index = endOfString(content, index);
        break;
      case "{":
      case "[":
        depth += 1;
        break;
      case "}":
      case "]":
        depth -= 1;
        if (depth === 0) return index + 1;
        break;
      default:
        break;
    }
  }
  return undefined;
}

/**
 * Keys repeated within one object, at any depth. Only called on content that already parses, which is
 * what lets the scan treat the next quote as the end of a string and a `,` inside a container as a
 * separator.
 *
 * The state is two things: which containers are open, and whether the next string is a key. A `{` opens
 * an object and the next string is its first key; a `[` opens an array, which has no keys; a comma
 * means another entry of whatever is open.
 */
function duplicateKeys(content: string): Array<{ key: string; line: number }> {
  const found: Array<{ key: string; line: number }> = [];
  // One entry per open container, holding the keys seen so far; undefined for an array, which has none.
  const containers: Array<Set<string> | undefined> = [];
  let expectKey = false;
  for (let index = 0; index < content.length; index += 1) {
    switch (content[index]) {
      case "{":
        containers.push(new Set());
        expectKey = true;
        break;
      case "[":
        containers.push(undefined);
        expectKey = false;
        break;
      case "}":
      case "]":
        containers.pop();
        expectKey = false;
        break;
      case ",":
        expectKey = containers.at(-1) !== undefined;
        break;
      case '"': {
        const start = index;
        index = endOfString(content, index);
        const keys = containers.at(-1);
        if (!expectKey || !keys) break;
        // Parsed rather than sliced, so an escaped key ("quotes") counts as the key it spells.
        const key: unknown = JSON.parse(content.slice(start, index + 1));
        if (typeof key !== "string") break;
        if (keys.has(key)) found.push({ key, line: lineAt(content, start) });
        keys.add(key);
        expectKey = false;
        break;
      }
      default:
        break;
    }
  }
  return found;
}

export function jsonDamage(content: string, file: string): JsonDamage[] {
  try {
    JSON.parse(content);
  } catch (error) {
    const damage: JsonDamage[] = [{ file, type: "invalid-json", message: `not readable JSON: ${errorMessage(error)}` }];
    const end = firstValueEnd(content);
    const rest = end === undefined ? "" : content.slice(end).trim();
    if (end !== undefined && rest) {
      const line = lineAt(content, end);
      const preview = rest.slice(0, 80).replaceAll(/\s+/gu, " ");
      damage.push({
        file,
        type: "trailing-content",
        line,
        message: `a complete value ends at line ${line} and ${rest.length} more characters follow it, starting: ${preview}`,
      });
    }
    return damage;
  }
  return duplicateKeys(content).map(({ key, line }) => ({
    file,
    type: "duplicate-key",
    line,
    message: `key "${key}" is repeated in the same object at line ${line}; JSON keeps only the last value, so the first is lost`,
  }));
}

/** One file, named in the report as `label` so a report can show a path relative to the repository. */
export function damageInFile(filePath: string, label = filePath): JsonDamage[] {
  return jsonDamage(readFileSync(filePath, "utf8"), label);
}

/** Every `.json` file under `dir`, named relative to it. A missing directory is an error, not silence. */
export function damageInTree(dir: string): JsonDamage[] {
  return listJsonFiles(dir).flatMap((file) => damageInFile(path.join(dir, file), file));
}
