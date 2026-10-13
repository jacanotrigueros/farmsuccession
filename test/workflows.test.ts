import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

/**
 * What GitHub Actions is allowed to do here: whatever somebody starts, and nothing else.
 *
 * The allowance is free only while a repository is public and comes out of a monthly budget while it
 * is not, and this project's gate runs before every commit and every push on the maintainer's own
 * machine. A workflow that starts itself would spend that budget proving what has already been proved,
 * and the one workflow that publishes would be deciding on its own that today's data is what the public
 * should read. Both are decisions a person makes.
 *
 * `AGENTS.md` says the same thing in a sentence; this is the part of it a file can be wrong about.
 */
const WORKFLOWS = path.join(ROOT, ".github", "workflows");

const workflows = existsSync(WORKFLOWS)
  ? readdirSync(WORKFLOWS)
      .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
      .map((name) => ({ name, text: readFileSync(path.join(WORKFLOWS, name), "utf8") }))
  : [];

test("there are workflows to check, so an empty run cannot pass as a clean one", () => {
  assert.ok(workflows.length > 0, "no workflow in .github/workflows: this check proved nothing");
});

test("a workflow runs because somebody started it, never because something happened", () => {
  for (const { name, text } of workflows) {
    const lines = text.split("\n");
    const start = lines.findIndex((line) => line.startsWith("on:"));
    assert.notEqual(start, -1, `${name} declares no triggers at all`);
    const after = lines.slice(start + 1);
    const end = after.findIndex((line) => /^[A-Za-z]/u.test(line));
    const block = (end === -1 ? after : after.slice(0, end)).filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));
    const triggers = block.filter((line) => /^\s{2}\S/u.test(line)).map((line) => line.trim().replace(/:.*$/u, ""));
    assert.deepEqual(
      triggers,
      ["workflow_dispatch"],
      `${name} would run on ${triggers.join(", ") || "nothing"}; the minutes are a monthly budget and publishing is a decision, so a workflow here is started by hand`,
    );
    assert.ok(
      /^on:\s*$/u.test(lines[start] ?? ""),
      `${name} declares its triggers inline; write them under on: so they can be read one by one`,
    );
  }
});

test("a workflow says what it is allowed to touch", () => {
  for (const { name, text } of workflows) {
    assert.match(
      text,
      /^permissions:/mu,
      `${name} inherits whatever the repository grants a token by default; say what this workflow needs, so a step that is compromised can do no more than that`,
    );
  }
});

test("a workflow names the version of everything it runs", () => {
  for (const { name, text } of workflows) {
    for (const [, action] of text.matchAll(/^\s*(?:- )?uses:\s*(\S+)/gmu)) {
      const [, version] = /@(.+)$/u.exec(action ?? "") ?? [];
      assert.ok(
        version !== undefined && /^v\d/u.test(version),
        `${name} runs ${action}: name a released version, because a branch is whatever somebody pushed to it this morning and this workflow publishes the site`,
      );
    }
  }
});
