# 036 — Help readers choose before listing everything

Proposed 2026-11-07. Review of the published 1.8.1 interface against develop
`180ec26`. These are interface decisions, not changes to the documentary corpus.

## Observations and scope

The public interface was inspected in a desktop browser: Europe, Spain,
Austria, Madrid, Canarias, Burgenland, a financial-support record with a call,
national search with a kind filter and an empty query result, project information,
history, the correction form and the 404 recovery page. The shared templates,
record evidence, footer, navigation and translations were read in the repository.
This covers the distinct page types; it is not a claim that every URL or language
was manually inspected.

On the published Spain page at the browser's 1,350px-wide desktop viewport, the
page was about 12,558px tall. The needs heading started around 8,238px down,
after the territorial navigation and an expanded directory of every record.
National and European records then appeared again as full cards. Those are
layout observations, not evidence about what readers actually click.

## Decisions in this change

| Surface              | Observed problem                                                                                                      | Change and reader benefit                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Europe home          | Four statistics and a long explanation precede country selection.                                                     | Move the evidence/statistics panel after countries and needs. A reader reaches a useful destination sooner.                                                          |
| Country              | An expanded regional directory pushes the needs chooser far down the page.                                            | Put needs first, followed by territories and national/inherited cards. Move the regional directory after those.                                                      |
| Country directory    | National and European resource names are repeated in competing lists.                                                 | List only subnational resources in the regional directory. Each record destination appears once on the country page.                                                 |
| Regional directory   | Every resource name is expanded even before a territory is chosen.                                                    | Native closed disclosures show territory names and counts; opening one exposes its resource names. All links remain in the initial HTML and work without JavaScript. |
| Country, hub, region | The funding card promises training and advice but filters only financial support.                                     | Name the card and its hint after the financing it actually returns, across all seven supported interface languages. Retain the existing category mapping.            |
| Resource             | The official action follows all application-period panels; several calls can push it far away.                        | Put the official-page and evidence actions before the call panels, after the summary and draft notice. Dates and their consultation dates remain explicit.           |
| Resource access      | A resource without access prose renders an empty access section.                                                      | Supply its official-page link as the access route.                                                                                                                   |
| Resource exit        | After reading the evidence, the nearest general search loses the resource's regional context.                         | Offer the same territorial catalogue below the evidence, with the relevant region or grouping's regions selected.                                                    |
| Search               | With filters hidden during loading, failure or no JavaScript, the catalogue occupies the 18rem desktop filter column. | Let the catalogue span the full layout while the filter aside is hidden. Restore its existing column when filters become usable.                                     |
| Project and history  | The navigation is last in source order, so on a narrow screen it follows the entire article.                          | Place it before the article in source order and keep it on the right at desktop widths.                                                                              |

Country-level filtering uses the existing complete national search. The former
in-page kind selector covered national and inherited cards but silently ignored
the regional directory. It is removed from country pages and retained on regions
and groupings, where it covers every resource card on the page.

The funding copy is deliberately narrower rather than widening a category's
query without deciding how its counts should change. Evidence quotations are
never collapsed, clamped or shortened. Regional disclosures contain directory
links, not the source evidence itself. Inherited cards stay visible: a reader
must still see resources that apply through wider layers.

## Second interface pass

The same proposal was extended on 2026-11-07 after the maintainer asked for a
broader pass over interface wording and visual consistency. The maintainer will
run the site and perform the visual review.

- The home hero has a direct country-selection action alongside the complete
  European catalogue, so choosing a place does not require scrolling first.
- Topic cards use the existing category SVGs instead of four separate raster
  illustrations. Country, grouping and regional pages use a compact version
  with clear names and counts; the home retains the explanatory hints.
- Empty topics say that no resource has yet been documented, rather than implying
  that no service exists. Their text retains normal contrast.
- Country headers concentrate on resources and territories. Source and quotation
  counts move to the coverage section, where they explain the evidence.
- Headings, introductory paragraphs and quotations have a reading measure. Flags
  are inline with the heading instead of becoming a separate flex row on a phone.
  Quotations remain complete and expanded.
- Status tags get consistent symbols in both built cards and enhanced search
  results. A short explanation on record pages separates operating status from an
  open application period. Published figures get a direct page-index link; contact
  forms get a descriptive action rather than a raw URL.
- The search field has a question as its accessible label. A short hint explains
  that resources retain their source language. Explicitly widening to Europe
  keeps the query and thematic filters and drops geographic restrictions, even
  when the national index fails to load.
- Preparing a correction or suggestion shows a selectable email draft locally.
  Opening an email application is a separate action; the draft can also be copied
  into webmail. Changing an answer hides the obsolete draft. Without JavaScript,
  the original mail form remains. Nothing is submitted by preparing the draft.
- The intake page no longer jumps past its introduction on load. The record's
  feedback copy asks for a concrete improvement instead of asking a yes/no question
  that has no response control. Utility copy is excluded from the record's search
  body.

A final hierarchy check promotes advice into the primary topic grid. Someone
who needs guidance should not have to look under background resource types to
find it. Its link filters exactly ADVICE, its count uses the same kind, and it is
removed from the secondary list. The existing index grouping and documentary
categories stay unchanged. The five primary topics use a three-column maximum
rather than leaving a single fifth card under a four-column row.

All new interface words are supplied for the seven supported languages. The
underlying resource descriptions and quoted source material are not rewritten.

## Findings retained for further consideration

- The search's existing pagination, active filters, empty-state recovery and
  country boundary are useful. Keep these rather than introducing another search
  implementation on country pages.
- A territory with no own records still shows what it inherits and says that its
  own coverage is empty. Keep that distinction; an empty local layer does not
  mean no applicable resources.
- The correction form now offers a selectable draft as well as an explicit mail
  action and a visible address. Sending still happens in the reader's email
  service; this change does not add a submission service.
- Country and record headings can be long, especially on phones. This proposal
  preserves the full source names, body size and touch targets rather than
  reducing type to squeeze them into a screenshot.
- The home remains in English, with country names in their local languages. A
  translated home would need a separate content decision; it is not silently
  introduced as an interface rearrangement.
- A responsive page index for long record pages may help, but a permanently
  sticky multi-line strip can obscure content on a phone. No new sticky chrome
  is added here.

## Verification and limits

The build's country-link regression compares each country's record destinations
with its complete national search fallback, including inherited European records.
The two sets must agree and the country list must contain no duplicate record
destinations. Existing tests retain full quotations, dated call answers, language
markup, accessibility structure and the no-storage/no-third-party contracts.

The public desktop inspection is complete. A separate headless browser could
not start in this execution environment (`socket() failed: Operation not
permitted`), so screenshots and overflow checks of the modified build at 320px,
390px and desktop widths are **not verified**. The maintainer will perform that visual pass
before merge, especially disclosure expansion, the reordered prose index, status
symbols and the prepared-email flow.
No before/after scroll reduction is claimed for the modified build without that
measurement. This review is an inspection, not a usability study with readers.
