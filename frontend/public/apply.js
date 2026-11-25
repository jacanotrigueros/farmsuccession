/**
 * The answer to "can I apply now?" on a record page.
 *
 * The rule below is pure, and it runs three times over the same inputs: when the page is built, in the
 * tests, and in the reader's browser. The build can only answer for the day it runs, and a static page
 * stays published after a documented opening or closing date has passed — so the block is answered again
 * for the reader's own day, from the dates the sources gave. Nothing is re-consulted, and the date the
 * call was checked never moves: it is printed beside the answer, because that is what the answer rests on.
 *
 * Only documented dates are used. Past a documented closing date the answer is no. Inside the documented
 * period of a call that was last seen as upcoming, the answer is "open according to the dates published",
 * which is a claim about the source and not about the counter at the other end. A call that should have
 * opened but publishes no closing date cannot be confirmed, and says so.
 *
 * A record that is operating and documents no call gets no block at all: how to reach it is on the page,
 * and inventing a yes or a no there would claim more than the sources show.
 */

/** @typedef {"open"|"openByDates"|"upcoming"|"closed"|"deadlinePassed"|"shouldBeOpen"|"noDates"|"announced"|"historical"|"unconfirmed"} ApplyKey */

/** How certain each answer is, which is what the icon and the border say without words. */
export const APPLY_TONE = {
  open: "yes",
  openByDates: "yes",
  upcoming: "wait",
  closed: "no",
  deadlinePassed: "no",
  shouldBeOpen: "unsure",
  noDates: "unsure",
  announced: "no",
  historical: "no",
  unconfirmed: "unsure",
};

/**
 * Where an answer stands among the answers of one record: a period a reader can apply through comes first,
 * then one that is about to open, then one whose dates nobody published, then the closed ones, then a
 * record that does not operate. Ties keep the order of the file (decisions/042, amending 029).
 */
export const APPLY_RANK = {
  open: 0,
  openByDates: 0,
  upcoming: 1,
  shouldBeOpen: 1,
  noDates: 2,
  unconfirmed: 2,
  closed: 3,
  deadlinePassed: 3,
  announced: 4,
  historical: 4,
};

/**
 * @param {{ state: string, opens?: string, closes?: string } | undefined} call one documented application period
 * @param {string} status the record's own status
 * @param {string} today an ISO day
 * @returns {ApplyKey | undefined} nothing for an operating record with no documented call
 */
export function applyKey(call, status, today) {
  if (call) {
    const { state, opens, closes } = call;
    if (state === "CLOSED") return "closed";
    if (state === "NOT_PUBLISHED") return "noDates";
    if (closes && closes < today) return "deadlinePassed";
    if (state === "OPEN") return "open";
    if (opens && opens <= today) return closes ? "openByDates" : "shouldBeOpen";
    return "upcoming";
  }
  if (status === "ANNOUNCED_NOT_OPERATING") return "announced";
  if (status === "HISTORICAL") return "historical";
  if (status === "UNKNOWN") return "unconfirmed";
  return undefined;
}

/** The same evidence accompanies a documented period on its record and in search results.
 * @param {import("../../src/types/edition.ts").Resource} resource
 */
export function documentedPeriods(resource) {
  return (resource.calls ?? []).map((call) => {
    const checked = resource.sources.find(({ url }) => url === call.sourceUrl)?.consultedOn;
    if (!checked) throw new Error(`${resource.id}: the application period "${call.name}" has no consulted source`);
    return { call, checked };
  });
}

/**
 * @param {{ call: { name: string, state: string, opens?: string, closes?: string }, checked: string }[]} periods
 * @param {string} today
 */
export function rankedPeriods(periods, today) {
  return periods
    .flatMap((period) => {
      const key = applyKey(period.call, "", today);
      return key ? [{ ...period, key }] : [];
    })
    .toSorted((a, b) => APPLY_RANK[a.key] - APPLY_RANK[b.key]);
}

/** The reader's own calendar day, which is what the documented dates are compared against. */
export function localToday(now = new Date()) {
  /** @param {number} number */
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Every named period carries its own call and answers. Refresh each one independently; nothing is
// hidden, and the open periods move first on the reader's day as they did on the build's (decisions/042).
if (typeof document !== "undefined") {
  const today = localToday();
  /** @type {Map<Element, { block: HTMLElement, rank: number, position: number }[]>} */
  const groups = new Map();
  for (const [position, block] of document.querySelectorAll("section.apply[data-apply-answers]").entries()) {
    if (!(block instanceof HTMLElement)) continue;
    const call = block.dataset.applyCall ? JSON.parse(block.dataset.applyCall) : undefined;
    const key = applyKey(call, block.dataset.applyStatus ?? "", today);
    const answer = key && JSON.parse(block.dataset.applyAnswers ?? "{}")[key];
    const text = block.querySelector("[data-apply-text]");
    const detail = block.querySelector("[data-apply-detail]");
    if (!answer || !text || !(detail instanceof HTMLElement)) continue;
    block.dataset.tone = APPLY_TONE[key];
    text.textContent = answer.text;
    detail.textContent = answer.detail ?? "";
    detail.hidden = !answer.detail;
    const parent = block.parentElement;
    if (parent) groups.set(parent, [...(groups.get(parent) ?? []), { block, rank: APPLY_RANK[key], position }]);
  }
  for (const [parent, blocks] of groups) {
    if (blocks.length < 2) continue;
    const ordered = blocks.toSorted((a, b) => a.rank - b.rank || a.position - b.position);
    if (ordered.some((entry, index) => entry !== blocks[index])) parent.append(...ordered.map(({ block }) => block));
  }
}
