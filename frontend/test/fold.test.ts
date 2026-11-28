import assert from "node:assert/strict";
import { test } from "node:test";

import { revealTarget } from "../public/fold.js";

/** A heading inside a fold that sits inside another fold, both closed. */
function nested() {
  const outer = { open: false, parentElement: null, closest: () => null };
  const inner = { open: false, parentElement: { closest: (s: string) => (s === "details" ? outer : null) } };
  const summary = {
    focused: false,
    focus() {
      this.focused = true;
    },
  };
  const heading = { closest: (s: string) => (s === "details" ? inner : s === "summary" ? summary : null) };
  return { outer, inner, summary, heading };
}

test("following a link to a folded heading opens every fold around it and focuses its control (Sol, 28 Nov 2026)", () => {
  const { outer, inner, summary, heading } = nested();
  assert.equal(revealTarget(heading), summary);
  assert.equal(inner.open, true);
  assert.equal(outer.open, true);
});

test("a link to nothing changes nothing", () => {
  assert.equal(revealTarget(null), null);
});
