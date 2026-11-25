# 044 — Search shows documented periods and the nearest layer first

**2026-11-26.** Amends [042](042-answer-can-i-apply-under-the-title.md), point 5,
for queries with selected territories and no words.

## The question

What should a search result say about applying, and what should an empty query
show first once its reader has selected a place?

## What the evidence said

- A financial-support search for Aragón showed a green operating status on the
  grant card. Its record documented a closed 2026 call.
- In the no-text Aragón search, the first record filed in Aragón appeared at
  position 19 of 31. The catalogue order gave priority to wider layers.
- Pagefind returned five German-language records for `zzfarmnoresultzz`. Their
  matched positions came from single letters that the reader had never typed
  as words. The European page displays summaries for those results, so it did
  not show that weak match in an excerpt.

## The decision

- Search uses the record's documented periods, original source dates and the
  same dated answer and precedence rule as the record page. Each period has
  its own line and the operating badge is quiet alongside it.
- A no-text search with selected territories groups results by recording
  layer: region, grouping, country, EU. Within a layer the usual order
  remains. An unscoped empty search still starts with the European layer.
- A text search checks the positions Pagefind matched for at least one
  substantial word or explicitly typed single letter. Searches that match
  only untyped initials use the existing no-results state. Pagefind still
  scores and orders searches with matching evidence.

## What it costs

Scoped browsing reads the filter for the documentary layer. A text search may
need to read fragments to determine whether the match is genuine. It stops
checking once it has found a real match.

## What would overturn it

A Pagefind option that reliably distinguishes a match from a fallback to an
untyped initial, or evidence that readers need to see wider resources first
when they choose a region.
