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
  for (const reading of register.sources) {
    // A record quotes the page and sends the reader to it. Either one refused is a record that cannot stand.
    if (reading.uses.quote === "PERMITTED" && reading.uses.link === "PERMITTED") continue;
    if (host === reading.host || host.endsWith(`.${reading.host}`)) return reading;
  }
  return null;
}
