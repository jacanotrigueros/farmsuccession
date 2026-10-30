# The live checks: what they read back, and what their answers are worth

Every published record here rests on a claim of the same shape: this page said this, and somebody read it on this day. The
edition files hold that claim. The live checks are the only thing in the repository that goes back out and reads the page
again, which is what separates evidence from a sentence about evidence.

They are also the part of the process most easily misread, because a check that reaches the network answers three questions
at once — is the page there, does it still say it, and can this machine reach it today — and only the first two are about
the corpus. This document is what the project has learnt about telling them apart, so that the next pass does not re-learn
it.

## The two checks, and what each one proves

```bash
npm run check:sources                    # every page a record cites, and the quotes recorded against it
npm run check:sources -- 2026            # one edition
npm run check:sources -- 2026 es/aragon  # one territory, without the other ninety
npm run check:links                      # every address the repository points at, and nothing about what it says
npm run check:territory -- 2026 es/aragon  # the gate for finishing one territory: a warning fails too
```

**`check:sources`** reads each cited page and looks for the quotes the record copied from it. It proves the most: the page
exists, it is reachable, and it still says what this project says it says. It is the check that makes the rest mean
something — a citation nobody ever re-reads is a claim, not evidence.

**`check:links`** asks of every address — access links, sources, the portals named in a coverage method, the sources the
territory catalogue itself rests on — whether it still answers, and nothing more. It covers far more addresses and proves
far less about each. It exists because a link that drops a reader into a 404 costs the project more than a stale figure:
it is the first thing anybody notices.

Neither is part of `npm run check` and neither gates a commit. A portal being down is not a reason to refuse a commit, and
a check that can be failed by somebody else's maintenance window would be disabled within a month of being made mandatory.

## Three answers, and why the third one exists

- **PASS** — the page answered and said what the record says it says.
- **FAIL** — the page answered and did not: the address is gone, the page says it does not exist, or a quote is no longer
  on it.
- **UNCHECKED** — this run got no reading. A timeout, a host declining automation, a challenge page, a document this
  checker cannot read.

UNCHECKED is a third answer and not a softer failure (`decisions/007`). Collapsing it into FAIL would mean a bad afternoon
on this side of the connection could retire a perfectly good record; collapsing it into PASS would mean claiming a reading
nobody took.

## A run is a reading, not a verdict

On the evening of 2026-10-08 a sweep of the nineteen French territories came back 53 PASS, 0 FAIL, 36 UNCHECKED, which
reads like a corpus full of dead links. Occitanie answered 0 of 14 that evening and 14 of 14 a few minutes later; Bretagne
went the other way, 6 of 8 and then 0 of 8; `curl` got 200 from all of them throughout. Nothing was wrong with France. The
network here was dropping, and no single run could have said so — only two runs disagreeing could.

So every run writes a file of its own under `reports/checks/`, named for the moment it ran and the scope it covered, and
those files are committed on purpose: they are the evidence behind what the site claims about its own freshness, and a
claim whose evidence is not in the repository is a claim nobody can check (`decisions/025`, `decisions/026`). `reports/`
otherwise is output and is ignored — `reports/sources.json` is overwritten by the next run and means nothing a day later.

Each reading also records which territories cite the page, because a verdict on a page is a verdict on the records that
cite it, and somebody has to be able to find them. Three early sweeps stay unattributed: a reading that was taken is not
edited afterwards.

## Reading the series rather than the run

```bash
npm run report:sources
```

It reads every run ever recorded and answers the four questions one run cannot:

1. **which pages are actually gone** — failed on two different days, rather than unread once;
2. **whose records they are**, and which territories nobody has read at all;
3. **which hosts are unreliable**, as opposed to which links are broken;
4. **which runs were readings about this machine** rather than about the corpus.

It decides nothing. It prints what somebody then has to act on.

## What to do with each verdict

- **GONE** (failed on two different days): open the page by hand. Either the record is corrected — a new address, a new
  quote, a changed figure, recorded against the edition it changed in — or the resource is marked UNKNOWN or DISCONTINUED
  (`decisions/015`). An id outlives the instrument: a record that disappears without a trace is worse than a record that
  says it stopped.
- **A quote missing from a page that is alive**: the page changed under the claim. This is the case the check exists for,
  and it is not pedantry about punctuation. Madeira's prize page used to read "não antes de 24 meses" and now reads "há
  não mais de 4 anos": the eligibility window more than doubled, and the record would otherwise have told somebody three
  years into farming that it was too late for them.
- **UNCHECKED with a 403, a challenge or a cookie wall**: the host declines automation. Not a failure of the record, and
  not something to fix in the data. Re-read by hand when that territory's next pass runs.
- **UNCHECKED with no response at all**: usually this side. Run it again, and let the series decide.
- **A TLS chain that will not complete**: some public portals serve an incomplete chain. The intermediates are pinned
  under `config/` and installed for the run (`decisions/008`), rather than turning verification off, which would make
  every reading worthless.

## How they behave while running

One host at a time, with a pause between two requests to the same host, and a user agent that says what this is rather
than posing as a browser. A run over the whole edition is therefore slow — it is meant to be. The politeness settings are
parameters, so a test exercises the whole command without a single request leaving the machine.

## What the series says so far

**2026-10-13 — the first full pass over the whole corpus, before publication.** `check:sources` read 500 cited pages:
423 PASS, 5 FAIL, 72 UNCHECKED. `check:links` asked 583 addresses: 495 PASS, 5 FAIL, 83 UNCHECKED. About half an hour
each, and the series reads neither of them as a failure of this machine.

The five evidence failures were opened by hand the same evening, and all five were real:

- **Lombardia, the 2026 establishment fund** — the record quoted "In apertura" and the page now says "Aperto", with
  applications from 13 to 27 October 2026. It opened that morning. A reader would have been told that a call which is
  open had not started yet, which is the most perishable fact this corpus carries and the reason the check exists.
- **Veneto, the professional-farmer course** — "Dal 12 Ottobre 2026" now reads "Dal 19 Ottobre 2026". The course starts
  a week later than the record says.
- **Andalucía, establishment of young farmers** — the missing quote is the page's own "Seguimiento (Actualizado:
  25/06/2026)", which now reads 13/10/2026. The substance did not change; a payment-application guide was added. The
  lesson is about the quote and not the page: quoting a page's own updated-on stamp buys nothing and guarantees a
  failure every time the body touches anything. Quote the sentence that carries the fact.
- **València, the land bank of the Consell Agrari** — both cited pages answer 404 in a real browser and not only to the
  checker, and the whole Spanish section of that site is gone while the site itself is alive. Where the service moved
  needs a person, and `decisions/025` wants a second day before this is called gone.

Every one of the thirty-four territories holding a failed or unread page was read a second time the same evening,
one territory at a time so each reading says whose it was: 193 pass, the same 5 fail, 45 unread. The five failures are
therefore the corpus and not the connection, and all five were corrected the same night — the Lombardy call set to open
with the window the page shows, the Veneto date moved to the 19th, the Andalusian citation moved off the page's own
updated-on stamp and onto a published resolution, and the València land bank re-cited to the municipal procedure in the
city's electronic office, with the claims that only the dead pages supported removed. The four territories pass their
own gate now.

`check:links` adds three addresses that no record cites as evidence but a reader can still meet: a Palmela council PDF
and a Zaragoza procedure, both 404, cited by the coverage method of their territories, and `ismea.it` redirecting its
own root to a page the citation now names instead. The Zaragoza and Palmela links stay as they were read: a method is
what somebody did on a day, and what those two did is done.

The 72 and 83 unreadable are the same hosts as ever — the Galician portal, Gipuzkoa, Nouvelle-Aquitaine, Hesse's LLH,
Brandenburg, the Spanish grant database — none of which has ever answered this checker. A note for whoever automates
this: only `check:sources` records a run in `reports/checks/`, so the series knows nothing about what `check:links` saw.

**2026-10-08 and 2026-10-09 — 52 runs, 503 cited pages.** 0 GONE. 56 pages UNREACHABLE: never a reading, on more than one
day. They concentrate in a handful of hosts rather than spreading across the corpus — the Spanish grant database, two
Madrid pages answering 403, Gipuzkoa's procedures, Nouvelle-Aquitaine's aid portal, Hesse's LLH, the Galician and Asturian
portals, Brandenburg's ministry. The lesson that cost the most to learn is in that list: almost everything that looks like
a dead link in a first run is a host declining automation, and the only way to tell is to ask again on another day.

Regenerate the current paragraph from the committed ledger with
`node scripts/live-checks-summary.ts --write`, then format the document. The root
suite compares it with the ledger on every gate; the dated observations above are
historical accounts and are not regenerated.

<!-- source-series:start -->

As of 2026-10-30, the committed source-check series holds 158 runs on 10 UTC days (2026-10-08 to 2026-10-30), observing 578 distinct URLs: 393 HEALTHY, 148 FLAKY, 26 UNREACHABLE, 2 GONE and 9 NEW. Of those, 566 are still cited by the current corpus: 389 HEALTHY, 145 FLAKY, 26 UNREACHABLE, 0 GONE and 6 NEW; 12 no longer cited URLs remain in the history. All cited pages have been checked at least once for 87 of 96 territories that cite evidence; 5 territories cite none. Checked includes UNCHECKED outcomes and does not mean a page was successfully read. These verdicts follow decision 025; they do not establish current availability or a human review.

<!-- source-series:end -->
