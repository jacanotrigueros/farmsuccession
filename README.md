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

| Area                                                         | State                                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Data contracts (`schema/`) and the types generated from them | Settled at `schemaVersion` 1.0.0                                                          |
| Territorial model (EU → country → hub → region)              | Implemented once, in `src/layers.ts`                                                      |
| Offline validation: schema, semantics, whole-edition rules   | `npm run validate`                                                                        |
| Live checks: cited pages, reachable links, one territory     | `npm run check:sources`, `check:links`, `check:territory`                                 |
| The research process, with every version of it kept          | `prompts/`, currently 1.12.0                                                              |
| The research pipeline: fill a prompt, ingest an answer, diff | `npm run prompt`, `ingest`, `diff`                                                        |
| Published data                                               | The 2026 edition of the EU layer, Spain, Germany, France and Italy: 91 files, 302 records |
| The rest of Europe                                           | Researched, not published here yet: Portugal                                              |
| The site                                                     | Builds from the data: 408 pages, one script on search; not published                      |

## What is published today

The 2026 edition covers the European layer; Spain, with its three multi-island and
multi-province groupings and its 28 regional territories; Germany, with its 16 Länder;
France, with its 18 régions; and Italy, with its 19 regions and two autonomous
provinces: **302 records**, each with the page it came from, the date that page was read
and the words that were on it — 486 sources, 1,483 quotes, 470 distinct pages — plus 30
dated developments of the year and the 91 research briefs that say how each territory was
searched, including the 213 leads that were considered and rejected.

[**What the 2026 research found**](research/findings-2026.md) is the account of that
work territory by territory: what each pass published, what it looked for and did not
find, what it considered and left out with the reason, and what it has still to
settle. It is generated from the data by `npm run report`, and `npm run check` fails
while the committed copy is stale, so the conclusions cannot drift from the evidence.
Read on its own it answers the question the records cannot, and the three countries
answer it differently. In Spain, establishment aid was found in all 28 regional
territories, a succession or cessation aid in 11, a land bank in 21, an entry course in
21, and an advisory service of a farmers' organisation in 13. Germany documents nothing
operative at national level — every one of the 16 Länder carries its own, with
establishment aid in 9, a handover advisory service in 10, a transfer or matching
service in 5, a land exchange in 2 and a qualifying course in 1. France leans towards
land: of its 18 régions, 13 document a land exchange, 12 a transfer or matching service,
11 establishment aid, 6 advice and 4 a qualifying course, while one — Mayotte —
documents nothing and says exactly why. Italy leans the other way: establishment aid in
20 of its 21 territories and a qualifying course in 10, but a transfer or matching
service in only 2, and nothing operative at national level, where the instruments belong
to ISMEA and no page specific enough to cite was found.

`npm run validate` reports `91 edition file(s) and 91 research brief(s) checked: 0
error(s), 0 warning(s), 1 for review`. The count is printed on purpose: a check that
passes over nothing must never read as a clean run. The one for review is a question
rather than a defect — two records, in Berlin and in Brandenburg, cite the same page,
because the two Länder fund establishment through one joint directive, and each record
says so.

Every cited page is re-read against the live web, and every run is kept:
[`reports/checks/`](reports/checks/) holds one file per run, named for the instant it
was taken —
when, what it covered, and each URL with its status, HTTP code and, when it did not
pass, why. `npm run report:sources` reads the series.

The runs over the whole edition on 8 October 2026, the first two eight minutes apart:

|                                            | pages | PASS | FAIL | UNCHECKED |
| ------------------------------------------ | ----- | ---- | ---- | --------- |
| 22:15 UTC                                  | 360   | 284  | 3    | 73        |
| 22:23 UTC                                  | 360   | 302  | 3    | 55        |
| 22:58 UTC, after the certificate fix below | 360   | 289  | 3    | 68        |

**Twenty pages gave a different answer in the second run than in the first**, and that
is the number worth having. The third run makes the same point from the other side: it recovered eight pages no run had been able to read, and its total rose by five, because other pages went the other way in the meantime. A single run reads like a measurement of the corpus and is
not one: it is a reading taken on one machine, on one network, at one moment. The
series is what distinguishes a page that has gone from an evening when nothing could be
reached — [`decisions/025`](decisions/025-a-source-is-gone-when-the-series-says-so.md)
says how, and what it took to learn it.

What the two runs agree on:

- **Three FAIL, the same three both times**, and they are the only findings that ask
  somebody to change a record: a municipal land bank whose procedure page the city
  removed (HTTP 404), and two pages that answered normally but no longer carry one of
  the sentences quoted from them. The records still say what those pages said on the
  day they were read; a page losing a sentence is not by itself evidence that an
  instrument stopped operating, and that call belongs to a person.
- **283 pages passed in both runs.**
- **57 answered in neither.** Their causes, across both runs: 71 connection timeouts
  spread over many hosts, 18 refusals to verify a certificate chain, 12 HTTP 403 from
  hosts that decline automation, 2 DNS failures and 2 HTTP 404.

The certificate failures were one finding, not eighteen, and the series is what made
it one. `www.mapa.gob.es` — the Spanish ministry, eight of the cited pages — serves a
chain that includes the self-signed FNMT root the default store does not carry, so path
building stopped there. `curl` failed on it too and `openssl` answered
`Verify return code: 19`, so it was neither our bug nor a passing glitch.

[`decisions/008`](decisions/008-complete-a-tls-chain.md) says what may be done about
that and what may not: an intermediate issued and signed by a root the runtime already
trusts may be pinned by fingerprint, a trust anchor may never be added, and verification
is never turned off. FNMT publishes exactly such a certificate — the same
`AC RAIZ FNMT-RCM SERVIDORES SEGUROS G2R`, cross-signed by the older `AC RAIZ FNMT-RCM`
that the store does carry — and it is byte-identical to the one the ministry serves. It
is now pinned in [`config/tls-intermediates.json`](config/tls-intermediates.json), and
the eight pages read again: Spain's national layer went from 3 PASS and 8 UNCHECKED to
**11 PASS, 0 FAIL, 0 UNCHECKED**.

The self-signed twin FNMT publishes beside it was rejected: trusting it would add an
anchor, which is the one thing that mechanism must never do. The two Gipuzkoa portals
stay UNCHECKED for the same reason — their chain is anchored in Izenpe, which this
runtime does not carry and which no cross-signed certificate links to a root that it
does.

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
npm run report         # rewrite the account of what each territory's research concluded
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
| `research/`  | One research brief per territory, and what each one concluded         |
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
