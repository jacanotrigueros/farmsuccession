# Cite the 2026 edition

The citable object is **Farm Succession Atlas — 2026 edition, data revision
2026-10-26**. Its 101 JSON files are frozen at the full Git commit
[`dfe9b15be6618bc5868f7163c3e38e8efa809b12`](https://github.com/jacanotrigueros/farmsuccession/tree/dfe9b15be6618bc5868f7163c3e38e8efa809b12/data/editions/2026).
The commit is the edition identifier; a site or software version is not a data
edition.

Suggested citation:

> Cano, José Antonio (2026). _Farm Succession Atlas — 2026 edition_ (data
> revision 2026-10-26). Git commit
> `dfe9b15be6618bc5868f7163c3e38e8efa809b12`.
> https://github.com/jacanotrigueros/farmsuccession/tree/dfe9b15be6618bc5868f7163c3e38e8efa809b12/data/editions/2026

## Retrieve and verify it

Download the repository object from its immutable commit address:

```bash
curl -L -o farmsuccession-2026.tar.gz \
  https://github.com/jacanotrigueros/farmsuccession/archive/dfe9b15be6618bc5868f7163c3e38e8efa809b12.tar.gz
tar -xzf farmsuccession-2026.tar.gz
cd farmsuccession-dfe9b15be6618bc5868f7163c3e38e8efa809b12/data/editions
sha256sum --check ../manifests/2026.sha256
```

On macOS, use `shasum -a 256 --check ../manifests/2026.sha256` for the last
command. The
[published manifest](https://github.com/jacanotrigueros/farmsuccession/blob/dfe9b15be6618bc5868f7163c3e38e8efa809b12/data/manifests/2026.sha256)
hashes the exact bytes of every JSON file in `data/editions/2026`, in sorted
path order. All 101 lines must report `OK`.

The repository object also contains the territorial catalogue, JSON Schemas,
research briefs and methodology that explain the edition. They support its use
but are not part of the 101-file checksum set.

## Corrections, evidence and rights

This object never changes. A later correction receives a different full commit
identifier and checksum manifest; stable record identifiers make revisions
comparable. The live site may therefore be newer than this frozen edition.

A matching checksum establishes which bytes were retrieved. It does not assert
that a programme remains available, replace the cited official source or turn
an automated check into human review. Each record states when its sources were
read and preserves the supporting quotations.

The original data, site and code are licensed under
[CC BY 4.0](LICENSE). Quoted excerpts and linked documents retain the rights of
their publishers.
