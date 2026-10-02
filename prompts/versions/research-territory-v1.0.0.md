# FarmSuccession — research one territory

Prompt version: 1.0.0

You are researching **{{territoryName}}** ({{territoryLabel}}) for the **{{edition}}**
edition of FarmSuccession. Today is {{today}}. The result is two JSON files that
anyone can check mechanically: the edition file and the research brief of this
territory. Work only from public pages you actually open and read in this
session; never from memory, training data or search-result snippets.

## 1. What FarmSuccession collects

Public instruments that help someone enter, take over or transfer a farm, at
every administrative level of this territory (regional, provincial, island,
comarcal, intermunicipal, municipal):

- **Land access and transfer**: land banks and land registers (a municipal land
  bank counts as much as a regional one), holding banks, succession or matching
  services between retiring holders and new entrants.
- **Aid and financing** explicitly for young or new farmers, first
  establishment, generational renewal, or the transfer or succession of a
  holding (grants, loans, guarantees), with their application route.
- **Training and advice** explicitly tied to entering or taking over farming
  (the course required for establishment aid, shepherd schools, mentoring,
  incubators).
- **Official portals** that give access to those procedures, and **policy
  frameworks** (laws, plans) that create or announce such instruments.
- **News**: dated events of {{edition}} that change the picture (an announcement,
  a launch, a call opening or closing, a law, a discontinuation, new figures).

Leave out generic agricultural subsidies, generic rural-development pages,
ordinary sector courses, one-off events, private providers' catalogues,
property listings and urban-land portals, unless the page itself establishes
an instrument of the families above.

## 2. Process

1. **Read the briefs below first** (EU, country, region). They contain the
   context and pitfalls learnt so far, the portals and open-data sources to
   review, the queries to run, and every lead already considered. Do not
   re-admit a REJECTED lead unless its situation has changed, and say why.
2. **Discover.** Review every portal and open-data source, run every query
   (a country query's `{region}` is this territory's name), and evaluate every
   TO_CHECK lead. Cover all families before going deep into one. Record each
   new candidate as a lead, local ones included, even if you reject it.
3. **Evaluate each candidate** with these admission rules:
   - Cite the operator's own stable page (the procedure, inventory, registration,
     course or contact page). Press, aggregators and local pages that only relay
     a regional or national instrument are not separate resources. An official
     press release is acceptable only when no operator page exists; say so in
     `notes`.
   - The page itself must establish the instrument and its link to entry,
     takeover, transfer or succession. A search snippet is a lead, not evidence.
   - If the page is rendered by JavaScript, blocks robots or has an incomplete
     certificate chain, look for another official page with readable text and
     record the pitfall in the brief's `context`.
   - **Existence is not availability.** Something that exists only in law, is
     announced, historical, or whose current operation the page does not show is
     `ANNOUNCED_NOT_OPERATING`, `HISTORICAL` or `UNKNOWN`, never `ACTIVE`. A call
     whose deadline has passed is `CLOSED`, never `OPEN`; one that has not opened
     yet is `UPCOMING`.
   - Write a resource once, in the file of the widest territory it applies to.
     The resources already listed for the higher layers are shown below: do not
     repeat them here.
4. **Write the edition file** following the schema:
   - Keep the `id` of any resource already in the current file; ids never change
     between editions. New ids are lowercase slugs that start with the territory
     (for example `galicia-banco-tierras`, `es-programa-cultiva`).
   - Quotes are copied **character for character** from the page text, in its
     language: a name, a status line, a deadline, an amount, an eligibility
     sentence. Prefer short quotes (10–300 characters) that avoid line breaks,
     hyphenation, typographic quotation marks and dashes between dates. A quote a
     machine cannot find on the page makes the entry fail.
   - The `accessUrl` must also be one of the resource's `sources`.
   - `consultedOn` is the date you actually read the page; `published` is today.
     Figures say whether they are a total budget or an amount per beneficiary,
     and cite a URL that is one of the resource's sources.
   - Free text is in the territory's language ({{language}}); code values stay
     as the schema enumerates them.
   - `coverage` states the methods really used; `limitations` states documented
     absences ("no operating regional land bank was found, because…") and gaps.
     An absence is never proof that something does not exist.
   - `review.status` is `DRAFT`; a person marks it `REVIEWED`.
5. **Update the research brief**: set every lead you evaluated to ADMITTED (with
   its `resourceId`) or REJECTED (with the reason), with `checkedOn`; leave
   TO_CHECK only for what you could not resolve, with what remains to verify;
   add useful new queries, portals and pitfalls; append one `log` line
   describing this pass.
6. **Check your work.** If you can run commands in the repository, run
   `npm run format`, `npm run validate`,
   `npm run check:sources -- {{edition}} {{fileFilter}}` and `npm run check:links`,
   and fix every error and FAIL before delivering. If you cannot run them, say
   so plainly: never claim a check passed that you did not run.

## 3. Before you deliver

- [ ] Every resource and news item has at least one source with quotes copied from a page you opened.
- [ ] No status says more than its page shows (announced, closed or unknown where appropriate).
- [ ] No resource repeats one listed for a higher layer.
- [ ] Every lead you looked at is in the brief with its status and reason.
- [ ] Dates are real: nothing in the future, news within {{edition}}.

## 4. Deliverable

Return exactly two fenced JSON blocks, each preceded by its repository path:

- `data/editions/{{edition}}/{{editionPath}}`
- `research/{{briefPath}}`

Then list, in plain text, anything you could not verify. Never invent a URL,
name, date, amount, deadline or status. An honest short file is better than a
long one with unsupported entries.

---

## Research briefs

### EU

```json
{{euBrief}}
```

### Country

```json
{{countryBrief}}
```

### This territory

```json
{{territoryBrief}}
```

## Resources already listed in higher layers (do not repeat)

{{higherResources}}

## Current edition file for this territory

```json
{{currentEdition}}
```

## Edition schema

```json
{{editionSchema}}
```

## Research brief schema

```json
{{briefSchema}}
```
