/** Exact file bytes, not canonical JSON: a checksum identifies an object and does not validate its claims. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { EDITIONS_DIR } from "../src/editions.ts";
import { listJsonFiles } from "../src/json-files.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";

/** A sha256sum-compatible manifest, with paths relative to the explicitly supplied editions directory. */
export function editionChecksums(editionsDir: string, edition: string): string {
  if (!/^\d{4}$/u.test(edition)) throw new Error("name a four-digit edition, not an arbitrary directory");
  const files = listJsonFiles(editionsDir, edition);
  if (files.length === 0) throw new Error(`${edition}: no JSON files; an empty manifest cannot identify an edition`);
  return (
    files
      .map(
        (file) =>
          `${createHash("sha256")
            .update(readFileSync(path.join(editionsDir, file)))
            .digest("hex")}  ${file}`,
      )
      .join("\n") + "\n"
  );
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const [edition, ...extra] = process.argv.slice(2);
    if (!edition || extra.length > 0) {
      console.error("usage: npm run --silent checksums:edition -- <year>");
      return 1;
    }
    process.stdout.write(editionChecksums(EDITIONS_DIR, edition));
    return 0;
  });
}
