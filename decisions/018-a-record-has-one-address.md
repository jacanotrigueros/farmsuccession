# 018 — A record has one address, under the territory that recorded it

Decided 2026-10-03, milestone 07.

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

The second question the count raised is where that single page sits. A record id and a
region slug are both slugs, and nothing in the schema stops a national record from being
called `galicia`: `/es/galicia/` would then be a region page and a record page at once, and
which one the build wrote would be luck.

## The decision

A record has exactly one page, under the territory whose file holds it, behind a segment
of its own: `/es/galicia/record/galicia-banco-tierras/`, `/es/record/<id>/` for a national
record, `/record/<id>/` for a European one. Every territory that inherits the record links
there.

The segment is not decoration. It makes the two routes impossible to confuse by
construction rather than by hoping no id ever collides with a slug, and it keeps the
territory in the address, which is what tells a reader — and a search engine — which layer
recorded the thing they are reading.

## What it costs

A reader on the Galicia page who opens a national programme ends up at `/es/record/…`, a
layer up from where they were. They have left the page they were on, and if they had not
noticed that the record was inherited, the breadcrumb is the first thing that tells them.

That is the real price, and it is paid at the right moment: the layer a record was
recorded at is not a technicality, it is the difference between a national scheme and a
regional one, and between the page you should watch for changes and one that merely
repeats it. The list row that led there already says the record is inherited and from
where, so the move is announced before it happens rather than explained after.

## What would overturn it

A record whose content genuinely differs by the territory it is read from — a national
programme with per-region amounts, say, stated by a source rather than inferred. That
would make the duplicated pages different pages, and the count above stops being an
argument. The schema does not hold anything like that today, and adding it would be its
own decision.
