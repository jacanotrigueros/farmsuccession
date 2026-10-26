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

## The published 2026 object

The 2026 edition is frozen at full Git commit
`dfe9b15be6618bc5868f7163c3e38e8efa809b12`. That object contains the 101 JSON files,
their published `data/manifests/2026.sha256` manifest and all repository context. The
edition is named, cited, retrieved and independently checked as described in
[`CITATION.md`](../CITATION.md). The checksum set covers only the edition JSON; the
catalogue, schemas, research briefs and methodology accompany the repository object
as supporting material.

Corrections receive a different full commit identifier and manifest. A release or
site version does not silently rename the data edition, and neither this publication
nor the checksum creates a new review state.
