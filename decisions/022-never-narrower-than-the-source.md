# 022 — A record is never narrower than its source

Decided 2026-10-03, milestone 07.

## The question

Building the record pages surfaced a contradiction the corpus had been carrying
quietly: **11 of 132 records say they are aimed at "anyone" and at named profiles at
the same time** — young farmers, new entrants, successors — and the schema's own
wording made that impossible, because it defined `GENERAL` as open to anyone _rather
than_ to a named profile.

So one of two things was wrong. Either eleven records were researched carelessly and
need correcting, or the vocabulary was asking for something the sources do not say.
The first is the comfortable answer and it is mechanically enforceable: a check can
refuse `GENERAL` next to anything else, and the eleven get cleaned up.

## What the evidence said

Read record by record, from the quotes and the audience prose already in the files,
`GENERAL` turned out to be doing three different jobs:

1. **Genuinely open to anyone, with somebody named as well.** Cantabria's CIFA
   courses are for "personas mayores de 18 años", and the same page says who has
   priority and who needs the certificate for a PAC aid line. Both halves are true,
   and both came from the page.
2. **Open beyond the named profiles, but not to everybody.** Aragón's IFGC loans are
   for "jóvenes agricultores y titulares de explotaciones agrarias". There is no
   profile in the list for _an existing farm holder_, so whoever researched it reached
   for `GENERAL` to avoid leaving half the audience out.
3. **No audience at all.** The European Observatory on Farmland is an announced
   instrument and Madrid's Plan de Dinamización is 35 measures across six axes.
   Neither source names anybody, because there is nothing to apply for.

Eight of the eleven are the first two kinds: information that was recorded correctly
and that the vocabulary had no honest way to express. Enforcing the strict reading
would have deleted it.

The third kind is the one that is actually wrong, and wrong in a specific direction:
somebody guessed an audience for a thing that has none.

## The decision

**A record is never narrower than its source.** That is the rule, and it is larger
than this one field.

Where a page sets no age, no sector, no territory within the territory, no fee and no
profile, the record sets none either. Where a page opens something to anyone _and_
names who it has in mind, both go in: `GENERAL` sits alongside the named profiles, and
the page says "jóvenes agricultores, personas que empiezan en el campo y cualquier
otra persona". Where a page names no audience at all, the field is left out.

An invented restriction is worse than an invented instrument, and this is why the rule
is stated in that direction. A reader who is turned away by a limit nobody imposed
never applies, never finds out they were eligible, and never generates the complaint
that would have corrected the record. Nothing in the system contradicts it — not a
source check, not a reader, not a later edition. It fails silently, in the one
direction this project cannot afford.

It is written where it is followed rather than only here: in the schema's description
of the field, in the research process (version 1.13.0, with 1.12.0 kept whole), and in
[`AGENTS.md`](../AGENTS.md).

Three records were corrected, each by removing a claim no source supports, which is
what a correction may do ([016](016-a-pass-is-a-dated-snapshot.md)): the Observatory
and Madrid's plan lost `targetProfiles` entirely, and Gipuzkoa's mixed-holding scheme
lost `GENERAL`, because "at least 18 and under 55, with a viability plan and no prior
establishment aid" is not anyone under any reading.

## What it costs

The automatic check goes away. Under the strict reading a validator could refuse
`GENERAL` beside anything else; under this one, no check can tell a careful use from a
lazy one, and `GENERAL` could become a shrug that gets added to everything. What
stands in the way is the prompt, the schema's own words and a reviewer — which is
weaker than a test, and is the honest trade for not deleting eight records' worth of
true information.

It also leaves the underlying gap open: there is still no profile for an existing farm
holder, and `GENERAL` is carrying that meaning in at least one record. That is a
schema change, it would touch every territory researched so far, and it is not worth
making until the rest of Europe arrives and shows how often the gap is real.

## What would overturn it

The gap above closing — a profile vocabulary that can say "an established farmer"
without reaching for "anyone". Then case 2 stops needing `GENERAL`, the combination
gets rarer, and it may be worth re-examining whether the strict reading can be
enforced after all. Case 1 would survive any such change, because a course open to
everybody over 18 is open to everybody over 18 however many profiles exist.
