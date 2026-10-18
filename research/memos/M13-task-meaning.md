# M13 — Task relevance needs a policy that search can express

17 October 2026; develop 88fc645. This is a decision memo, not a new numbered decision.

Published Madrid: “Traspasar mi explotación”, zero and unlinked, precedes the record
madrid-ayudas-sucesion-explotaciones, whose own prose addresses retirement and transfer.
The implementation counts SUCCESSION_SERVICE exclusively. The schema defines purposes
only for FINANCIAL_SUPPORT; its TRANSFER and RETIREMENT_SUCCESSION codes already carry
more precise evidence than the resource category alone.

Measured over the current edition:

- 29 SUCCESSION_SERVICE records.
- 24 financial records with TRANSFER or RETIREMENT_SUCCESSION (22 and 10 respectively,
  with overlap); a kind-plus-explicit-purpose candidate would find 53 unique records.
- 72 records name TRANSFEROR: 29 succession services, 20 advice, 9 financial supports,
  9 land banks, 3 policy records, one network and one course.
- All 29 succession services name TRANSFEROR. Forty-six advice records do not
  name TRANSFEROR: adding all advice is not justified by that label either.

Reproduce using JSON resource fields in data/editions/2026/**/*.json, selecting kind,
set intersection of purposes with TRANSFER/RETIREMENT_SUCCESSION, and targetProfiles.
These are counts of assignments, not a re-review of every source or current service.

The implementation problem extends beyond the card. goalOf currently partitions kinds
into exactly one goal and is also used to organise sections. A task match can reasonably
be non-exclusive; turning goalOf into a broader match without separating those jobs
would duplicate or relocate records. The search URL supports kind/profile/status/scope/
territory/country, but not purposes. Values within a facet are OR and different facets
are AND. kind=SUCCESSION_SERVICE plus profile=TRANSFEROR cannot express their union or
an explicit financial-purpose alternative. A card count and its destination must name
the same set; changing only the count recreates a different false answer.

Options:

1. Rename the four cards as category links. Small and mechanically exact, but gives up
   the situation-first approach rather than answering its question.
2. Define task predicates separately from the category partition, using only explicit
   documented purpose/profile/scope fields and resource kind. Decide which combinations
   count, add an equivalent search contract, deduplicate by stable resource identifier,
   and test count versus destination. More work, no new research pass or data edits.
3. Add editorial per-resource task assignments. Flexible, but creates new interpretation
   in frozen records and a research/review obligation. It is not a harmless UI refactor.

Recommend option 2 after the maintainer approves each predicate. A first candidate is
succession services plus explicit transfer/retirement support, with transfer advice
considered separately from background policy. This is a candidate for review, not an
implemented definition. No age, fee, sector, eligibility or unrecorded scope limit is
inferred. Decision 022 prohibits that; 001 still governs inherited records.

What would overturn it: source-backed examples showing the chosen fields do not convey
relevance, or M0 showing category retrieval is what readers actually need. Until then,
no invented global mapping ships, and the current zero remains an acknowledged defect.
