import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { ROOT } from "../src/paths.ts";

/**
 * What GitHub Actions is allowed to do here.
 *
 * Two different things are at stake and they pull in opposite directions. A contributor who offers a
 * correction has to find out from the repository whether it holds, and waiting for the maintainer to
 * run the gate on their own machine is how an open repository stops being one. But minutes are free
 * only while a repository is public: while it is private they come out of a monthly allowance, and a
 * run per push would spend the month proving what the push hook had just proved.
 *
 * So a workflow that reacts to an event runs its jobs only where the minutes are free, and the one that
 * publishes reacts to nothing at all — an edition reaches readers because somebody decided it should.
 *
 * `AGENTS.md` says this in a sentence; this is the part of it a file can be wrong about.
 */
const WORKFLOWS = path.join(ROOT, ".github", "workflows");

const workflows = existsSync(WORKFLOWS)
  ? readdirSync(WORKFLOWS)
      .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
      .map((name) => ({ name, text: readFileSync(path.join(WORKFLOWS, name), "utf8") }))
  : [];

/** The triggers a workflow declares, read off the `on:` block rather than parsed. */
function triggersOf(text: string): string[] {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.startsWith("on:"));
  if (start === -1) return [];
  const after = lines.slice(start + 1);
  const end = after.findIndex((line) => /^[A-Za-z]/u.test(line));
  const block = (end === -1 ? after : after.slice(0, end)).filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));
  return block.filter((line) => /^\s{2}\S/u.test(line)).map((line) => line.trim().replace(/:.*$/u, ""));
}

/** A workflow that publishes, which is the one that asks for the right to write Pages. */
const publishes = ({ text }: { text: string }): boolean => /pages:\s*write/u.test(text) || text.includes("deploy-pages");

test("there are workflows to check, so an empty run cannot pass as a clean one", () => {
  assert.ok(workflows.length > 0, "no workflow in .github/workflows: this check proved nothing");
});

test("a workflow can always be started by hand", () => {
  for (const { name, text } of workflows) {
    assert.ok(
      triggersOf(text).includes("workflow_dispatch"),
      `${name} can only be started by an event; a maintainer has to be able to run it against a branch nobody trusts, so keep workflow_dispatch`,
    );
  }
});

test("what publishes the site reacts to nothing", () => {
  for (const workflow of workflows.filter(publishes)) {
    assert.deepEqual(
      triggersOf(workflow.text),
      ["workflow_dispatch"],
      `${workflow.name} publishes the site and would also run on ${triggersOf(workflow.text).join(", ")}; an edition reaches readers because somebody decided it should, not because a merge happened`,
    );
  }
});

test("a workflow that reacts to an event spends nothing while the repository is private", () => {
  for (const { name, text } of workflows) {
    const automatic = triggersOf(text).filter((trigger) => trigger !== "workflow_dispatch");
    if (automatic.length === 0) continue;
    assert.ok(
      text.includes("github.event.repository.visibility == 'public'"),
      `${name} runs on ${automatic.join(", ")} without asking whether the minutes are free; gate its jobs on the repository being public, where GitHub-hosted minutes are unlimited, so a private month is never spent on what the push hook already proved`,
    );
    assert.ok(
      !automatic.includes("pull_request_target"),
      `${name} uses pull_request_target, which runs a fork's code with this repository's secrets and a writable token; pull_request runs the same code with neither`,
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
        `${name} runs ${action}: name a released version, because a branch is whatever somebody pushed to it this morning and these workflows build and publish the site`,
      );
    }
  }
});
