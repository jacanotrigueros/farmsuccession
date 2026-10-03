/**
 * Builds one search index per language the catalogue is written in, each holding every record.
 *
 * Pagefind indexes a site by language: it reads the `lang` of each page and files it under that language,
 * so a Spanish page searching its own index would never reach the European layer, which is written in
 * English. The records inherited from above are the ones a reader is least likely to know about, and they
 * are exactly the ones that would have gone missing.
 *
 * So each language gets an index of the whole catalogue, stemmed for somebody typing in that language.
 * That costs a second of build time and a megabyte in `dist/`, which nobody downloads: a reader loads the
 * index of the page they are on and nothing else. It is also what makes the one promise here testable —
 * whatever language a reader types in, the same records are reachable.
 *
 * The languages come from the data rather than from a list here, so a country published in a language
 * nobody thought about still gets an index.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import { loadSnapshots } from "../../src/editions.ts";

const SITE = path.join(import.meta.dirname, "..", "dist");

const loaded = loadSnapshots({});
if (loaded.problems.length > 0) {
  const problems = loaded.problems.map(({ file, message }) => `${file} ${message}`).join("; ");
  throw new Error(`cannot index data the loader could not read: ${problems}`);
}

const languages = [...new Set(loaded.snapshots.map(({ data }) => data.metadata.language))].toSorted();
if (languages.length === 0) throw new Error("no languages in the corpus: there is nothing to index");

for (const language of languages) {
  const run = spawnSync(
    "pagefind",
    ["--site", SITE, "--force-language", language, "--output-path", path.join(SITE, "pagefind", language)],
    { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8", shell: process.platform === "win32" },
  );
  if (run.status !== 0) {
    throw new Error(`pagefind failed for ${language} with status ${String(run.status)}`);
  }
  const indexed = /Indexed (\d+) pages/u.exec(run.stdout ?? "")?.[1] ?? "no";
  process.stdout.write(`search index for ${language}: ${indexed} pages\n`);
}
