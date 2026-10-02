# 002 — The schemas compile under AJV in full strict mode

Decided 2026-10-01, milestone 01.

## The question

AJV's strict mode rejects schemas that merely look right: a property mentioned in
a conditional branch that nothing requires, a keyword that cannot apply to the
declared type, a `$ref` beside sibling keywords that are then ignored. Most of
these are not errors in the specification — the schema is valid JSON Schema, it
simply does not mean what its author thought.

Turning strict mode on costs work: every one of those has to be fixed in the
schema. Leaving it off costs nothing today.

## What the evidence said

`strictRequired` alone forced real corrections. A conditional branch that said
"when the level is LOCAL, the served area matters" without requiring `area` reads
as a rule and enforces nothing: every file passed. The same shape appeared in the
review block, where a file could claim it had been reviewed while naming neither
a reviewer nor a date.

Those were not hypothetical. The review rule was lost once during a rewrite of the
schema and only a restored strict compile caught that a REVIEWED file with no
reviewer validated cleanly.

## The decision

AJV runs with `strict: true`, including `strictRequired`, and
[`src/schema.ts`](../src/schema.ts) has no flag to relax it. A schema that needs
a relaxed AJV is a schema to fix.

A test compiles every schema in `schema/` under strict mode, so the compile itself
is part of the suite rather than something that happens to work on one machine.

## What it costs

Verbosity. A conditional branch has to restate `type`, `required` and the
properties it constrains, which makes the schemas longer than the equivalent
loose version and makes a reader look twice at an `if`/`then`/`else`.

## What would overturn it

A rule that is genuinely inexpressible without a keyword strict mode rejects. The
answer would still not be a global flag: it would be that rule moving into code,
where a message can explain it — see [004](004-where-a-rule-lives.md).
