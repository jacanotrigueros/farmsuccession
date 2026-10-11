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

### Not here yet

- A published site, and therefore anything to visit.
