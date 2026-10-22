# EU CAP Network Annex II — pilot preflight (2026)

**Status:** BLOCKED ON SOURCE ACQUISITION — no resources imported or countries added.

## Objective

Evaluate a deliberately narrow documentary pilot for Belgium (BE), Austria (AT), and Ireland (IE) before expanding FarmSuccession beyond its current five-country scope. The pilot is a test of source yield, evidence quality, regional modelling, and long-term maintenance cost — **not** an instruction to publish every instrument listed in an EU report.

## Upstream dataset

- Publisher: EU CAP Network / European Evaluation Helpdesk for the CAP.
- Report: *Assessment of generational renewal strategies across EU Member States*, published 20 October 2025.
- Official publication page: https://eu-cap-network.ec.europa.eu/publications/assessment-generational-renewal-strategies-across-eu-member-states_en
- Officially listed attachment: *Annex II — Inventory of national and regional policy instruments*, XLSX, 82.6 KB, filename ending `inventory-updated-20260223.xlsx`.
- Attachment URL as advertised by the publication: https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2026-02/eucapnetwork-generational-renewal-strategies-annexe%20II-inventory-updated-20260223.xlsx
- Official page states that the study covers 27 Member States and draws on CAP Strategic Plans, stakeholder interviews, case studies and a farmer survey.

**Acquisition result (22 October 2026):** official HTML publication was accessible, but the XLSX bytes were not obtainable through the available retrieval interfaces (the webpage reader rejected XLSX content and the download attempt failed). Therefore **no worksheet was read**, no Annex-II rows were classified, no row counts were computed, and no comparison against the existing edition was carried out. Do not infer annex contents from secondary summaries.

## Repository baseline, checked on `develop`

- `AGENTS.md` requires that `data/territories.json`, edition files and research briefs agree; a new country cannot be added on its own.
- `prompts/research-territory.md` is currently version 1.13.0 and requires public primary-page evidence, literal quotations, consultation dates, and a research brief tracking admitted/rejected/unresolved leads.
- The current catalogue includes the EU layer plus ES, DE, FR, IT and PT. BE, AT and IE are absent; their country research briefs are absent too.
- The source dataset's policy-instrument categories are **not** automatically equivalent to FarmSuccession's publishable resources. A CAP policy measure or announcement is not proof that a practical service or application window operates.

## Proposed pilot: decision gates

1. **Obtain the original Annex II.** Verify its file hash and save a retrieval record outside the committed corpus. Inspect all sheets, headers, codes and hyperlinks, then extract only BE, AT and IE rows. Report exact per-country counts.
2. **Compare existing coverage and exclusions** (for this pilot the countries are new; check shared EU resources as well). Identify concrete instruments and their jurisdiction; do not treat national and regional schemes as duplicates by name alone.
3. **Read primary sources** linked by each candidate or discover the responsible authority's original public page. An Annex II description is only a lead. Preserve exact source text, date of reading, access route and any unresolved status.
4. **Measure yield and effort.** For every candidate, document one result: already covered, verified and admissible, excluded with reason, uncertain / inaccessible, or discontinued / historical. Record actual human/tool research time if available; never invent it.
5. **Model one country end to end only when supported.** Determine official administrative leaves/hubs from authoritative sources, create catalogue entries and the full required research/edition file set, satisfy the country's expected-instrument checklist, and test navigation/translation. If that is too costly for a low-yield pilot, report that finding rather than weakening schemas or silently skipping territories.
6. **Keep the evidence bar unchanged.** No lower-trust tier, no auto-import, no artificial minimum per country, no assumption of current availability, and no new UI language merely because a country was added.
7. **Validate before publication.** Run repository checks under Node 24, including `npm run validate`, `npm run check`, applicable frontend checks and per-territory source checks; explain external UNCHECKED outcomes. Do not modify `master`, deploy, or merge without owner review.

## Current outcome

- **New resources: 0.**
- **New countries: 0.**
- **Changed production data, schemas or frontend: none.**
- **Validation:** not executed against a working checkout; this document introduces no production data changes.
- **Next required input:** a verified copy of the EU CAP Network Annex II XLSX, accessible to the research runtime. Do not mark the pilot complete until the worksheet-level comparison and primary-source checks are performed.

This document records an honest preflight and a bounded approach for review; it is **not** a completed pilot.
