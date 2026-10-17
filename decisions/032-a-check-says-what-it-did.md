# 032 — A check says what it did, not what a trust label suggests

**2026-10-17.** The home badge and the footer share one account of public sources,
dated readings and automatic attempts to read them again. Neither calls the directory
verified.

## The question

Should the site keep a short verification label, leaving its method to another page,
or name the observable evidence and the limits of its checks where the label appears?
The short label is easier to scan. The explicit account is longer, but a reader can
understand it without deciding what "verified" must mean here.

## What the evidence said

At develop `88fc645`, the six `trustSourced` labels in `frontend/src/lib/words.ts`
say source-linked or verifiable. The six `notAService` footers instead claim verified
references. In French, Italian and Portuguese that moves from something that can be
checked to something already checked. Every draft-record notice says no person has
reviewed the record. Automatic checks can coexist with that notice; an undefined
verification label does not explain what they establish.

The audit also found the same unqualified claim in the opening of `README.md`, and
German `applyUnconfirmedDetail` and `periodsExplained` call sources checked where the
other languages say consulted. Those become consulted too; no application-answer
rule changes.

Reproduce the inventory with `rg -n -i 'verifi|vérifi|geprüft|trustSourced|notAService'
frontend/src/lib/words.ts README.md`. Classify each hit before changing it:
`checkedOn` qualifies a dated state and `reportVerification` describes the editorial
process, so both stay. Automatically checked drafts, requests to check, information
left unverified, and technical TLS or domain verification are also scoped claims,
not assertions that this directory is verified.

The actual evidence path is a public URL, its consultation date and its verbatim
quotes. `src/check-sources.ts` and `src/sources/` attempt to retrieve sources and find
those quotes again; their ledger retains PASS, FAIL and UNCHECKED. An attempt is not
necessarily a successful reading, much less confirmation of every fact or present
availability. No live check was required or run to change this wording.

## The decision

Use one `SourceClaim.astro` component, with the same language strings, for the home
badge and every footer. State that records link to public sources with the day each
was read, and that automatic checks try to read them again. State their limits beside
that claim: they do not replace human review or confirm current availability. Neither
surface defines verification independently. The README describes the same observable
process; it is not a second trust label.

Retain dated state checks and the editorial-process explanation. Decisions 019 and
028 still govern application answers and indexing respectively; this change revises
neither and assigns no new review state to a record.

The built-HTML test compares the two rendered home claims and checks that every
footer uses one consistent claim per language. It does not pin the new wording or
claim to judge its truth. The same component makes a later wording edit reach both
surfaces; the test catches a template that removes, duplicates or independently
extends the explanation. This is static text, so a browser is not needed to prove
that equality.

## What it costs

The site loses a strong trust word and its first home badge takes more space. The
longer explanation tells the reader what happened instead of asking them to infer
what was checked. It does not claim that every re-reading succeeded or that a person
reviewed the record.

## What would overturn it

A documented verification standard, with measurements of what it actually checks and
an explanation readers understand as distinct from human review, eligibility and
availability. A more concise wording that preserves those distinctions could replace
the shared explanation without restoring an undefined assurance.
