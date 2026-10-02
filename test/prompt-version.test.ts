import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";
import {
  checkPromptVersion,
  compareVersions,
  currentPromptVersion,
  knownPromptVersions,
  PROMPT_PATH,
  PROMPT_VERSIONS_DIR,
  promptVersionOf,
} from "../src/prompt-version.ts";
import type { EditionSnapshot } from "../src/types/edition.ts";
import { fakeEdition } from "./fixtures.ts";

const snapshotFiles = (): string[] => readdirSync(PROMPT_VERSIONS_DIR).filter((name) => name.endsWith(".md"));

/** An edition file drafted by the tool and version given. */
const draftedWith = (tool: "CLAUDE" | "PERSON", promptVersion?: string): EditionSnapshot =>
  fakeEdition({
    metadata: {
      language: "en",
      sourcePolicy: "PUBLIC_SOURCES_ONLY",
      generatedBy: [{ id: "a", tool, ...(promptVersion && { promptVersion }) }],
    },
  });

test("every kept version declares the version its file name claims", () => {
  for (const name of snapshotFiles()) {
    const claimed = /^research-territory-v(\d+\.\d+\.\d+)\.md$/u.exec(name)?.[1];
    assert.ok(claimed, `"${name}" is not named research-territory-v<x.y.z>.md`);
    assert.equal(
      promptVersionOf(path.join(PROMPT_VERSIONS_DIR, name)),
      claimed,
      `${name} declares a different version from its name, so a record citing either cannot be read against it`,
    );
  }
});

test("the current prompt is newer than every version it superseded", () => {
  const current = currentPromptVersion();
  for (const name of snapshotFiles()) {
    const superseded = promptVersionOf(path.join(PROMPT_VERSIONS_DIR, name));
    assert.ok(
      compareVersions(superseded, current) < 0,
      `${name} declares ${superseded}, which is not older than the current prompt (${current}): one of the two is mislabelled`,
    );
  }
});

test("the live prompt is not a copy of a version already kept", () => {
  const live = readFileSync(PROMPT_PATH, "utf8");
  for (const name of snapshotFiles()) {
    assert.notEqual(
      readFileSync(path.join(PROMPT_VERSIONS_DIR, name), "utf8"),
      live,
      `${name} is byte-identical to the live prompt, so one of them is a version that never changed anything`,
    );
  }
});

test("every known version is described in VERSIONS.md", () => {
  const log = readFileSync(path.join(ROOT, "prompts/VERSIONS.md"), "utf8");
  for (const version of knownPromptVersions()) {
    assert.match(
      log,
      new RegExp(`^### ${version.replaceAll(".", "\\.")} — `, "mu"),
      `prompts/VERSIONS.md has no entry for ${version}: a kept version nobody can read the reason for is a file, not a record`,
    );
  }
});

test("a draft says which version of the process it followed", () => {
  const known = ["1.0.0", "1.11.0"];
  assert.deepEqual(checkPromptVersion(draftedWith("CLAUDE", "1.11.0"), known), []);
  assert.deepEqual(checkPromptVersion(draftedWith("CLAUDE", "1.0.0"), known), [], "an older version is how an old record stays readable");
  assert.deepEqual(checkPromptVersion(draftedWith("PERSON"), known), [], "a person followed no prompt");
  assert.match(checkPromptVersion(draftedWith("CLAUDE"), known).join(" "), /promptVersion is required for a file drafted with CLAUDE/u);
});

test("a version this repository cannot show is refused, future versions included", () => {
  const known = ["1.0.0", "1.11.0"];
  assert.match(
    checkPromptVersion(draftedWith("CLAUDE", "1.5.0"), known).join(" "),
    /is not a version this repository keeps \(1.0.0, 1.11.0\)/u,
    "a version nobody can read is as unusable as none at all",
  );
  assert.match(checkPromptVersion(draftedWith("CLAUDE", "2.0.0"), known).join(" "), /not a version this repository keeps/u);
});

test("versions compare as numbers, not as text", () => {
  assert.ok(compareVersions("1.10.0", "1.9.0") > 0, "1.10.0 comes after 1.9.0, which string order gets backwards");
  assert.ok(compareVersions("1.6.1", "1.6.0") > 0);
  assert.equal(compareVersions("1.11.0", "1.11.0"), 0);
});
