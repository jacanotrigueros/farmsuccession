# 026 — A reading says which territory it was about, not which command took it

**2026-10-09.** Every result in `reports/checks/` records the territories whose records
cite that page, and `npm run report:sources` reports the series territory by territory,
against what each territory cites today.

## The question

[`decisions/025`](025-a-source-is-gone-when-the-series-says-so.md) settled that a verdict
about a source belongs to the series rather than to the run in front of you. It left open
the question of who a verdict belongs _to_.

A run already recorded what it covered: `fr/corse`, `it/veneto`, or `all` for a sweep of
the whole edition. That looks like enough. Both answers are defensible: the scope is what
the operator asked for, it is already in the file name, and a per-territory run is one
command away — so if the detail is wanted, run the detail.

## What the evidence said

The series on the morning of 9 October 2026, before this change: **47 runs, 3 of them
sweeps of the whole edition and 44 of one territory each**, covering 502 distinct pages.

Of those 502 pages, **347 — 69% — had only ever been read by a sweep whose scope was
"all"**. For those, the series could say that a page was HEALTHY, FLAKY or GONE and
nothing at all about whose record it was. The 44 per-territory runs named 33 territories
of the 101 in the edition — Italy and Portugal territory by territory, because those two
countries were published that way, plus Corsica and Spain nationally. Germany, France,
the European layer and every Spanish region had been swept three times and attributed
never.

Put as a sentence somebody would act on: **the series could not say how much of Spain's
evidence had been read, nor on which day, nor name one Spanish page to go and look at.**
The thing this repository publishes about itself — that every claim traces to a source
that was read again — was true of the corpus and unsayable about any part of it.

Running 101 per-territory checks instead would have produced the same detail. It would
also have written 101 files to record one sweep, and left attribution depending on how
somebody happened to invoke the command that evening — which is exactly how 69% of the
series came to have none. It would not have cost many more requests: only 2 of the 501
pages the corpus cites are cited by more than one territory, so almost nothing would be
fetched twice. The argument against it is not the network. It is that the information was
never missing: `collectSourceChecks` plans each check with the edition files that cite it,
every report carries that list, and the ledger was dropping it on the floor.

The other half of the measurement: **8 of the 101 territories cite no page at all**, because
they document no instrument — Germany and Italy nationally, El Hierro, Formentera,
Fuerteventura, Mayotte, Oeste e Vale do Tejo and Península de Setúbal. Coverage counted
against the ledger alone would have reported those eight as unread on every run for ever,
which is a false alarm that trains somebody to ignore the real ones.

## The decision

1. **Each result records the territories that cite the page**, as territory specs — `eu`,
   `es`, `es/aragon` — derived from the references the check was planned with. Not the
   scope of the run: a sweep of the whole edition now says whose each of its 494 pages is.
2. **A page cited by two territories is counted in both.** Berlin and Brandenburg cite the
   same joint directive; a verdict on that page is a verdict on both records.
3. **Coverage is measured against what the corpus cites today**, read from the edition
   files by the same planner the checks use. The report says `11 of 14 page(s)` for a
   territory and names the three, so a page added after the last sweep shows up as unread
   instead of being invisible until somebody re-runs everything.
4. **A territory that cites nothing is reported as citing nothing**, never as unread.
5. **Nothing already recorded is rewritten.** A reading that was taken is not edited
   afterwards — the rule `recordRun`'s `wx` flag exists for. A run whose results carry no
   attribution is read at its scope when the scope is a single territory, which is the
   right answer for the 44, and counted as unattributed when it is not, which leaves the
   three sweeps of 8 October attributed to nobody for good. The report says how many runs
   that is rather than hiding them.

## What it costs

Each reading carries its territories, which is 30 bytes per result, measured: the sweep
of 9 October is 90 KB for 501 pages — 180 bytes a reading, against 150 for the sweeps of
the day before, which read 360 pages each at 54 KB. About 15 KB of this sweep is
attribution, against a series that is 282 KB in total.

The attribution is frozen at the moment of the reading, so a page that later gets cited
by another territory is attributed to that territory only from the next run onwards. That
is the honest behaviour for a record of what happened, and it is why coverage is counted
against the corpus rather than against the ledger.

Rule 5 means the series contains readings that cannot be grouped, and will for ever. The
alternative was to go back and fill the attribution in from today's data, which would
have recorded as fact something nobody observed: those three sweeps did not know which
file cited what, because the corpus has changed since.

## What the second day found, which is the first thing the series was good for

The sweep of 9 October gave this corpus a second day of readings, and the verdicts moved
for the first time. Fourteen pages had now failed on two different days, and the ledger
called all fourteen GONE — a list somebody would have taken as fourteen records to
rewrite.

Eleven of them were nothing of the kind. `barriosproductores.madrid.es` (two pages),
`bretagne.bzh` (two), `vertrauensstelle-hofuebergabe.de` (two) and an Abruzzo PDF had
answered **403**: a host declining an automated request. Bolzano's two pages, an
`infosubvenciones.es` call and a Portuguese decree had answered **200** with a page this
checker cannot read. Every one of those readings was UNCHECKED, which
[`decisions/007`](007-unchecked-is-a-third-answer.md) settled is a third answer and not a
softer failure — and `decisions/025` says GONE needs _an answered failure_ twice. The code
did not: it treated any reading that carried an HTTP status as an answer, so a refusal to
an automaton counted the same as a 404.

Corrected, GONE is **3**: a Valencian procedure page and a Navarrese union page that have
both lost a quoted sentence, and a Zaragoza land-bank page that answers 404. Those three
are records to open. The other eleven are hosts and formats, and they are UNREACHABLE,
which asks a person to look rather than to edit.

Two things are worth keeping about this. The rule was right in `decisions/025` and wrong
in the code, and nothing could tell until a page failed twice on two different days —
which is the first thing this series was able to show and the reason it exists. And the
failure mode was the dangerous direction: an over-eager GONE sends somebody to rewrite
correct records, which is the one kind of damage this repository cannot detect afterwards.
`test/source-ledger.test.ts` now fails if a 403, or a page that answered but could not be
read, is ever counted towards GONE again.

## What would overturn it

A planner that stops knowing which files cite a page — which would mean the evidence
check no longer reports who to tell when a citation fails, a much larger problem than
this one. Or a series large enough for 30 bytes a reading to matter: at one sweep a day,
the ledger would reach 33 MB in a year, and the answer then is to keep sweeps and summarise
or drop old readings, not to stop recording what a reading was about.
