# FarmSuccession — research one territory

Prompt version: 1.10.0

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
  Search from both sides of a transfer: the entrant and the retiring holder.
  Include concrete handover preparation, farm diagnosis, family mediation,
  trial placements and support after installation when the admission rules hold.
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
   the hub brief when the region belongs to a hub of several regions that has
   one, then this territory). A regional or hub pass requires a real country brief: if it is missing,
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
   Before searching, distinguish resources owned by this territory from those
   inherited from EU, country and hub layers. Zero local resources is not zero
   available support. Inventory unresolved leads, missing resource families,
   unsupported practical details and calls whose dates need rechecking. Use
   this inventory to prioritise the pass, not to replace the breadth search.
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
   - Search for new entrants as well as young farmers: age-limited aid is not
     interchangeable with support for older entrants, part-time farmers,
     entrants outside a farming family or retiring holders. Check separate
     instruments and eligibility rather than applying a generic age limit.
     Use official local languages, territorial aliases and programme codes.
   - Search current calls and amendments separately from evergreen services.
     Do not restrict every query to {{edition}}: that can hide useful services
     whose pages have no recent publication date. Follow official registers of
     recognised training and advisory providers to the actual access route.
   - If a search returns irrelevant places or generic material, narrow it to
     a known operator or official domain and split the families into separate
     queries. Check geographical namesakes, the actual service area and local
     competences; a regional office address does not establish eligibility.
   - A search-result scan is discovery only. Record inaccessible candidates as
     TO_CHECK with the blocked URL and next action. Do not turn an unread page
     into evidence of absence or a resolved lead. Where the schema requires
     NOT_FOUND for an unverified expected instrument, explain the access block
     and point to the unresolved lead; keep coverage PARTIAL.
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
   - For each call, open the latest procedure and its amendments or extensions,
     including linked notices and attachments. Distinguish the farmer's
     application window from windows for delivery organisations, payment
     claims, corrections or business-plan changes. An open administrative
     phase does not make applications by new beneficiaries open. Resolve
     conflicts using the applicable dated official amendment; if unresolved,
     record the conflict and omit disputed optional values. Never roll a
     previous year's dates or amounts forward.
   - Evidence must support each material claim separately: what the instrument
     does, who may use it, how to access it, its present status and every amount
     or date. Omit an optional field rather than filling a gap from general
     knowledge. Re-check resources already in the current file; preserve their
     ids, but never preserve an unsupported status or claim merely because it
     was published before.
   - A successful HTTP response is not sufficient: confirm that the final page
     still contains the intended procedure and operator, not a homepage,
     unrelated replacement, expired domain or login/challenge page.
   - Write a resource once, in the file of the widest territory it applies to.
     The resources already listed for the higher layers are shown below: do not
     repeat them here.
   - **Hubs of several regions** (a `data/territories.json` hub with more than
     one member, such as an archipelago or a group of foral territories) may
     have their own edition file and brief. Write a resource there only when its
     sources show that the same instrument applies to every region of the hub
     (one procedure, one operator, one application route for all of them). A
     common registration system, a shared web page or a regional operator is not
     enough on its own: services delivered separately in some regions (a school,
     a centre, a local office) stay in the region where they are delivered, and
     only when they meet the admission rules themselves. Fill a decision facet
     of a hub resource (for example `trainingFormats`) only when it holds for
     every region of the hub; otherwise omit it and say in `howToAccess` where
     the concrete offer is published. A region's brief may record an inherited
     resource as an ADMITTED lead and use it for an `instrumentChecks` answer.
4. **Write the edition file** following the schema:
   - Keep the `id` of any resource already in the current file; ids never change
     between editions. New ids are lowercase slugs that start with the territory
     (for example `galicia-banco-tierras`, `es-programa-cultiva`).
   - Quotes are copied **character for character** from the page text, in its
     language: a name, a status line, a deadline, an amount, an eligibility
     sentence. Prefer short quotes (10–300 characters) that avoid line breaks,
     hyphenation, typographic quotation marks and dashes between dates. A quote a
     machine cannot find on the page makes the entry fail. Keep the page's own
     apostrophe (’ or ') and spacing; never join words the page separates
     ("LandbauBerlin") or rebuild a word a PDF splits across lines
     ("estableci-miento"): choose another sentence that sits on one line.
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
   - Audit existing entries for useful missing details, not just new resources:
     beneficiary and age conditions, geographical restrictions, application
     route and prerequisites, fees or membership requirements, current call,
     institutional contact, and training recognition. Put supported details in
     existing schema fields such as `howToAccess` and `notes`; do not add schema
     fields. Publicly described does not mean free. A provider's accreditation
     does not prove that every course qualifies for establishment aid. Record
     unresolved material details in the brief instead of inventing values.
   - Each figure takes the `measure` from the schema's closed list that
     describes it exactly: aid is never recorded as a loan, nor a call budget
     as an amount per beneficiary. Use `OTHER` only when none fits, and let the
     `label` say what the figure is. Figures cite a URL that is one of the
     resource's sources.
   - Free text is in the territory's language ({{language}}), in the edition
     file and in the brief alike, including every lead `reason`; code values
     stay as the schema enumerates them. A name in another language goes in
     quotation marks («…»).
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
   its `resourceId`) or REJECTED (with the reason), with `checkedOn`; every
   resource of this territory's edition file needs its ADMITTED lead, including
   one you add, split or keep from an earlier pass, and an `instrumentChecks`
   answer must not contradict the resources you publish; leave
   TO_CHECK only for what you could not resolve, with what remains to verify;
   add useful new queries, portals and pitfalls; answer every expected
   instrument in `instrumentChecks` (regions); append one `log` line describing
   this pass, with `by` naming the tool and model. Keep every earlier log line,
   lead and context item: the brief is cumulative.
   State what changed (new resource, enriched entry, corrected call, duplicate
   decision or unresolved lead) and what remains. A brief-only discovery scan
   must not advance an edition's publication or consultation dates, rewrite
   old prompt-version metadata or claim a full territorial review. Follow-up
   work in another layer belongs in that layer's next separate pass.
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
     supports a published resource only with a **documented manual check**:
     you opened the original page through a connection whose certificate chain
     validated (never with certificate checks disabled, never with a trust
     anchor added for the purpose), read its text and confirmed every quote and
     the claims they support. Record it in the lead of that resource: `url`
     is the page, `checkedOn` the date, and `reason` states the quotes
     confirmed, the claims they back, the tool and how the chain validated,
     who checked (the tool and model, or the person's name) and why the
     automatic check cannot read the page. The automatic result stays
     UNCHECKED; a manual check by an assistant is not a human review, and the
     file stays `DRAFT`. Without that record, keep the source as a TO_CHECK
     lead whose `reason` says what blocked it and the next action. Name every
     UNCHECKED source in your plain-text list either way. A resource listed **for
     review** shares its access page with a resource of a higher layer or a
     sibling territory; it does not fail the check. Decide whether it is the
     same instrument (keep it once, in the widest territory) or a distinct one
     (say why in `notes`), and name each decision in your plain-text list.
   - **You cannot run commands** (a chat, a read-only repository connector):
     deliver the two blocks exactly as described below. The person integrating
     them saves your answer and runs `npm run ingest -- <saved answer>`, which
     writes, formats and validates the files; then they run the source check.
   - Either way, say plainly which checks you did not run: never claim a check
     passed that you did not run.

## 3. What the automatic checks reject

These rules are enforced by `npm run validate` (inside `check:territory` and
`ingest`). They are the mistakes earlier passes made most often; a draft that
breaks one is refused as a whole.

- **Figures.** Every number of two or more digits in `name`, `whatItOffers`,
  `whoCanUseIt`, `howToAccess` or `notes` must appear in that resource's
  evidence: a quote, a source or access URL, a metric, a call, or one of its
  dates. That includes programme codes (`75.01`, `SRE01`) and ages. Summary,
  limitations and news may use any evidence of the file. Do not write numbers
  about the research itself (an HTTP status such as 403, a count of pages
  read) in these fields: the brief is the place for them.
- **Reader text shows no internals.** The site turns codes into labels, so
  text readers see never names a schema code or field (`UNKNOWN`,
  `ANNOUNCED_NOT_OPERATING`, `accessUrl`, `qualifiesForEstablishmentAid`), a
  resource or news id, a territory slug (`illes-balears`) or a repository path
  (`data/editions/…`). Write the label or plain words ("la edición común de
  las Illes Balears"). Notes about integration, duplicates or the data model
  belong in the brief.
- **Clean text.** No HTML or Markdown (`<br>`, `**`, backticks, `[text](url)`,
  `&amp;`), no placeholder (`TODO`, `TBD`, lorem ipsum), no double spaces, no
  leading or trailing space, no empty string, no line break, tab or invisible
  character, no text decoded with the wrong encoding (`Ã©`, `â€™`), and
  nothing written in another catalogue language. URLs carry no tracking
  parameters (`utm_…`, `fbclid`) or `#:~:text=` highlights.
- **Calls.** `OPEN` needs a resource `ACTIVE`, an opening date no later than
  the consultation and a closing date not before it. `UPCOMING` needs an
  `opens` date after the consultation. `NOT_PUBLISHED` carries no dates: if
  the page gives dates, use the state they show. `CLOSED` with a later
  published deadline needs the page to say it closed early.
- **Dates.** `published` is today and not earlier than any `consultedOn`;
  every `consultedOn` falls in {{edition}}; news dates fall in {{edition}}
  and not after `published`. `lastEvidenceDate` belongs to the resource, is a
  date the page shows and never equals a consultation or publication date.
- **Scope and links.** `LOCAL` and `SUBREGIONAL` resources name their `area`
  as the source names it. `accessUrl` and every contact, call or metric
  `sourceUrl` are among the resource's `sources`, and a URL is listed once per
  resource. Every contact value (telephone, email, address) appears literally
  in a quote of the source it cites.
- **Identity.** `officialName`, `metadata.language` and the territory fields
  match `data/territories.json` exactly. Ids are unique across the edition and
  never reused for another instrument.
- **Files.** Deliver each file complete, as a single JSON value, with no
  repeated key in an object and nothing after the closing brace.

## 4. Before you deliver

- [ ] Every resource and news item has at least one source with quotes copied from a page you opened.
- [ ] No status says more than its page shows (announced, closed or unknown where appropriate).
- [ ] No resource repeats one listed for a higher layer.
- [ ] Every lead you looked at is in the brief with its status and reason.
- [ ] Consultation, publication and evidence dates are not in the future; news dates belong to {{edition}} and are not future events presented as completed. Announced future opening or closing dates are allowed when explicitly sourced and their call state is appropriate.
- [ ] Every material claim (including status, eligibility, access, figures and dates) is supported by a source quote.
- [ ] Every contact is institutional, useful for access, quoted by its source and contains no named person's direct details.
- [ ] Decision facets are used only for their applicable resource kind and are explicitly supported, never inferred.
- [ ] A second discovery pass used the vocabulary and actors found in the first, or the brief explains why no expansion was possible.
- [ ] `SEARCHED` is used only when the documented plan and expansion pass both finished; it does not claim exhaustiveness.
- [ ] For a region, every expected instrument of the country brief has an `instrumentChecks` answer.
- [ ] Non-governmental services (farmers' organisations, chambers, associations, church or social services) were searched, not only administrations.
- [ ] No `lastEvidenceDate` is a consultation or publication date.
- [ ] Every figure in free text appears in that resource's evidence; no reader-facing text names a code, id, slug or repository path.
- [ ] Every resource of the edition file has an ADMITTED lead, and free text in both files is in {{language}}.
- [ ] Existing calls were checked against amendments and the correct applicant phase; practical omissions and unresolved source conflicts are recorded.
- [ ] Zero local entries were assessed with inherited support; a blocked source or a search-result scan was not presented as completed verification.
- [ ] `npm run check:territory -- {{edition}} {{territorySpec}}` passes, or you state plainly that you could not run it.
- [ ] Every UNCHECKED source either has a documented manual check in its lead (validated connection, quotes and claims confirmed, tool, who, date, why the automatic check cannot read it) or is a TO_CHECK lead with its URL, what blocked it and the next action; each is named in your plain-text list.

## 5. An example resource to imitate

This is a schema-valid resource from an existing edition, not a live guarantee
of source availability, current deadlines or complete claim-level evidence.
Use it for the JSON shape only. Apply all evidence rules above independently:
each claim backed by a quote, calls with their own source, figures that say
what they measure. Do not copy its dates, statuses or optional fields as defaults.

```json
{{exampleResource}}
```

## 6. Deliverable

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
