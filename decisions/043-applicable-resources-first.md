# 043 — Show applicable resources before empty local coverage

**2026-11-26.** Amends [036](036-help-readers-choose-before-listing-everything.md)
where it places an empty local list and where it places documented access steps.

## The question

How can the shared pages put the next available action first while still saying
which layer documented the resource? Can the sitemap give a publication date
that says when each of those pages last changed materially?

## What the evidence said

- El Hierro has no records of its own and inherits resources from Canarias,
  Spain and the European Union. Its former local section offered a zero count,
  a page-index link and a kind selector before the inherited list.
- On Austria's overview, a region's name already links to the region. An
  imperative about applicable resources under that name looked like the
  disclosure used for a region with its own records.
- The official sources for the Zaragoza bank and La Estiva advice respectively
  point to a PDF of the municipal rules and publish an institutional email for
  readers taking their first steps. Readers need to see the type of document
  and the stated way to use the service in the record header.
- Compare the resources by ID and full JSON between tags `v1.4.1` and
  `v1.5.0` in `data/editions/2026`, then compare each owning file's
  `published` field. For 74 unchanged records the former sitemap rule would
  give a different date. For example, the Catalan first-establishment record
  would move from 30 September to 25 October with identical record data.
  The file date also misses changes made in a shared template or inherited layer.

## The decision

1. A subnational territory with an empty local layer starts its body with
   applicable records, nearest contributing layer first. Its coverage note
   stays in the coverage section. The empty local section, zero counter, jump
   and its filter are omitted. The territory-scoped search remains available.
2. The region name and right arrow take the reader into the region. The
   downward disclosure exposes its additional record links. In inherited-only
   cards, the quiet line describes coverage. The two-column grid and featured
   first-establishment links keep their layout and complete names.
3. The header picker labels the EU layer as the European Union in the page
   language. The home page has a separate link to that layer's own records.
4. The record header includes documented access steps after the official link.
   An official link ending in `.pdf` identifies that format. Conditions on
   published amounts can use the existing figure label, which travels with the
   amount and its citation.
   The sitemap is scheduled for review after 10 December 2026, using a material
   modification date per page.

## What it costs

A territory with inherited records only relies on the scoped search for kind
filtering. A record with lengthy access instructions has a longer header.

## What would overturn it

A reader study showing that the empty local section helps find usable resources,
or a maintenance process that records material revisions for the individual
published pages, including changes that come from shared dependencies.
