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
| `research/`  | One research brief per territory                                               |
| `prompts/`   | The standard research process, used by any assistant or person                 |
| `config/`    | Pinned public TLS intermediates for portals with incomplete certificate chains |
| `src/`       | Production code only                                                           |
| `src/types/` | Types generated from `schema/`, never edited by hand                           |
| `scripts/`   | Development tooling                                                            |
| `frontend/`  | The Astro static site                                                          |
| `test/`      | `node:test` suites and fictional fixtures                                      |

Every directory listed here exists, and each is empty until the milestone that
needs it. That milestone adds its file layout, its commands and their rules to
this file in the same change, so nothing here ever describes something the
repository does not have.

Three schemas are settled: `territories.schema.json` (the catalogue),
`edition.schema.json` (one territory in one year) and
`research-brief.schema.json` (the research memory of a territory). They stay at
`schemaVersion` `1.0.0` until the first public release.

`data/territories.json` is the catalogue, keyed by ISO code plus `EU`. It
carries the EU layer and Spain: the model is proved on one country before more
are added. `src/layers.ts` is the one implementation of the territorial tree —
anything that needs to know what a page shows asks it, so a reader and a
validator cannot disagree. `src/territories.ts` loads the catalogue and also
enforces the rules the schema cannot express: a region belongs to exactly one
hub, a hub of one region reuses that region's slug, and a hub of several never
takes a region's slug.

## Commands

Node.js 24.

```bash
npm install            # also installs the git hooks
npm run check          # type-check, lint, formatting, generated types and tests
npm run types          # regenerate src/types from schema/
npm run types:check    # fail if a committed generated file is stale
npm run format         # format with Prettier
```

## Non-negotiable data rules

These hold from the first commit and constrain how the schema is designed, not
the other way round.

- Every published fact cites at least one public HTTPS source, with the date it
  was consulted and verbatim quotes copied from the page. No source, no entry.
- Never invent a fact, URL, amount, date or deadline. Unknown stays unknown:
  leave it out rather than guess.
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
  requests.
- Every rule that decides what is publishable ships with the test that proves
  it, in the same change.
- `npm run check` must pass before a commit, and never claim a check passed
  without running it.
- `npm install` installs the git hooks: `pre-commit` formats the staged files,
  `pre-push` runs `npm run check`. They remove friction, they do not replace
  it. `--no-verify` skips them, and a shell without Node on its `PATH` cannot
  run them at all, so a commit made there has not been checked whatever its
  message says.
- Never add automatic GitHub Actions triggers (push, pull_request, schedule):
  Actions minutes are limited, so workflows are manual (`workflow_dispatch`)
  and every check runs locally.

## Branching

- `master` holds released state and receives only `release/*` and `hotfix/*`
  merges. `develop` is the integration branch.
- One `feature/*` branch per milestone, merged into `develop` through a
  reviewed pull request before the next milestone starts. Data milestones get
  one branch per territory.
- Never force-push or delete `master` or `develop`.

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
