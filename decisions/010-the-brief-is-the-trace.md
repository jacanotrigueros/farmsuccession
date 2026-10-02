# 010 — Every published record traces back to an admitted lead

Decided 2026-10-02, milestone 03.

## The question

A record with a public source, a consultation date and verbatim quotes is
_sourced_. It is not necessarily _re-verifiable_: a year later nobody can say how
it was found, what else was looked at, or what was deliberately left out.

A research brief per territory could be two things. Either a working note — useful
to whoever wrote it, ignorable afterwards — or a contract: the memory of the pass,
checked like the data.

## What the evidence said

Searching a territory is the expensive part of this project, and almost all of that
work is invisible in the result. A pass that finds a regional land bank also
establishes that there is no succession service and no regional training, and
those absences are findings. Without them, the next pass starts from zero and the
reader cannot tell "we looked and there is none" from "nobody looked".

The second fact is about trust in the other direction: a resource that appears in
an edition file with no record of how it was found is a resource nobody can
re-verify, however good its sources look.

## The decision

The brief is a checked contract, with the rules enforced where the data rules are.

- **Every resource of a territory's own edition file came in through a lead the
  brief admitted.** A published record whose origin nobody wrote down fails.
- **A lead admitted as a resource names one a reader of that territory can
  actually see** — its own layer or a layer it inherits from, never a sibling
  region, another hub or another country. An id that is not visible there means a
  different instrument.
- A rejected lead keeps its reason, and a lead still being evaluated stays
  TO_CHECK rather than disappearing. The rejections are the part a second
  researcher needs most.
- A country brief lists the instruments a region usually has; a region brief
  answers each one. **`npm run check:territory` fails while any is unanswered**, so
  a pass cannot quietly skip the instrument that usually exists at that level.

That last rule is deliberately not part of `npm run validate`: an unanswered
instrument is work in progress, not a broken file. It fails the gate for finishing
one territory, which is a different question from whether the repository is
consistent.

## What it costs

Research now has a bookkeeping cost: a lead for every published record, and an
answer for every expected instrument. That is real work, and it is the work that
makes a second pass cheaper than the first.

## What would overturn it

Nothing measured; this is the project's purpose expressed as a rule. The shape
could change — the expected-instrument list could move from the country brief to
the catalogue, for instance — without changing the requirement that a published
record names how it was found.
