# 024 — A territory lives under a segment of its own

**2026-10-08.** Everything below a country moves from `/es/galicia/` to
`/es/regiones/galicia/`, in the country's own word: `/de/regionen/bayern/`, and
`regions`, `regioni`, `regioes` for the three countries still to come.

## The decision

A country's URL space holds two lists of different kinds.

One is closed and written here: the page about the project, the history of the
domain, the search page. Three words per language, changed only on purpose.

The other is open and grows with the catalogue: the territories. Twenty-eight in
Spain, sixteen in Germany, and more with every country.

Published side by side, the open list eventually collides with the closed one. There
is no region called `proyecto` today and there may never be, but the guarantee that
there will not be is nobody's — it belongs to a statistical office in another country
picking a name. The cost of being wrong is that a region quietly takes the page about
the project, in one language, and the site still builds. So the open list is fenced:
`/{cc}/{regions}/{slug}/`, with the segment in the country's language, from
`REGION_SLUGS` in `frontend/public/search-scope.js` — the same module that already
owns the search slugs, because the route shape is one contract and not two.

A grouping that publishes a layer of its own goes there too. For a reader, Canarias
is the place the page is about, not a tier of the model.

## Why not keep the shorter path

`/es/galicia/` is shorter and reads well, and shortness is a real argument on a site
whose addresses get pasted into emails. It was the shape until today.

What decided it was not length but who owns the risk. The shorter path makes every
future research pass a chance to break a page of the site, in a language the person
running that pass may not read, with no error — just two things at one address and
the build picking one. A segment costs eight characters and removes the whole class.

The search URLs did not change: `/es/buscar/` is still `/es/buscar/`, because the
search page is one of the closed list.

## What this costs and when it was paid

Changing published addresses gets more expensive with every link that exists to them,
so it was done before the third country rather than after the fifth, and before
anything is published at all. One function in `frontend/src/lib/corpus.ts` builds
every territory address on the site, so the change is that function plus the contract
module; nothing else names a path.

`test/built-site.test.ts` now fails if a territory is published beside the site's own
pages, and the message says what would be taken and by what. Removing the segment and
rebuilding was tried: the test named `/de/baden-wuerttemberg/` and the page it would
have cost.
