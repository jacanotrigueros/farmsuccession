# M17 — Bytes can be measured; publication still needs a named object

17 October 2026. The public v1.2.0 GitHub release was read through the repository's
API: it has no attached edition asset, and it is not marked immutable. The published
master is a6ed742b0bc0460ccebb24542e5b12a4e901b283. Its 2026 data is the same corpus as
current develop; interface releases must not silently identify different data editions.

A separate tooling patch supplies exact per-file SHA-256 manifests without a dependency,
a network request or a data write. It is preparation, not a completed publication. It
hashes bytes rather than parsed/reformatted JSON; all 101 current file digests were
checked by the independent sha256sum tool. A checksum identifies content, not truth,
completeness of research or a human review.

Options:

1. Cite a full repository commit with a one-page retrieval/checksum guide. The existing
   hosting suffices and the bytes have a stable object identifier. Cost: researchers
   must distinguish the data edition from its site's software version; a repository
   archive includes material that is not the dataset itself.
2. Publish a dedicated first-party edition bundle and manifest. Easier for outsiders;
   the maintainer must decide what travels with it (catalogue, schemas, prompt snapshots,
   rights notice), its stable path and how corrections create a new identified object.
   No runtime service or automatic release is necessary.
3. Use an external archival identifier. Useful for citation longevity, but adds a service
   and publishing/account workflow. It is not required to verify bytes now and was not
   started under this brief.

Recommend option 1 as the first publication, with the payload pinned to a full commit
and the edition/software-version distinction explicit. Use a manifest obtained from that
publication, not one generated from the same download being “verified”. Verification
against a self-generated list proves internal consistency only. A tag can move; the
citation must name the frozen object and its correction policy. Preserve attribution
and the limits on rights in quoted material; a dataset checksum grants no new rights.

What would overturn it: actual citers who cannot retrieve/use the repository object,
or a maintainer-approved stable bundle/archival publication policy. No download page,
release asset, edition identifier or citation wording was invented on the maintainer's
behalf. M17 remains partially blocked rather than marked done by the checksum command.
