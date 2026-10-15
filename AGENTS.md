# Instructions for AI agents

Keep this project small and practical: prefer deleting scope to adding
abstractions for hypothetical needs, and prefer an existing, well-maintained
tool to writing our own.

## What the project is

A static site on GitHub Pages that centralises public, source-linked
information about farm succession in Europe (land banks, succession services,
aid, training, advice, official portals, policy frameworks and dated news),
published as **yearly editions** of JSON files per EU / country / region.

## Where things go

| Path         | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| `schema/`    | JSON Schemas (Draft 2020-12): the single source of truth for data shapes       |
| `data/`      | The territory catalogue and the yearly editions                                |
| `research/`  | One research brief per territory, and the generated account of what each found |
| `decisions/` | Why each rule is the way it is, and the evidence that decided it               |
| `prompts/`   | The standard research process, used by any assistant or person                 |
| `config/`    | Pinned public TLS intermediates for portals with incomplete certificate chains |
| `reports/`   | Where the live checks write their full result; output, never committed         |
| `src/`       | Production code only                                                           |
| `src/types/` | Types generated from `schema/`, never edited by hand                           |
| `scripts/`   | Development tooling                                                            |
| `frontend/`  | The Astro static site                                                          |
| `test/`      | `node:test` suites and fictional fixtures                                      |

Every directory listed here exists and now holds the work it was waiting for.
Each stayed empty until the milestone that needed it, and that milestone added its
file layout, its commands and their rules to this file in the same change, so
nothing here ever describes something the repository does not have. The empty ones
were held open by a `.gitkeep`; none is left, and a directory that fills up does not
keep the placeholder that stood in for its contents.

`data/editions/2026` and `research/` hold the real data: the European layer; Spain,
with its three groupings of several regions and its 28 regional territories; Germany,
with its 16 Länder; France, with its 18 régions; Italy, with its 19 regions and two
autonomous provinces; and Portugal, with its 9, each territory with one research brief.
The catalogue carries the EU layer and those five countries, and nothing else. The two halves of that have to agree: a file whose
country the catalogue does not define is an error rather than a file waiting for its
country, and a country the catalogue defines with no file of its own is the same
mistake the other way round. `test/territories.test.ts` compares the two instead of
naming the countries, so neither can be edited without the other.

## The site

`frontend/` is an Astro site with its own `package.json`, built from `data/` and
nothing else. It has one job — showing what the gate already judged — and it decides
nothing about what is publishable.

```bash
cd frontend
npm install
npm run dev            # http://localhost:4321
npm run check          # type-check, build, and the tests over what was built
npm run build          # writes frontend/dist, which is output and is not committed
```

| Path                    | What is in it                                                       |
| ----------------------- | ------------------------------------------------------------------- |
| `src/pages/`            | One route per surface: every territory, and every record            |
| `src/layouts/`          | The one shell every page uses                                       |
| `src/components/`       | Presentation only: no data loading, no rules                        |
| `src/lib/corpus.ts`     | The only place the site reads data                                  |
| `src/lib/words.ts`      | The site's own words, per language                                  |
| `src/lib/vocabulary.ts` | The words for the codes the data holds, per language                |
| `src/lib/language.ts`   | Dates, figures and lists, written the way each language writes them |
| `src/styles/global.css` | The tokens: every colour and size comes from here                   |
| `test/`                 | Tests over the built HTML in `dist/`                                |

The rules, which are requirements rather than preferences:

- **The published pages make no third-party request and store nothing in the reader's
  browser, and a page ships JavaScript only for something it actually carries.** The
  audience is often on a phone on a rural connection. Tests over `dist/` enforce all
  three: a page may load `/search.js` only if it has a search form, `/apply.js` only
  if it has an application-period block, `/filter.js` only if it has an in-page filter,
  and `/report.js` only if it has the public correction form; never inline, and nothing
  shipped to a browser — this project's code or the search engine's — may touch a cookie
  or any storage.
- **Every enhancement sits on a page that is already complete.** Every record in scope
  is in the HTML before anything runs; the search field stays hidden until the index
  answers; a reader whose browser never gets there loses the typing, not the answer. A
  control that cannot do anything is worse than no control.
- **The route fixes the scope of a search and the query string can only narrow it.**
  `/search/` is Europe and `/{cc}/{slug}/` is one country, at the word that country's
  language uses for searching. A `country` parameter on a national route is ignored and
  a territory belonging to somewhere else is dropped, so no link — however it was built,
  edited or shared — can show a reader a scheme that does not apply where they are.
  `public/search-scope.js` owns that contract and is read by the pages when they are
  built, by the browser, and by the tests: implemented twice means disagreeing once.
- **One search bundle per language, each holding the records written in it**, plus a
  manifest. A scope loads the bundles its own records need and queries each with its own
  stemmer, through its own import of its own `pagefind.js`. Never merge indexes across
  languages and never put two languages through one module: Pagefind keeps one
  WebAssembly instance per module, so the second language silently gets the first one's
  stemmer. `pagefind.filters()` is called once per bundle, or the counts of every facet
  the query did not mention are simply missing.
- **A value in a URL or an index is a code from the schema, never a translated word.** A
  shared search has to survive being opened in another language, and a result found from
  the European page is described in the words of the page that found it.
- **The site reads data only through `src/lib/corpus.ts`**, which loads the
  repository's own modules from the repository rather than bundling them: they resolve
  the schemas and the data from their own location, which stops being true the moment a
  bundler copies them. `astro.config.mjs` injects the repository root, and it is the
  only file in a position to know it.
- **No code a reader never sees.** The data says `ANNOUNCED_NOT_OPERATING`; a page says
  what that means, from `vocabulary.ts`, in the territory's language. A language with no
  words there throws at build time instead of rendering English chrome around text in
  another language, and a test reads `schema/` and fails on any of its codes found in a
  built page. Dates and figures go the same way: a reader never meets `2026-09-28`, and
  `20405` is written in their own convention, because 20.405 and 20,405 are different
  numbers depending on who is reading.
- **A record has one page**, under the territory whose file holds it; every territory that
  inherits it links there rather than carrying a copy (`decisions/018`).
- **An application period is printed as a dated statement about a page**, never as a
  verdict about today, and a test fails a page that states one without the date its source
  was read (`decisions/019`). A site published once a year cannot know what a page says
  this afternoon; the official link can, which is why it is the most prominent thing on a
  record page.
- **The evidence is never folded away.** Numbered sources, with their addresses, the date
  each was read and its quotes in full. A test fails if a quote on a page is not character
  for character the quote in the data: shortened to fit a layout, it stops being something
  a reader can search the live page for.
- **Sizes are a constraint**: 17px body, nothing functional under 16px, metadata never
  under 15px, anything tappable at least 44px, and the page works at 320px wide. The
  readers are farmers, often older, often on a phone.
- **No imagery beyond one illustration in the home hero.** The schema has no image
  field; operator emblems are protected marks; a grid that is mostly placeholder reads
  as broken. Every asset is first-party and committed, and `image.domains` and
  `image.remotePatterns` stay empty — which is also what keeps the one open advisory in
  the dependency tree unreachable (`decisions/017`).
- **`astro check` runs with the type check**: `npm run typecheck` is `tsc` over the
  project and then `astro check`, so the type coupling to `schema/` is checked and
  `.astro` files are checked too. Keep logic in `.ts` anyway: there the compiler sees
  it without a template around it, and a test can reach it.

Three data schemas are settled: `territories.schema.json` (the catalogue),
`edition.schema.json` (one territory in one year) and
`research-brief.schema.json` (the research memory of a territory). They stay at
`schemaVersion` `1.0.0` until the first public release.
`tls-intermediates.schema.json` describes the one piece of configuration in
`config/` and carries no version, because nothing publishes it.

`data/territories.json` is the catalogue, keyed by ISO code plus `EU`. It
carries the EU layer and five countries: a country is added with its data, never ahead
of it. `src/layers.ts` is the one implementation of the territorial tree —
anything that needs to know what a page shows asks it, so a reader and a
validator cannot disagree. `src/territories.ts` loads the catalogue and also
enforces the rules the schema cannot express: a region belongs to exactly one
hub, a hub of one region reuses that region's slug, and a hub of several never
takes a region's slug.

A research brief under `research/` is the memory of how a territory was
searched: its portals, its queries, and every lead with what became of it. It is
not a draft of an edition file, and it is what makes a published record
re-verifiable rather than merely sourced — every resource in an edition file has
to trace back to a lead the brief admitted, and a lead that claims to have
become a resource has to name one a reader of that territory can actually see.

## Commands

Node.js 24.

```bash
npm install            # also installs the git hooks
npm run check          # everything below plus type-check, lint, formatting and tests
npm run validate       # the catalogue, every edition file and every brief; -- <year> for one edition
npm run types          # regenerate src/types from schema/
npm run types:check    # fail if a committed generated file is stale
npm run format         # format with Prettier
npm run measure -- figures | units | language [editionsDir]
npm run report         # rewrite research/findings-<year>.md; --check fails if one is stale
npm run prompt -- <year> eu | <iso> | <iso>/<region or hub> [--compact]
npm run ingest -- <saved answer.md>
npm run diff -- <from year> <to year>
```

`validate` reaches no network, which is why it runs on every push. It prints how
many files it checked, so a run over nothing cannot be read as a clean run. An
error means something cannot be true and fails; a warning and a suspected
duplicate ask a person to look and do not.

The live checks do reach the network, and therefore never gate a commit:

```bash
npm run check:sources  # re-read every cited page and look for its quotes
npm run check:links    # ask every address the repository points at whether it answers
npm run check:territory -- <year> eu | <iso> | <iso>/<region or hub>
```

`check:territory` is the gate for finishing one territory, and it is stricter
than the others on purpose: for that territory's edition file and brief, a
warning fails it too, a region has to answer every instrument its country brief
expects, and every cited page has to give its quotes back. Passing means nothing
in the territory contradicts itself, nothing published is untraceable and every
quote was found again today — not that coverage is exhaustive, not that what is
described still operates, and not that a person has reviewed it.

Both take `-- <year>` for one edition, visit one host at a time with a pause
between requests, and write their full result to `reports/`. They answer PASS,
FAIL or UNCHECKED, and the third is not a softer failure: it means this run could
not read the page — no response, a bot challenge, a server error, a page a browser
would have to render — so it proves nothing either way. Never report an UNCHECKED
page as verified, and never "fix" one by removing the quote.

**A verdict about a source comes from the series of runs, never from the run in
front of you.** Every run writes `reports/checks/<when>--<scope>.json`, which is
committed as a file of its own, and `npm run report:sources` reads the series territory by
territory — never pass a territory spec to a sweep to get that detail, every reading
already records which territories cite the page. A page is only GONE after it
answered with a refusal, or lost its quotes, on two different days, and silence
never becomes GONE at all. A run where half or more of what it checked never
answered is a reading about the machine it ran on, and its totals are not a
measurement of the corpus — see [`decisions/025`](decisions/025-a-source-is-gone-when-the-series-says-so.md)
for the French sweep that proved it, where 36 pages went unread one evening and
every one of them answered the next day.

One research pass is one territory in one edition: `npm run prompt` builds the
instructions for it, the pass produces that territory's edition file and its
brief, and `npm run check:territory` decides whether it is finished. An assistant
that can run commands works in the repository and checks its own work; one that
cannot delivers the two files as fenced JSON blocks and `npm run ingest` writes
them. Either way the same checks judge the result, which is the reason the process
does not care who did the research.

## Non-negotiable data rules

These hold from the first commit and constrain how the schema is designed, not
the other way round.

- Every published fact cites at least one public HTTPS source, with the date it
  was consulted and verbatim quotes copied from the page. No source, no entry.
- Never invent a fact, URL, amount, date or deadline. Unknown stays unknown:
  leave it out rather than guess.
- **Never record a limit the source does not state** (`decisions/022`). Where a page
  sets no age, no sector, no fee, no territory within the territory and no profile,
  the record sets none; where it opens something to anyone and also names who it has
  in mind, both go in; where it names no audience at all, the field is left out. An
  invented restriction is worse than an invented instrument: the reader it turns away
  never applies, never learns they were eligible, and never produces the complaint
  that would have corrected it, so nothing in the system contradicts it.
- Existence is not availability. An announced or legal-only instrument is never
  presented as operating, and a closed application period is never presented as
  open.
- Territorial views are cumulative: the EU view is the EU layer; a country view
  is EU plus country; a region view is EU plus country plus region, plus a
  grouping layer where one genuinely applies. A fact is recorded once, at the
  widest territory it applies to, and a lower layer never repeats it.
- A thing keeps the same identifier across editions, so progress from one year
  to the next can be read from that identifier and the dated news of each
  edition.
- Territories come from the catalogue only. Never invent a territory or a slug.
- Free text is written in the territory's language; quotes stay in the source
  language. Code, comments, commit messages and repository docs are in English.
- Contact points are institutional or role-based channels only; never a named
  person's direct details.
- An agent never marks its own work as reviewed. Only a person reviews.

## Engineering rules

- Strict TypeScript run natively by Node.js 24 (type stripping), type-checked
  with `tsc`, linted with oxlint (type-aware), formatted with Prettier, tested
  with `node:test`. No bundler and no build step.
- A data shape changes in `schema/` first; everything generated from it follows,
  never the other way round. Read what it generated before committing: a schema
  can be valid, strict and pass every test while producing a type nobody can
  read.
- No AI agent runtime in the pipeline. Discovery and drafting may use any
  practical means (scripts, open-data APIs, sitemaps, search, manual additions,
  ChatGPT, Claude), but what gets published is decided by deterministic checks.
- The published site is cookie-free, has no analytics and makes no third-party
  requests. What the project knows about its readers comes instead from Google
  Search Console and Bing Webmaster Tools, which measure the search engines' own
  side: which pages they have indexed, what people searched for, which results
  they clicked. Both are verified through the DNS zone, so they add nothing to a
  page and see nobody who arrives another way. Anything that needs a tag in the
  HTML is out, whatever it promises about privacy.
- Every rule that decides what is publishable ships with the test that proves
  it, in the same change. A rule the schema can state belongs in the schema; a
  rule that needs a sentence to explain itself belongs in
  `src/validate-edition.ts`, where the message can say it.
- A threshold is measured against the corpus with `npm run measure`, and what it
  measured is recorded in `decisions/`. A number chosen because it looked right
  is a number nobody can defend, and the records are where the reasoning lives
  that no test can hold.
- `research/findings-<year>.md` is written by `npm run report` from the edition
  files and the briefs, never by hand, and `npm run check` fails while a committed
  one is stale. It is the account of what each pass concluded — what it looked for
  and did not find, what it left out and why — and an account that can drift from
  the evidence it describes is worth nothing. Change what it says by changing the
  data, or the generator when the data is right and the telling is wrong.
- A check that could not read something says so. UNCHECKED, a skipped file and a
  warning are answers; an empty result over nothing is not a clean run, and a
  caught error must never become a value a caller reports as success.
- The research process is versioned, and every version is kept whole in
  `prompts/versions/`. Changing `prompts/research-territory.md` means raising the
  version in its own `Prompt version:` line, keeping the superseded text as a
  snapshot and saying in `prompts/VERSIONS.md` what changed and why. Never edit a
  superseded version: a record says which version it followed, and rewriting that
  version turns the account of what a pass was told into what we now wish it had
  been told.
- `npm run check` must pass before a commit, and never claim a check passed
  without running it.
- `npm install` installs the git hooks: `pre-commit` formats the staged files,
  `pre-push` runs `npm run check`. They remove friction, they do not replace
  it. `--no-verify` skips them, and a shell without Node on its `PATH` cannot
  run them at all, so a commit made there has not been checked whatever its
  message says.
- A workflow that reacts to an event must run its jobs only while the repository
  is public, where GitHub-hosted minutes are free; while it is private they come
  out of a monthly allowance. Nothing that publishes may react to an event at
  all. Tests in `test/workflows.test.ts` carry the reasoning and fail on both.

## Branching

- `master` holds released state and receives only `release/*` and `hotfix/*`
  merges. `develop` is the integration branch.
- One `feature/*` branch per milestone, merged into `develop` through a
  reviewed pull request before the next milestone starts. Data milestones get
  one branch per territory.
- A merge commit names the branch it merged — `Merge feature/validators: add
schema and semantic validation rules` — and names a pull request number only
  when that pull request is in this repository. A number is a reference, and a
  reference that resolves to nothing is worse than no reference: the first
  milestones were merged in an earlier repository, so their merge commits name
  their branch and nothing else.
- Never force-push or delete `master` or `develop`.
- The first seven commits are the milestones this work went through before this
  repository existed, one commit each, taken as the state in which each of them was
  integrated. Everything after them follows the contract above.

## Commits

Conventional Commits (`type(scope): subject`, imperative, no full stop), small
and focused.

The maintainer is the sole author of every commit. Never add a
`Co-Authored-By` trailer and never name an assistant in a commit message, pull
request or release: drafting may use any practical means, but the published
history is the maintainer's own record. Verify with
`git log --format='%an <%ae>' | sort -u` before pushing.

A commit message describes what the diff does. Do not claim a check, a
validation or a feature the diff does not contain.

Keep data and code in separate commits, one territory per data commit, so a bad
research pass can be reverted on its own.

## Working alongside another assistant

More than one assistant commits to this repository. The repository is the
shared memory, not any conversation.

- Before building on someone else's commits: fetch, `npm ci`, `npm run check`.
  If it fails, fix or report it first; never stack new work on a broken branch.
  Commits pushed from an environment that cannot run commands have not been
  checked, whatever their message says.
- Resolve the live branch before reading or building on it. A local ref can be
  behind what is pushed, and work built on a stale ref has to be redone.
- Stage and commit in one step when sessions share a working tree and its
  index: a change staged early can land in someone else's commit.

## Publishing and visibility

Publishing to `farmsuccession.eu`, and the repository's visibility, are the
maintainer's decisions alone. An agent may build locally to test, and never
publishes, changes visibility or touches the GitHub Pages settings.
