/**
 * Completing a TLS chain a portal left incomplete, without weakening what a failure means.
 *
 * Some official portals send only their leaf certificate: valid, but missing the intermediate that
 * links it to a trusted root. A browser quietly fetches that intermediate; Node.js reports
 * UNABLE_TO_VERIFY_LEAF_SIGNATURE and the page goes unread. Turning verification off would hide
 * exactly the failures the source check exists to surface, so the missing public intermediates are
 * committed instead, pinned by fingerprint, and each is installed only after it is shown to be a real
 * intermediate issued and signed by a root the runtime already trusts.
 *
 * That completes a chain. It never adds a trust anchor, and nothing here can make an invalid
 * certificate pass.
 */
import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as tls from "node:tls";

import { ROOT } from "../paths.ts";
import { compileSchema } from "../schema.ts";
import type { Intermediate, TlsIntermediates } from "../types/tls-intermediates.ts";

export const MANIFEST_PATH = path.join(ROOT, "config/tls-intermediates.json");

export type AcceptedIntermediate = { subject: string; issuer: string; servedIncompleteBy: string[]; pem: string };

/** X509Certificate writes a distinguished name one attribute per line; the manifest writes it on one. */
const oneLine = (name: string): string => name.replaceAll("\n", ", ");

/**
 * Every certificate of the manifest, checked. Throws naming the first entry that fails, because a
 * manifest that has drifted from what it claims is a reason to stop, not to carry on with the rest.
 *
 * What each check is for: the fingerprint is what makes this a pin rather than a bundled file; a
 * certificate that is not a CA could not sign anything; a self-signed one would be a root, which is
 * the one thing this must never install; and an entry whose subject no longer describes its
 * certificate means the file was edited without being understood.
 */
export function acceptIntermediates(manifest: TlsIntermediates, trustedRoots: readonly string[], now = Date.now()): AcceptedIntermediate[] {
  const roots = trustedRoots.map((pem) => new X509Certificate(pem));
  return manifest.certificates.map((entry: Intermediate) => {
    const certificate = new X509Certificate(entry.pem);
    if (certificate.fingerprint256 !== entry.sha256Fingerprint) {
      throw new Error(`intermediate "${entry.subject}" does not match its pinned fingerprint`);
    }
    if (!certificate.ca) throw new Error(`"${entry.subject}" is not a CA certificate`);
    if (certificate.checkIssued(certificate)) throw new Error(`"${entry.subject}" is self-signed: a root would add a trust anchor`);
    const issuer = roots.find((root) => certificate.checkIssued(root) && certificate.verify(root.publicKey));
    if (!issuer) throw new Error(`"${entry.subject}" is not issued and signed by a root in the default store`);
    if (entry.subject !== oneLine(certificate.subject)) {
      throw new Error(`intermediate "${entry.subject}" does not describe the pinned certificate`);
    }
    if (Date.parse(certificate.validTo) <= now) throw new Error(`intermediate "${entry.subject}" expired on ${certificate.validTo}`);
    return {
      subject: oneLine(certificate.subject),
      issuer: oneLine(issuer.subject),
      servedIncompleteBy: entry.servedIncompleteBy,
      pem: entry.pem,
    };
  });
}

/** The committed manifest, validated against its schema before a single certificate is parsed. */
export function loadManifest(manifestPath = MANIFEST_PATH): TlsIntermediates {
  const schema = compileSchema<TlsIntermediates>("schema/tls-intermediates.schema.json");
  const data: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!schema.accepts(data)) {
    throw new Error(`${path.relative(ROOT, manifestPath)} is not a TLS intermediate manifest: ${schema.errors(data).join("; ")}`);
  }
  return data;
}

/** Adds the committed, verified intermediates to the default store for this process only. */
export function installIntermediates(manifestPath = MANIFEST_PATH): AcceptedIntermediate[] {
  const defaults = tls.getCACertificates("default");
  const accepted = acceptIntermediates(loadManifest(manifestPath), defaults);
  tls.setDefaultCACertificates([...defaults, ...accepted.map((intermediate) => intermediate.pem)]);
  return accepted;
}
