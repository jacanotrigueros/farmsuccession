# 015 — A record whose only source dies becomes UNKNOWN, not gone

Decided 2026-10-02, milestone 05.

## The question

The first live run over real data found what it exists to find: the page a record
cited had been removed. Zaragoza's municipal land bank was documented from the
city's own procedure page, with five quotes copied from it; four days after the
research pass that page answered 404 — to the checker and to a browser, which
shows "Registro no encontrado" — and the city's own huerta page had dropped every
mention of the registry.

Four answers are available and three of them are defensible, which is why this
needs deciding once rather than record by record:

- keep it **ACTIVE**, because nobody said it ended;
- mark it **DISCONTINUED**, because its page is gone;
- **delete** the record, because its evidence is gone;
- mark it **UNKNOWN**, because we cannot tell.

## What the evidence said

What was actually established: the page answers 404, a browser sees the same, the
municipal page that used to mention the registry no longer does, and no page
anywhere says the instrument ended. A search engine still indexes a shorter URL for
the same procedure number, and that address answers 404 too — a stale index, not a
move.

So the absence is strong enough to stop a claim and too weak to make one. That
asymmetry is the whole finding, and it is the project's own rule read backwards:
existence is not availability, and a page going quiet is not a page saying anything.

## The decision

**UNKNOWN**, with a note, and the identifier stays.

- **ACTIVE is refused.** It would publish that something operates on the strength of
  evidence that stopped existing, which is the one thing this project cannot do.
- **DISCONTINUED is refused too, and this is the less obvious half.** It claims an
  end nobody read, and the diff between editions reports it as a record that stopped
  operating — a fact a reader would carry away from a page that merely vanished.
- **Deleting it is refused.** An identifier that outlives what it names is what makes
  a series of editions a series: delete the record and next year cannot tell "it
  ended" from "we never found it", which is the distinction decision 010 pays for.
- The record carries a **note** saying the page stopped answering and pointing at the
  address the city published while it was still there, so a reader is not left at a
  dead link with no next step.
- The lead stays **ADMITTED** in the brief, with the decision in its log. If the city
  publishes the procedure again, the next pass continues rather than rediscovers.
- The live check goes on reporting that page as a **FAIL**, and that is correct. The
  report is a reading of today, not a verdict on the record.

Changing a status is a review decision and was made by the maintainer, not by the
checker and not by an agent: a run produces the finding, a person draws the
conclusion.

## What it costs

A permanent FAIL in the live report until a pass resolves it, which looks like
neglect to anybody skim-reading the numbers and is the price of not quietly tidying
it away. And UNKNOWN is the least useful state for a reader: it says the project
cannot vouch for something it published, which is honest and unsatisfying at once.

It also leaves a judgement call open every time this happens. Nothing here decides
how long a record may stay UNKNOWN before a pass has to settle it.

## What would overturn it

Enough cases to make a distinction worth modelling. If dead pages turn out to split
cleanly into "removed because the instrument ended" (often with a notice elsewhere)
and "removed in a site redesign" (the service still reachable by another route), then
a status or a field that records which is worth having. One case is a decision; a
dozen would be a measurement.
