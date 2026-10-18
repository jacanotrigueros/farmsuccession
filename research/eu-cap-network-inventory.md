# EU CAP Network inventory as a discovery source

## Current scope

Research and integration cover Spain, France, Germany, Italy and Portugal, plus information applicable across the European Union. EU-wide frameworks and networks belong in the EU layer; national and regional access routes belong in the corresponding country or regional layer. An instrument mentioned in a European report is not necessarily EU-wide.

The remaining countries appear below only as references for a possible future expansion. Their presence in this index does not expand current research or publication scope.

## Provenance

- Publication: [Assessment of generational renewal strategies across EU Member States](https://eu-cap-network.ec.europa.eu/publications/assessment-generational-renewal-strategies-across-eu-member-states_en), published 20 October 2025.
- [Annex II, updated 23 February 2026](https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2026-02/eucapnetwork-generational-renewal-strategies-annexe%20II-inventory-updated-20260223.xlsx).
- [Main report linked by the publication](https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2026-03/eu-cap-network-report-assessment-of-generational-renewal-strategies-c.pdf).
- Retrieved on 17 October 2026 (UTC). The official XLSX and the maintainer's supplied copy were byte-identical: SHA-256 `5cfa85b23ac1cfa485bbe6b23412e746ee5d876d737f0d9f42f49d6b3fb68d0b` (84,583 bytes).

The workbook is a discovery input, not evidence of current operation, eligibility or an open application window. Keep the original outside the repository; do not commit downloaded workbooks or PDFs. If the official file changes, record its new hash and repeat the comparison rather than silently reusing old row references.

## Reading the workbook

All three worksheets were inspected with Python `openpyxl` in read-only analysis:

- `Introduction`: distinguishes targeted instruments from general policies that might also affect young farmers.
- `Acronyms`: CAP, ERDF, ESF+, RDP, RRF, SWOT and VAT.
- `Inventory`: header in row 1; 199 populated instrument rows, numbered 2–200. Columns A–D contain `Member State`, `Type of instrument`, `Name` and `Description`. Column E is empty. There are no instrument identifiers, dedicated reference columns, hyperlinks or comments. The one embedded source URL is in D110, a Vie publique account of the French agricultural orientation law.

Use references such as `Inventory!114` together with the workbook hash and original name. Preserve the category in column B. Green highlighting (`FFE9F5D0`) identifies instruments the authors considered specifically targeted; it is not a FarmSuccession admission decision. References can be embedded in description text, so inspect that text as well as cell hyperlinks.

Count workbook rows separately from distinct programmes and published records. For example, rows 33 and 44 both concern BioBoden; one row can also describe several measures. Belgium has separate Flanders and Wallonia labels, not two countries. There is no separate EU-wide row in this workbook.

## Methodological limits

The main report's sections 4.2–4.5 describe a study of the 2023–2027 CAP period with earlier policy context, documentary research, stakeholder interviews, case studies, focus groups and a survey. Its limitations include self-selection and response bias, uneven national participation, heterogeneous information and an inventory whose completeness cannot be established. It is not a census of accessible services.

Some descriptions contain dates or claims requiring independent checks. Row 35 describes an arrangement as existing since 2027, despite this annex's February 2026 version. Row 103 anticipates France Services Agriculture in 2025, whereas the existing French record cites a ministry announcement for 2027. Never import these claims or infer the number of missing services from the number of rows.

The report permits reproduction with source acknowledgement. Prefer original, concise descriptions of findings and short necessary quotations from primary sources; do not republish the institutional descriptions wholesale.

## Country index for future research

These are spreadsheet labels and row locations, not proposed additions to the territory catalogue. DE, ES, FR, IT and PT account for 77 rows; the other 122 rows remain available for future discovery. This document preserves the source and expansion workflow. It does not represent a completed row-by-row comparison or validate the listed instruments as publishable resources.

| Workbook label   | Rows    | Count |
| ---------------- | ------- | ----: |
| Belgium-Flanders | 2–5     |     4 |
| Belgium-Wallonia | 6–15    |    10 |
| Bulgaria         | 16–20   |     5 |
| Czechia          | 21–30   |    10 |
| Denmark          | 31–32   |     2 |
| Germany          | 33–50   |    18 |
| Estonia          | 51–53   |     3 |
| Ireland          | 54–61   |     8 |
| Greece           | 62–64   |     3 |
| Spain            | 65–95   |    31 |
| France           | 96–110  |    15 |
| Croatia          | 111–113 |     3 |
| Italy            | 114–117 |     4 |
| Cyprus           | 118     |     1 |
| Latvia           | 119     |     1 |
| Lithuania        | 120–121 |     2 |
| Luxembourg       | 122–126 |     5 |
| Hungary          | 127–137 |    11 |
| Malta            | 138–144 |     7 |
| Netherlands      | 145–149 |     5 |
| Austria          | 150–159 |    10 |
| Poland           | 160–161 |     2 |
| Portugal         | 162–170 |     9 |
| Romania          | 171–174 |     4 |
| Slovenia         | 175–188 |    14 |
| Slovakia         | 189–197 |     9 |
| Finland          | 198–199 |     2 |
| Sweden           | 200     |     1 |

## Reusing this source when coverage expands

Expansion requires a separate maintainer decision. This document adds no countries, regions, public records, dependencies or automatic import process.

The existing territorial model already supports additional countries through data, catalogue entries and language support. Decision 023 records the working example of Germany. No speculative schema or frontend redesign is needed to retain that capability. A future country still needs its own research and validation; the annex supplies starting points, not a ready-to-publish dataset.

1. Read the current `AGENTS.md`, `prompts/research-territory.md`, schemas and [decision 023](../decisions/023-a-country-is-data-a-catalogue-entry-and-a-language.md). Establish the country's actual territorial responsibilities and language requirements before defining its catalogue entry.
2. Fetch the official annex again and record its version, retrieval date and hash. Inspect every worksheet and extract the chosen country's rows with original row numbers, descriptions, categories and embedded references. Do not assume the row index above survives an update.
3. Research the country before its regions. Use the annex as a seed alongside the normal breadth and expansion searches, not as a substitute for a national brief, regional checklist or saturation pass.
4. Compare each instrument with the EU, national, hub and regional layers and prior leads. Record A (covered), B (partial), C (potentially missing), D (out of scope), E (insufficient evidence) or F (historical/discontinued), with reasons, matching resource IDs, source URLs and the next action. An initial classification is not completed primary-source research.
5. Open the responsible operator's sources. Verify access, scope, eligibility, dates, legal versus operational existence and separate calls. Preserve uncertainty and literal dated evidence. Do not mark an inaccessible source verified, bypass certificate validation or import a search snippet.
6. Add the country only with its edition, research brief and complete reader-facing language support, following decision 023. Add regional data through their own research passes; never translate another country's institutional structure into a new one by assumption.
7. Run the current territorial source gate, report generation, repository checks and applicable frontend checks. Commit small coherent changes and open a PR into `develop`. Publication and expansion remain separate decisions.

Keep row-level comparisons in the research PR. Put reusable discoveries, rejected candidates and access blockers into the relevant briefs. This preserves the evidence trail without creating a second public inventory or an import subsystem.
