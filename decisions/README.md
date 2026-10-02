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

It reads `data/editions` by default, and takes a directory as its second
argument. The corpus behind the numbers recorded so far is the set of 101 edition
files and 101 research briefs that milestone 05 brings into this repository, so
until then the command is run against that directory and the records say so.

## The records

| #                                                       | Decision                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| [001](001-cumulative-territorial-views.md)              | Territorial views are cumulative, and implemented once        |
| [002](002-ajv-full-strict-mode.md)                      | The schemas compile under AJV in full strict mode             |
| [003](003-no-maxitems-in-schemas.md)                    | No `maxItems`, because of what it generates                   |
| [004](004-where-a-rule-lives.md)                        | A rule lives in the schema, or where a message can explain it |
| [005](005-a-figure-is-a-date-or-a-value-with-a-unit.md) | A figure is a date, or a value with a unit                    |
| [006](006-prose-in-the-wrong-language.md)               | Prose reads as another language at two function words         |
| [007](007-unchecked-is-a-third-answer.md)               | UNCHECKED is an answer, not a softer failure                  |
| [008](008-complete-a-tls-chain.md)                      | Complete a TLS chain; never disable verification              |
| [009](009-no-silent-failures.md)                        | A caught error never becomes a value that reads as success    |
| [010](010-the-brief-is-the-trace.md)                    | Every published record traces back to an admitted lead        |
