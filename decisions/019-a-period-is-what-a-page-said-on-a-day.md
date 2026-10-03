# 019 — A period is what a page said on a day, not a claim about today

Decided 2026-10-03, milestone 07. **Revised 2026-10-04**: the dates answer, in the reader's own day.

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

## Revised 2026-10-04: the dates answer, and they answer again for the reader's day

The rule above is right and the wording it produced was not the best way to keep it. The
previous generation of this site had already solved it, measured and closed, and the answer
it found is better than refusing to answer:

- The page does answer the question, in a sentence, under the summary: "Sí, la convocatoria
  está abierta", "No: el plazo terminó el 9 de abril de 2026", "No se ha podido confirmar".
- **The answer is derived from the dates the sources published, not from the state a page
  was in.** Past a documented closing date it is no, whatever the source said when it was
  read. Inside a documented period of a call last seen as upcoming it is "yes, according to
  the dates published" — a claim about the source, not about the counter at the other end.
  A call that should have opened and publishes no closing date cannot be confirmed, and
  says exactly that.
- **The same rule runs again in the reader's browser, for the reader's own day.** A static
  page outlives the deadline it was built before; `/apply.js` re-answers from the dates
  already on the page. Nothing is re-consulted and no date moves: the day the source was
  read is printed beside the answer, because that is what the answer rests on.
- A record that operates and documents no call gets **no block at all**, because inventing
  a yes or a no there would claim more than the sources show.

What survives unchanged: a period is still printed as a dated statement about a page, in
the section below, with the number of the source that published it. The answer at the top
is derived from those dates and never from a state that has quietly aged.

The one claim that can still outlive its evidence is a call a source showed as open with no
closing date — Galicia's year-round MR711G. There the page says the source said so, and on
what day, which is the most anybody can say about an open-ended period without reading the
page again.

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
