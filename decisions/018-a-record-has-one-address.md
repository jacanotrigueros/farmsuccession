# 018 — A record has one address

Decided 2026-10-03, milestone 07. **Revised 2026-10-04**: the address is flat.

## The question

Territorial views are cumulative (decision [001](001-cumulative-territorial-views.md)): a
region shows what the EU, the country and the region offer, as one list. So a reader
meets the same record on many pages, and the record now needs a page of its own. Under
which territory does that page live?

The obvious answer is "under the one the reader came from". Somebody reading Galicia who
opens a national programme stays inside Galicia, the breadcrumb keeps making sense, and
the page can even say what that programme means there. The other answer is that a record
has one page, under the territory whose file holds it, and every other territory links to
it.

Both are defensible, and the first is what most catalogues do.

## What the evidence said

Counted over the published edition — 1 European layer, 1 country, 3 groupings and 28
regions, holding 132 records between them:

- Giving every record a page under each territory that inherits it produces **508 pages
  instead of 132**. The four EU records alone would exist 33 times each.
- The duplicated pages would not be variants. The evidence a record carries — 231 sources
  and 651 quotes across the corpus — is the same evidence wherever it is read from, because
  it is what one page said on one day. Nothing in the data differs by the territory a
  reader arrives from.
- So 376 of those 508 pages would be copies, and a reader arriving from a search engine
  would land on whichever copy it had indexed, with no way to tell it apart from the other 32.

## The decision

A record has exactly one page, at `/resources/<id>/`, and every territory that inherits it
links there.

The half of this that has not changed is the half the count settled: one record, one page,
never a copy per territory. What changed the next day is the shape of the address.

The first version put the territory in the path — `/es/galicia/record/<id>/` — because the
layer a record belongs to is not a technicality, and because a record id and a region slug
are both slugs, so nothing in the schema stopped a national record from being called
`galicia` and colliding with a region page. **Both arguments survive the reversal and
neither carries it.**

- The address is read by people looking for a thing, not by somebody studying the corpus,
  and the owner of the project is the one who answers for whether it is found at all:
  _"tú piensas en un sitio documental, yo pienso en qué buscan los usuarios en la web"_.
  That is a goal this record has no standing to overrule.
- Nothing is lost, because **the identifier already begins with its territory**:
  `galicia-banco-tierras` says Galicia as plainly as a path segment would, and the page
  says it again in its breadcrumb and its facts.
- A flat address is **stable across editions**. A record that changes layer — a regional
  scheme taken over nationally — keeps its address instead of leaving a dead one behind,
  and a URL that never moves is worth more, to a reader and to a search engine, than a URL
  that reads prettily.
- The collision goes away with the path: `/resources/` is a namespace of its own, and
  nothing else is ever published inside it.

## What it costs

A reader who looks at the address alone cannot tell which layer recorded the thing: a
European framework and a municipal land bank sit at paths of the same shape. The page says
it in the breadcrumb, in its facts and in the row that led there, but a list of bare links
no longer does.

It also costs this record its first answer one day after it was written, which is worth
leaving visible rather than tidying away: the measurement that settled the real question —
one page or 508 — was sound, and the part that got reversed was the part decided on taste
rather than on evidence.

## What would overturn it

A record whose content genuinely differs by the territory it is read from — a national
programme with per-region amounts, say, stated by a source rather than inferred. That
would make the duplicated pages different pages, and the count above stops being an
argument. The schema does not hold anything like that today, and adding it would be its
own decision.
