# 038 — A retired edition stays readable, as it was published

**2026-11-16.** The 2027 edition will replace the 2026 one at the site's addresses. The founder
asked that the 2026 information stay available once that happens.

## The question

When a new edition is published, should the previous one disappear from the site, kept only in the
repository, or stay readable — and if it stays, regenerated with today's templates or kept exactly as
readers saw it?

## What the evidence said

The site already builds only the newest edition (`currentEdition` in `frontend/src/lib/corpus.ts` is
the newest folder under `data/editions/`). On the day 2027 is published, every 2026 page would vanish
and its addresses would show 2027 content, although the 2026 files stay in the repository.

[016](016-a-pass-is-a-dated-snapshot.md) already says what an edition is: the record of what somebody
could see on a particular day, never improved afterwards. An edition regenerated with next year's
templates would be a different document over the same data, so the faithful archive is the one that
was published.

Regenerating instead was measured by what it would take: every template writes its links as absolute
addresses (`/es/…`) through `href()`, the footer, the header and the search helpers. Threading an
edition through all of them is a refactor of the whole presentation layer to serve pages that will
never change again.

One built edition is 509 pages and 34 MB, 3.6 MB of it the search index.

## The decision

- The current edition stays at the site's own addresses. Links already shared keep leading to what
  is current.
- A retired edition is listed in `frontend/archives.json` with the release tag that last published
  it. At publication (`npm run build:archives`, run by `publish.yml`) it is rebuilt from that tag in a
  throwaway worktree — its own code and data — and frozen under `/<edition>/`.
- Each archived page (`frontend/scripts/archive.ts`):
  - keeps the reader inside the archive: every address inside the site gains the prefix;
  - leaves search addresses unprefixed and drops the archive's search, because an index stores the
    addresses of its edition's current pages and would send readers out of the archive unannounced;
  - asks not to be indexed and names no canonical or language alternates, so search engines keep
    offering the edition a reader should act on;
  - opens with a notice in its own language saying which edition it is and linking to the same page
    in the current edition. The notice is styled by `/archive.css` of the current site, because an
    inline style breaks the page's policy ([034](034-an-inline-style-is-an-error.md)).
- The footer of the current edition lists earlier editions once there is one.

Nothing is stored built: the repository keeps a year and a tag, not 34 MB of HTML per edition.

## What it costs

- An archive has no search of its own. A reader of the 2026 archive who searches lands in the current
  edition, and the notice says so.
- A page that no longer exists in the current edition makes the notice's link lead to the 404 page.
- Each publication rebuilds every archived edition, a few minutes per edition, and needs the whole git
  history (`fetch-depth: 0`).
- Scripts inside an archived page that fetch absolute addresses at run time fetch the current site's
  files. None of the 2026 pages does so outside the search, which is left out.

## What would overturn it

- A reader need to search a past edition: then build each archive's search index from its rewritten
  pages, so its stored addresses carry the prefix.
- A comparison between editions (what changed in a country from 2026 to 2027) becoming the reason
  readers come to archives: that is a page of the current edition, built from both editions' files,
  not a property of the archive.
- Build time per edition becoming a problem: then store the frozen archive once, as a release asset,
  instead of rebuilding it at every publication.
