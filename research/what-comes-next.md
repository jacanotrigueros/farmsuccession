# What comes next, and why that order

**15 October 2026**, the day after the site reached readers. A plan written to be
checked against later rather than to be agreed with now: every number in it is
reproducible, and the last section says what would make it wrong.

It was drafted once, read adversarially, and rewritten. Three things the first
draft said were false — two of its own figures and one citation — and they are
corrected here rather than quietly dropped, because a plan that hides its first
version teaches nothing about how it was reached.

## The premises, and which of them are evidence

Four are written into this repository and hold:

- The core value is evidence. Every claim traces to a public page, quoted word
  for word, dated by the day somebody read it.
- One maintainer, near-zero running cost, a static site with no cookies, no
  analytics and no third-party request.
- Publication is a deliberate act, never a consequence of merging.
- The scarce resource is not code, it is the research pass. 319 records exist
  because somebody read 492 pages and copied 1,546 quotes from them.

Two are hypotheses the site is designed around and **nobody has observed**:

- That the readers are people facing a succession or trying to start farming —
  often older, often on a phone, often on a rural connection.
- That what they come for is whether something exists where they live, whether
  they can still apply, and where to go.

Both are reasonable and the design follows from them. Neither is a finding. The
first milestone below exists because of that, and the order of the rest depends
on them being true.

## Where it stands, measured

As corrected on 18 October, 318 records: ES 127, FR 72, IT 62, DE 36, PT 17, and 4 on the European layer.
By kind: 100 financial support, 71 land banks, 66 advice, 39 training, 29
succession services, 7 policy, 3 official portals, 2 networks, 1 other.

One edition, 2026, over 101 files, 92 of them regions. 426 pages live at
farmsuccession.eu since 14 October. The committed series has observed 504 URLs,
of which 496 are still cited: 362 have always passed, 106 have mixed readings,
and 28 have never given a successful reading. Of the 106 mixed histories only 10
include a FAIL; the other 96 combine PASS and UNCHECKED, which is not a failure.
232 repository tests and 84 frontend tests, none of which drives a browser.

Reproduce the first paragraph from the repository root with Node.js 24:

```bash
node --input-type=module <<'JS'
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
const count = {};
function walk(dir, label) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, entry.name.length === 2 ? entry.name : label);
    else if (entry.name.endsWith('.json')) {
      const snapshot = JSON.parse(readFileSync(file, 'utf8'));
      const key = (label ?? entry.name.replace('.json', '')).toUpperCase();
      count[key] = (count[key] ?? 0) + (snapshot.resources?.length ?? 0);
    }
  }
}
walk('data/editions/2026', null);
console.log(count, Object.values(count).reduce((a, b) => a + b, 0));
JS
```

**17 October 2026 correction:** the mixed histories above were previously called
"both passed and failed". That conflated an UNCHECKED attempt with a FAIL. The
report now separates those outcomes without changing decision 025's verdicts. The
92 regions were also previously described as 92 territory files; the edition has
101 files when its European, country and grouping layers are included.

The series figures come from `npm run report:sources`, which reads
`reports/checks/` and reaches nothing over the network.

## The order

**Observe, then correct what is wrong now, then stop it breaking, then keep the
promise, then make the edition citable, then make a second one.**

Growth comes last on purpose. Every one of the later milestones multiplies work
already done rather than asking for another research pass, which is the only
thing this project cannot buy more of.

---

## M0 — Find out who actually arrives

The whole order below is priced for a reader nobody has met. The site has no
analytics by design and will not get any, so there is exactly one signal
available: the queries Search Console records, which say what somebody typed into
a search engine before arriving. "Ayudas incorporación joven agricultor
Andalucía" and "edad media agricultores España" are two different audiences and
they justify two different plans.

This costs no work, only waiting. The property was verified on 14 October and
reporting lags by two to three days.

**Done when** there are enough recorded queries to say which of the two
hypotheses above is closer to true, and this document has been revised against
them — including, if the answer is uncomfortable, the order of everything below.

**First reading, 17 October 2026:** [`audience-2026.md`](audience-2026.md). One
day, 110 impressions, two arrivals, 67 queries, and not one of them asking for a
statistic or an overview. It is the first evidence for the practical reader and
none at all for volume, so the order below stands for now and the next reading
decides whether it keeps standing.

## M13 — What the site says is true

Three findings from an outside review of the published site are open, and one
misleads a reader today: a task card reports "0 resources" on a page that lists
resources for that task. Madrid, "traspasar mi explotación", with a grant for
retirement and transfer printed further down the same page. Also: the badge says
"verified" while a record notice says no person has reviewed it, and a count at
the point of choice does not separate a documented reference from an available
service — a distinction [019](../decisions/019-a-period-is-what-a-page-said-on-a-day.md)
makes for application periods and the counts do not.

**Done when** no task card reports zero where records exist; the badge says what
the project actually does, in all six languages; and a count that leads a reader
into a list says what kind of thing they will find there.

## M14bis — The interface reads like its language

Six language surfaces, and a large block of new strings for the correction form.
The build guarantees that a translation exists, that no internal code reaches a
reader, that formats and types are right. It cannot guarantee that a German
reader would put it that way. A string that misleads about availability costs
more trust, faster, than a missing second edition.

This is deliberately small. Not every string: the ones that carry a decision —
availability, the call to apply, states, filters, the situations a reader picks
from, the correction form, and anything that says what the evidence is worth.

**Done when** each of those has been read in its own language rather than
checked for existence, and what was changed is recorded with the reason.

## M15 — It cannot break without somebody noticing

No regression drives a browser. The search switched its own search box off on
every search page, in every language, while 42 tests passed; the same week, a
page that did not compile and an incorrect new test both reached a pull request.
Markup assertions cannot see any of it.

**Done when** a browser smoke test covers search, filters, pagination, the
application answer and the correction form, in Chromium, with the keyboard where
a keyboard is how you use it, and it runs in the pull request's own check job.
Not a matrix of browsers. One that fails when a control stops working.

## M14 — The promise stops rotting quietly

106 of the 496 pages still cited have not passed on every attempt: 10 carry a
real FAIL and 96 combine PASS and UNCHECKED. Another 28 have never given a
successful reading. A dead link announces itself; a page that quietly stopped
carrying the sentence quoted from it does not.
[025](../decisions/025-a-source-is-gone-when-the-series-says-so.md) makes it
harder to see: "a page that passes once is FLAKY rather than broken, however
often it fails afterwards". The evidence that settled 025 supports something
narrower — that one reading cannot condemn a page — and not that one old success
protects against a hundred later failures. The last PASS has to count for
something, and how much is a question for the ledger rather than for taste.

025 was measured rather than argued, and it survived:
[035](../decisions/035-a-measurement-defends-025.md). Letting failures after the
last success condemn a page would move nothing in the committed series, and
`npm run measure:recency` is now the command that says when to look again.

**Done when** every page the data still cites has either given a reading or been
classified, by hand, as a host that declines automation; and the cadence for
re-reading is written down instead of improvised.

**Not** "fewer than ten never read". If seventeen of them are ministries that
refuse robots, going from seventeen to nine makes the corpus no better.

## M17 — The edition becomes something others can cite

101 JSON files with stable ids, sources, literal quotes, consultation dates and a
licence, already tagged and released. Turning that into an edition somebody
outside can retrieve exactly, by name, is nearly free and changes what the
project is: from a site people visit into a source other people link to.

It also makes the milestone after it mean more. "Changed since the previous
edition" is a weak claim if the previous edition is not an object anyone can
fetch.

**Done when** an outsider can cite the 2026 edition, fetch exactly those bytes
from a stable address, verify them against a published checksum, and read one
page that tells them how.

## M16 — A second edition, and the proof that the method repeats

The strongest thing about this corpus is not that it will have two editions. It
is that a claim is joined to the page that carried it, to the sentence that said
so, and to the day somebody read it — and that the same work can be done again.
A second edition is the first serious evidence that the last part is true.

Be careful what it puts on a page. A farmer asking whether there is anything for
them in Madrid does not want to be told first that three resources changed since 2026. The history serves a researcher, a journalist, an administration, an
auditor: the secondary audience by this document's own premises.

**Done when** every record in the new edition has been read again under the
process of the day, or carries the evidence of why it needed no new claim;
additions, removals and changes follow deterministically from stable ids; no
difference is presented as a cause; and an edition is a dated editorial decision
rather than whatever the check ledger happened to say that week.

## Coverage, which is not a milestone

The first draft of this plan asked for succession services to double and for
Portugal and Germany to pass a hundred records each. That was wrong, and it is
worth saying why: a quota makes somebody find forty things because forty were
asked for, and this repository's rule is that looking and not finding is a
result. The research briefs already record absences that were searched for.
Portugal holding 17 records may be a finding about Portugal.

What replaces it is a question rather than a target: **are there demonstrable
gaps in what was searched for?** The unit is territory × expected instrument,
which the briefs already use. Repeat the search for succession and handover
specifically; add what turns up, whether that is twenty-five records or three.
If it is three, the corpus was right and the proportion of 100 financial supports
to 29 succession services describes the public record rather than the pass.

## What would make this plan wrong

- M0 showing that the readers are overwhelmingly researchers and journalists.
  Then M16 and M17 move ahead of M13's task cards, and the case for depth in
  succession weakens.
- The ledger showing, when 025 is measured, that recency changes almost nothing.
  Then M14 shrinks to a documentation fix.
- A browser smoke test proving cheap to write and catching nothing in six months.
  Then it was insurance, not a milestone, and should be said so.
- Somebody citing the 2026 edition before M17 is done, which would mean the
  dataset is already usable and the work is documentation only.
