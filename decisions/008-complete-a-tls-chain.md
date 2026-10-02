# 008 — Complete a TLS chain; never disable verification

Decided 2026-10-02, milestone 03.

## The question

Some official portals send only their own certificate and leave out the
intermediate that links it to a trusted root. A browser quietly fetches the
missing one and shows the padlock; Node.js reports
`UNABLE_TO_VERIFY_LEAF_SIGNATURE` and the page goes unread.

The one-line fix is in every forum answer: set
`NODE_TLS_REJECT_UNAUTHORIZED=0`, or pass `rejectUnauthorized: false`. The page is
then read, and the project is reading pages whose identity it no longer checks.

## What the evidence said

Two hosts in the corpus serve an incomplete chain: `mediorural.xunta.gal`, which
is the Galician agriculture portal and a primary source, and
`www.regione.abruzzo.it`. Both chains are completed by a public intermediate that
the certificate authority itself publishes for download.

So the missing piece is public, fetchable and verifiable. Disabling verification
to work around a missing public certificate trades a check for convenience the
project does not need.

## The decision

The missing intermediates are committed in
[`config/tls-intermediates.json`](../config/tls-intermediates.json), each pinned
by SHA-256 fingerprint and recorded with the authority's own download address and
the hosts that need it. Before any of them is installed for the process, every
entry has to prove that it is:

- the certificate its fingerprint names;
- a CA certificate, since otherwise it could not have signed anything;
- **not self-signed**, because a self-signed certificate is a root and a root would
  add a trust anchor;
- issued **and** signed by a root already in the runtime's default store;
- unexpired, read from the certificate rather than from the manifest.

That completes a chain a server left incomplete. It cannot make an invalid
certificate pass, and verification is never switched off.

The manifest validates against its own schema like every other data file, and a
test runs the real manifest against the real trust store, so an entry that goes
stale stops a run instead of weakening it.

## What it costs

Two certificates to keep current, which expire in 2028 and 2036 and will fail
loudly rather than silently. And a reader of the repository has to be told why
there are certificates in it at all, which is what this record is for.

## What would overturn it

Both portals fixing their configuration, at which point the entries say which
hosts needed them and can be removed. The `servedIncompleteBy` field exists for
exactly that: an intermediate nobody needs any more is an intermediate to delete.
