import path from "node:path";

import { errorMessage } from "./errors.ts";
import { listJsonFiles, readJson } from "./json-files.ts";
import type { Layer } from "./layers.ts";
import { ROOT } from "./paths.ts";
import { compileDefinition } from "./schema.ts";
import type { EditionSnapshot } from "./types/edition.ts";

export type {
  Call,
  ContactPoint,
  CountrySnapshot,
  EditionSnapshot,
  EuSnapshot,
  HubSnapshot,
  Metric,
  NewsItem,
  RegionalSnapshot,
  Resource,
  Source,
} from "./types/edition.ts";

export const EDITIONS_DIR = path.join(ROOT, "data/editions");

export type SchemaId = EditionSnapshot["schemaId"];
export type LoadedSnapshot = { file: string; data: EditionSnapshot };
export type LoadProblem = { file: string; message: string };

/** What a file's location says it must contain. */
export type ExpectedIdentity = { edition: string; schemaId: SchemaId; country?: string; hub?: string; region?: string };

/** The `$defs` entry of the edition schema that describes each kind of snapshot. */
const DEFINITION_BY_SCHEMA_ID: Record<SchemaId, string> = {
  "eu-snapshot": "euSnapshot",
  "country-snapshot": "countrySnapshot",
  "hub-snapshot": "hubSnapshot",
  "regional-snapshot": "regionalSnapshot",
};

/** The edition a file belongs to, which its path says and nothing else decides. */
export const editionOf = (relativePath: string): string => relativePath.slice(0, 4);

/**
 * The identity a snapshot must carry, read from its path relative to `data/editions`:
 * `<year>/eu.json`, `<year>/countries/<iso>.json`, `<year>/hubs/<iso>/<hub>.json` or
 * `<year>/regions/<iso>/<region>.json`. Anything else is not an edition file, and saying so is how
 * a stray file is reported rather than silently ignored.
 */
export function identityFromPath(relativePath: string): ExpectedIdentity | null {
  const [edition, ...rest] = relativePath.split(/[\\/]/);
  if (!edition || !/^[0-9]{4}$/.test(edition)) return null;
  const [first, second, third] = rest;
  if (rest.length === 1 && first === "eu.json") return { edition, schemaId: "eu-snapshot" };
  if (rest.length === 2 && first === "countries" && second && /^[a-z]{2}\.json$/.test(second)) {
    return { edition, schemaId: "country-snapshot", country: second.slice(0, 2).toUpperCase() };
  }
  if (rest.length === 3 && first === "hubs" && second && /^[a-z]{2}$/.test(second) && third?.endsWith(".json")) {
    return { edition, schemaId: "hub-snapshot", country: second.toUpperCase(), hub: third.slice(0, -".json".length) };
  }
  if (rest.length === 3 && first === "regions" && second && /^[a-z]{2}$/.test(second) && third?.endsWith(".json")) {
    return { edition, schemaId: "regional-snapshot", country: second.toUpperCase(), region: third.slice(0, -".json".length) };
  }
  return null;
}

/**
 * Where the edition file of one layer belongs within its year: the inverse of `identityFromPath`, for a
 * command that is given a territory and has to find its file.
 */
export function editionPathFor(layer: Layer): string {
  if (layer.level === "EU") return "eu.json";
  const iso = layer.country.toLowerCase();
  if (layer.level === "COUNTRY") return `countries/${iso}.json`;
  if (layer.level === "HUB") return `hubs/${iso}/${layer.hub}.json`;
  return `regions/${iso}/${layer.region}.json`;
}

/** Every JSON file under `data/editions`, or under one edition, as sorted relative paths. */
export function listEditionFiles(editionsDir = EDITIONS_DIR, edition?: string): string[] {
  return listJsonFiles(editionsDir, edition);
}

export function readSnapshot(relativePath: string, editionsDir = EDITIONS_DIR): unknown {
  return readJson(editionsDir, relativePath);
}

/**
 * Loads the edition files that parse and pass the schema. Every other file comes back as a problem
 * with its reason, never silently skipped: a file nobody can read is the one most likely to hide a
 * mistake.
 *
 * Each file is checked against the snapshot kind its own location implies, so the errors describe
 * that shape instead of listing what is wrong with all four kinds at once. A file in a place the
 * layout does not define is itself the error.
 */
export function loadSnapshots(options: { editionsDir?: string; edition?: string; filter?: string } = {}): {
  snapshots: LoadedSnapshot[];
  problems: LoadProblem[];
} {
  const editionsDir = options.editionsDir ?? EDITIONS_DIR;
  const snapshots: LoadedSnapshot[] = [];
  const problems: LoadProblem[] = [];
  const files = listEditionFiles(editionsDir, options.edition).filter((name) => !options.filter || name.includes(options.filter));

  for (const file of files) {
    const expected = identityFromPath(file);
    if (!expected) {
      problems.push({ file, message: "is not in a place the edition layout defines, so nothing can be expected of it" });
      continue;
    }
    let data: unknown;
    try {
      data = readSnapshot(file, editionsDir);
    } catch (error) {
      problems.push({ file, message: errorMessage(error) });
      continue;
    }
    const schema = compileDefinition<EditionSnapshot>("schema/edition.schema.json", DEFINITION_BY_SCHEMA_ID[expected.schemaId]);
    if (schema.accepts(data)) snapshots.push({ file, data });
    else problems.push(...schema.errors(data).map((message) => ({ file, message })));
  }
  return { snapshots, problems };
}

/** The country of a snapshot, or undefined for the EU layer. */
export function snapshotCountry(snapshot: EditionSnapshot): string | undefined {
  return snapshot.schemaId === "eu-snapshot" ? undefined : snapshot.country;
}

/** The region slug of a regional snapshot, or undefined for every wider layer. */
export function snapshotRegion(snapshot: EditionSnapshot): string | undefined {
  return snapshot.schemaId === "regional-snapshot" ? snapshot.region : undefined;
}

/** The hub slug of a hub snapshot, or undefined for every other layer. */
export function snapshotHub(snapshot: EditionSnapshot): string | undefined {
  return snapshot.schemaId === "hub-snapshot" ? snapshot.hub : undefined;
}

/**
 * The scope levels a resource may declare in each kind of file. A resource wider than its file
 * belongs in the wider file, where every territory below inherits it once instead of each repeating
 * it; a resource narrower than its file needs the narrower file, or readers of a sibling territory
 * would be shown something that does not apply to them.
 */
export const SCOPE_LEVELS_BY_SNAPSHOT: Record<SchemaId, readonly string[]> = {
  "eu-snapshot": ["EU"],
  "country-snapshot": ["NATIONAL"],
  "hub-snapshot": ["REGIONAL"],
  "regional-snapshot": ["REGIONAL", "SUBREGIONAL", "LOCAL"],
};
