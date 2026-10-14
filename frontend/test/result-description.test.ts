import assert from "node:assert/strict";
import { test } from "node:test";

import { resultDescription } from "../public/result-description.js";

const result = {
  meta: { summary: "Access to documented land offers." },
  excerpt: "Land bankActive A title · A territory · An operator ... <mark>land</mark> offers",
};

test("browsing uses the record summary rather than repeated index chrome", () => {
  for (const term of ["", " ", "\t"]) {
    assert.deepEqual(
      resultDescription(result, term),
      { format: "text", value: result.meta.summary },
      "an empty query has no text match to explain: show what the record offers, not its tags and repeated title",
    );
  }
});

test("a text query keeps the contextual excerpt and its match markup", () => {
  assert.deepEqual(
    resultDescription(result, "land"),
    { format: "html", value: result.excerpt },
    "a reader who typed words needs to see where those words matched",
  );
});

test("a browsing summary remains literal source prose rather than executable markup", () => {
  const summary = "A & B <district>";
  assert.deepEqual(
    resultDescription({ ...result, meta: { summary } }, ""),
    { format: "text", value: summary },
    "metadata summaries must be assigned as text, even when they contain angle brackets or ampersands",
  );
});

test("missing summary metadata does not silently bring back the browsing excerpt", () => {
  assert.deepEqual(
    resultDescription({ excerpt: result.excerpt }, ""),
    { format: "text", value: "" },
    "an absent summary must stay absent rather than repeating unrelated index text",
  );
});
