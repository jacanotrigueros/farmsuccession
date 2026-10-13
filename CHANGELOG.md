# Changelog

What changed, written for somebody deciding whether to trust the data rather than
for somebody reading the diff. Each entry says what became possible and what
became impossible.

Nothing is released yet: `master` holds no version, and the entries below describe
work merged into `develop`. The first release will be tagged when there is data to
release.

## Unreleased

### The data contracts

- Three schemas settled at `schemaVersion` 1.0.0: the territory catalogue, one
  territory in one year, and the research brief of a territory. Every property
  carries a description, every free-text field is bounded by a length measured from
  real values, and no property has a `default` — in a documentary schema a default
  is indistinguishable from a fact somebody read on a page.
- The types in `src/types/` are generated from the schemas and never edited by
  hand, so the data contract has one source.
- A field that describes one kind of resource can no longer appear on another: a
  training course cannot hand over plots of land, and a land bank cannot carry a
  financial mechanism.

### The territorial model

- Views are cumulative — EU, then country, then hub, then region — with one
  implementation, so a reader and a validator cannot disagree about what a
  territory inherits. A hub of one region is that region and carries no layer of
  its own.

### What can no longer be published

- A file whose path, own fields and the catalogue disagree about which territory it
  describes.
- A date after the day the file was written, a source consulted after it was
  published, or a review signed before the last source was read.
- A figure, deadline, percentage or contact detail in reader-facing prose that no
  quote, metric, date or URL of that file supports.
- A call marked open on a day its own source showed it closed, or marked upcoming
  after it had already opened.
- A resource that no lead in the territory's research brief admitted, or a lead
  admitted as a resource that no reader of that territory could see.
- Prose that names a schema code, a resource id, a territory slug or a repository
  path, or that reads as another of the catalogue's languages.
- A file carrying damage the parser hides: a repeated key that silently keeps only
  its last value, or a pasted fragment after the end of the document.

### The checks

- `npm run validate` — offline, part of `npm run check`, and therefore part of
  every push. It says how many files it read, so a run over nothing cannot be read
  as a clean run.
- `npm run check:sources` and `npm run check:links` — live. They re-read every
  cited page against its quotes, and ask every address the repository points at
  whether it still answers. They answer PASS, FAIL or UNCHECKED, and never gate a
  commit.
- `npm run check:territory -- <year> <territory>` — the gate for finishing one
  territory, where a warning fails too and a region must have answered every
  instrument its country brief expects.
- `npm run measure` — the distributions behind the thresholds, so a rule can be
  re-argued against the corpus instead of against preference.

### Written down

- [`decisions/`](decisions/README.md): why each non-obvious rule is the way it is,
  what the evidence said, what it costs and what would overturn it.
- `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` and this
  file.

### The research pipeline

- `prompts/research-territory.md` is the standard process, and every version it
  went through is kept whole in `prompts/versions/`. A record says which version it
  followed, and the gate refuses a version the repository cannot show, so old work
  can be read against the instructions it actually had.
- `npm run prompt -- <year> <territory>` fills that process with the briefs, the
  resources of the layers above, the current file and the schemas. `--compact`
  names the shared files by path for an assistant that can open them.
- `npm run ingest -- <answer.md>` writes the files an answer delivered as fenced
  JSON blocks and then runs the whole gate, so an assistant with access to nothing
  can take part in the research.
- `npm run diff -- <from> <to>` says what changed between two editions, and the
  gate warns about the two ways continuity breaks: a record that vanishes instead
  of being kept as discontinued, and the same page returning under a new id.

### The first edition

- **The 2026 edition of the European layer and Spain**: 33 files, 132 records, 231
  sources, 651 quotes and 18 dated developments, plus the 33 research briefs that say
  how each territory was searched — including the 115 leads that were considered and
  rejected, which is the part that makes a second pass cheaper than the first.
- One commit per territory, edition file and brief together, so a research pass can be
  reverted on its own.
- Three sentences were corrected on the way in, each claiming a date that no quote of
  the file supported, and one rule was corrected because the data was right and the
  rule was wrong: a file's own voice may use the evidence of the layers it inherits,
  which is what a cumulative view means.
- The Asturian portal's incomplete certificate chain is completed by a third pinned
  public intermediate; the Gipuzkoa portals stay UNCHECKED, because trusting their
  root would add a trust anchor and that line does not move.
- Re-read live on 2 October 2026: 218 PASS, 1 FAIL, 11 UNCHECKED of 230 pages, all
  three published as they are.

### Germany

- **The 2026 edition of Germany**: 17 files, 36 records, 43 sources and 142 quotes,
  with a research brief for the national layer and for each of the 16 Länder. Nothing
  operative is documented nationally, because establishment aid, handover advice and
  farm matching are run by the Länder; every one of them documents something.
- A country now arrives as data, one catalogue entry and one language, and no code:
  [`decisions/023`](decisions/023-a-country-is-data-a-catalogue-entry-and-a-language.md).
  German is the first language added after the two the site started with, and the type
  checker listed every word that was missing rather than letting a page fall back to
  another language.
- Two records, in Berlin and in Brandenburg, cite the same page on purpose: the two
  Länder fund establishment through one joint directive. Each record says so, and the
  validator lists the pair for review rather than deciding for a person.
- Three corrections on the way in, all of them prose a reader would have been told
  wrongly: a national coverage note and a limitation still saying the other Länder
  remained to be examined, and two notes written in research vocabulary — a dataset, a
  duplicate check, a resource id, a stored status code — none of which a reader can use.
- Re-read live on 8 October 2026, Land by Land: 40 PASS, 0 FAIL, 2 UNCHECKED of 42
  fetches, the two being pages of one host that refuses automated requests.

### The site

- An Astro site built from the data, with a page for every territory and every record,
  a search page for each scope, the pages about the project, and an account of the
  project that held this domain before. It is not published yet.
- Search is a Pagefind index per language, each loaded on its own, so recall in one
  language never costs recall in another.
- One script on the search pages, one that re-answers "can I apply now?" for the
  reader own day, and nothing else: no cookies, no storage, no request to another host.

### France

- **The 2026 edition of France**: 19 files, 72 records, 89 sources and 271 quotes, with a
  research brief for the national layer and for each of the 18 regions. France sits
  between the two countries already here: one national record, and the weight in the
  regions, where land is the strongest layer.
- Mayotte publishes nothing and says why — the state agricultural service did not answer,
  the land authority certificate has expired, and the domain that carried the European
  funds now redirects elsewhere. A reader gets that account rather than an empty page.
- French is the fourth language, added the same way as the third: one union, nineteen
  tables, and a build that stays broken until every word exists.
- It also found a defect four milestones old: the link that skips to the content was
  written into the layout in English and stayed English on every Spanish, German and
  French page. It is the first thing a keyboard or screen-reader user meets, and it was
  invisible to every check because it only appears when focused. Fixed, and now a test.

### The shapes of the closed design

- **Every page opens with the same band**: where you are, what the page is called, what it
  is about, and whatever that page needs a reader to have before the content. The trail
  above the title is one component, with the page's own name left off a record where the
  title repeats it immediately, and it is published as structured data so a search engine
  is told what a reader is shown.
- **A record in a list is a card**: kind and status, the name, what it offers, and the
  three things that make it checkable — where it applies, who runs it, how many pages were
  read and when. The whole box is the link. A search result is the same card without its
  box, from the same template, so a result and a listed record cannot drift apart.
- **A territory says what it recorded and what reaches it**, in two groups rather than
  interleaved: its own records, then one group per wider layer, closest first, each naming
  the layer and counting it. Its figures count everything documented anywhere inside it —
  which is what a search from that page returns — and a line underneath says how that
  total breaks down.
- **A record page answers before it shows its working.** The band carries the summary, the
  answer to "can I apply today" and the two ways out: the official page, and the evidence,
  as a button saying how many sources there are. The facts sit beside the text as a panel,
  and the evidence closes the page at full width, numbered, each source with the site it
  lives on, the day it was read and its quotes in the serif this site keeps for quoted
  evidence.
- **The filters of a search are a column beside the results**, each group folding, instead
  of a wall of twenty-eight checkboxes above them. What starts hidden is the field and the
  filters, never the list under them: without the index, that list is the whole answer.
- **A page may ask not to be indexed** (`decisions/028`): the six regions that have
  documented nothing of their own, and the six search pages, carry `noindex, follow` and
  are left out of the sitemap, which reads the rule off the built page rather than working
  it out a second time. Nothing is hidden from a reader: the pages stay, their links are
  followed, and each of them says in its own words that nothing has been recorded for that
  territory itself.
- The page that answers an address which does not exist had never been inside the
  container that holds the site's margins; it is, and it has the band too.

### The pass against the design this repository is converging on

- **A record lives under the country that recorded it**: `/es/recursos/<id>/`, `/de/angebote/<id>/`, in
  that country's own word for a record, with the European layer keeping `/resources/<id>/`. The flat
  namespace said nothing about where a record applies and made every id unique or colliding across the
  whole of Europe. The search index and the sitemap find a record page by what it declares about itself
  rather than by the folder it sits in.
- **The page takes the width of the page.** Two rails — an index of every territory on one side, the
  page's own sections on the other — left the content about 600 pixels wide on a 1280 screen, and the
  cards, the breadcrumb and the lists inside it were all paying for that. What is on this page is a strip
  of links under the title; the index of territories is gone, because moving around inside a country is
  what the country page, the breadcrumb and the control at the top are for.
- **A record page answers in the order the questions come**: what kind of thing it is and whether it is
  operating, what it is called, where it applies and who runs it, what it offers, whether you can apply
  today, and the way to the official page — then the detail.
- **Flags are files.** A flag emoji is a pair of regional indicator letters and Windows ships no glyph for
  the pair, so most readers saw `ES` where the page meant Spain.
- Each kind in "other types of resources" carries the line that says what it is; every state is
  capitalised, like the kinds beside them; the page you are on no longer sits higher than the trail behind
  it; the four links that were 19 to 24 pixels tall are targets again; and the edition note sits with the
  figures it qualifies instead of having a band of the page to itself.

### What a reader meets before the page, and what a page says about itself

- **Titles say what the page is about.** Every territory page was called "España —
  FarmSuccession", which is a name and tells a searcher nothing; it now reads "España:
  relevo generacional y acceso a la tierra", in the page's own language. The description
  stays the territory's own summary, which is written from its data.
- **An address that does not exist answers in six languages.** One file serves every
  unknown path, so it says what happened in all of them: an English heading and the
  European search, then every country saying it in its own language with the way back
  into itself. No script decides which one a reader sees —
  [`decisions/027`](decisions/027-the-page-for-somebody-already-lost-asks-for-nothing.md).
- **A sitemap and a robots file.** The sitemap is written from the pages the build
  produced rather than from the routes meant to produce them, so it cannot list a page
  that does not exist or miss one that does. Its dates are the days the data says each
  territory published its evidence, and nothing else carries a date at all: a lastmod
  invented here would be a claim about freshness.
- **Each record says which layer it comes from, once.** A situation keeps its single
  list, ordered from the closest layer outwards, with a heading where the layer changes:
  what the territory recorded, then what applies from the country, then from Europe. An
  aid or a course recorded for the country and not for the region is one a reader can use
  anywhere inside it, and the page now says so without a line of small print per record.
- **A search box shows what kind of word goes in it**, and a territory page counts what it
  holds — records that apply, territories inside, sources cited — before a reader scrolls
  it.
- A filter offered three territories as "el-hierro", "formentera" and "fuerteventura":
  the names were read from the records, so the only ones that could lose a name were the
  three that document nothing of their own. They are read from the catalogue now.

### A reading says whose page it was

- Every reading in `reports/checks/` now records the territories whose records cite the
  page, so a sweep of the whole edition says whose each of its pages is instead of saying
  only "all". It was 69% blind before: of the 502 pages the series had seen, 347 had only
  ever been read by a sweep that recorded no territory, so the series could not say how
  much of Spain's evidence had been read, on which day, or name one Spanish page to go
  and open.
- `npm run report:sources` reports territory by territory, grouped by country, worst
  first: how much of what each territory cites has been read, on how many days, which of
  its pages somebody has to act on, and which of its pages **no run has ever read** — a
  gap no single run can report, because a run only knows what it checked.
- Coverage is counted against what the corpus cites today, not against the ledger, so a
  page added after the last sweep shows up as unread rather than staying invisible. The
  8 territories that document no instrument at all are reported as citing nothing, never
  as unread: a false alarm repeated every run teaches somebody to ignore the real ones.
- The second day of readings corrected the verdict itself. The sweep of 9 October gave the
  corpus a second day for the first time, fourteen pages had now failed twice, and the
  ledger called all fourteen GONE. Eleven were hosts answering 403 to an automated request
  or pages that answered 200 and cannot be read by a checker — UNCHECKED readings, which
  prove nothing either way, and the code was counting any HTTP status as an answer. GONE
  is 3: two pages that have lost a quoted sentence and one that answers 404. An over-eager
  GONE is the dangerous direction, because it sends somebody to rewrite correct records.
- Nothing already recorded was rewritten. A run whose results carry no attribution is
  read at its scope when that scope is one territory, and counted as unattributed when it
  is not, which leaves the three sweeps of 8 October attributed to nobody for good. See
  [`decisions/026`](decisions/026-a-reading-says-which-territory-it-was-about.md).

### The checks keep their results

- Every live check writes its own file under `reports/checks/`, committed, named for the
  instant it was taken: when, which scope, the totals, and every URL with its status,
  HTTP code and reason. One file per run, because a 53 KB append is not atomic and two
  checks at once would corrupt each other, and because a run nobody needs can be deleted
  without the rest losing their meaning.
- `npm run report:sources` answers from the series what no single run can: which pages are
  actually gone, which hosts are unreliable, and which runs were readings about the
  machine they ran on rather than about the corpus.
- A page is GONE only after it answered badly on two different days, and silence never
  becomes GONE. The French sweep of 8 October 2026 is why: 36 of 89 pages went unread in
  one evening, every one of them a transport failure, and the next run read them fine.
  See [`decisions/025`](decisions/025-a-source-is-gone-when-the-series-says-so.md).

### A chain completed, and one that cannot be

- `www.mapa.gob.es` — the Spanish ministry, eight cited pages — served a chain including
  the self-signed FNMT root the default store does not carry, so nothing could read them.
  FNMT publishes the same certificate cross-signed by the older root that the store does
  carry; it is byte-identical to the one the ministry serves, and it is now pinned by
  fingerprint. Spain's national layer went from 3 PASS and 8 UNCHECKED to 11 PASS.
- The self-signed twin published beside it was refused: trusting it would add an anchor,
  which [`decisions/008`](decisions/008-complete-a-tls-chain.md) forbids and the checks
  in `installIntermediates` reject on their own. The Gipuzkoa portals stay UNCHECKED for
  that reason — their chain is anchored in Izenpe, and no cross-signed certificate links
  it to a root this runtime trusts.

### Italy

- **The 2026 edition of Italy**: 22 files, 62 records, 123 sources and 419 quotes, with a
  research brief for the national layer and for each of the 19 regions and two autonomous
  provinces. Nothing operative is documented nationally: the national instruments belong
  to ISMEA and no page specific enough to cite was found, and the file says so.
- Italy leans the opposite way from France: establishment aid in 20 of its 21 territories
  and a qualifying course in 10, but a transfer or matching service in only 2.
- Three claims no source supported were refused at the door: two invented a minimum age of
  18 where the call quotes only "di età non superiore a 40 anni", and one named a deadline
  that no quote of its record mentions.
- Four territories failed their own gate because their sources had moved, and all four were
  corrected against what those pages say now rather than edited to pass: the Campanian call
  closed on 30 September, the Piedmontese one reads Scaduto, the Venetian one opened on 2
  October with its publication in the BUR, and a Tuscan chamber replaced the weekly sheet
  that carried a remaining-budget figure, which is therefore no longer published here.
- Italian is the fifth language. The check that no schema code reaches a reader now skips
  quotations, because an Italian training course quotes its own page — "COMPILA IL FORM
  ONLINE" — and FORM is also a contact channel in the schema. A citation edited to satisfy
  a check is no longer evidence, so the rule that gave way is the other one.

### Portugal, and the edition complete

- **The 2026 edition of Portugal**: 10 files, 17 records, 26 sources and 69 quotes, with a
  research brief for the national layer and for each of its 9 regions. It is the thinnest
  country and the most national: four of its records apply to the whole country, no region
  documents a qualifying course, and what the regions carry is advice in 4 of 9 and a land
  exchange in 3.
- **The corpus is now the whole corpus**: 101 edition files and 101 briefs, the EU layer
  and five countries, 319 records, 511 sources, 1,550 quotes, 494 distinct pages. What the
  research sweep produced is what this repository publishes, so the sample the measurement
  thresholds were set from and the thing being measured have become the same.
- Portuguese is the sixth language.
- Madeira cost the most and was worth it. Its prize page used to read "não antes de 24
  meses" and now reads "há não mais de 4 anos": the eligibility window doubled and then
  some, and the record would have told somebody three years into farming that it was too
  late for them. The notices page had dropped a prefix from every line, and another page
  had fixed a typo this repository was still quoting. Checking that a quote can still be
  found is not pedantry about punctuation; this is what it is for.
- The same page also shows a call nobody had recorded: the prize is open from 2 October to
  18 December, so the record now answers "can I apply now?" where before it had no dates
  at all.

### The design, closed

- **The site says what the validated design says.** The chrome was rewritten against it in all
  six languages: what a record's rows are called and the order they answer in, the names of the
  kinds and of the states, the figures of a territory and the sentence that breaks them down,
  the words of the search and of the pages around it. Where the two differed, the validated
  design won.
- **A search answers a page at a time**: twenty results, the filters in a column beside them
  with the count each one would return, a chip for everything chosen, a link that clears them
  all at once, and a way back to the European search when a country has nothing. What a reader
  without the index gets is unchanged — the complete list is in the markup, and it is the whole
  answer.
- **A territory can be narrowed where its records are.** The strip under the title is the map
  of the page again — the sections it has, and nothing else — and the narrowing sits inside the
  records, offering only the kinds that page actually holds. Choosing one rewrites every figure
  beside a list with the list, drops a layer or a section that has nothing left in it along with
  its link in the strip, and says where the records of other scopes are when the choice empties
  the list it narrows. Without the script none of this is missed: the page is complete, and
  every one of those kinds is a link to the search.
- **A figure can no longer say one thing while the page shows another**: a count that a reader
  can change carries the two sentences it can become, one record or several, so what is written
  stays a sentence in its own language — and a page that ships a figure like that has to ship
  the script that keeps it true.
- The links of the footer are one list rather than four columns of one; the button under the
  home page's search no longer repeats the words above it; and an English edition is the
  "2026 edition", not the "Edition 2026".

### Not here yet

- A published site, and therefore anything to visit.
