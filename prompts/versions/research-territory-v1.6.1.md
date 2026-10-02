# FarmSuccession — research one territory

Prompt version: 1.6.1

You are researching **{{territoryName}}** ({{territoryLabel}}) for the **{{edition}}**
edition of FarmSuccession. Today is {{today}}. The result is two JSON files that
anyone can check mechanically: the edition file and the research brief of this
territory. Work only from public pages you actually open and read in this
session; never from memory, training data or search-result snippets.

## 1. What FarmSuccession collects

Public instruments that help someone enter, take over or transfer a farm. Use
the country's own territorial organisation and search every relevant lower
administrative or functional level, not a fixed list copied from another
country. The country brief explains which levels and organisations matter:

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

**Who operates it does not decide admission; what it offers does.** Besides
public administrations and their agencies, look for farmers' and young
farmers' organisations, chambers of agriculture, cooperatives, foundations,
land trusts, rural associations and church or social services that run a
concrete service in the families above (succession advice, handover seminars,
family mediation for the handover, land matching, incubators). They are
resources with `operatorType` `NONPROFIT` or `MIXED` when their own page
describes the service and how to reach it.

Leave out generic agricultural subsidies, generic rural-development pages,
ordinary sector courses, one-off events, commercial consultancies selling
their services, property listings and urban-land portals, unless the page
itself establishes an instrument of the families above.

## 2. Process

1. **Check the prerequisites, then read the briefs below first** (EU, country,
   region). A regional pass requires a real country brief: if it is missing,
   stop and research the country first. Do not infer national institutions from
   another country. The briefs contain the
   context and pitfalls learnt so far, the portals and open-data sources to
   review, the queries to run, and every lead already considered. Do not
   re-admit a REJECTED lead unless its situation has changed, and say why.
   For a region, the country brief's `expectedInstruments` is a mandatory
   checklist: search for each one in this region before anything else, and
   answer every item in the region brief's `instrumentChecks` (FOUND with the
   admitted lead, NOT_FOUND with what you searched, or NOT_APPLICABLE with the
   reason). A pass that leaves an item unanswered is incomplete.
2. **Discover in breadth, then expand.** Review every portal and open-data source, run every query
   (a country query's `{region}` is this territory's name), and evaluate every
   TO_CHECK lead. Cover all families before going deep into one. Record each
   new candidate as a lead, local ones included, even if you reject it.
   - Treat the supplied queries as seeds, not as a closed checklist. Each source
     can reveal local vocabulary, programme names, operators and lower
     territorial levels. Use those discoveries in a second search pass and add
     reusable queries and portals to the brief.
   - Stop expanding only when a complete pass across all families produces no
     new relevant vocabulary, operators, territorial levels or candidates.
     This is search saturation for this documented pass, not proof of
     exhaustiveness.
   - Record the exact portal, API request, gazette search or web query actually
     used in `coverage.methods`. Do not claim a method you did not run.
3. **Evaluate each candidate** with these admission rules:
   - Cite the operator's own stable page (the procedure, inventory, registration,
     course or contact page). Press, aggregators and local pages that only relay
     a regional or national instrument are not separate resources. An official
     press release is acceptable only when no operator page exists; say so in
     `notes`.
   - The page itself must establish the instrument and its link to entry,
     takeover, transfer or succession. A search snippet is a lead, not evidence.
   - A page that only describes, links to or republishes an instrument operated
     at a wider level is not a new local resource. Admit it locally only if the
     entity itself provides a distinct inventory, application route, matching
     service, advice or delivery role for that area.
   - If the page is rendered by JavaScript, blocks robots or has an incomplete
     certificate chain, look for another official page with readable text and
     record the pitfall in the brief's `context`.
   - **Existence is not availability.** Something that exists only in law, is
     announced, historical, or whose current operation the page does not show is
     `ANNOUNCED_NOT_OPERATING`, `HISTORICAL` or `UNKNOWN`, never `ACTIVE`. A call
     whose deadline has passed is `CLOSED`, never `OPEN`; one that has not opened
     yet is `UPCOMING`.
   - **Resource status is not call state.** A recurring programme may be
     `ACTIVE` while its latest call is `CLOSED`. `ACTIVE` still requires a
     current operator or programme page; an old call alone proves only a
     historical or unknown situation.
   - Evidence must support each material claim separately: what the instrument
     does, who may use it, how to access it, its present status and every amount
     or date. Omit an optional field rather than filling a gap from general
     knowledge. Re-check resources already in the current file; preserve their
     ids, but never preserve an unsupported status or claim merely because it
     was published before.
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
     `lastEvidenceDate` is the latest date the page itself shows (an update, a
     publication, a call) and is quoted; a page whose newest date is years old
     does not support `ACTIVE` on its own. It is never the date you consulted
     the page or published the file: when the page shows no date, omit it.
   - Record `contactPoints` only when they are public institutional or
     role-based channels that help a reader use the resource. Copy the email,
     telephone, form URL or office address from a cited source and quote it.
     Never record a named person's direct details. Omit contact points when the
     page only publishes personal contact data.
   - Fill the closed decision facets only when the source states them:
     `assetTypes` distinguishes plots from whole holdings; `sectors` records
     agriculture, livestock or forestry without inference; financial support
     uses `instrumentType` and `purposes`; training uses `trainingFormats` and
     `qualifiesForEstablishmentAid`. Omit an unknown facet instead of guessing
     or using `OTHER` as a substitute for missing evidence.
   - Each figure takes the `measure` from the schema's closed list that
     describes it exactly: aid is never recorded as a loan, nor a call budget
     as an amount per beneficiary. Use `OTHER` only when none fits, and let the
     `label` say what the figure is. Figures cite a URL that is one of the
     resource's sources.
   - Free text is in the territory's language ({{language}}); code values stay
     as the schema enumerates them.
   - Set `metadata.generatedBy.promptVersion` to `{{promptVersion}}`, alongside the actual
     tool and model. This records which method produced the draft without
     coupling the dataset to one provider.
   - `coverage` states the methods really used; `limitations` states documented
     absences ("no operating regional land bank was found, because…") and gaps.
     An absence is never proof that something does not exist.
     `SEARCHED` means only that the documented plan and its expansion pass were
     completed. It never means that the territory is exhaustively covered. Use
     `PARTIAL` whenever a portal, family, lower level or unresolved lead remains.
   - `review.status` is `DRAFT`; a person marks it `REVIEWED`.
5. **Update the research brief**: set every lead you evaluated to ADMITTED (with
   its `resourceId`) or REJECTED (with the reason), with `checkedOn`; leave
   TO_CHECK only for what you could not resolve, with what remains to verify;
   add useful new queries, portals and pitfalls; answer every expected
   instrument in `instrumentChecks` (regions); append one `log` line describing
   this pass, with `by` naming the tool and model. Keep every earlier log line,
   lead and context item: the brief is cumulative.
6. **Check your work**, according to what your environment allows:
   - **You can run commands in the repository** (a coding agent): run
     `npm run format`, then `npm run check:territory -- {{edition}} {{territorySpec}}`.
     It fails on any validation error or warning in this territory's edition
     file or brief, on an unanswered expected instrument, and on a FAIL source
     of the edition file (a 4xx, a page saying it does not exist, a quote not
     found on its page). A source it cannot read (no response, an incomplete
     certificate chain, a bot challenge, 403/429, 5xx, unreadable content) is
     reported UNCHECKED and does **not** fail it.
     **Do not commit or deliver until it passes.** Fix the files, not the
     checks. Passing means only that this technical check ended without a
     blocking failure: it does not prove exhaustive coverage, that an
     instrument still operates (a quote found on an old page proves only that
     the page still says it) or a human review. A source that stays UNCHECKED
     cannot support a published resource: keep it as a TO_CHECK lead whose
     `url` is the page and whose `reason` says what blocked it and the next
     action, and name it in your plain-text list.
   - **You cannot run commands** (a chat, a read-only repository connector):
     deliver the two blocks exactly as described below. The person integrating
     them saves your answer and runs `npm run ingest -- <saved answer>`, which
     writes, formats and validates the files; then they run the source check.
   - Either way, say plainly which checks you did not run: never claim a check
     passed that you did not run.

## 3. Before you deliver

- [ ] Every resource and news item has at least one source with quotes copied from a page you opened.
- [ ] No status says more than its page shows (announced, closed or unknown where appropriate).
- [ ] No resource repeats one listed for a higher layer.
- [ ] Every lead you looked at is in the brief with its status and reason.
- [ ] Dates are real: nothing in the future, news within {{edition}}.
- [ ] Every material claim (including status, eligibility, access, figures and dates) is supported by a source quote.
- [ ] Every contact is institutional, useful for access, quoted by its source and contains no named person's direct details.
- [ ] Decision facets are used only for their applicable resource kind and are explicitly supported, never inferred.
- [ ] A second discovery pass used the vocabulary and actors found in the first, or the brief explains why no expansion was possible.
- [ ] `SEARCHED` is used only when the documented plan and expansion pass both finished; it does not claim exhaustiveness.
- [ ] For a region, every expected instrument of the country brief has an `instrumentChecks` answer.
- [ ] Non-governmental services (farmers' organisations, chambers, associations, church or social services) were searched, not only administrations.
- [ ] No `lastEvidenceDate` is a consultation or publication date.
- [ ] `npm run check:territory -- {{edition}} {{territorySpec}}` passes, or you state plainly that you could not run it.
- [ ] Every UNCHECKED source is a TO_CHECK lead in the brief with its URL, what blocked it and the next action, and is named in your plain-text list.

## 4. A verified resource to imitate

This resource passed every check of the repository. Match its level of
evidence: each claim backed by a quote, calls with their own source, figures
that say what they measure.

```json
{{exampleResource}}
```

## 5. Deliverable

Return exactly two fenced JSON blocks, each preceded by its repository path:

- `data/editions/{{edition}}/{{editionPath}}`
- `research/{{briefPath}}`

Then list, in plain text, anything you could not verify. Never invent a URL,
name, date, amount, deadline or status. An honest short file is better than a
long one with unsupported entries.

This pass changes those two files and nothing else: no code, schema, prompt,
site, workflow or other territory's file. If something in the repository looks
wrong or blocks the research, describe it in the plain-text list instead of
changing it.

---

{{context}}
