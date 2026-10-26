# Changelog

What changed, written for somebody deciding whether to trust the data rather than
for somebody reading the diff. Each entry says what became possible and what
became impossible.

Version 1.0.0 is the 2026 edition: one European layer and five countries, read
back against their own sources before being closed on 13 October 2026. The site
built from this data reached readers at farmsuccession.eu on 14 October 2026,
and what it serves is this edition; the workflow that publishes it was written
after the version was closed and is not a part of it.

## 1.5.0 — 2026-10-26

Six records enter, seventeen say more than they did, and what a record offers a
result page changed in every country. The new records are Italian and Spanish;
the French work completes records that already existed.

### What a record offers a result page

- **Descriptions ran past the room a result has.** Three of them measured 213,
  231 and 255 characters against the roughly 155 a result shows. Every
  description now ends inside 155 characters, cut at a word and never mid-word,
  in all six languages, and a test over the built site refuses one that does not.
- **The call a record documents now opens its description.** Records held the
  period in the data and nothing carried it to the line a result can show. Where
  the call's name does not fit the room available, its year stands in for it.
- **Every record is linked by name from its country page**, and not only from the
  listing and search pages it was reachable through before.

### The crawl stops going to one form

- Each record linked to the correction form with its parameters already filled
  in, so the build emitted 424 distinct URLs of a single form, each of them
  fetched and then discarded against the `noindex` those pages carry.
- **Those links now carry `rel="nofollow"`.** The form is untouched: it is still
  one page, and it still works.

### France: where each Safer acts, and what it was before

- **Fifteen French records now name the territory their Safer acts in**, and
  eight of them carry the département numbers the body publishes itself. A number
  appears only where the source prints one; where a page names its départements
  without numbers, no number is recorded.
- **Five records say what the body was formed from.** Safer Grand Est, Safer
  Normandie, Safer Bourgogne-Franche-Comté, Safer Nouvelle-Aquitaine and Safer
  Occitanie each name the Safer they succeeded, so a record is no longer silent
  about a name the body used to carry.
- **Nineteen sources enter, every one of them a page the body publishes itself**,
  quoted word for word and dated by the day it was read. Where the territory is
  fixed by an arrêté in a gazette that refuses to be read by a machine, the
  gazette is not cited: the fact comes from the operator's own page, or it does
  not come in.
- **Four land-agency records now say what else exists in their region**, which is
  what this site can add beside the agency's own page.
- One sentence was withdrawn instead of published. A record had gained a
  statement about its own territory that no page had been read for, and the
  publication date that arrived with it went back as well.

### Italy and Spain: six records enter

- **Italy gains its first three national records**, all ISMEA instruments:
  Generazione Terra 2026, Banca nazionale delle Terre Agricole and Più Impresa.
  Until now Italy was documented region by region only.
- **Spain gains three public land banks**: Nordeste de Tenerife, Pedreguer and
  Callosa de Segura.
- **Two records in Catalunya carry the Catalan terms the Generalitat uses**,
  inside their Spanish text. That documents the words a body uses for its own
  instrument; it is not a seventh language and does not claim to be one.

324 records over 101 edition files, against 318 in 1.4.1.

## 1.4.1 — 2026-10-25

Nothing in the data changed. Two things the site put in front of a reader
promised an action it could not perform, and both are gone.

### A control that cannot act is not a control

- **Each record asked whether the page helped and offered two answers styled as
  buttons.** Both were `mailto:` links. Where no mail client is configured —
  which is the common case, because most people read mail in a browser —
  pressing one did nothing at all and the page looked broken; where one was
  configured, an unexpected compose window opened instead.
- **The question now ends in the address, written out**, where it can be read
  and copied without being pressed. What became impossible: a record page
  carrying a `mailto:` link shaped like a button, which a test over the built
  site now refuses, in each of the six languages.
- The correction form is untouched. It is a page that works, and it asks for
  more than a yes or a no.

### The page for an address that does not exist

- `404.html` is served for every address this site does not have, so the address
  a reader is at is the one they mistyped and never that file's. It carried a
  canonical and an `og:url` naming `/404/` all the same, which the build does
  not produce.
- **It now claims no address of its own and asks to stay out of the index**,
  while its links are still followed. Requested directly the file still answers
  200, which is what static hosting does; what it no longer does is offer itself
  as a result to somebody who was looking for an answer.

## 1.4.0 — 2026-10-19

One record leaves the directory. That is the whole of what a reader sees, and the
rest of this version exists so that the next one does not leave a hole where the
evidence was.

### A source this project may not quote

- **Pastoreo Vivo is withdrawn**, and with it the only record resting on
  `serraniasvivas.org`. Its legal notice, read on 18 October, reserves
  "la reproducción y/o publicación, total o parcial" of the site to prior written
  permission and limits the material to personal and private use. Every record
  here rests on words quoted from its source, so a record that cannot carry its
  quotes cannot meet the evidence rule and goes rather than standing on nothing.
  [016](decisions/016-a-pass-is-a-dated-snapshot.md) makes removal the only
  correction a closed edition allows.
- Nobody asked for this. It is a reading of a published document, which can be
  wrong, so the clause it rests on is recorded word for word with the day it was
  read. Linking was never the problem: the same notice contemplates third-party
  hyperlinks that open the full page.
- It is a loss worth naming. A programme pairing new entrants with livestock
  farms at risk of closing is this project's subject, not a marginal entry. The
  way back is in the notice itself, which reserves permission rather than
  refusing it.

### So that the next withdrawal leaves a trace instead of a hole

The site has told readers in six languages, since the first version, that an
organisation which does not want to appear can ask to be taken out. Nothing stood
behind that sentence. The first time it came up the record was deleted — and the
lead, the reason it had been admitted, and the record of having searched there at
all went with it. The next pass would have found it again and decided the same
thing from nothing.

- **What each source's terms permit is written down once**, per host, and a
  permission is worth recording as much as a refusal: one stops somebody reading
  the same notice next year, the other stops a record citing that host again.
- **A notice answers one use at a time.** A record quotes a page and sends a
  reader to it, and both have to be permitted. Taking entries out of somebody's
  listing is a third use with its own right attached, which no published record
  shows, so it is asked separately and never blocks a record.
- **A lead can now be real and uncarryable.** The two Andalucían leads that had
  been deleted are back under that status, including the one that was never
  published.
- **The guarantee is a test, not a label.** The build fails if any published
  record cites a refused host — in its access address, its sources, its calls or
  its news — and names every record that does.

### Two readings of this project's own work

- **Who arrives, read twice.** 155 impressions and three clicks over four days,
  average position 26.6. All three clicks went to the record of a named
  instrument; four land-agency records took fifty-three impressions and produced
  none. A query that names an organisation wants that organisation's own site,
  which sits above this one. If that holds, those impressions are not a problem
  to solve, because solving them would mean competing with the body each record
  exists to send a reader to.
- **025 was measured rather than argued, and 107 was the wrong number.** Letting
  failures after the last success condemn a page would move nothing in the
  committed series. Of the 107 pages called mixed successes and failures, only 10
  carry a real failure; the other 97 combine a success with an attempt nobody
  could take.

### Written down, not acted on

- Two faults measured on the pages that take the impressions: descriptions of up
  to 255 characters where a results page shows about 155, one of them cut
  mid-word exactly where the reason to click would have been; and a brand suffix
  spending seventeen characters of a title that truncates near sixty. Neither is
  changed. Rewriting a title mid-measurement makes the next reading incomparable
  with the last two, and comparability is the only reason the site is being left
  alone this week.
- Which of the remaining sources permit this use. 100 of the 258 hosts a reader
  is sent to are not public administrations, and they carry 111 records. Two have
  been read.

## 1.3.0 — 2026-10-18

No record changes and no file under `data/` changes. `schema/edition.schema.json`
gains one sentence: a description on the audience codes, which no validation reads
and which changes nothing that has been checked.

What changes is a set of claims the site was making and could not support, a thing
a reader can now say back, and the first evidence about who is actually here.

### Four things the site said that it could not show

- **A heading asked how much _you_ can receive.** It sat above a figure a source
  published, on a record whose own source says the 2026 allocation is
  "totalmente esgotadas". The site documents what an administration published per
  beneficiary; it does not know what anybody will receive. Every language now names
  the published amount, and the three questions stay apart: whether an instrument
  exists, whether its documented dates let somebody apply today, and what a source
  said per beneficiary.
- **A footer called these references _verified_** in French, Italian and
  Portuguese, while every record on the page says no person has reviewed it. One
  component now makes the same statement on the home page and in all six footers:
  public sources, dated readings, automatic attempts to read them again, and no
  claim of human review or of current availability. The German also described
  consulted sources as checked, in two places, and no longer does.
- **A French label said a new entrant was somebody already established.**
  "Nouvel·le installé·e" excludes exactly the _futurs agriculteurs_ that the
  sources behind 58 French records address, and 242 of the 319 records carry that
  audience code. The code now carries a definition — a person entering farming,
  intended or recent — and each language names that person the way it already
  names a young farmer.
- **A French page called a record an _Angebot_.** In the box that tells a reader
  what is about to be sent on their behalf, and in the email the form prepares.
  It arrived in a commit called "keep words in their language": a test forbids
  that German word in the German intake, French used the same word, and the
  replace that satisfied the test landed in both.

### What a reader can say back

- The intake form had two doors, and both need somebody who already knows an
  answer: a resource exists and is missing, or a record is wrong. A third asks the
  reader who searched, found nothing and is about to leave — the only person who
  can say where this directory has a hole. It is offered at the moment a search
  returns nothing, and it carries what they typed so they do not write it twice.
- Every record now asks whether the page sent them to the right official source.
  Two letters already written, no script and no request; the whole cost is pressing
  send. That cost is also the open question: a reply address is a lot to ask for one
  word, and whether this survives is a decision for the first week of real use.

### What the browser now refuses

- **Every page carries a Content-Security-Policy.** A script, a stylesheet, a font,
  an image or a connection from another host is refused by the browser itself, and
  so is a form that would post anywhere but the correction address. "No third-party
  request" stops being a property of the build and becomes a rule enforced where the
  page actually runs. It travels in the page because GitHub Pages sends no headers
  of its own on a custom domain, which is also its one cost: `frame-ancestors` exists
  only as a header, so framing is not covered.
- Nothing needed `'unsafe-inline'`, and nothing may add it. An inline `style`
  attribute now fails the build and names the page, because a hash can cover a
  `<style>` element and can never cover an attribute.

### What the project can now say about itself

- **Who arrives.** The first reading of the search queries that precede an arrival,
  with what it does and does not support. 24 hours, 110 impressions, two arrivals,
  67 queries, and not one asking for a statistic or an overview. The plan's first
  milestone was written for a reader nobody had met; this is the first evidence that
  the reader is practical, and no evidence at all about volume.
- **An edition can be named by its exact bytes.** A sha256sum-compatible manifest, so
  somebody outside can fetch the files and prove they hold the ones that were cited.
  It certifies neither the truth of the evidence nor a human review.
- **A page nobody could read has not failed.** The report called 107 pages mixed
  successes and failures; only 10 carry a real failure and 97 combine a success with
  an attempt nobody could take. And coverage over an edition file that will not load
  now refuses to measure instead of reporting that territory as citing nothing.
- **025 was measured rather than argued.** Letting failures after the last success
  condemn a page would move zero pages in the committed series, which is the
  condition the plan itself set for leaving the rule alone. The objection is kept
  with the measurement that failed to support it, and a command says when to look
  again.

### Not here yet

- Whether a yes-or-no that costs an email is worth asking at all.
- What a task card counts, and what makes a record relevant to a task.
- Whether anything should drive a browser, and what.
- A second edition, and a payload somebody outside can cite by name.

Each of those is an open question with a memo, not a thing nobody noticed.

## 1.2.0 — 2026-10-16

The corpus is untouched again: no file under `data/` or `schema/` changes. What
changes is whether each of the six languages reads like itself, and what a page
tells a machine about the language it is written in. Found by reading the
published site in all six languages against the repository.

### A reader in Portugal was shown Brazilian conventions

- The formatter asked for the language `pt`, which resolves to Brazilian
  Portuguese. A Portuguese reader was shown `1.234.567,5` where their own
  convention writes `1 234 567,5`, and `€ 1.500` where it writes `1500 €` — the
  euro sign on the wrong side of the number, on the line a reader checks hardest.
  Every amount and every date in the Portuguese tree is now written the way
  Portugal writes them.

### Counting in a language that counts differently

- **French and Portuguese treat zero as singular**, and the count was written as
  `count === 1`. The empty state — the screen somebody reaches once they have
  already failed to find anything — said "0 résultats" where French says
  "0 résultat". Plural choice now comes from the language's own rules rather than
  from an equality, for the build, the search counter and the territorial filter
  alike.
- French and Italian adjectives did not agree with the nouns they described:
  "Annoncé", "Supprimé", "Annunciato", "Soppresso" against _ressource_ and
  _risorsa_.
- The German form called a record a _Ressource_ while the rest of the German
  site, including its own addresses, calls it an _Angebot_.
- Four languages said a count of records was "available" where English and
  Spanish only said how many there are. The same directory holds historical,
  announced and unconfirmed records; all six now say what the number counts.

### What a page tells a machine about its own language

- **Prose carries the language it was written in.** The European search is in
  English and lists records whose summaries, operators and served areas are
  Spanish, German, Italian and Portuguese, word for word from the pages that
  published them. Nothing said so, so anything reading the page aloud read all of
  it as English. The translated labels around that prose stay in the reader's
  language, which is why the place a record serves had to be split into its label
  and its value.
- **The project explanation and its history declare their six language versions.**
  They are the same document written six times, so they carry `hreflang` for all
  six and `x-default` to the English one. The country trees still do not, and
  deliberately: `/es/` and `/fr/` are pages about different countries, and saying
  otherwise would ask a search engine to show one to a reader who needs the other.
- A record's title carried its territory whether or not anything depended on it,
  and the longest ran to 161 characters. It is kept only where two records share
  a name and the title is the only thing telling them apart.

### Written down

- [`research/what-comes-next.md`](research/what-comes-next.md): what to do next
  and in which order, with every figure reproducible from the command it prints,
  and a first milestone that admits nobody has yet observed who reads this site.

### Not here yet

- Three claims this version does not fix, each needing a decision rather than a
  patch: a heading that asks how much _you_ can receive above a figure a source
  published, over a grant whose own source says the allocation is exhausted; a
  footer calling these references _verified_ while every record notice says no
  person has reviewed them; and a profile label that names a person in two
  languages, an event in three, and in French somebody who has already arrived.
- The language of a quotation. A German sentence quoted inside an Italian record
  cannot be marked as German, because a source carries no language of its own and
  guessing one would invent it.

## 1.1.0 — 2026-10-15

The first version a stranger read. Every correction below was found by reading the
published site rather than the repository, most of them by a review commissioned for
that purpose, and each one is a thing the site was telling a reader that was not so.
The data is untouched: this is the edition of 13 October, read correctly.

### What the site said that was not so

- **The search switched its own search box off.** The loop that disables a filter with
  no matches walked every named control in the form, and the form holds one that is not
  a filter: the search field. With no counts of its own it was read as an option that
  answers with nothing. Every search page, in every language, for every reader who
  waited for the index to load.
- **A record answered for one of its application periods and called it the answer.**
  The first in the array decided, and the array is not ordered: the Balearic and
  Azorean records list their calls oldest first, Cantabria, Veneto and Madeira newest
  first. On 15 October the Balearic page said the grant was closed, from a call that
  closed in December 2025, while the same page documented a window running to 30
  November 2026. Each of the eight records with more than one period now answers for
  each of them, named, and no call represents another.
- **Choosing a country meant two different things.** Spain in the European search
  returned 128 records and the Spanish search 132, the four being the European records
  Spain inherits. Territorial views are cumulative; one of those two numbers was not.
- **A card named the territory that contained a record rather than the area it serves.**
  A service documented as covering Südbaden read as covering all of Baden-Württemberg.
- **Browsing opened with the wrong words.** A result shown without a query led with its
  category and status and then repeated the title, territory and operator printed
  beside it. Browsing now begins with the record's own summary; the marked excerpt is
  kept for an actual text match, which is the only thing it was ever describing.
- **A label called an area a level.** The German and French words heading a record's
  scope were Ebene and Échelle — level and scale — above a row that holds a level and an
  area together. Once the area a record serves began appearing on cards and in search
  results, those two words were introducing a comarca as if it were a level.
- **A search that had not run did not say so.** Without the index a request carrying
  words and a territory returned the whole catalogue under a status that loaded for
  ever, and the source claimed the page worked without JavaScript. The page is
  complete, which is a different promise; it now says which one it is keeping.

### What a reader could not reach

- **News that named no record reached no page.** Evidence is rendered through the
  records it belongs to, so an item belonging to none was dropped: Cantabria's
  livestock succession pilot and Nouvelle-Aquitaine's selection of advisory
  organisations existed in the data, with their sources and dates, and nowhere else.
  The home page counted them among its updates. They now appear on their own
  territory, with their evidence, as news rather than as a service.

### The floor under every control

- **Nothing a reader has to use is under 16px or under 44px again.** The stylesheet had
  said so since the scale was written, and the scale had no step at 16: every control
  that was not body text took the metadata size and landed under the floor its own
  comment states. The strip of page links, the breadcrumbs, the reference from a claim
  to its source, the buttons that clear a search, and a pagination that was 40px square
  against a 44px rule. Measured in a browser across nine pages in all six languages.

### How French is set

- **French punctuation keeps the space its own typography gives it, and that space does
  not break.** An ordinary space before a colon can end a line, leaving the colon alone
  at the top of the next one with the word it belongs to abandoned above. Across 274
  French strings, 26 colons, 8 semicolons, 7 question marks and one pair of guillemets
  now carry the right character: the non-breaking space before a colon, the thin one
  before `;` `?` `!` and inside guillemets. The separator that introduces a value is a
  word of the language now rather than something a template writes for every language
  at once.
- Both characters are invisible in a diff, so a test reads every French string and fails
  on an ordinary space before any of those marks, on the wide space where the thin one
  belongs and on the thin one where the wide one does. The first thing it caught was
  four strings added by a different change while that one was open.

### A correction without an account

- **A reader can report a missing resource or a stale date without a GitHub account.**
  The only public route was an issue, which needs one. The form makes no network
  request: it prepares a structured message in the reader's own mail client, carrying
  the territory, the record and the page that led there. Nothing submitted publishes
  anything.

### What the documents say, and what holds them to it

- Three sentences described a repository that does not exist: that the whole gate runs
  on every commit, that the site loads one script, and that `astro check` is not used.
  The gate runs before a push, the site loads three, and the frontend has been running
  `astro check` all along.
- The account of the live checks said the series held 53 runs over 503 pages. It holds
  91 over 504. It is generated from the committed ledger now, and a test fails when the
  prose and the series disagree.
- Decisions [029](decisions/029-each-period-answers-for-itself.md) and
  [030](decisions/030-public-correction-stays-outside-github.md) record why each period
  answers for itself and why a public correction travels by email.

### Not here yet

- No regression drives a real browser. Every check above reads the markup the build
  emits, which is why the search could switch its own field off while 42 tests passed.
- The strings of the correction form were written in six languages and read by nobody.

## 1.0.0 — 2026-10-13

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

### Read back before being closed

- **Every cited page was read again, and every address asked whether it answers**, which this repository
  had never done over the whole corpus at once: 500 cited pages, 423 of them still saying what the records
  say they say, and 583 addresses of which 495 answered. The unread ones are a handful of portals that
  have never spoken to an automated reader, not a corpus of dead links, and the series in
  `reports/checks/` is what tells one from the other.
- **The five pages that had changed were corrected the same night**: a Lombardy call that opened that
  morning and was still recorded as upcoming, a Veneto course that had moved a week, an Andalusian
  citation resting on a page's own updated-on stamp, and a València land bank whose pages had gone from a
  site that is still alive — re-cited to the municipal procedure, with the claims only the dead pages
  supported removed.
- [`research/live-checks.md`](research/live-checks.md) now holds what the checks mean, what each answer is
  worth, and what every pass has found, so the next edition starts from the readings rather than from
  somebody's memory of them.

### Not here yet

- A published site, and therefore anything to visit.
