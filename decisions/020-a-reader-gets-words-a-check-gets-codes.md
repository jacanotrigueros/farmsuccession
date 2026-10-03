# 020 — A reader gets words; the codes exist for the checks

Decided 2026-10-03, milestone 07.

## The question

The schema records closed lists of codes: `ANNOUNCED_NOT_OPERATING`, `FIRST_ESTABLISHMENT`,
`FEE_REQUIRED`, `SUBREGIONAL`. They are there so a check can reason about them and so two
territories stay comparable, and they are good at that job.

A record page shows most of them. The question is who is responsible for turning a code
into something a person reads: the data, by holding a label beside each code; the page, by
printing the code as it is and letting the reader work it out; or a table between them,
which has to be complete in every language the site publishes.

The audience settles part of it — this site is for a working farmer, not a policy
specialist — but not the mechanism, and the mechanism is where this goes wrong months
later, when one new field is printed directly because it looked readable enough.

## What the evidence said

- The edition schema holds **102 codes** across the record, its calls, its figures, its
  contacts and the news. That is the full surface a page can leak.
- They are not evenly bad. `TRAINING` nearly reads as English; `ANNOUNCED_NOT_OPERATING`
  does not; `GENERAL` reads as English and means something narrower than it looks. A rule
  that only covers the ugly ones covers the wrong half, because the harmless-looking ones
  are the ones somebody prints directly.
- Putting the labels in the data was measured against the corpus and rejected: 132 records
  would carry the same label strings over and over, the labels would be free text that
  nothing checks, and a corrected wording would mean editing records whose sources did not
  change — which collides with how a pass is written ([016](016-a-pass-is-a-dated-snapshot.md)).
- Dates and figures are the same problem in another costume. `2026-09-28` is what a machine
  orders by; `20405` is what the source published. Written into a page unchanged, the first
  is a code and the second is ambiguous: 20.405 and 20,405 are different numbers by three
  orders of magnitude depending on which convention the reader has.

## The decision

One table, in the site, for every code the data can hold, in every language the site
writes. It is tied to the generated types with `satisfies`, so a value added to `schema/`
breaks the build until somebody writes its words, and a language that answers only half
the table does not compile.

Dates, numbers, amounts and lists go through the same door: every date a reader sees is
written the way their language writes it, with the stored form kept in the `datetime`
attribute for anything that parses the page; every figure is written in the reader's own
convention; the unit agrees with the count.

Two tests hold it. One reads `schema/edition.schema.json`, collects the codes and fails on
any of them found in any built page. The other is the type system, which is the half that
catches the mistake before it is written rather than after.

`EU` is excluded from the scan, named and with its reason: it is a code _and_ how ordinary
prose writes the European Union, and the records are full of the second one. Anything else
that turns out to be both goes in the same place, with the same kind of note.

## What it costs

A fifth of this part of the site is a table of words that no test can judge for quality.
"Instalarse por primera vez" is a better sentence than `FIRST_ESTABLISHMENT`, and nothing
mechanical can tell whether it is the right one; only a reader can, and the project's
reader works in Spanish.

The table also has to grow before a country can be published: adding France means writing
every one of these in French, and the build will refuse until somebody does. That is the
cost showing up at the right time — the alternative is a French page in English chrome,
which is a page nobody reviewed.

## What would overturn it

A source of translated labels with the authority to be quoted — the EU's own multilingual
vocabularies, for instance, where a category genuinely matches one of these codes. Then the
words would be evidence like anything else on the page, with a source and a date, instead
of the project's own editorial voice. Until then they are the site speaking, which is why
they live in the site.
