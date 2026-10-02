# 001 — Territorial views are cumulative, and implemented once

Decided 2026-10-01, milestone 02.

## The question

A reader on a regional page wants to know what applies to them. Two models were
available.

**Per-territory pages**: each page lists what was documented for that territory.
Simple, and what most directories do. A regional page then has to repeat the
national and European instruments, or leave the reader to find them.

**Cumulative views**: a region shows the European layer, then its country, then
its hub where it has one, then itself. Each instrument is written once, in the
layer it actually belongs to.

## What the evidence said

This is not a measurement; it is the shape of the domain, and two facts decide it.

Establishment aid in Spain is a national instrument administered regionally. A
regional land bank is regional. The CAP framework is European. If a regional page
is the only page a reader opens — which it is, because that is the page they
search for — then a per-territory model either duplicates the national instrument
into seventeen files, or hides it.

Duplication is the expensive answer. The same instrument written in seventeen
files is seventeen records to keep current, seventeen chances for them to
disagree, and seventeen reasons for a reader to find a figure that another page
contradicts.

## The decision

Views are cumulative: **EU view = EU; country view = EU + country; region view =
EU + country + region**, plus the region's hub when that hub has a file of its
own. A lower layer adds what applies there; it never hides a higher layer.

A hub exists only where several regions share instruments: the Canary Islands and
the Basque Country, not as a level every country must have. **A hub of one region
is that region** and carries no layer of its own, because two pages for one
territory is two records of it.

The tree has exactly one implementation, [`src/layers.ts`](../src/layers.ts).
Anything that needs to know what a page shows asks it, so a reader and a
validator cannot disagree about what a territory inherits. The validators use the
same function to decide whether a news item may link a resource, and whether a
lead may claim one.

## What it costs

A reader cannot tell, from the page alone, which layer an instrument came from
unless the page says so — so the page has to say so. And a resource written in
the wrong layer is now wrong for every territory below it rather than for one,
which is why the scope of a record is checked against the file it sits in.

## What would overturn it

A country whose territorial structure does not nest — where a measure applies to
a set of regions that is not a hub and not the whole country. The model would
then need a fifth kind of layer rather than a different model, and the hub
concept is already the escape hatch for the cases seen so far.
