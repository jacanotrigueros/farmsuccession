# Identify the bytes of an edition

`checksums:edition` is offline tooling for M17. It fingerprints the JSON files of
one explicitly named edition. It does not publish an edition, select its citation,
read its public sources, or establish that any claim is true.

Use Node.js 24 and install the repository's declared dependencies with `npm ci`.
Run the ordinary gate before treating a checkout as publishable. Then, from the
repository root:

```bash
npm run --silent checksums:edition -- 2026 > /tmp/2026.sha256
```

The command writes only stdout; the redirection above is the caller's choice. The
manifest has one standard SHA-256 digest and one path per JSON file. Paths are
relative to `data/editions`, sorted and written with `/` separators. Files from
another edition and non-JSON files are excluded. Whitespace, encoding and line
endings are part of the bytes: reformatting equivalent JSON changes its checksum.
File modification times are not part of it.

A missing or empty edition fails instead of yielding an apparently successful
empty manifest. Invalid edition arguments fail too. The command does not validate
the contents or substitute a checksum for `npm run check`.

To compare a checkout with a manifest obtained independently:

```bash
(cd data/editions && sha256sum --check /path/to/published-2026.sha256)
```

On macOS the equivalent is `shasum -a 256 --check`. Generating a manifest from a
download and then checking that same download against it proves only internal
consistency, not that the download is the published object. A consumer needs the
manifest from the publication they mean to cite. The list covers the named JSON
files; it does not assert that a download contains no unrelated extra files.

## What M17 still needs

The 1.2.0 release has no attached edition asset or checksum manifest as observed on
17 October 2026. Its public source commit is
`a6ed742b0bc0460ccebb24542e5b12a4e901b283`. A full commit identifier can pin a source
object without assuming a movable tag is immutable. The corpus bytes do not change
merely because the site receives a new interface version.

The maintainer still has to settle the edition identifier, stable public location
and what accompanies the data: catalogue, schemas, prompt snapshots and rights
notice. Those choices determine the citation and download, and are not made by this
command. A published manifest would then be generated from the chosen frozen source
and retrieved alongside it. No release, upload, public download route or new review
state is created automatically. M17 is not marked complete by this tool.
