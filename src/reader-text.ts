import type { EditionSnapshot } from "./types/edition.ts";

/**
 * Schema codes and field names written into text a reader sees ("the status stays UNKNOWN",
 * "qualifiesForEstablishmentAid is omitted"). The site shows every code as a translated label, so a
 * sentence naming the code itself leaks the data model onto the page: write the label a reader sees
 * ("Estado no confirmado") or plain words.
 */
const CODES = [
  "ACTIVE",
  "ANNOUNCED_NOT_OPERATING",
  "HISTORICAL",
  "UNKNOWN",
  "UPCOMING",
  "CLOSED",
  "NOT_PUBLISHED",
  "LAND_BANK",
  "SUCCESSION_SERVICE",
  "FINANCIAL_SUPPORT",
  "OFFICIAL_PORTAL",
  "TO_CHECK",
  "ADMITTED",
  "REJECTED",
  "DRAFT",
  "REVIEWED",
  "qualifiesForEstablishmentAid",
  "lastEvidenceDate",
  "accessUrl",
  "whatItOffers",
  "whoCanUseIt",
  "howToAccess",
  "contactPoints",
  "targetProfiles",
];
const CODE = new RegExp(`(?<![\\p{L}\\d_])(?:${CODES.join("|")})(?![\\p{L}\\d_])`, "gu");

const RESOURCE_TEXT_FIELDS = ["name", "whatItOffers", "whoCanUseIt", "howToAccess", "notes"] as const;

/** Every text of an edition file the site shows as prose, each with a label for the message. */
function readerTexts(data: EditionSnapshot): Array<[label: string, text: string]> {
  const texts: Array<[string, string | undefined]> = [];
  for (const resource of data.resources) {
    for (const field of RESOURCE_TEXT_FIELDS) texts.push([`resource "${resource.id}": ${field}`, resource[field]]);
  }
  for (const item of data.news) {
    texts.push([`news "${item.id}": headline`, item.headline]);
    texts.push([`news "${item.id}": summary`, item.summary]);
  }
  texts.push(["summary", data.summary], ["coverage note", data.coverage.note]);
  for (const limitation of data.limitations) texts.push(["limitations", limitation]);
  return texts.filter((entry): entry is [string, string] => entry[1] !== undefined);
}

export function schemaCodesInText(data: EditionSnapshot): string[] {
  const problems: string[] = [];
  for (const [label, text] of readerTexts(data)) {
    const found = [...new Set(text.match(CODE) ?? [])];
    if (found.length) problems.push(`${label} names ${found.join(", ")}; write the label readers see or plain words instead`);
  }
  return problems;
}

/** A repository path or a file name: a reader can open neither. */
const REPOSITORY_PATH = /(?<![\p{L}\d./-])(?:data|research|schema|prompts|src)\/[\w./-]*\w|[\w-]+\.json(?![\p{L}\d])/gu;
const KEBAB = /(?<![\p{L}\d_./-])[a-z\d]+(?:-[a-z\d]+)+(?![\p{L}\d_/-])/gu;

/**
 * Internal references in reader-facing text: a resource or news id, a territory slug, or a
 * repository path. Drafts really carried these — "se representa en
 * data/editions/2026/hubs/es/pais-vasco.json" — and a reader sees names and pages, never how the
 * data is filed. Name the instrument or the territory instead.
 *
 * `identifiers` holds the ids and hyphenated slugs to look for, compared exactly, so an ordinary
 * hyphenated word is never mistaken for one.
 */
export function internalReferencesInText(data: EditionSnapshot, identifiers: ReadonlySet<string>): string[] {
  const problems: string[] = [];
  for (const [label, text] of readerTexts(data)) {
    const prose = text.replaceAll(/https?:\/\/\S+/gu, " ");
    const found = new Set([
      ...(prose.match(REPOSITORY_PATH) ?? []),
      ...(prose.match(KEBAB) ?? []).filter((token) => identifiers.has(token)),
    ]);
    if (found.size) {
      problems.push(`${label} shows readers the internal reference ${[...found].join(", ")}; name the instrument or territory instead`);
    }
  }
  return problems;
}
