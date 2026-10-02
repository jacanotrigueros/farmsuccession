# 006 — Prose reads as another language at two function words

Decided 2026-10-02, milestone 03. Measured.

## The question

Free text is written in the territory's language; only quotes keep the language of
the page they came from. One researcher working through several countries leaves a
paragraph in the wrong language sooner or later, and nothing else in the checks
would notice: the file is schema-valid, the sources are real, the quotes match.

Detecting it means judging a language from a short text, which is a heuristic, and
a heuristic that fires on correct text is worse than no heuristic at all.

## What the evidence said

The method: count the distinct function words of another catalogue language that
are not also words of the text's own language. Measured with
`npm run measure -- language` over 2,085 pieces of real prose, and over the same
prose scored as if it had been left in each of the other five languages.

**Correctly written prose never reaches two.** 84 of 2,085 texts reach exactly
one, every one a coincidence: "es" is a German word as well as a Spanish article,
"an" is German, "per" is German, "dos" is Portuguese and Spanish. The other 2,001
reach zero. None reaches two.

**Misplaced prose scores far higher.** Across 10,425 simulated misplacements, a
threshold of two catches 84.9 % of all of them and **98.7 % of those of twenty
words or more**. Raising it to three drops the long-sentence figure to 94.5 %, and
to four, 84.9 %. There is no empty gap to move into: the cost of raising it is
immediate, and the benefit is nothing, because correct prose never reaches two.

**The one false alarm the corpus comes closest to** is Spanish prose naming a
Galician or Catalan body in its own language: "la web **da** Consellería **do**
Medio Rural" scores two on Portuguese. Those particles are part of the name, not
the language of the sentence. Removing a short lowercase word that sits between
two capitalised words costs 99.0 % → 98.7 % on long sentences, moves two texts
from one foreign word to zero, and removes the false alarm.

## The decision

Two distinct foreign function words, with the particles of official names taken
out before counting. The threshold is the first value above the measured noise,
and the record of that measurement is this file.

## What it costs

Named honestly in the code: **this cannot tell Galician or Catalan from Spanish.**
They share most of their function words with it, so a paragraph left in the
language of a Spanish region reads as Spanish here. A genuinely Galician sentence
in the corpus scores one. The check is for a text left in another of the
catalogue's six languages, which is the mistake that actually happens.

The margin is also one word. That is why the name-particle rule is not optional:
without it, the first Galician file to describe its own institutions in Spanish
prose would produce a false report.

## What would overturn it

A corpus where correct prose reaches two — which would mean the word lists are
wrong for a language, not that the threshold is. A new country also makes this
measurable again, and a test ties the word lists to the languages the catalogue
actually declares, so adding one without a list fails rather than silently
skipping its files.
