# 013 — A diff between editions is what a reader would notice

Decided 2026-10-02, milestone 04.

## The question

A yearly edition is only worth publishing if the difference between two of them can
be read; that is the whole reason a resource keeps one identifier for as long as it
exists. The complete difference, though, already exists and costs nothing:
`git diff` between two edition directories is exact, and no code has to be written
or maintained for it.

So what should `npm run diff` add — the whole difference in a friendlier format, or
a chosen few changes and not the rest?

## What the evidence said

Honestly: thin, because there is only one edition. The comparison between two real
editions cannot be measured until 2027 exists, and a decision taken now is a
hypothesis.

What could be checked is the premise rather than the selection. Over the 319
resources of the corpus, the same edition compared against itself reports nothing
changed — which is a test of the identifier as the comparison key, not of the diff,
and is the result that would have exposed an id reused or lost between files. A
synthetic second edition, with one record per file moved to DISCONTINUED, yields 93
changes and no continuity warnings: a record kept as discontinued is continuity
preserved, and the warnings stay quiet, which is what they are for.

The selection rests on the shape of the data rather than on a measurement. Of the
319 resources, 53 carry metrics and 80 carry calls — the fields that move for a
reason a reader cares about. Every single one carries `whatItOffers` and at least
one quoted source, and those are the longest strings in the file and the ones a
second pass is most likely to improve. A complete diff would report the enrichment
loudest and the discontinuation quietest, in a document whose purpose is to say
what changed for somebody looking for land or support.

## The decision

`diff` compares two editions by identifier and reports what a reader would notice:

- a record that stopped operating, or started;
- a name that changed;
- a link that moved — compared as the canonical page, so a tracking parameter or a
  trailing slash is not a change;
- a metric value that moved, with its unit;
- a call that opened, closed or appeared;
- records added and records gone, and the news the newer edition recorded.

Deliberately not a field-by-field diff. A better description or a newly quoted
source is work, not news, and `git diff` remains the complete answer for anybody who
wants every edit.

`npm run validate` turns the two ways continuity breaks into **warnings**: a record
that simply vanishes instead of being kept as DISCONTINUED or HISTORICAL, and the
same page coming back under a new identifier. Warnings rather than errors because
only a person can say whether a record really ended or was renamed by mistake, and
both readings are legitimate. Two records sharing a page while both are listed is
not a rename at all — that is the suspected-duplicate review that already exists.

## What it costs

The output is not an audit, and must never be presented as one. A quote replaced by
a weaker one, a source dropped while another remains, an access cost that changed,
a contact point removed: none of them appears. Somebody auditing a pass reads
`git diff`, and the command's own output would mislead them if they did not.

The continuity rules being warnings has the usual cost of a warning: in
`npm run validate` it can be ignored indefinitely. It fails only in
`npm run check:territory`, where a warning fails too — so it blocks finishing a
territory, which is the moment a person is looking anyway.

## What would overturn it

The first real second edition, and this is the measurement to make then: take the
full structural difference between 2026 and 2027, and list what the command did not
report. Each omission is then a change kind to add or a deliberate silence to
record here. The list above is meant to grow from that comparison, not from
guessing before any second edition existed.
