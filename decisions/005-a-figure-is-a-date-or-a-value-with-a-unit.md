# 005 — A figure is a date, or a value with a unit

Decided 2026-10-02, milestone 03. Measured.

## The question

Reader-facing prose paraphrases what a source says, and a paraphrase is where an
invented figure hides: the quote is checked against the page, the paraphrase is
not. So every number in prose is compared against the numbers the file's own
evidence states.

The question is what a number _is_ for that comparison. The first implementation
read every number as a normalised string of digits, which made a date three loose
numbers and an amount a number with no unit.

## What the evidence said

Measured over 2,085 pieces of reader-facing prose and 1,611 quotes, with
`npm run measure -- figures` and `-- units`:

**Dates in prose are written in words.** Of the 175 dates in reader-facing text,
169 spell the month out and 6 use slashes; **none** is in ISO form. Reading "28 de
setembro de 2026" as 28, 9 and 2026 therefore matched the year, sometimes the day,
and never the month — while supplying "28" as a number that any later figure could
match by accident. 61 of those dates give no year at all, which is why an absent
year has to match rather than fail.

**Day and month numbers are the noise, not the signal.** A consultation date of
the 15th supplied "15", which then supported an invented "15 hectares" in a
paragraph. That is the failure this check exists to catch, passing because of the
calendar.

**Only some units can be read from prose.** Of 85 real metrics, 79 are in EUR or
HOURS. In prose the recognisable marks are `€`, `%`, `m²` and the spelled words.
Two abbreviations had to be rejected on the evidence: `ha` appears twice, once as
an area ("23 ha") and once as the Italian verb ("nel 2024 **ha** ricevuto"); `h`
appears four times, every one of them a Portuguese opening time ("das 09h00 às
12h30"). "años", "anni" and "ans" are an age as often as a duration.

**No amount has cents to lose.** Of the 200 figures the text itself marks as euros,
not one has a non-zero decimal part, so dropping a trailing `,00` and treating
every other separator as thousands loses nothing real. The ambiguity between a
decimal comma and a thousands separator is therefore left unresolved on purpose.

## The decision

A figure read from text is either a **date**, compared as one date against the
dates of the file, or a **value with the unit written next to it**, compared by
value and unit. An absent year and an absent unit match anything, because a figure
whose unit was guessed wrong would be reported as invented, and a check that cries
wolf is a check researchers learn to skip.

The evidence side is read generously where generosity can only let a figure
through: a date also stands for its year, because prose cites "the 2026 call", and
an eight-digit number stands for the date it spells, because official pages
publish `DATA PUBBLICAZIONE 20261002`. The text side is never read that way.

Dotted dates (`06.08.2026`) are read, strictly as two, two and four digits —
loosen that and "7.1/2026" becomes July and "13.00.00" becomes a date in an
impossible year, both of which are in the corpus.

## What it cost, measured

Against the 101 real edition files the new reading reported **seven figures the
old one had let through, and lost nothing**. Each of the seven was checked by hand
against its file: four dates stated in prose that no quote or date of the file
supports, among them a future opening date in a file with no dates at all; one
superseded deadline; two lower age bounds that no quote states.

Two false positives appeared on the way and were fixed rather than tolerated: a
decree dated `06.08.2026` in a quote, and Veneto publishing its date as
`20261002`.

## What it costs

A quote and a paraphrase can still agree on a number for the wrong reason: the
same value in the same unit, about two different things. Comparing figures by
value cannot see that, and only a reader can.

## What would overturn it

Prose that starts carrying ISO dates, which would make the spelled-month tables
unnecessary; or a corpus where `ha` is overwhelmingly an area, which would make
the hectare abbreviation worth reading. Both are questions for
`npm run measure -- figures`, not for preference.

## Refined later

[014](014-a-file-may-use-the-evidence-it-inherits.md) settles whose evidence may
support a figure, which this record left as "the file" and the territorial model
had already answered differently.
