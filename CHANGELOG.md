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

### Not here yet

- Italy and Portugal: researched, not published here.
- A published site, and therefore anything to visit.
