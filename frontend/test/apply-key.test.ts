import assert from "node:assert/strict";
import { test } from "node:test";

import { applyKey } from "../public/apply.js";

type Period = { name: string; state: string; opens?: string; closes?: string };

const answers = (calls: readonly Period[], day: string) => calls.map((call) => applyKey(call, "ACTIVE", day));

test("a closed older call does not answer for the next documented window", () => {
  const calls = [
    { name: "Earlier call", state: "CLOSED", closes: "2025-12-19" },
    { name: "Next call", state: "UPCOMING", opens: "2026-10-01", closes: "2026-11-30" },
  ];
  for (const [day, expected] of [
    ["2026-09-30", ["closed", "upcoming"]],
    ["2026-10-01", ["closed", "openByDates"]],
    ["2026-11-30", ["closed", "openByDates"]],
    ["2026-12-01", ["closed", "deadlinePassed"]],
  ] as const) {
    assert.deepEqual(answers(calls, day), expected, `${day}: the earlier closed call must not replace the next call's answer`);
  }
});

test("two open procedures keep separate answers when one deadline passes", () => {
  const calls = [
    { name: "Register a holding", state: "OPEN", closes: "2026-11-03" },
    { name: "Request access", state: "OPEN" },
  ];
  assert.deepEqual(answers(calls, "2026-11-03"), ["open", "open"], "the documented closing day is still inside its period");
  assert.deepEqual(
    answers(calls, "2026-11-04"),
    ["deadlinePassed", "open"],
    "one procedure's deadline must not close another procedure with no documented deadline",
  );
  const undated = calls.map(({ name, state }) => ({ name, state }));
  assert.deepEqual(answers(undated, "2026-11-04"), ["open", "open"], "two undated OPEN procedures are still two answers");
});

test("three simultaneous calls cross their own deadlines, in their recorded order", () => {
  const calls = [
    { name: "Large investment", state: "OPEN", opens: "2026-08-17", closes: "2026-11-17" },
    { name: "Medium investment", state: "OPEN", opens: "2026-08-10", closes: "2026-11-10" },
    { name: "Small investment", state: "OPEN", opens: "2026-08-03", closes: "2026-11-03" },
  ];
  for (const [day, expected] of [
    ["2026-11-03", ["open", "open", "open"]],
    ["2026-11-04", ["open", "open", "deadlinePassed"]],
    ["2026-11-10", ["open", "open", "deadlinePassed"]],
    ["2026-11-11", ["open", "deadlinePassed", "deadlinePassed"]],
    ["2026-11-17", ["open", "deadlinePassed", "deadlinePassed"]],
    ["2026-11-18", ["deadlinePassed", "deadlinePassed", "deadlinePassed"]],
  ] as const) {
    assert.deepEqual(answers(calls, day), expected, `${day}: each call has its own closing date, not the first call's`);
  }
});

test("closed calls and calls with no dates keep the state their sources documented", () => {
  const calls = [
    { name: "First period", state: "CLOSED", closes: "2026-02-18" },
    { name: "Second period", state: "CLOSED", closes: "2026-04-27" },
    { name: "Third period", state: "CLOSED", closes: "2026-07-03" },
  ];
  for (const day of ["2026-02-18", "2026-02-19", "2026-04-27", "2026-04-28", "2026-07-03", "2026-07-04"]) {
    assert.deepEqual(answers(calls, day), ["closed", "closed", "closed"], `${day}: a source marked CLOSED is not reopened by the calendar`);
  }
  assert.deepEqual(
    answers(
      [
        { name: "Undated course", state: "CLOSED" },
        { name: "No period published", state: "NOT_PUBLISHED" },
      ],
      "2026-10-15",
    ),
    ["closed", "noDates"],
    "missing dates must not invent an opening or a deadline",
  );
});

test("an open procedure and an upcoming window answer independently", () => {
  const calls = [
    { name: "Without competition", state: "OPEN" },
    { name: "Competitive window", state: "UPCOMING", opens: "2026-11-02", closes: "2026-11-20" },
  ];
  for (const [day, expected] of [
    ["2026-11-01", ["open", "upcoming"]],
    ["2026-11-02", ["open", "openByDates"]],
    ["2026-11-20", ["open", "openByDates"]],
    ["2026-11-21", ["open", "deadlinePassed"]],
  ] as const) {
    assert.deepEqual(answers(calls, day), expected, `${day}: the year-round procedure and the competitive window are different calls`);
  }
});
