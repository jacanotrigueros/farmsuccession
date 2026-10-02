import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { getCACertificates } from "node:tls";
import { test } from "node:test";

import { acceptIntermediates, loadManifest } from "../src/sources/tls.ts";
import type { TlsIntermediates } from "../src/types/tls-intermediates.ts";

const roots = getCACertificates("default");

/** The committed manifest with one entry altered, to prove each guard is the one that catches it. */
function tampered(change: (entry: TlsIntermediates["certificates"][number]) => void): TlsIntermediates {
  const manifest: TlsIntermediates = JSON.parse(JSON.stringify(loadManifest()));
  change(manifest.certificates[0]);
  return manifest;
}

test("every committed intermediate is a real intermediate of a root the runtime trusts", () => {
  const accepted = acceptIntermediates(loadManifest(), roots);
  assert.ok(accepted.length > 0, "the manifest exists because at least one portal needs it");
  for (const intermediate of accepted) {
    assert.ok(intermediate.issuer.length > 0, `${intermediate.subject} names the root it chains to`);
    assert.ok(intermediate.servedIncompleteBy.length > 0, `${intermediate.subject} says which portal needs it`);
  }
});

test("a certificate that does not match its pinned fingerprint is refused", () => {
  const changed = tampered((entry) => {
    entry.sha256Fingerprint = entry.sha256Fingerprint.replace(/^../u, "00");
  });
  assert.throws(() => acceptIntermediates(changed, roots), /does not match its pinned fingerprint/u);
});

test("a manifest entry whose subject no longer describes its certificate is refused", () => {
  const changed = tampered((entry) => {
    entry.subject = "C=ES, O=Something Else, CN=Not This Certificate";
  });
  assert.throws(() => acceptIntermediates(changed, roots), /does not describe the pinned certificate/u);
});

test("a root is never installed, even pinned correctly and described honestly", () => {
  // Built from a root of the runtime itself, so subject and fingerprint are genuine: the only thing
  // wrong with the entry is that a root is a trust anchor, which is what this must never add.
  const root = new X509Certificate(roots[0] ?? "");
  const asRoot = tampered((entry) => {
    entry.pem = root.toString();
    entry.sha256Fingerprint = root.fingerprint256;
    entry.subject = root.subject.replaceAll("\n", ", ");
  });
  assert.throws(() => acceptIntermediates(asRoot, roots), /is self-signed: a root would add a trust anchor/u);
});

test("an expired intermediate stops the run instead of being installed", () => {
  const manifest = loadManifest();
  const longAfter = Date.parse("2100-01-01T00:00:00Z");
  assert.throws(() => acceptIntermediates(manifest, roots, longAfter), /expired on/u);
});

test("an intermediate with no trusted root behind it is refused", () => {
  assert.throws(() => acceptIntermediates(loadManifest(), []), /is not issued and signed by a root in the default store/u);
});

test("a file that is not a manifest is reported as such, not parsed as one", () => {
  assert.throws(() => loadManifest("package.json"), /is not a TLS intermediate manifest/u);
});
