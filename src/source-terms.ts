/**
 * What each source's own terms permit, and which hosts no record may cite.
 *
 * The site promises in six languages that an organisation may ask not to appear, and until now
 * nothing stood behind that promise: a source that looked restrictive was deleted, and the lead,
 * its reason and the record of having searched there went with it. The next pass would have found
 * it again and decided the same thing from nothing.
 *
 * So a reading is written down once, per use, because a notice answers one use at a time: a site may permit
 * the quoting and reserve the linking, and a record needs both. A host nobody has read is not in this file,
 * and silence here is not permission.
 *
 * Both answers are worth the same. A permission read today
 * is what stops somebody reading the same notice next year; a refusal is what stops a record
 * citing that host again. Only the refusal stops a build — `test/source-terms.test.ts` is where
 * the promise is actually kept, because a label in a file guarantees nothing on its own.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { ROOT } from "./paths.ts";
import { compileSchema } from "./schema.ts";
import type { Reading, SourceTerms } from "./types/source-terms.ts";

export const SOURCE_TERMS_PATH = path.join(ROOT, "config/source-terms.json");

/** The committed register, validated against its schema before anything reads a single entry. */
export function loadSourceTerms(registerPath = SOURCE_TERMS_PATH): SourceTerms {
  const schema = compileSchema<SourceTerms>("schema/source-terms.schema.json");
  const data: unknown = JSON.parse(readFileSync(registerPath, "utf8"));
  if (!schema.accepts(data)) {
    throw new Error(`${path.relative(ROOT, registerPath)} is not a source-terms register: ${schema.errors(data).join("; ")}`);
  }
  const seen = new Set<string>();
  for (const { host } of data.sources) {
    if (seen.has(host)) throw new Error(`${host} is read twice in config/source-terms.json; one host, one reading`);
    seen.add(host);
  }
  return data;
}

/**
 * Everywhere a published page puts an address in front of a reader.
 *
 * The first version of this walked resources only. A news item cites its own sources and is published
 * on the same pages, so thirty-three addresses answered to nothing while the commit that opened the
 * hole said they were being walked. One function now, so a caller cannot walk half of them.
 */
/** The shape this reads, named rather than asserted: every place an edition file puts an address. */
type Addressed = {
  resources?: readonly { accessUrl?: string; sources?: readonly { url?: string }[]; calls?: readonly { sourceUrl?: string }[] }[];
  news?: readonly { sources?: readonly { url?: string }[] }[];
};

export function addressesIn(snapshot: Addressed): string[] {
  const urls: string[] = [];
  const add = (value: string | undefined): void => {
    if (value !== undefined && value !== "") urls.push(value);
  };
  for (const resource of snapshot.resources ?? []) {
    add(resource.accessUrl);
    for (const source of resource.sources ?? []) add(source.url);
    for (const call of resource.calls ?? []) add(call.sourceUrl);
  }
  for (const item of snapshot.news ?? []) {
    for (const source of item.sources ?? []) add(source.url);
  }
  return urls;
}

/** A host without its www, which is how a register entry is written and how an address is compared. */
export function hostOf(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./u, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * The hosts no record may cite, as a set that answers for a subdomain too.
 *
 * A reading of `example.org` is a reading of what that organisation published about its own site,
 * so `terms.example.org` is covered by it. The reverse is not true: a permission read on one
 * subdomain says nothing about the parent, which is why only the suffix direction is walked.
 */
export function refuses(register: SourceTerms, url: string): Reading | null {
  const host = hostOf(url);
  if (host === null) return null;
  // The most specific reading wins. A subdomain somebody read for itself is not governed by what the
  // parent published, because the parent's notice was not written about it; with nothing read for the
  // subdomain, the parent's reading is the only one there is.
  const reading = register.sources
    .filter((entry) => host === entry.host || host.endsWith(`.${entry.host}`))
    .toSorted((a, b) => b.host.length - a.host.length)[0];
  if (reading === undefined) return null;
  // A record quotes the page and sends the reader to it; either one refused is a record that cannot
  // stand. Extracting a listing is read here and never blocks a record, because a record never does it.
  return reading.uses.quote === "PERMITTED" && reading.uses.link === "PERMITTED" ? null : reading;
}
