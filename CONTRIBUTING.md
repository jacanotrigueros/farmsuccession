# Contributing

Thank you for looking. This covers the same ground as [`AGENTS.md`](AGENTS.md),
which is the working contract for anyone — person or coding agent — committing
here. Where the two disagree, `AGENTS.md` wins and the disagreement is worth
reporting.

## What this project will and will not accept

The value of this repository is that every published claim is traceable. That
makes some ordinary contributions unwelcome and some unusual ones essential.

**Welcome**: a source that is better than the one cited; a figure that has
changed, with the page that says so; a territory nobody has documented; a rule
that catches something real, with the test that proves it; a decision record that
argues a line better than the current one.

**Not accepted, whatever its quality**: a record without a public source, a
consulted date and verbatim quotes. A figure, URL, amount or deadline that is
written from memory or inference. An instrument described as operating because it
was announced. A quote deleted to make a failing check pass.

If you are unsure whether something is verifiable, open an issue with the page
you are looking at rather than a pull request.

## Getting set up

Node.js 24 (see [`.nvmrc`](.nvmrc)). There is no bundler and no build step.

```bash
npm install            # also installs the git hooks
npm run check          # type-check, lint, formatting, generated types, tests and validate
```

`npm install` installs two git hooks: `pre-commit` formats the staged files and
`pre-push` runs `npm run check`. They remove friction, they do not replace it —
`--no-verify` skips them, and a shell without Node on its `PATH` cannot run them
at all, so a commit made there has not been checked whatever its message says.

## The rules that matter most

- **A data shape changes in `schema/` first.** Everything in `src/types/` is
  generated from it with `npm run types`, never edited by hand. Read what it
  generated before committing: a schema can be valid, strict and pass every test
  while producing a type nobody can read.
- **Every rule that decides what is publishable ships with the test that proves
  it, in the same change**, and the reason goes in the failure message so the next
  person reads why before deleting the test.
- **A threshold is measured, not chosen.** If a rule needs a number, measure it
  against the corpus with `npm run measure` and record what you found in
  [`decisions/`](decisions/README.md). "It felt about right" is not an argument
  anybody can check.
- **Nothing describes what does not exist.** A document that mentions a command,
  a directory or a field the repository does not have is a bug, and so is a
  command that exists without being written down.
- **A check that could not read something says so.** UNCHECKED is not a softer
  failure, a skipped file is reported, and a caught error never becomes a value a
  caller can report as success.

## Commits and branches

Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org/),
Angular's flavour: `type(scope): subject`, imperative, no full stop. The body is
where the reasoning goes, and it is read: say what the diff does and why that way
rather than another, and never claim a check the diff does not contain.

`develop` is the integration branch; `master` holds released state. Version 1.0.0
is `develop` as it stood when the 2026 edition was read back and closed, tagged
`v1.0.0`; after that `master` takes `release/*` and `hotfix/*` merges only. One `feature/*` branch per milestone, merged
through a reviewed pull request with a merge commit, so the milestone stays
readable as a unit afterwards.

Keep data and code in separate commits, one territory per data commit, so a bad
research pass can be reverted on its own.

## Reporting something wrong in the data

A wrong figure, a dead link or an instrument described as operating when it is not
are the most useful things you can report. Include the page, what it says today,
and the date you looked. That is exactly the evidence a correction needs, and it
goes straight into the record.

## How this repository is protected

None of this is suspicion of contributors. It is that a documentary project can
be damaged quietly — a figure nobody checks, a quote deleted to make a check
pass, a workflow spending a budget nobody is watching — and the damage is only
visible later.

- **A pull request is checked by the repository, not by its author's word.**
  The whole gate — types, lint, formatting, generated types, the tests and the
  validator — runs on every pull request, on a clean checkout with nothing of
  anybody's machine in it, and the branch protection will not merge without it.
  It runs on `pull_request`, so a fork's code never sees a secret of this
  repository or a token that can write to it.
- **It costs nothing while the repository is private.** GitHub-hosted minutes
  are free and unlimited for a public repository and come out of a monthly
  allowance for a private one, so the job is skipped while this one is private:
  a skipped job spends nothing and reports success, and the push hook has run
  the same gate anyway. Tests fail if a workflow ever reacts to an event without
  that condition, uses `pull_request_target`, stops saying what it is allowed to
  touch, or runs an action from a branch instead of a released version.
- **Publishing is a decision.** The publish workflow refuses to run on anything
  but `master`, builds the site from the data, validates it again before the
  artifact is uploaded, and goes out through a protected environment. An edition
  reaches readers because somebody decided it should, never because a merge
  happened.
- **The gate runs before the review, not after it.** `npm run check` — types,
  lint, formatting, generated types, 200-odd tests and the validator over every
  edition file and brief — runs on a commit and again on a push, through the git
  hooks that `npm install` sets up. A pull request that did not run it is
  visible immediately, because the account of the edition it would have
  regenerated is stale.
- **Every change is reviewed by the maintainer**, through `CODEOWNERS` and the
  branch protection behind it. The schemas and the published data are where this
  matters most: a schema change is a change to every record at once.
- **The live checks never gate anything.** They reach the network, and a portal
  being down is not a reason to refuse a commit. What they produce is a reading,
  kept in `reports/checks/`, and
  [`research/live-checks.md`](research/live-checks.md) says how to read a series
  of them.

## The settings behind all that

Written down because a setting that only exists in a web interface is one
accidental click from not existing. For the maintainer, in the repository
settings:

- **Branches**: a protection rule on `master` and on `develop` — a pull request
  before merging, the `check` job required to pass, review from code owners,
  conversations resolved, no force pushes, no deletions, and no bypass for
  anybody.
- **Tags**: protect `v*`, so a released version cannot be moved after the fact.
- **Actions**: workflow permissions read-only by default; do not let Actions
  create or approve pull requests; require approval for all fork pull requests
  from outside collaborators.
- **Billing**: the Actions and Packages spending limit at zero, so a private
  repository can never bill for a run.
- **Environments**: `github-pages` restricted to `master`, with the maintainer
  as a required reviewer, so publication needs a second deliberate click.
- **Pages**: source "GitHub Actions". It needs a paid plan while the repository
  is private; on the free plan the repository is public first.

## If you are reading this to see how it is built

That is a fair reason to be here. The shortest path through the repository:
[`decisions/`](decisions/README.md) for why each rule exists and the evidence
that decided it, the layout table in [`README.md`](README.md) for the shape of
the thing, [`research/live-checks.md`](research/live-checks.md) for how the corpus
is read back against its own sources, and `schema/` for the contract everything
else serves. The site is in `frontend/`, builds to static files, and ships no
framework: what JavaScript it does ship is listed in a test that fails if a page
loads anything else.
