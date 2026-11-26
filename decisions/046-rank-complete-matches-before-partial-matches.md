# 046 — Rank complete written matches before partial matches

**2026-11-26.** Supplements [045](045-require-evidence-for-each-search-hit.md).

## The question

When someone types several words, should a document matching all of them be
easier to find than a document matching only part of the query?

## What the evidence said

The European search for `safer bretagne` included two Azores records and an
EU record below the Brittany results. A partial match can still be useful,
but a reader who typed an organisation and a place should see records with
both words first.

## The decision

With two or more distinct written words, display results containing every
query word first. Compare whole words in the indexed text, folding case and
diacritics. Within each group keep the engine's order and scores. Keep all
partial matches that pass decision 045. A one-word search and an empty
search retain their existing ordering.

## What it costs

The complete-match check reads the indexed words in each already-loaded
fragment. A stemmed variant can qualify as a partial result and sit below a
literal match.

## What would overturn it

Evidence from real queries that users consistently need stemmed or partial
results to come before records containing all their written terms.
