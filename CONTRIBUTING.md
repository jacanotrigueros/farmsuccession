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

`develop` is the integration branch; `master` holds released state and takes only
`release/*` and `hotfix/*` merges. One `feature/*` branch per milestone, merged
through a reviewed pull request with a merge commit, so the milestone stays
readable as a unit afterwards.

Keep data and code in separate commits, one territory per data commit, so a bad
research pass can be reverted on its own.

## Reporting something wrong in the data

A wrong figure, a dead link or an instrument described as operating when it is not
are the most useful things you can report. Include the page, what it says today,
and the date you looked. That is exactly the evidence a correction needs, and it
goes straight into the record.
