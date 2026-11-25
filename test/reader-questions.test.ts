import assert from "node:assert/strict";
import { test } from "node:test";
import { questionsOf } from "../src/reader-questions.ts";
import { fakeResource } from "./fixtures.ts";

const page = "https://example.test/land-bank";

test("an aid leaves a reader's question open until it answers it or says the source does not", () => {
  const aid = fakeResource({ kind: "FINANCIAL_SUPPORT", whoCanUseIt: "Farmers under 41.", howToAccess: "Apply online." });
  assert.deepEqual(
    questionsOf(aid).open,
    ["AMOUNT_PER_BENEFICIARY", "CALL_DATES", "CONTACT_CHANNEL"],
    "an aid that says nothing of money, dates or contact helps no one decide",
  );
  const checked = fakeResource({
    ...aid,
    calls: [{ name: "2026 call", state: "NOT_PUBLISHED", sourceUrl: page }],
    notPublished: [
      { question: "AMOUNT_PER_BENEFICIARY", sourceUrl: page },
      { question: "CONTACT_CHANNEL", sourceUrl: page },
    ],
  });
  assert.deepEqual(questionsOf(checked).open, [], "a source read and found silent is an answer the reader can act on");
  assert.equal(questionsOf(checked).answers.AMOUNT_PER_BENEFICIARY, "NOT_PUBLISHED");
});

test("each kind asks its own questions", () => {
  const portal = fakeResource({ kind: "OFFICIAL_PORTAL", howToAccess: "Search the portal by region." });
  assert.deepEqual(questionsOf(portal).open, []);
  const training = fakeResource({ kind: "TRAINING", whoCanUseIt: "New entrants.", howToAccess: "Enrol online.", accessCostType: "FREE" });
  assert.deepEqual(questionsOf(training).open, ["TRAINING_FORMAT"]);
});
