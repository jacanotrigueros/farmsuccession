# 031 — An amount belongs to its source, not to its reader

**2026-10-17.** Per-beneficiary figures have a documentary heading in every language.
The figures, their dates and their citations stay where they are.

## The question

Should a record introduce its figures with the reader's question, "How much you can
receive", or name the amounts its sources published? The personal question is familiar
and tells somebody where to look. The documentary heading says less about that person,
which is all this site has evidence to say.

## What the evidence said

At develop `88fc645`, `howMuchTitle` in `frontend/src/lib/words.ts` addresses the reader
in all six languages. None promises payment outright, but each makes a published figure
sound like an answer about the person reading it.

The counterexample is `pt-novos-produtores-pecuarios-2026` in
`data/editions/2026/countries/pt.json`. Its per-beneficiary metric is EUR 30000. The same
record says the 2026 allocation is exhausted and quotes the source saying the funds are
"totalmente esgotadas". It is ACTIVE and documents no application period: the instrument
exists, which does not make an application window open.

Reproduce this by reading that record's `metrics`, `status`, `howToAccess`, `notes` and
`sources`, then building the frontend and opening
`/pt/recursos/pt-novos-produtores-pecuarios-2026/`. The heading is used only for measures
whose code includes `_PER_BENEFICIARY_` in `[...record].astro`; total budgets and other
measures have their own headings.

## The decision

Name published amounts per beneficiary in all six languages. Keep three questions
separate: whether an instrument exists, whether its documented dates permit an
application today, and what amount a source published per beneficiary. Decisions 015
and 019 already separate the first two; an amount heading must not collapse them again.

No figure, date, citation, status, application answer or record is changed. The heading
carries the distinction itself; no later qualification is needed to make it true.

## What it costs

"Published amounts per beneficiary" is less conversational than a personal question.
It does not estimate an individual's award or establish their eligibility. It also
keeps an exhausted scheme's figures visible as documentary evidence, which asks readers
to consult the separate availability answer and official source.

This is an editorial choice, not a mechanical rule about particular words. No test
restates the six headings. The existing type checks require every language to answer
the same keys, and the built-record tests protect the unchanged evidence.

## What would overturn it

Evidence that a different documentary heading helps readers find the published amount
more reliably without implying an individual award. A personal calculation would need
verified information about the reader and a different, advisory remit; it is outside
what this heading or this project can establish.
