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

/** The reader's own calendar day, which is what the documented dates are compared against. */
export function localToday(now = new Date()) {
  /** @param {number} number */
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Every named period carries its own call and answers. Refresh each one independently; array order
// never chooses which period the reader gets to hear about (decisions/029).
if (typeof document !== "undefined") {
  const today = localToday();
  for (const block of document.querySelectorAll("section.apply[data-apply-answers]")) {
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
  }
}
