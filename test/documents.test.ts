import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

/** Everything written for a reader of the repository. Data and research are not documents: they quote pages. */
const SKIP = new Set(["node_modules", ".git", "data", "research", "reports", "docs"]);

function documents(dir = ROOT): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return documents(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

/** A domain ends in letters, which is what tells an address from a package version such as `astro@2.10.9`. */
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]*[a-z]{2,}\b/giu;
const PROJECT_DOMAIN = "@farmsuccession.eu";

test("a document names a project address, never a personal one", () => {
  const found: string[] = [];
  for (const file of documents()) {
    for (const [address] of readFileSync(file, "utf8").matchAll(EMAIL)) {
      if (!address.endsWith(PROJECT_DOMAIN)) found.push(`${path.relative(ROOT, file)}: ${address}`);
    }
  }
  assert.deepEqual(
    found,
    [],
    `a personal address in a public repository is an address anybody can harvest, and it outlives the file it was written in: ` +
      `use a ${PROJECT_DOMAIN} channel so the person behind it can change without the document changing. Found ${found.join(", ")}`,
  );
});

/**
 * A link target that names a path: a directory, or a file with an extension. The research prompt quotes
 * `[text](url)` as an example of what free text may not contain, and a word that is not a path was never
 * a claim about this repository, so it is not this test's business.
 */
const isPath = (target: string): boolean => target.includes("/") || /\.\w+$/u.test(target);

test("every relative link in a document points at something that exists", () => {
  const broken: string[] = [];
  for (const file of documents()) {
    const text = readFileSync(file, "utf8");
    for (const [, label = "", target = ""] of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/gu)) {
      if (/^(https?:|mailto:|#)/u.test(target) || !isPath(target)) continue;
      const [withoutAnchor = ""] = target.split("#");
      if (!existsSync(path.resolve(path.dirname(file), withoutAnchor))) broken.push(`${path.relative(ROOT, file)}: [${label}](${target})`);
    }
  }
  assert.deepEqual(broken, [], `a link that goes nowhere is a document describing a repository that does not exist: ${broken.join(", ")}`);
});
