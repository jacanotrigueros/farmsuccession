# 042 — Answer "can I apply?" under the title, open periods first

**2026-11-25.** Amends [029](029-each-period-answers-for-itself.md) on the order of the answers and
[036](036-help-readers-choose-before-listing-everything.md) on where they sit in a record. Every
period still answers for itself; none is hidden or merged.

## The question

A reader opens a record to learn whether they can apply. On the published 2.0.1 record of Aragón's
young farmer grant, read on a 375 px screen, the only thing above the title was a green "Recurso
activo" tag, and the answer "No: la convocatoria está cerrada" started at 1,049 px, a screen down,
after the summary and the buttons. The Balearic FOGAIBA record answered "no" for its closed 2025 call
before "yes" for its 2026 window, which was open that day. Should the answer move up, and should the
open periods come first?

## What the evidence said

- **The green tag read as a yes.** It answers whether the programme operates, which 029 and 019 keep
  apart from whether a period is open. Next to the title, and green, it was the first answer a reader saw.
- **File order carries no meaning.** 029 found that records list their calls oldest first or newest
  first, and kept that order because sorting is not evidence of priority. Putting the periods a reader
  can apply through first does not choose one of them either: all of them are shown, with their own
  names, dates and consultation dates. It ranks them by the answer each one gives, which is the reader's
  question, not by a priority the sources never stated.
- **One copied call.** The Pays de la Loire DJA listed the same call twice, name, state and source
  identical, so it showed two "yes" panels nobody could tell apart. That was a data error, not a design
  one; it is removed, and `test/call-uniqueness.test.ts` refuses a repeated call.
- **"The source does not publish dates" said more than was known.** A call recorded as NOT_PUBLISHED
  means the sources that were read publish no period. The headline now says "No application period
  documented", and the detail names the sources consulted.

## The decision

1. **The application answers come right after the title, the place and the operator**, before what
   the resource offers. The official-page and evidence buttons follow the summary, as before.
2. **Answers are ranked by what they say:** open, upcoming, no period documented, closed, not
   operating. Ties keep the file's order. The build ranks them for its day and `apply.js` ranks them
   again for the reader's day with the same `APPLY_RANK`, so a period that opens after the build moves
   up in the reader's browser.
3. **The programme's status stays, in grey, when the record has calls.** The words still say
   "active" and the note still says what active does not promise; the green no longer competes with
   the answer. A record without calls keeps the green tag, because nothing else answers there.
4. **A NOT_PUBLISHED call reads "No application period documented"**, with "The sources consulted
   publish no application dates" underneath.

The same change gives the site's own search two things a reader expects of it, under the same
reasoning of saying no more than is known:

5. **An empty search lists the catalogue in one order**, the European layer and then country by
   country, which is also the order of the list a search page carries without JavaScript. It used to
   show whichever language bundle loaded first.
6. **The name readers type is indexed when it differs from the official one.** A record's search
   title ("Niederlassungsprämie (75-01) für Junglandwirte in Österreich") is given to the index as an
   attribute, as the European records' translated terms are (17 Nov 2026). The page shows only the
   official name.

## What it costs

On a phone the official-page button moves down by the height of the answers: one panel for most
records, three for Madeira's. The answer is what a reader came for; the button is still in the first
part of the page. Readers without JavaScript see the build's order, which can be a day behind.

Measured in a browser on the local build of this change, 25 Nov 2026: in the German bundle, which an
Austrian search loads, "Niederlassungsprämie" now finds the 75-01 record third, after two German
investment records whose text says they are not a Niederlassungsprämie; before, it did not find it at
all. "jóvenes agricultores Aragón" still ranks Aragón's grant seventh, after its advice, courses and
land records. Two things were tried and not adopted: Pagefind ignores `data-pagefind-weight` on an
indexed attribute (scores unchanged), and its search-time `ranking` options moved Aragón from seventh
to fourth while leaving the Austrian case where it was, which is not enough evidence to retune every
query in the catalogue. Ranking stays open; a visible alias would weigh more, but it changes the text
of the pages whose titles 2.0.0 is measuring until 10 December.

## How it is checked

`frontend/test/apply-periods.test.ts` checks that every multi-call record serves its calls in the
ranked order, that the Balearic open call comes before its closed one while both stand, and that the
answer precedes "what it offers" on every record that has one. `frontend/test/search-order.test.ts`
checks that the European search lists the EU layer first and each country's records together, that
every record gives the index its place in that order, and that the Austrian 75-01 record is indexed
as Niederlassungsprämie. The ranking itself runs in a browser and was measured there, as above.

## What would overturn it

Readers telling us they look for the official link first, or a source establishing that one call
supersedes another, which 029 already names as what would let calls be combined.
