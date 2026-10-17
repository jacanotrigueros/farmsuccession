# 035 — A measurement defends 025, and says when to come back

**18 October 2026.** Letting failures after the last success condemn a page would move
nothing in the committed series. 025 stands, the objection to it is written down with
the measurement that failed to support it, and `npm run measure:recency` is the command
that says when to look again.

## The question

[025](025-a-source-is-gone-when-the-series-says-so.md) says a page that has passed once
is FLAKY rather than GONE, however often it fails afterwards. The objection is obvious
and was written into the plan: one old success should not protect a page forever, and
the last PASS has to count for something.

Should recency change a verdict, and if so by how much? The plan's own answer was that
the question belongs to the ledger rather than to taste — so the first thing to find out
is what any such rule would actually do.

## What the evidence said

The candidate rule was kept deliberately narrow, so that a failure to find anything
could not be blamed on an over-complicated proposal: keep every existing
classification, except that a history with a PASS becomes GONE when actual FAIL
readings land on **two distinct UTC days later than its most recent PASS**. An
UNCHECKED reading neither proves a failure nor resets the clock, which is
[007](007-unchecked-is-a-third-answer.md).

Over the committed series — 91 runs, on 8, 9 and 13 October, 504 URLs observed and
499 still cited:

- **zero pages would move**, among cited pages and among retired ones alike;
- 364 are HEALTHY, 107 FLAKY, 28 UNREACHABLE, none GONE and none NEW;
- and of the 107 FLAKY, only **10 carry a real FAIL**. The other 97 combine PASS with
  UNCHECKED, which is not a mixture of success and failure at all.

Reproduce it from the repository root with Node.js 24:

```bash
npm run measure:recency
```

It reads `reports/checks/` and reaches nothing over the network. It reads each run's
full `checkedAt` rather than a history's day, because two readings of one page on one
day cannot be ordered by a date.

The counterexample that motivates the rule is still real and still reproducible —
PASS on the 8th, 404 on the 9th, 404 on the 13th, which 025 calls FLAKY and the
candidate calls GONE — but it is **synthetic**. It lives in `test/recency.test.ts`,
not in the ledger, and nothing fictional was written to the ledger to manufacture it.
Those tests also exist so that "zero" means zero: a measurement that has never been
shown finding something is indistinguishable from a broken one.

## The decision

1. **025 stands.** A rule adopted on three days of evidence, to fix nothing that has
   happened, is a rule nobody can defend later.
2. **The objection is kept, not dropped.** It is in
   [`research/memos/M14-recency.md`](../research/memos/M14-recency.md) with its costs
   on both sides, so the next person starts from the measurement.
3. **`npm run measure:recency` is the trigger.** The day it reports a cited page with
   two answered failure days after its last PASS, this decision is reopened with a real
   case in hand.
4. **A count of network refusals never argues either side.** 97 of the 107 mixed
   histories are UNCHECKED, and quoting 107 as failures — which the plan did until
   today — overstates the problem by a factor of ten.

## What it costs

A page that genuinely died after an old success stays labelled FLAKY until somebody
opens it. That is the known hole, and it is not closed here.

The 28 pages that have never given a successful reading are untouched by all of this.
They still need classifying by hand as hosts that decline automation or as citations
that are actually broken, and no bulk re-reading was done.

Three days of readings cannot price a window of seven days, or thirty, or ninety. Any
rule with a threshold in it would be choosing that number by feel, which is the thing
this project does not do.

## What would overturn it

An actual cited URL with two answered failure days after its last PASS — the command
above names it.

Or a loss verified by hand that the current label hid: a page whose quote is gone,
which the series still calls FLAKY because it answered once in October.

Either way the rule that replaces this one has to be measured against the full
observations rather than argued from the shape of the hole, and opening a public
source and correcting a record stays a person's decision —
[015](015-a-record-whose-source-dies.md).
