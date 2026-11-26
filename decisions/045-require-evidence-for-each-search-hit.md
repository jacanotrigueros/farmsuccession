# 045 — Require matching evidence for each search hit

**2026-11-26.** Amends [044](044-search-shows-periods-and-nearest-layer-first.md)
on when a text search may show hits.

## The question

Should finding one genuine hit make every prefix fallback in that query
eligible for display, or should every result have matching evidence?

## What the evidence said

The compiled European search at `7ed6e14` returned 47 hits for
`Niederlassungsprämie`. The Austrian grant was twentieth. The first five
were Italian records whose only matched token was `n.`. Checking each
result leaves 15 hits and moves the Austrian grant to eleventh. The ten
hits ahead of it include two German records with the full word, six
French records matched on `ni`, and two Spanish records matched on
`NIE` in published text. The same rule accepts these multi-letter
matches.

The comparison uses the same search engine and compiled Pagefind bundles for
all seven languages. The results retained for `jóvenes agricultores Aragón`,
`Hofübergabe`, `safer bretagne`, and `young farmers` keep their ordering.
The unknown query `zzfarmnoresultzz` still has zero results.

## The decision

Check the positions in each hit's own fragment. A matched token must contain
a word with more than one letter or digit, or an initial the reader typed as
a word. Remove hits that fail this check. Keep the Pagefind scores and the
relative order of remaining hits. Recount facets from the surviving hits when
the check removes any, including when calculating the options for a facet
the reader has already selected. Empty queries continue to browse the
catalogue without loading fragments for validation.

## What it costs

A text search inspects the matching fragments before it can show an accurate
total. It caps the number of fragment reads in flight for each search. Short
multi-letter matches can still place an unrelated page above a useful one.

## What would overturn it

A reliable signal from Pagefind that rejects these prefix fallbacks before
fetching fragments, or evidence supporting a narrower criterion for
multi-letter matches without losing useful results.
