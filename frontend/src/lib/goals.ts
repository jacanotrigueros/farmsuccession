/**
 * The site's own ordering: what somebody came to sort out, not what kind of thing the data model says a
 * record is.
 *
 * A visitor who knows the phrase "banco de tierras" finds it either way. A visitor who only knows "quiero
 * dejarle la explotación a mi hija" or "necesito tierra para empezar" has to translate their situation
 * into institutional vocabulary before they can even choose a heading — and "Succession service", "Policy
 * framework" and "Land bank" are not how anybody describes their own need out loud.
 *
 * So the sections of a territory page are these, and the record's kind stays on the record as a tag. The
 * mapping is deliberate and not a taxonomy: one situation can be answered by two kinds, and the last group
 * is everything that is context rather than something to apply for.
 */
import type { Resource } from "../../../src/types/edition.ts";

export type Goal = { id: string; kinds: ReadonlyArray<Resource["kind"]> };

export const GOALS = [
  { id: "land", kinds: ["LAND_BANK"] },
  { id: "handover", kinds: ["SUCCESSION_SERVICE"] },
  { id: "money", kinds: ["FINANCIAL_SUPPORT"] },
  { id: "learn", kinds: ["TRAINING", "ADVICE"] },
  { id: "context", kinds: ["POLICY", "NETWORK", "OFFICIAL_PORTAL", "OTHER"] },
] as const satisfies readonly Goal[];

export type GoalId = (typeof GOALS)[number]["id"];

const KIND_GOAL = new Map(GOALS.flatMap((goal) => goal.kinds.map((kind) => [kind, goal.id] as const)));

/** Which situation a record answers. Every kind the schema allows is in exactly one, and a test says so. */
export const goalOf = (kind: Resource["kind"]): GoalId => {
  const goal = KIND_GOAL.get(kind);
  if (goal === undefined) throw new Error(`no situation covers the record kind ${kind}: add it to goals.ts before publishing one`);
  return goal;
};
