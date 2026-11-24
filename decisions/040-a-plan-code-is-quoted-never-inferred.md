# A plan code, an act and an office's area are quoted, never inferred

## Question

Official pages often say which CAP plan intervention an aid belongs to, which act it rests on and which office serves which area. Should a record carry these as fields, or leave them in its prose?

## Evidence

On 24 November 2026, 38 of the 662 records quoted the code of their own intervention, for example SRE01 in eleven Italian regions, 75.01 in the French overseas regions, 6961.1 in three Spanish regions and C.2.2.1 in Portugal. Three records quoted the act that governs them. The pages also list codes that belong to something else: a calendar of every open call, a course that requires another intervention, a telephone number shaped like a code. A plan's code means something only inside that plan. The same intervention number in two countries does not share ages, cycles or amounts.

## Decision

A record may give `interventionCodes`, `legalBasis` and, on each contact point, the `areas` it serves. Each value is written as its source writes it and must appear in a quote of that source. An office's areas must appear in the same quote as its telephone, email or address, so that one row's office is never paired with another row's area. A code is never mapped to another country's code or to an EU intervention type. A record that is itself an act does not name a legal basis.

## Cost

Most records carry none of these yet. A value only counts once it has been quoted, and no office area has been quoted alongside its contact so far. Readers see a code only where the page printed it.

## Revisit when

A plan revision renumbers its interventions, or the 2028–2034 CAP plans replace the codes. Also revisit if readers or search show that a code nobody types is taking space on the page.
