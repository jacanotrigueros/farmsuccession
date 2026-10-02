# 004 — A rule lives in the schema, or where a message can explain it

Decided 2026-10-02, milestone 03.

## The question

Every rule that decides what is publishable can go in one of two places. The
schema states shapes and is checked before anything else runs; the code states
rules and can say anything in a sentence.

Put everything in the schema and the contract is self-describing, but the reader
of a failure gets a JSON pointer and a keyword. Put everything in code and every
message is readable, but the contract no longer says what it accepts, and a
consumer reading the schema sees fields that look optional and are not.

## What the evidence said

Five fields of a resource described one kind of resource each —
`assetTypes`, `instrumentType`, `purposes`, `trainingFormats`,
`qualifiesForEstablishmentAid` — and said so only in their descriptions. A
training course handing over plots of land validated cleanly, and a land bank
carrying a financial mechanism did too. Both were fields filled out of habit
rather than read off a page, which is exactly the kind of thing a contract should
refuse.

Against that, the rule that each metric unit has to fit its measure cannot be
said usefully by a pointer. `BUDGET_TOTAL` in hectares has to be answered with
"use EUR", and `LAND_AREA` in parcels with "use HECTARES". A boolean `false`
schema can refuse the field; it cannot name the units that would have been right.

## The decision

A rule goes in the schema when the schema can state it without losing the
explanation — that is, when the field's own description already carries the reason
and a pointer at the field is enough to act on. The five kind-specific fields are
now closed in the schema with an `if`/`else` per kind, each branch carrying the
reason in its own `description`.

A rule that needs a sentence lives in
[`src/validate-edition.ts`](../src/validate-edition.ts), where the message says
it. The unit-per-measure table stays there for that reason.

The root description of the edition schema used to claim these rules "cannot be
expressed in JSON Schema". That was not true, and it now says why each one lives
where it does.

## What it costs

The boundary is a judgement, not a formula, so two people can disagree about a
given rule. The cost is bounded by the fact that both places are checked by the
same command: a rule in the wrong place is a worse message, never a missed error.

## What would overturn it

A validator whose output included the schema's own `description` for the branch
that failed. Then a schema rule could explain itself, and the second half of this
decision would have no reason to exist.
