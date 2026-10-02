# 007 — UNCHECKED is an answer, not a softer failure

Decided 2026-10-02, milestone 03.

## The question

A live check re-reads a cited page and looks for the quotes recorded against it.
Sometimes it cannot: the host does not answer, a bot challenge arrives instead of
the page, the server is having a bad day, or the page is a shell that a script
fills in later.

Two answers are possible and both are wrong. Calling it a pass says the evidence
was verified when nothing was read. Calling it a failure says the citation is
broken when the only thing broken was this run, and a check that fails on a portal
being briefly down is a check nobody runs twice.

## What the evidence said

Real portals do all of these. In a single live run over three pages, one host
refused with no response at all; in the corpus, pages sit behind challenge
services whose interstitial answers 403 while carrying none of the cited text.

The deciding argument is not a measurement, it is asymmetry of cost. This project
exists to say that a published claim is traceable. A false pass retires a
citation nobody ever re-read and the data then asserts something the project never
verified — the one failure it cannot afford. A false failure costs a researcher an
afternoon.

## The decision

Three answers, and the third is first-class:

- **PASS** — the page answered and every quote was found again.
- **FAIL** — the address is gone, the page's own title says it does not exist, or
  a quote is not there.
- **UNCHECKED** — this run could not read the page. Not a failure, not proof.

A 403 or 429 is a host declining automation and a 5xx is a host having a bad day:
both UNCHECKED. A bot challenge is recognised _before_ the status code it arrives
with, because "a challenge replaced the page" says more than "HTTP 403". A request
that got no answer at all is retried once; a status code is an answer and is never
retried.

An UNCHECKED page never becomes verified by being run again until it passes, and a
missing quote is never "fixed" by deleting the quote. Both are written into
[`AGENTS.md`](../AGENTS.md) because no test can catch them.

## What it costs

Stated in the code rather than hidden: a page whose quotes are missing but which
carries fewer than 200 characters of readable text is treated as an unrendered
shell and reported UNCHECKED. **A page with less text than that can therefore
never fail a quote check.** That is the conservative side of the line, and it is a
judgement about where a shell ends and a short notice begins, not a measurement —
a genuinely terse official notice whose quote disappears comes back as a question
rather than as a failure.

## What would overturn it

A measurement of how much readable text real cited pages actually carry, once
there is a corpus of live runs to measure. If short pages are common, the
threshold is too generous and the shell test needs a better signal than length.
