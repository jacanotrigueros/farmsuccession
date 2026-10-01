import path from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root, resolved from this file so every tool works from any working directory. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** True when the calling module is the process entry point (`node src/x.ts`), not an import. */
export function isEntryPoint(moduleUrl: string): boolean {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]!) === path.resolve(fileURLToPath(moduleUrl));
}

/**
 * Runs a command-line entry point: the returned number becomes the exit code, and an unexpected
 * error is logged and exits with 2. Keeping a crash (2) distinct from a check that found problems
 * (1) means a broken tool can never be read as a clean run, and an error is never swallowed.
 */
export function runMain(main: () => number | Promise<number>): void {
  Promise.resolve()
    .then(main)
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error("unexpected error:", error);
      process.exitCode = 2;
    });
}
