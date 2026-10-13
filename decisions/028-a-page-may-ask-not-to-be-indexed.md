# 028 — A page may ask not to be indexed, and the sitemap reads that off the page

**2026-10-12.** A region that has documented nothing of its own, and every search page,
carry `noindex, follow` and are left out of the sitemap. They stay reachable, their links
are followed, and nothing about them is hidden from a reader.

## The question

Territorial views here are cumulative: a region shows its own records and everything that
reaches it from its hub, its country and the European layer. That is the right answer for
a reader — what applies in El Hierro does apply in El Hierro — and it means no territory
page is ever empty.

It also means that the six regions which have documented nothing of their own publish the
same list as their twenty-seven neighbours: the national and European records all of them
inherit, under a different name and a different address. A search engine asked to index
twenty-eight pages whose content is one list has to choose between them, and whichever it
picks is arbitrary.

The two answers available were **index everything**, because every page is true and
useful, or **stop building the thin ones**, because they add nothing.

## What the evidence said

Both are wrong in the same way: they treat "worth showing a reader" and "worth a search
engine keeping a copy" as one question.

A reader who arrives on El Hierro's page from its country page, or from the search with
that territory chosen, is answered: fourteen records apply there, and the page says in so
many words that none of them was recorded for El Hierro itself. Deleting the page would
break the country page's own list of its territories and would answer that reader with a 404. Indexing it asks for twenty-eight copies of one list to compete with each other, and
with the country page that is the real answer to the query.

`noindex, follow` is the one answer that separates the two questions. The page exists, it
is linked, its own links are followed and count; it is simply not offered as a result.

## The decision

1. **A region with no records of its own carries `noindex, follow`.** The rule is the
   page's own count, not a hand-kept list: the day that region documents something, the
   page is indexed again with no change anywhere else.
2. **A search page carries it too.** A search is a way of asking a question, not a
   document; the record pages it finds are the documents.
3. **The sitemap reads the rule off the built page.** It skips what carries `noindex`
   rather than working the rule out a second time — a sitemap that decided separately
   would be free to disagree with the page it is offering, and the disagreement would be
   invisible.
4. **Nothing is hidden from a reader.** No page is removed, no link is dropped, and the
   page says plainly that nothing has been recorded for this territory itself.

## What it costs

Twelve of 439 pages are not offered to search engines, and a query that names one of those
six regions reaches the country page or the search instead of the region's own page. The
sitemap has to parse the built HTML, which is a line of regular expression over files that
have just been written.

## What would overturn it

A region that keeps `noindex` after documenting something of its own, which would mean the
rule is being read from the wrong count. Or evidence that readers search for a thin
territory by name and are not reaching it at all: then the honest fix is to index the page
and give it something of its own to say, not to leave it indexed and empty.
