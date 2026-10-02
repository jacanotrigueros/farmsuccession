# FarmSuccession

Public information about **taking over or starting a farm in Europe** — land
banks, succession and transfer services, establishment aid, training, advice,
official portals and policy frameworks — published as yearly editions of data in
which every single claim is traceable to a public page, the date it was read and
the words that were on it.

It is a directory of verified references, not a replacement for the official
services: every entry points at the page that owns the information.

## The rule everything else serves

**No source, no entry.** A record exists only with at least one public HTTPS
source, the date it was consulted, and verbatim quotes copied from the page.
Nothing is inferred, rounded or remembered.

Two consequences that shape the whole design:

- **Existence is not availability.** An instrument that was announced, or that
  exists only in law, is never presented as operating, and a closed application
  period is never presented as open.
- **A citation nobody re-reads is a claim, not evidence.** Every cited page is
  re-read against its quotes, and a quote that is no longer there fails.

## What is built, and what is not

This repository is being built in milestones, and it says where it is rather
than describing what it intends to be.

| Area                                                         | State                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| Data contracts (`schema/`) and the types generated from them | Settled at `schemaVersion` 1.0.0                                 |
| Territorial model (EU → country → hub → region)              | Implemented once, in `src/layers.ts`                             |
| Offline validation: schema, semantics, whole-edition rules   | `npm run validate`                                               |
| Live checks: cited pages, reachable links, one territory     | `npm run check:sources`, `check:links`, `check:territory`        |
| The research process, with every version of it kept          | `prompts/`, currently 1.11.0                                     |
| The research pipeline: fill a prompt, ingest an answer, diff | `npm run prompt`, `ingest`, `diff`                               |
| Published data                                               | None yet: `data/` holds the territory catalogue and nothing else |
| The site                                                     | Not built yet, so there is nothing to visit                      |

`npm run validate` therefore reports `0 edition file(s) and 0 research brief(s)
checked` today. That is the honest output of a check over an empty dataset, and
it is deliberately said out loud: a check that passes over nothing must never
read as a clean run.

## How a territory becomes publishable

1. **Territories are fixed data.** [`data/territories.json`](data/territories.json)
   is the catalogue: the EU layer, each country, its hubs and its regions, with
   the sources the division itself rests on.
2. **Each territory keeps a research brief** under `research/`: the official
   portals, the queries that work in the local language, and every lead ever
   considered — admitted, rejected with its reason, or still to check. It is the
   memory of how the territory was searched, so the next pass starts where the
   last one stopped.
3. **Information is published as yearly editions** of JSON files validated
   against [`schema/edition.schema.json`](schema/edition.schema.json):

   ```
   data/editions/<year>/eu.json
   data/editions/<year>/countries/<iso>.json
   data/editions/<year>/hubs/<iso>/<hub>.json      (only a hub of several regions)
   data/editions/<year>/regions/<iso>/<region>.json
   ```

   A view is cumulative: a region shows the EU layer, then its country, then its
   hub when it has a file, then itself. A lower layer adds; it never hides what
   a higher one offers. Records keep stable ids across editions, so what
   changed from one year to the next can be read.

4. **Anybody can research a territory** by following
   [`prompts/research-territory.md`](prompts/research-territory.md): a person, or
   an assistant of any kind. `npm run prompt` fills it with the briefs, the
   current data and the schemas; an assistant that can run commands checks its own
   work, and one that cannot delivers the two files as text for `npm run ingest`
   to write. Every version of that process is kept, and each record says which one
   it followed, so old work can be read against the instructions it actually had.
5. **Deterministic checks decide what is publishable.** No model and no
   judgement call sits between the evidence and what gets published; see below.

## What the checks guarantee, and what they cannot

`npm run validate` is offline, runs on every push, and fails on anything that
cannot be true: a file whose path, content and the catalogue disagree about
which territory it describes; a date after the day the file was written; a
review signed before the last source was consulted; a figure, deadline or
contact in prose that no quote, metric or date of that file supports; a call
marked open on a day its own source showed it closed; a resource that no lead in
the brief admitted. It also finds the damage a parser hides, such as a repeated
key that silently keeps only its last value.

The live checks answer in three states, and the third one matters most:

- **PASS** — the page answered and every quote was found again.
- **FAIL** — the address is gone, the page says it does not exist, or a quote is
  not there any more.
- **UNCHECKED** — this run could not read the page: no response, a bot
  challenge, a server error, or a page a browser would have to render. It is not
  a softer failure. It proves nothing either way, and treating it as a pass
  would be the one lie the project cannot afford.

What none of this proves: that coverage is exhaustive, that everything described
is still operating, or that a person has reviewed it. Those are separate claims
and the data says so in its own fields.

## Decisions are measured, not asserted

The interesting part of this project is not the code; it is the reasoning behind
each rule, and the evidence that settled it. Every non-obvious decision is
written down in [`decisions/`](decisions/README.md) with the question, the
options, what the evidence actually said, and what would overturn it.

Three examples of the shape of the argument:

- A date in prose is compared **as a date**, not as three loose numbers. Reading
  "28 de setembro de 2026" as 28, 9 and 2026 looked thorough and matched almost
  anything, and the month never matched at all when a page spells it out.
- A text is judged to be in the wrong language at **two** foreign function
  words, because across 2,085 real pieces of prose no text correctly written in
  its own language reaches two, while a misplaced sentence of twenty words or
  more is caught 98.7 % of the time.
- A unit is read from prose only when it is unambiguous: not `ha`, which is also
  a verb in Spanish, Italian and Portuguese, and not `h`, which real pages use
  for opening times.

## Commands

Node.js 24, no bundler and no build step. Strict TypeScript run natively, typed
with `tsc`, linted with oxlint, formatted with Prettier, tested with
`node:test`.

```bash
npm install            # also installs the git hooks
npm run check          # type-check, lint, formatting, generated types, tests and validate
npm run validate       # the catalogue, every edition file and every brief
npm run prompt -- <year> eu | <iso> | <iso>/<region or hub> [--compact]
npm run ingest -- <saved answer.md>   # write the files an answer delivered, then validate them
npm run diff -- <from year> <to year> # what changed between two editions
npm run check:sources  # live: re-read every cited page and look for its quotes
npm run check:links    # live: ask every address the repository points at whether it answers
npm run check:territory -- <year> eu | <iso> | <iso>/<region or hub>
```

The live checks reach the network and never gate a commit: a portal being down
is not a reason to refuse one. They visit one host at a time with a pause
between requests, identify themselves rather than posing as a browser, and write
their full result to `reports/`.

## Repository layout

| Path         | What is in it                                                         |
| ------------ | --------------------------------------------------------------------- |
| `schema/`    | JSON Schemas (Draft 2020-12): the single source of truth for shapes   |
| `data/`      | The territory catalogue and the yearly editions                       |
| `research/`  | One research brief per territory                                      |
| `decisions/` | Why each rule is the way it is, and the evidence that decided it      |
| `src/`       | Production code: loading, validation, and the live checks             |
| `src/types/` | Types generated from `schema/`, never edited by hand                  |
| `test/`      | `node:test` suites and fictional fixtures                             |
| `prompts/`   | The standard research process, for a person or an assistant to follow |
| `config/`    | Pinned public TLS intermediates for portals with incomplete chains    |
| `frontend/`  | The static site                                                       |

[`AGENTS.md`](AGENTS.md) is the working contract for anyone — person or coding
agent — committing here, and [`CONTRIBUTING.md`](CONTRIBUTING.md) covers the
same ground for a human reader.

## Licence

[CC BY 4.0](LICENSE) — the data, the site and the code that produces them. Use
them, including commercially, with attribution. The quoted excerpts belong to
the public bodies that published them and are cited, with their source and the
date they were read, as evidence.
