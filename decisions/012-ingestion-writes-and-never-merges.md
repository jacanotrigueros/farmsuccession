# 012 — Ingestion writes what an answer said and never merges

Decided 2026-10-02, milestone 04.

## The question

An assistant that cannot run commands takes part in the research by delivering the
two files as fenced JSON blocks, and `npm run ingest` turns that answer into
files. The territory it writes into usually already has files, with earlier work in
them.

Merging is the obvious kindness: keep every resource the answer did not mention,
add the new ones, update the ones that changed. The alternative is blunt — write
what the answer said and let the checks judge it — and loses anything the answer
forgot. Both are defensible, and the choice decides what a research pass _is_.

## What the evidence said

A merge needs a rule for what an absent value means, and in this data an absence
is itself a claim. A resource the answer does not mention may be one the pass
checked and found still operating, one it found discontinued, or one it never
looked at. Nothing in the answer distinguishes those three, and they are not
interchangeable: decision 010 exists precisely because "we looked and there is
none" has to be distinguishable from "nobody looked". A merge would have to
silently pick one reading, for every field, every time.

This is the shape decision 009 is about, one level up. There the case was a caught
error becoming a value a caller reports as success; here it would be a missing
value becoming a fact carried over from last year. A merged file would be a record
nobody wrote, and it would pass every check, because the checks judge files and the
file would look complete.

The end-to-end run on a real answer showed the blunt version is enough: a chat
answer for Galicia delivered both files whole, `ingest` wrote them, and the gate
found no errors against the EU and country layers. There was nothing for a merge to
preserve, because the process asks for the whole file and the answer gave it.

## The decision

`ingest` writes and validates. It does not merge, patch or reconcile.

- It takes the fenced blocks whose path the edition layout defines — an edition
  file or a research brief, decided by the same functions the loaders use, so there
  is one definition of where a file belongs.
- Any other path is **refused out loud**, not skipped. A block labelled
  `schema/edition.schema.json` is an answer trying to write somewhere it should
  not, and that is something the maintainer wants to see.
- A duplicate key is refused before `JSON.parse` can hide it by keeping only the
  last value.
- Having written, it runs the whole offline gate and prints what it wrote, what the
  gate said, and the two things still to do: `check:territory` for the quotes it
  has not read back, and `git diff` before committing.
- Git is the undo. The command has no preserve mode, no backup copy and no
  interactive prompt.

## What it costs

Every pass has to return the whole file, which makes an answer long and a
partial re-check impossible through this path: a pass that only re-read three
pages still delivers the file entire. And a pass that forgets a resource deletes
it — the gate will not complain, because a file with one fewer resource is a
perfectly valid file. The only thing standing between that and a commit is the
maintainer reading `git diff`, which is why the command ends by saying so rather
than printing a success line.

## What would overturn it

A genuinely scoped refresh — re-check these three resources, leave the rest alone —
is a real need, and the honest reason it is not here is that the process cannot
yet express it. It needs an answer that distinguishes "checked, unchanged" from
"not looked at", per resource, with its own consultation date. That is a change to
the process document, and only then to this command: while the answer cannot say
which it means, the command must not guess.
