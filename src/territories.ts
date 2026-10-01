import { readFileSync } from "node:fs";
import path from "node:path";

import { ROOT } from "./paths.ts";
import { compileSchema } from "./schema.ts";
import type { Jurisdiction, Region, Territories } from "./types/territories.ts";

export type { Hub, Jurisdiction, Region, Territories } from "./types/territories.ts";

export const TERRITORIES_PATH = path.join(ROOT, "data/territories.json");

const SCHEMA = "schema/territories.schema.json";

/**
 * Reads the catalogue and checks it completely: the JSON Schema first, then the structural rules
 * the schema cannot express. Both, because a catalogue that satisfies the schema can still be
 * incoherent, and everything downstream trusts this file.
 */
export function loadTerritories(file = TERRITORIES_PATH): Territories {
  const data: unknown = JSON.parse(readFileSync(file, "utf8"));
  const problems = validateTerritories(data);
  if (problems.length) {
    throw new Error(`${path.relative(ROOT, file)} is not a valid catalogue: ${problems.slice(0, 5).join("; ")}`);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- validateTerritories returned no problems, so the schema accepted it
  return data as Territories;
}

/** ISO codes of the countries, which is every jurisdiction except the EU layer. */
export function countryCodes(territories: Territories): string[] {
  return Object.keys(territories.jurisdictions).filter((iso) => iso !== "EU");
}

/** The catalogue entry of one jurisdiction. Throws for a code the catalogue does not know. */
export function jurisdiction(territories: Territories, iso: string): Jurisdiction {
  const found = territories.jurisdictions[iso.toUpperCase()];
  if (!found) throw new Error(`"${iso}" is not a jurisdiction in data/territories.json`);
  return found;
}

/** One region of one country. Throws when the slug names no region, a hub-only slug included. */
export function region(territories: Territories, iso: string, slug: string): Region {
  const found = jurisdiction(territories, iso).regions.find((candidate) => candidate.slug === slug);
  if (!found) throw new Error(`"${slug}" is not a region of ${iso.toUpperCase()} in data/territories.json`);
  return found;
}

/**
 * The JSON Schema, then the four structural rules it cannot express:
 *
 * - every region belongs to exactly one hub, so no territory is documented twice or orphaned;
 * - every hub member is a declared region of the same jurisdiction;
 * - a hub of one region reuses that region's slug, or the site would publish two pages for the
 *   same territory;
 * - a hub of several regions never takes a slug a region already uses.
 */
export function validateTerritories(territories: unknown): string[] {
  const schema = compileSchema<Territories>(SCHEMA);
  if (!schema.accepts(territories)) return schema.errors(territories);

  const errors: string[] = [];
  if (!territories.jurisdictions.EU) errors.push("the EU layer is required");

  for (const [iso, entry] of Object.entries(territories.jurisdictions)) {
    if (iso === "EU") {
      if (entry.hubs.length || entry.regions.length) errors.push("EU: the supranational layer has no hubs and no regions");
      continue;
    }
    if (!entry.hubs.length) errors.push(`${iso}: at least one hub is required`);
    if (!entry.regions.length) errors.push(`${iso}: at least one region is required`);
    errors.push(...jurisdictionErrors(iso, entry));
  }
  return errors;
}

function jurisdictionErrors(iso: string, entry: Jurisdiction): string[] {
  const errors: string[] = [];
  const hubSlugs = new Set<string>();
  const regionBySlug = new Map<string, Region>();
  const hubsPerRegion = new Map<string, number>();

  for (const hub of entry.hubs) {
    if (hubSlugs.has(hub.slug)) errors.push(`${iso}: duplicate hub slug "${hub.slug}"`);
    hubSlugs.add(hub.slug);
    for (const member of hub.members) hubsPerRegion.set(member, (hubsPerRegion.get(member) ?? 0) + 1);
  }

  for (const leaf of entry.regions) {
    if (regionBySlug.has(leaf.slug)) errors.push(`${iso}: duplicate region slug "${leaf.slug}"`);
    regionBySlug.set(leaf.slug, leaf);
    if (!hubSlugs.has(leaf.parentHub)) errors.push(`${iso}/${leaf.slug}: parentHub "${leaf.parentHub}" is not a hub`);
  }

  for (const hub of entry.hubs) {
    for (const member of hub.members) {
      const leaf = regionBySlug.get(member);
      if (!leaf) errors.push(`${iso}/${hub.slug}: member "${member}" is not a region of ${iso}`);
      else if (leaf.parentHub !== hub.slug) {
        errors.push(`${iso}/${hub.slug}: member "${member}" declares parentHub "${leaf.parentHub}"`);
      }
    }
    if (hub.members.length === 1 && hub.members[0] !== hub.slug) {
      errors.push(`${iso}/${hub.slug}: a one-region hub must reuse its region's slug, not "${hub.members[0]}"`);
    }
    if (hub.members.length > 1 && regionBySlug.has(hub.slug)) {
      errors.push(`${iso}/${hub.slug}: a hub of several regions must not reuse a region's slug`);
    }
  }

  for (const slug of regionBySlug.keys()) {
    const count = hubsPerRegion.get(slug) ?? 0;
    if (count !== 1) errors.push(`${iso}/${slug}: a region belongs to exactly one hub, found ${count}`);
  }
  return errors;
}
