# 011 — Every version of the research process is kept whole

Decided 2026-10-02, milestone 04.

## The question

The research process is one file under version control, and every version it ever
had is already in the history: a record that says it followed version 1.8.0 could
be read against the commit that carried 1.8.0. Keeping twelve near-identical
copies of a 28 KB document in the working tree is the kind of duplication this
project removes everywhere else.

So the question is whether the history is a good enough answer, or whether a
superseded version has to exist as a file somebody can open.

## What the evidence said

The 101 edition files of the corpus declare four different versions of the
process — 1.0.0, 1.1.0, 1.8.0 and 1.9.0 — and **not one of them is the version in
force**. Every published record, today, follows instructions that are no longer
the prompt. That is not a transitional state; it is what a versioned process looks
like once it has been used.

Then the part that settles it. The history those records would be read against is
not this repository's history. The versions those files name were written in an
earlier generation of the project, and its commits are not in this repository at
all. The inherited `VERSIONS.md` cited several of them by commit hash, and
not one of those hashes resolves — the document was a set of pointers into a
history that had been left behind. A pointer is only as durable as what it points
at, and this project has already rewritten its own history once.

The third fact is about who reads it. What gets published is JSON, meant to be
read without the repository at all. A reader holding the data and not a clone
cannot resolve a commit, so a `promptVersion` whose only referent is a SHA is a
claim that cannot be checked by the people the claim is for.

The cost side was measured rather than assumed: twelve snapshots are 192 KB,
against the 28 KB of the prompt in force.

## The decision

Every superseded version is kept whole, as a file in `prompts/versions/`.

- The version is read from the `Prompt version: x.y.z` line **inside** each file,
  never from its name, so a snapshot renamed by hand cannot quietly claim to be a
  version it is not.
- A superseded version is never edited. Rewriting one turns the account of what a
  pass was told into what we now wish it had been told. They are excluded from
  Prettier for the same reason: formatting a snapshot edits it.
- `npm run validate` refuses a record whose `metadata.generatedBy.promptVersion`
  is not a version the repository can show — including a version newer than the
  current prompt, which is a record claiming instructions nobody wrote. A file
  drafted by a person followed no prompt and needs none.
- Changing the prompt means raising its own version line, keeping the superseded
  text as a snapshot, and saying in `prompts/VERSIONS.md` what changed and why, in
  the same change.
- `VERSIONS.md` cites nothing it cannot resolve. It is a reading of the versions,
  not the record of them: the versions are the files.

## What it costs

192 KB today, growing by the size of the prompt at every version, and a mechanical
obligation on every edit of the process — snapshot plus changelog entry — which is
exactly the kind of step somebody skips in a hurry. The gate does not catch a
missing snapshot until a record names the missing version, which is later than one
would like.

It also means two accounts of the same thing exist, the snapshots and
`VERSIONS.md`, and they can disagree. That is why the known versions are computed
from the files and `VERSIONS.md` has no authority: when they disagree, the prose
is wrong.

## What would overturn it

A record carrying the instructions it followed inside itself would make the
snapshot redundant. That sounds neat and is a much bigger change than it looks: it
puts a 28 KB document in every file, where decision 005's reasoning about prose
and evidence would then apply to it.

What would not overturn it: the duplication becoming annoying. The duplication is
the price of a published claim being checkable by somebody who has only the
published data.
