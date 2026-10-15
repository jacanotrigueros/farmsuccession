import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
for (const file of ["README.md", "CONTRIBUTING.md"]) {
  test(`${file} describes the hooks that actually ship`, () => {
    const prose = read(file).replace(/\s+/gu, " ");
    assert.match(read(".husky/pre-commit"), /^npx lint-staged$/mu, "the pre-commit account must be revisited if the hook changes");
    assert.match(read(".husky/pre-push"), /^npm run check$/mu, "the pre-push account must be revisited if the hook changes");
    assert.doesNotMatch(read(".husky/pre-commit"), /^npm run check/mu, "a changed pre-commit gate requires an updated account");
    assert.match(
      prose,
      /`pre-commit` formats staged files with `lint-staged`/u,
      `${file}: pre-commit formats staged files; it does not run the gate`,
    );
    assert.match(
      prose,
      /`pre-push` runs the root `npm run check`/u,
      `${file}: the push hook runs only the root gate, so it cannot stand for the site gate`,
    );
    assert.match(prose, /`npm run check --prefix frontend`/u, `${file}: contributors must be told to run the separate site gate`);
  });
}
