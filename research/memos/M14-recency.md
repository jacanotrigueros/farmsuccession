# M14 — Measure before replacing 025

17 October 2026; develop 88fc645. The committed ledger contains 91 runs on three UTC
days: 8, 9 and 13 October. It has observed 504 URLs; 499 are still cited. Current
verdicts are 364 HEALTHY, 107 FLAKY, 28 UNREACHABLE, zero GONE and zero NEW. Among the
107 current FLAKY histories, 10 have an actual FAIL and 97 have PASS plus UNCHECKED
only. The plan's description of all 107 as having failed was false. A report patch
corrects that explanation and exposes the two counts; it changes no verdict.

Reproduce from the repository root with Node 24 using the accompanying
measure-ledger.ts and the production readRuns/historyOf/collectSourceChecks functions.
The output ledger-measurement.json retains the counts and any affected histories.
The script reads the committed series; it makes no network request and writes no ledger.

The candidate rule measured was deliberately narrow: keep the existing classifications,
except that a history with a PASS could become GONE after actual FAIL readings on two
distinct UTC dates later than its most recent PASS. An UNCHECKED reading neither proves
failure nor supplies a successful reset. Full checkedAt timestamps establish which
readings came after the last success; a date slice alone cannot order same-day events.

Affected today: **zero URLs**, both among currently cited pages and the complete series.
There is no committed real sequence here that demonstrates the proposed change doing
useful work. That directly activates the plan's own “recency changes almost nothing”
condition. The stronger prior argument cannot be presented as a measured current harm.

The logical counterexample remains reproducible but synthetic: PASS on 8 October,
FAIL/404 on 9 October, FAIL/404 on 13 October. Current historyOf returns FLAKY; the
candidate rule would return GONE. It illustrates the permanent-immunity property of
025, not an observed source in this corpus. No fictional result was written to the ledger.

Options and costs:

- Retain 025 and improve the explanation now. No existing verdict changes, no retrospective
  policy over three days' evidence. Cost: a future persistent failure can still be masked
  by an old success until the policy is revisited.
- Adopt the two-post-PASS-failure-days rule now. It preserves the current two-day safeguard
  and UNCHECKED distinction, and handles the synthetic counterexample. Cost: no measured
  gain today; it can label an intermittently failing source GONE and prompt unnecessary
  human investigation or a mistaken UNKNOWN correction. It must never edit a record itself.
- Add a recency window or run ratio. Extra thresholds need evidence. Three observed days
  do not price an arbitrary seven-, thirty- or ninety-day window, and no quota justifies one.

Recommendation: retain 025 for now, ship the factual report/plan correction, and revisit
when a real post-success failure sequence appears. In either direction, opening the
public source remains a person's decision: false GONE can turn good evidence into an
unnecessary withdrawal, while false FLAKY can leave a lost citation looking temporary.
A count of network refusals must not be used to argue either side as if they were failures.

The 28 never-successful pages still need individual browser classification or a new
research pass. No bulk live re-reading was done here, so no host is newly certified as
refusing automation and no frozen source/status was changed. A re-reading cadence also
remains a maintainer choice; this memo does not silently schedule or publish checks.

What would overturn the recommendation: actual cited URLs with two answered-failure
dates after their last PASS, or independently verified losses that the current label
hid. Keep the full observations and compare both rules before choosing a new threshold.
