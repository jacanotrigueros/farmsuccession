# 023 — A country is data, a catalogue entry and a language

**2026-10-08.** Germany arrives: 17 edition files, 17 research briefs, one entry in
`data/territories.json` and one language in the site's own words. No template, no
route, no branch on a country code, no line of code written for Germany.

## The decision

Adding a country to this repository is three things and nothing else:

1. its edition files and research briefs under `data/editions/<year>/` and `research/`;
2. its entry in `data/territories.json`, which is what makes those files legal — a
   file whose country the catalogue does not define is an error, and a country the
   catalogue defines with no file is the same error the other way round;
3. the language its pages are written in, if the site does not already write it.

Anything a country seems to need beyond those three is a defect in the shared path,
not a reason to fork one.

## Why a language is a closed union and not a lookup

`Language` in `frontend/src/lib/language.ts` is `"en" | "es" | "de"`, and
`asLanguage()` throws for anything else. Every table of words is a
`Record<Language, …>`. So adding `"de"` to that union was the whole task list: the
type checker named nineteen tables with a hole in them, and the build could not
succeed until each had a German column.

The alternative is a fallback — when a word is missing in the page's language, use
English. It is one line, it never fails a build, and it is worse. A reader who opens
a German page and meets English headings around German text cannot tell whether the
site is half-translated or whether this particular record is English on purpose,
which is a real possibility here: records are quoted in the language of their source
and are never translated. A language that is half-written is a page nobody reviewed,
and the build is the cheapest place to find it.

The same applies to `languageName()` in `vocabulary.ts`, which throws for a language
code it has no name for rather than printing `br` at somebody. ISO 639-1 is an open
list; this table is deliberately not.

## Why the territorial model needs no new shape

A German Land is a region of a country, and `data/territories.json` already says
what a region is: a slug, a name, the phrase that puts a reader in it, and the hub it
belongs to. Germany's sixteen Länder are sixteen hubs of one region each, which the
catalogue's own rule covers — a hub of one region _is_ that region and carries no
layer of its own. Nothing about `territorialSystem` had to be generalised, because it
was data from the start rather than Spain's seventeen autonomous communities written
into the UI.

The one German fact that could have asked for a new shape did not: establishment aid
in Berlin and in Brandenburg is one joint directive on one page. Two sibling regions
cannot share a layer without inventing one, and putting the instrument at national
level would say it applies in sixteen Länder when it applies in two. So it stays as
two records citing the same page, each saying in its own note that the directive is
shared — and `npm run validate` lists the pair for review rather than deciding. The
duplicate check exists for exactly this: it asks a person, and a person answered in
the data.

## What this closes

A visual or structural change made for one country reaches every country, because
there is one of everything. A country whose instruments live at a different layer —
Germany documents nothing operative nationally, Spain documents a great deal — needs
no special case, only different data. And the next three countries are a known
quantity: files, a catalogue entry, a language, and whatever the type checker says is
missing.
