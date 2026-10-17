# Broadening a search currently discards its question

17 October 2026; SearchView.astro:183. Browser reproduction: home → Spain → Madrid →
all applicable records → type sucesión → Enter. One result appears. Activating
Ampliar búsqueda a Europa navigates to /search/, blanks the input and shows 319 results.
The source has a constant searchPath('/', undefined), not the current search state.

Options: preserve only q while dropping every facet; preserve q and non-geographic
facets while removing country/territory; or name the current action as starting a new
European search. The first still loses an explicitly chosen type/profile. The second
best fits “broaden” but defines exactly which restrictions travel across routes and
languages. The third is honest and cheapest, but makes the reader ask again.

Recommend q plus non-geographic facets, with geography removed explicitly, once the
maintainer confirms the contract. It can then be implemented in the existing shared
URL module, tested there against all national routes, and browser-checked for current
state and destination. The no-JavaScript fallback must remain honest: it cannot read
unexecuted query parameters on this static route. No handler or wording change is made
before that policy is chosen.

What would overturn it: evidence that readers use the control to deliberately clear
their question, or an existing documented contract giving the action that meaning.
The national route's fixed scope in AGENTS.md does not specify a transfer policy.
