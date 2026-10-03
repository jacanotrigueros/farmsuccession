# 016 — A finished pass is a dated snapshot, and a correction may only remove

Decided 2026-10-02, milestone 05.

## The question

Bringing in real research found three sentences claiming a date that no quote,
metric or URL of their file supported. One of them turned out to be **true**: La
Palma's limitation dated the island land bank's announcement 9 July 2026, and the
Cabildo's page does print "Jueves, 9 de julio de 2026" in its body. Nobody had
quoted it.

So the obvious fix is available and tempting: read the page, copy the quote, add the
source, keep the date. The file gets better evidence and the reader gets a verifiable
date. The question is whether a pass that finished on 28 September may be improved on
2 October.

## What the evidence said

The gate answers before any argument does. A source may not be consulted after the
file was published, and a review may not be signed before the last source was read.
Adding a source read on 2 October to a file published on 28 September therefore
forces both dates forward — and the second of them says a person reviewed the file
that day. Nobody did. The alternative, writing 28 September as the consultation date
for a page read on the 2nd, is simply a lie about when evidence was gathered.

Those rules were written for dates inside one pass. What they turn out to encode is
bigger: a published file is not a document that improves, it is **the record of what
somebody could see on a particular day**. That is also what makes the diff between
two editions mean anything — if files kept absorbing later evidence, two editions
would differ by when somebody last had time rather than by what changed in the world.

The other two sentences were not true in this sense: their dates existed only in the
brief's own `reason` prose, with no quote behind them anywhere. One unverified
sentence citing another is not evidence, and no re-reading was needed to decide that.

## The decision

A finished pass is a snapshot. Only two things may happen to it.

- **A correction may remove, never add.** Taking out a claim the file's own evidence
  does not support needs no new source, changes no date, and leaves the file saying
  less and nothing false. That is what was done to all three sentences, with each
  commit saying which claim went and why.
- **Adding evidence is a new pass**, which re-dates the file honestly: new
  consultation dates, a new publication date, and a review state that says a person
  has not signed it off. Convenience is not a reason to start one.

What follows from that, and is the rule a researcher needs:

- A dated fact about something the file does **not** publish belongs in `news`, with
  its page and its quote, written while the page is open. `limitations` carries no
  sources of its own, so a date put there can never be evidence. This is now in the
  research process, version 1.12.0.
- The dated detail that cannot be published stays in the brief, which is memory
  rather than a published claim, and therefore may be written at any time.
- Each territory enters the repository in its own commit, edition file and brief
  together, because a pass is the unit that can be wrong and so it has to be the unit
  that can be reverted.

## What it costs

Published prose says less than the researcher knew. La Palma's limitation no longer
dates the announcement although the date is on the page and verifiable in one click,
which is a real loss of information to a reader and the honest price of a file that
cannot be quietly improved after the fact.

It also means a page that starts showing more than it did when it was read goes
unused until the next pass, and that passes are the only way information gets better.

## What would overturn it

A scoped refresh the process can express: a pass that re-reads a named part of a
file, says per record whether it was checked and unchanged or not looked at, and dates
only what it touched. That is the open question decision 012 left, and it is the one
thing that would let a file gain evidence without claiming a review nobody made.
