/**
 * The site's own ordering: what somebody came to sort out, not what kind of thing the data model says a
 * record is.
 *
 * A visitor who knows the phrase "banco de tierras" finds it either way. A visitor who only knows "quiero
 * dejarle la explotación a mi hija" or "necesito tierra para empezar" has to translate their situation
 * into institutional vocabulary before they can even choose a heading — and "Succession service", "Policy
 * framework" and "Land bank" are not how anybody describes their own need out loud.
 *
 * These stable groups also supply the record index's situation metadata. They are not a taxonomy:
 * the topic chooser can expose a kind directly. Advice stays distinct from training and now has its
 * own primary entry, without changing the existing index grouping or mixing courses with guidance.
 */
import type { Resource } from "../../../src/types/edition.ts";

export type Goal = { id: string; kinds: ReadonlyArray<Resource["kind"]> };

export const GOALS = [
  { id: "handover", kinds: ["SUCCESSION_SERVICE"] },
  { id: "land", kinds: ["LAND_BANK"] },
  { id: "money", kinds: ["FINANCIAL_SUPPORT"] },
  { id: "learn", kinds: ["TRAINING"] },
  { id: "context", kinds: ["ADVICE", "POLICY", "NETWORK", "OFFICIAL_PORTAL", "OTHER"] },
] as const satisfies readonly Goal[];

export type GoalId = (typeof GOALS)[number]["id"];

const KIND_GOAL = new Map(GOALS.flatMap((goal) => goal.kinds.map((kind) => [kind, goal.id] as const)));

/** Which situation a record answers. Every kind the schema allows is in exactly one, and a test says so. */
export const goalOf = (kind: Resource["kind"]): GoalId => {
  const goal = KIND_GOAL.get(kind);
  if (goal === undefined) throw new Error(`no situation covers the record kind ${kind}: add it to goals.ts before publishing one`);
  return goal;
};
