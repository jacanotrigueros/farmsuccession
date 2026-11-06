# Decisions

Why each rule of this project is the way it is, and the evidence that settled it.

This is the part of the work that matters most. The code is small and anybody
could write it; the hard part is deciding where a line goes — when a figure in a
paragraph counts as unsupported, when a page that answered proves nothing, when a
rule belongs in a schema and when a message has to explain it — and being able to
show why that line and not another one.

## How a decision is recorded here

Each record answers the same five questions, in the same order:

1. **The question**, stated so that both answers sound reasonable.
2. **What the evidence said**, with the numbers and how to reproduce them. A
   threshold chosen because it felt right is a threshold nobody can defend.
3. **The decision**.
4. **What it costs**, because every line drawn somewhere has a side it gets
   wrong, and the honest thing is to name it rather than discover it later.
5. **What would overturn it**, so a future reader knows what to go and measure
   instead of re-arguing from preference.

Mechanical rules live in tests, with the reason in the failure message, and the
reasoning lives here. A rule that a test can catch does not need a paragraph in
[`AGENTS.md`](../AGENTS.md); it needs a record here and a test there.

## Reproducing the measurements

The numbers in these records come from `npm run measure`, which reads a corpus of
edition files and reports the distributions each decision turned on:

```bash
npm run measure -- figures     # how figures and dates are actually written
npm run measure -- language    # how close real prose comes to reading as another language
npm run measure -- units       # which units appear next to a number, and in what quantity
```

It reads `data/editions` by default and takes a directory as its second argument.

The numbers in the records were measured over the whole corpus one research sweep
produced: 101 edition files and 101 briefs, across the EU layer and five countries.
That is now the corpus this repository publishes, so the sample and the thing it was a
sample of have become the same: the command run here today reads those 101 files and
reports 2,086 pieces of reader-facing prose and 200 amounts in euros, against the 2,085
and 200 the thresholds were set from. The one extra piece of prose is a correction made
on the way in, which is the only honest reason for a measurement to move.

## The records

| #                                                                 | Decision                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| [001](001-cumulative-territorial-views.md)                        | Territorial views are cumulative, and implemented once         |
| [002](002-ajv-full-strict-mode.md)                                | The schemas compile under AJV in full strict mode              |
| [003](003-no-maxitems-in-schemas.md)                              | No `maxItems`, because of what it generates                    |
| [004](004-where-a-rule-lives.md)                                  | A rule lives in the schema, or where a message can explain it  |
| [005](005-a-figure-is-a-date-or-a-value-with-a-unit.md)           | A figure is a date, or a value with a unit                     |
| [006](006-prose-in-the-wrong-language.md)                         | Prose reads as another language at two function words          |
| [007](007-unchecked-is-a-third-answer.md)                         | UNCHECKED is an answer, not a softer failure                   |
| [008](008-complete-a-tls-chain.md)                                | Complete a TLS chain; never disable verification               |
| [009](009-no-silent-failures.md)                                  | A caught error never becomes a value that reads as success     |
| [010](010-the-brief-is-the-trace.md)                              | Every published record traces back to an admitted lead         |
| [011](011-every-prompt-version-is-kept.md)                        | Every version of the research process is kept whole            |
| [012](012-ingestion-writes-and-never-merges.md)                   | Ingestion writes what an answer said and never merges          |
| [013](013-a-diff-is-what-a-reader-would-notice.md)                | A diff between editions is what a reader would notice          |
| [014](014-a-file-may-use-the-evidence-it-inherits.md)             | A file's own voice may use the evidence it inherits            |
| [015](015-a-record-whose-source-dies.md)                          | A record whose only source dies becomes UNKNOWN, not gone      |
| [016](016-a-pass-is-a-dated-snapshot.md)                          | A finished pass is a dated snapshot; a correction only removes |
| [017](017-an-advisory-with-no-patch.md)                           | An advisory with no patch is assessed, not silenced            |
| [018](018-a-record-has-one-address.md)                            | A record has one address                                       |
| [019](019-a-period-is-what-a-page-said-on-a-day.md)               | A period is what a page said on a day; the dates answer today  |
| [020](020-a-reader-gets-words-a-check-gets-codes.md)              | A reader gets words; the codes exist for the checks            |
| [021](021-a-layout-asks-its-own-column.md)                        | A layout asks the column it sits in, not the window            |
| [022](022-never-narrower-than-the-source.md)                      | A record is never narrower than its source                     |
| [023](023-a-country-is-data-a-catalogue-entry-and-a-language.md)  | A country is data, a catalogue entry and a language            |
| [024](024-a-territory-lives-under-a-segment-of-its-own.md)        | A territory lives under a segment of its own                   |
| [025](025-a-source-is-gone-when-the-series-says-so.md)            | A source is gone when the series says so, not when a run does  |
| [026](026-a-reading-says-which-territory-it-was-about.md)         | A reading says which territory it was about                    |
| [027](027-the-page-for-somebody-already-lost-asks-for-nothing.md) | The page for somebody already lost asks for nothing            |
| [028](028-a-page-may-ask-not-to-be-indexed.md)                    | A page may ask not to be indexed, and the sitemap reads that   |
| [029](029-each-period-answers-for-itself.md)                      | Each documented application period answers for itself          |
| [030](030-public-correction-stays-outside-github.md)              | Public corrections use email; GitHub stays behind the site     |
| [031](031-an-amount-belongs-to-its-source.md)                     | An amount belongs to its source, not to its reader             |
| [032](032-a-check-says-what-it-did.md)                            | A check says what it did, not what a trust label suggests      |
| [033](033-a-new-entrant-is-a-person.md)                           | A new entrant is a person entering farming, intended or recent |
| [034](034-an-inline-style-is-an-error.md)                         | The policy travels in the page; an inline style is an error    |
| [035](035-a-measurement-defends-025.md)                           | A measurement defends 025, and says when to come back          |
