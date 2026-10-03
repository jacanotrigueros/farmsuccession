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
What this repository publishes is the part of that work which is finished and
checked — the EU layer and Spain, 33 files — and France, Italy, Portugal and Germany
arrive with their own milestone. So the command run here today reads those 33 files
and reports the same shape over a smaller sample: 803 pieces of reader-facing prose
where a record says 2,085, and 108 amounts in euros where a record says 200. The
distributions hold; the totals are a fifth of the corpus, and a record that names a
number says which of the two it came from.

## The records

| #                                                       | Decision                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| [001](001-cumulative-territorial-views.md)              | Territorial views are cumulative, and implemented once         |
| [002](002-ajv-full-strict-mode.md)                      | The schemas compile under AJV in full strict mode              |
| [003](003-no-maxitems-in-schemas.md)                    | No `maxItems`, because of what it generates                    |
| [004](004-where-a-rule-lives.md)                        | A rule lives in the schema, or where a message can explain it  |
| [005](005-a-figure-is-a-date-or-a-value-with-a-unit.md) | A figure is a date, or a value with a unit                     |
| [006](006-prose-in-the-wrong-language.md)               | Prose reads as another language at two function words          |
| [007](007-unchecked-is-a-third-answer.md)               | UNCHECKED is an answer, not a softer failure                   |
| [008](008-complete-a-tls-chain.md)                      | Complete a TLS chain; never disable verification               |
| [009](009-no-silent-failures.md)                        | A caught error never becomes a value that reads as success     |
| [010](010-the-brief-is-the-trace.md)                    | Every published record traces back to an admitted lead         |
| [011](011-every-prompt-version-is-kept.md)              | Every version of the research process is kept whole            |
| [012](012-ingestion-writes-and-never-merges.md)         | Ingestion writes what an answer said and never merges          |
| [013](013-a-diff-is-what-a-reader-would-notice.md)      | A diff between editions is what a reader would notice          |
| [014](014-a-file-may-use-the-evidence-it-inherits.md)   | A file's own voice may use the evidence it inherits            |
| [015](015-a-record-whose-source-dies.md)                | A record whose only source dies becomes UNKNOWN, not gone      |
| [016](016-a-pass-is-a-dated-snapshot.md)                | A finished pass is a dated snapshot; a correction only removes |
| [017](017-an-advisory-with-no-patch.md)                 | An advisory with no patch is assessed, not silenced            |
| [018](018-a-record-has-one-address.md)                  | A record has one address, under the territory that recorded it |
| [019](019-a-period-is-what-a-page-said-on-a-day.md)     | A period is what a page said on a day, not a claim about today |
| [020](020-a-reader-gets-words-a-check-gets-codes.md)    | A reader gets words; the codes exist for the checks            |
| [021](021-a-layout-asks-its-own-column.md)              | A layout asks the column it sits in, not the window            |
| [022](022-never-narrower-than-the-source.md)            | A record is never narrower than its source                     |
