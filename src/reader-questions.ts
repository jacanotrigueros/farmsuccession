/**
 * The questions a reader brings to each kind of resource, and whether a record answers them.
 *
 * A record that leaves a reader's question open is, for that reader, the same as no record: they still
 * have to find the official page and read it. A question counts as answered when the record gives the
 * answer, or when it says the source was read and does not publish one (`notPublished`, or a call with
 * state NOT_PUBLISHED for dates): "the official page does not say" is itself an answer a reader can act on.
 */
import type { Resource } from "./types/edition.ts";

export type Question =
  | "WHO_CAN_USE"
  | "HOW_TO_ACCESS"
  | "AMOUNT_PER_BENEFICIARY"
  | "CALL_DATES"
  | "CONTACT_CHANNEL"
  | "ACCESS_COST"
  | "TRAINING_FORMAT"
  | "LAND_HANDLED"
  | "APPLIED_BY";

/** What a reader of each kind needs before deciding whether to pursue it. */
export const QUESTIONS: Record<Resource["kind"], readonly Question[]> = {
  FINANCIAL_SUPPORT: ["WHO_CAN_USE", "HOW_TO_ACCESS", "AMOUNT_PER_BENEFICIARY", "CALL_DATES", "CONTACT_CHANNEL"],
  LAND_BANK: ["WHO_CAN_USE", "HOW_TO_ACCESS", "LAND_HANDLED", "CONTACT_CHANNEL"],
  SUCCESSION_SERVICE: ["WHO_CAN_USE", "HOW_TO_ACCESS", "ACCESS_COST", "CONTACT_CHANNEL"],
  ADVICE: ["WHO_CAN_USE", "HOW_TO_ACCESS", "ACCESS_COST", "CONTACT_CHANNEL"],
  TRAINING: ["WHO_CAN_USE", "HOW_TO_ACCESS", "TRAINING_FORMAT", "ACCESS_COST"],
  POLICY: ["WHO_CAN_USE", "HOW_TO_ACCESS"],
  OFFICIAL_PORTAL: ["HOW_TO_ACCESS"],
  NETWORK: ["WHO_CAN_USE", "HOW_TO_ACCESS"],
  OTHER: ["WHO_CAN_USE", "HOW_TO_ACCESS"],
};

/** Whether the record itself gives the answer to each question. */
const GIVEN: Record<Question, (resource: Resource, appliedBy: number) => boolean> = {
  WHO_CAN_USE: (resource) => resource.whoCanUseIt !== undefined,
  HOW_TO_ACCESS: (resource) => resource.howToAccess !== undefined,
  AMOUNT_PER_BENEFICIARY: (resource) => (resource.metrics ?? []).some(({ measure }) => /_PER_BENEFICIARY_/u.test(measure)),
  CALL_DATES: (resource) => (resource.calls ?? []).some(({ state }) => state !== "NOT_PUBLISHED"),
  CONTACT_CHANNEL: (resource) => (resource.contactPoints ?? []).length > 0,
  ACCESS_COST: (resource) => resource.accessCostType !== undefined && resource.accessCostType !== "UNKNOWN",
  TRAINING_FORMAT: (resource) => (resource.trainingFormats ?? []).length > 0,
  LAND_HANDLED: (resource) => (resource.assetTypes ?? []).length > 0,
  APPLIED_BY: (_resource, appliedBy) => appliedBy > 0,
};

export type Answer = "ANSWERED" | "NOT_PUBLISHED" | "OPEN";

/** How the record answers one question. `appliedBy` counts the records that say they apply this one. */
export function answerOf(resource: Resource, question: Question, appliedBy = 0): Answer {
  const declared = (resource.notPublished ?? []).some((entry) => entry.question === question);
  const given = GIVEN[question](resource, appliedBy);
  if (given) return "ANSWERED";
  if (declared || (question === "CALL_DATES" && (resource.calls ?? []).some(({ state }) => state === "NOT_PUBLISHED")))
    return "NOT_PUBLISHED";
  return "OPEN";
}

/** Every question of the record's kind with its answer, and the ones still open. */
export function questionsOf(resource: Resource, appliedBy = 0): { answers: Record<string, Answer>; open: Question[] } {
  const answers = Object.fromEntries(QUESTIONS[resource.kind].map((question) => [question, answerOf(resource, question, appliedBy)]));
  return { answers, open: QUESTIONS[resource.kind].filter((question) => answers[question] === "OPEN") };
}
