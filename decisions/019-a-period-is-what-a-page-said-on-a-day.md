# 019 — A period is what a page said on a day, not a claim about today

Decided 2026-10-03, milestone 07.

## The question

"Can I apply now?" is the question a farmer arrives with. The data holds what it takes to
answer it — a call has a name, a state, and the dates a source published — and the obvious
thing to build is the obvious thing: compare the window against today's date and print
**Open** or **Closed**, in green or in grey, at the top of the page.

The site is built once and published as one edition a year. So the question is whether a
page may compute that verdict at all, or whether it may only report what a page said on
the day it was read, and leave today to the official page.

Saying nothing is not the alternative. Burying the dates under the figures and the
practical details, which is where they were, is a way of not answering while looking like
a page that does.

## What the evidence said

The 2026 edition holds **48 application periods across 43 of its 132 records**, and their
states were judged against the day each source was read:

- **39 closed**, 6 open, 3 not yet opened.
- The 6 open ones are the dangerous ones. Each was open on a day in September 2026, and
  nothing in the data says anything about any later day. A build that printed "Open" would
  keep printing it for a year, and the reader it misleads is exactly the one who acted on
  it: somebody who stopped looking because the site said they still had time.
- The 3 upcoming ones fail the other way round, more quietly. `MR711B` opens on 2 November
  2026; a page computing from today's date would show it as upcoming all through October
  and as open in November — a claim no source in this repository supports, since nobody
  read the page in November.
- Recomputing on each build does not fix it either. A build in March and a build in
  December would make different claims from the same evidence, and neither one would be
  traceable to a page anybody read.

The underlying rule was already written down for the data — existence is not availability,
and a record's `ACTIVE` state never means a call is open ([`AGENTS.md`](../AGENTS.md),
[`README.md`](../README.md), and the schema's own description of `status`). What was
missing was what a _page_ does with it, which is where the rule is easiest to lose.

## The decision

A period is printed as a dated statement about a page, never as a verdict about the
present, and the words say so in both languages:

> MR404A — Convocatoria 2026
> ya cerrado, del 10 de marzo de 2026 al 9 de abril de 2026
> página leída el 28 de septiembre de 2026 [1]

The English labels are past tense for the same reason — "was open", "had closed", "had not
opened yet" — and every period carries the number of the source that published it, so the
claim can be followed to the page it came from. Under the list, one sentence says what all
of it means: each period is what its source said on the day it was read, not a statement
about today.

The question is still answered where the reader asks it. The periods sit immediately under
what the record offers, second on the page, above how to get it and who it is for; and the
link to the official page is the most prominent thing on the page, because it is the only
thing that can answer for this afternoon. A record with no period recorded says so, rather
than leaving a gap a reader cannot tell from an omission.

A test keeps it: a page that states a period without the date its source was read fails.

## What it costs

The reader does not get the one-word answer they wanted. "Ya cerrado, del 10 de marzo al 9
de abril, página leída el 28 de septiembre" is more to read than "Closed", and it asks them
to do the last step themselves.

It also costs the site the thing that makes catalogues feel alive: a green badge, a count
of what is open right now. Every one of those would be a claim this project cannot make
from a yearly snapshot, and the whole value of the project is that it does not make claims
it cannot trace to a page and a date.

## What would overturn it

Rebuilding often enough that "today" means something — a daily build that re-reads each
call's source and records a new consultation date. That is not a layout change, it is the
source-checking pass running on a schedule, and the claim would still be "as of the date we
read it", only with the date much closer. The wording could then shorten, because the
distance between the date and today would be a day instead of a year.
