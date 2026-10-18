# Who arrives, 2026

The site has no analytics and will not get any. The one signal available is what
Search Console records: what somebody typed into a search engine before the site
was shown to them. This file keeps each reading, dated, with what it does and does
not support, so that the second one can be compared with the first instead of
replacing it.

[M0](what-comes-next.md) exists because the whole order of that plan is priced for
a reader nobody had met. These readings are how that gets settled, or overturned.

## 18 October 2026 — the second reading, and a pattern worth testing

**What was read.** The same property, this time the report that aggregates whole
days rather than the last 24 hours: 13 to 16 October. Search Console lags two or
three days, so nothing here sees version 1.3.0.

**Totals.** 3 clicks, 155 impressions, 1.9% click-through, average position 26.6,
across 73 queries, 53 pages and 15 countries. Position was 29.2 a day earlier.

**Countries.** France 82 impressions and 1 click, Spain 46 and 2, Germany 9,
then Belgium, Italy, Switzerland, Portugal, Denmark, the Dominican Republic and
Guadeloupe with one to three each. Italy and Portugal were zero in the first
reading; Germany has gone from 5 to 9, and the site is now shown outside the five
countries it documents.

**The three clicks all went to a record.** Asturias, Centre-Val de Loire and La
Rioja. None to a country landing, none to a region. The impressions, meanwhile,
pile up on French land-agency records: Grand Est 16, Bourgogne-Franche-Comté 14,
Provence-Alpes-Côte d'Azur 12, Bretagne 11, and the Hauts-de-France region page 9. A German record surfaced for the first time —
`nordrhein-westfalen-ausserfamiliaere-hofnachfolge`, 6 impressions — which is the
page the first reading's `hofnachfolger gesucht nrw` was looking for.

### The pattern, which is a hypothesis and not yet a finding

Two kinds of query reach this site, and they behave differently.

One names an **organisation**: `safer grand est`, `safer bourgogne`, `safer 29`.
That person wants the land agency's own site, which is the first result. A record
here appears at position 26 describing an organisation whose own page is right
above it, and gets no click. Fifty-three impressions on those four records have
produced none.

The other names an **instrument**: `feader centre val de loire`, and the queries
behind the Spanish clicks. That person is looking for a scheme rather than a
body, and the operator's own site usually buries it. All three clicks are of this
kind.

If that holds, it says something the project can act on: the page that earns a
visit is the record of a named instrument, and the navigational impressions are
not a problem to solve. Chasing them would mean competing with the organisation
the record exists to send people to, which is the opposite of what this site
says it is for.

Three clicks is an anecdote. What makes it testable is the asymmetry: the
land-agency records keep taking impressions, so a week from now either they have
started converting or they have not.

### What is wrong, and is not being changed yet

Measured on the pages that take the impressions, not inferred:

- **Descriptions are too long to survive a results page.** Google shows about 155
  characters. These run to 255 on Grand Est, 231 on Asturias, 213 on
  Bourgogne-Franche-Comté. The Grand Est one is cut mid-word — "la vente ou la
  lo…" — exactly where a reader would have found the reason to click.
- **Every title carries `· FarmSuccession`**, seventeen characters out of a budget
  that truncates near sixty. On the Asturias record the title is 119 characters,
  so the name never appears anyway and the suffix only pushes useful words out.

Neither is being changed during the observation week. A title or a description
rewritten mid-measurement makes the next reading incomparable with these two, and
comparability is the whole reason for not touching the site. The diagnosis is
written down here so the decision on 25 October is made from it rather than from
memory.

### What would change the reading

The land-agency records starting to convert, which would mean the navigational
reading above is wrong and the position was the only problem.

Click-through staying flat **outside** navigational queries once the average
position improves. That would move the problem from coverage to what the result
says on the results page, which is the cheapest thing on this list to fix.

## 17 October 2026 — the first reading

**What was read.** The Search Console hourly view for the 24 hours ending 12:00
local on 17 October, for the domain property `sc-domain:farmsuccession.eu`, verified
on 14 October. Queries, pages, countries and devices, each as its own breakdown.

**Totals.** 2 clicks, 110 impressions, 1.8% click-through, average position 29.2.
Position 29 is the third page of results, which is why two of a hundred and ten
impressions became a visit.

**67 distinct queries.** The most frequent had 2 impressions; everything else had
one. Roughly forty-five were French and nearly all of one shape: `safer` followed
by a département or a region — marne, oise, vosges, jura, var, aisne, ardennes,
pas-de-calais, finistère, morbihan, ille-et-vilaine, yonne, saône-et-loire, nièvre,
meuse, haute-marne, vaucluse, and the numbered forms `safer 22`, `safer 29`,
`safer 35`. Beside them: `dja pays de la loire`, `dnja`, `france services
agriculture`, `répertoire départ installation`, `terres de liens occitanie`, `aide
à l'installation des nouveaux agriculteurs nouvelle aquitaine`, `prix des terres
agricoles`, `dossier investissement guyane`.

Five were German, and they are the plainest statement of this project's subject in
the whole set: `außerfamiliäre hofnachfolge`, the same with `landwirtschaft`,
`hofnachfolge`, `hofnachfolger gesucht nrw`, `existenzgründung landwirtschaft`.

Around eight were Spanish or Catalan, every one of them naming an instrument:
`préstamos ico para agricultores` in two spellings, `ico mapa saeca` in two,
`joven agricultor extremadura 2024`, `jóvenes agricultores andalucía`, `red terrae`,
`majuelo jccm`, `tramitacion de subvenciones requena`, `reconversió explotacions`.

None were Italian, Portuguese or English.

**Pages.** 38 of them were shown. By impressions: `fr/ressources/grand-est-safer-grand-est`
15, `fr/ressources/bretagne-safer-bretagne` 9, `fr/ressources/bourgogne-franche-comte-safer-bfc`
9, `fr/ressources/provence-alpes-cote-d-azur-safer-appels-candidatures` 8,
`fr/regions/hauts-de-france` 8, `es/recursos/gran-canaria-banco-tierras` 5,
`es/recursos/es-linea-ico-mapa-saeca-jovenes` 5, `fr/ressources/occitanie-dja` 4.

The two clicks went to Spanish records: `es/recursos/asturias-establecimiento-jovenes-nuevos-agricultores`
and `es/recursos/la-rioja-establecimiento-jovenes-agricultores`.

**Countries.** France 64 impressions, Spain 33 and both clicks, Germany 5, Réunion 2,
then one each from the Dominican Republic, Italy, the Netherlands, Portugal, French
Guiana and Brazil.

**Devices.** 82 desktop, 26 mobile, 2 tablet. Both clicks on desktop.

### What this supports

That the intent arriving here is operational and territorial. Every query names a
thing somebody wants in a place they live: a land agency in their département, a
named grant, a named loan, a successor wanted in North Rhine-Westphalia. Not one
query asked for a statistic, a policy or an overview.

The first of the plan's two unobserved premises — that the readers are people
facing a succession or trying to start farming — has its first evidence. The
second, that what they come for is whether something exists where they live and
where to go, is consistent with every query in the set.

### What this does not support

Anything about volume, and anything about the plan's order. One day, sixty-seven
queries, a maximum of two impressions each.

An impression is not an arrival. Two people arrived. Everything else is a line in a
results page that somebody may never have looked at.

This is Google only. Bing is a separate property and was not read.

Search Console anonymises queries made by few people, so the absence of a query is
not evidence that nobody asked it. Italian and Portuguese reading zero may mean the
site is not shown there, or that what was shown fell below the anonymity threshold.

The property is three days old, and position 29 is where a site with no inbound
links sits. None of this describes a steady state.

### What would change the reading

A week of data where research-shaped queries appear — average age of farmers,
generational renewal as a subject, policy summaries. That would mean the
secondary audience is the real one, and M16 and M17 move ahead of M13.

A click-through that stays near zero while impressions grow. That would mean the
site is matched to the right queries and is losing the reader at the title and the
description, which is a different and cheaper problem than coverage.

Italian and Portuguese staying at zero once there is enough data for the anonymity
threshold to stop explaining it.
