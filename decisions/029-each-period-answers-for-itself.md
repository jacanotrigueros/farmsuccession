# 029 — Each documented application period answers for itself

**2026-10-15.** A record gives one named answer per documented application period, in
the order its file lists them. This extends [019](019-a-period-is-what-a-page-said-on-a-day.md),
which continues to decide the wording of each answer and the dates it rests on.

## The question

A record can document more than one application period. One prominent answer is shorter
and seems to answer the reader's question immediately. An answer per period is longer,
but preserves the separate procedures and dates the sources actually documented.

The question is whether the record can choose one of its periods to represent the others.

## What the evidence said

Of 319 resources in the 2026 edition, 81 document at least one call. Seventy-three have
one and eight have more than one:

| Record                                                         | Calls | Shape                                                   |
| -------------------------------------------------------------- | ----: | ------------------------------------------------------- |
| `illes-balears-fogaiba-creacion-empresas-jovenes-agricultores` |     2 | Oldest first; a closed 2025 call before the 2026 window |
| `cantabria-establecimiento-jovenes-nuevos-agricultores`        |     2 | Newest first                                            |
| `cantabria-cifa-cursos-incorporacion-actividad-agraria`        |     2 | Neither call has dates                                  |
| `galicia-banco-tierras`                                        |     2 | An open procedure and an upcoming window                |
| `galicia-banco-explotaciones`                                  |     2 | Two OPEN calls for different procedures                 |
| `veneto-sre01-insediamento-giovani`                            |     2 | Newest first                                            |
| `madeira-investimento-instalacao-jovens-agricultores`          |     3 | Newest first; three OPEN calls at once                  |
| `acores-e71-instalacao-jovens-agricultores`                    |     3 | Oldest first; all closed                                |

Reproduce the count and inspect the names, states and dates from the repository root
with Node.js 24, without reaching the network:

```bash
node --input-type=module <<'JS'
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
function read(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? read(file)
      : entry.name.endsWith('.json') ? JSON.parse(readFileSync(file, 'utf8')).resources : [];
  });
}
const resources = read('data/editions/2026');
const withCalls = resources.filter(resource => resource.calls?.length);
console.log({ resources: resources.length, withCalls: withCalls.length,
  single: withCalls.filter(resource => resource.calls.length === 1).length,
  multiple: withCalls.filter(resource => resource.calls.length > 1).length });
for (const resource of withCalls.filter(resource => resource.calls.length > 1)) {
  console.log(resource.id, JSON.stringify(resource.calls));
}
JS
```

Two observations decide it. Array order is not consistent: the Balearic and Azorean
records list oldest first, while Cantabria, Veneto and Madeira list newest first.
`calls[0]` therefore expresses no documented relationship between the calls.

More importantly, Galicia's holding bank records two OPEN procedures: registering a
holding and requesting access to one. Choosing either hides the other. A latest opening,
an earliest deadline or a preference for OPEN cannot establish which procedure the
reader needs, because the data carries no priority or supersession relationship.

On 15 October 2026 the Balearic page demonstrates the harm. Its first call closed on
19 December 2025; its second documents a window from 1 October to 30 November 2026.
The headline answered closed from the first while the same page documented a period
that included the reader's day.

## The decision

1. **Every documented call has one named headline answer**, in the record's order.
   There is no selected call and no summary verdict for the record.
2. **Each answer uses its own dates and its own source's consultation date.** No date
   or state is borrowed from another call or from the newest source of the record.
3. **Every call reaches the browser**, as the payload of its own answer block. The one
   shared `apply.js` refreshes each block independently on the reader's day, using the
   same `applyKey` rule as the build. Refreshing changes no source or consultation date.
4. **The single-call case keeps one answer and its existing wording.** An operating
   record with no documented calls still gets no invented answer; the existing answers
   for announced, historical or unconfirmed records remain as decided in 019.
5. **The detailed documented-periods section does not change.** It already lists every
   call; the headline now stops contradicting it.

`frontend/test/apply-periods.test.ts` checks every multi-call record in the built HTML:
the number, names and order of its answers, all serialized calls, each period's own
consultation date and dates, and one shared script. `frontend/test/apply-key.test.ts`
checks the individual answers at fixed dates, including closing days and the next day.
Neither is a rendered-browser test.

## What it costs

Eight records become longer at the top, with up to three answers instead of one. Each
keeps its own name and evidence date because shortening them into a verdict would
reintroduce the relationship the sources never stated. Seventy-three single-call
records keep one answer.

The payload grows by the calls that were previously omitted. Source ordering is preserved
even when it is not chronological, because sorting is not evidence of priority either.
The tests establish the pure rule and the built contract; they do not establish visual
layout, focus behaviour or live DOM refresh in a real browser.

## What would overturn it

A public source establishing that one call supersedes another, or that several are
one procedure with one application window, and a schema that records that relationship.
Only then could an answer combine those calls without inventing a claim. A preference
for a shorter headline, or array order alone, would not be that evidence.
