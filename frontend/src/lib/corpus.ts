/**
 * What the site reads, and the only place it reads anything.
 *
 * It calls the repository's own loaders rather than parsing `data/` again: the same functions the gate
 * uses, over the same types generated from `schema/`, so a schema change breaks this site at type-check
 * time instead of producing pages that are quietly wrong. The loaders validate as they read, which means
 * the site cannot render a file the schema rejects — a safety net, not a second gate. What is publishable
 * was decided by `npm run validate` before anything got here.
 *
 * Nothing in this module reaches the browser. It runs once, at build time.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { LoadedSnapshot } from "../../../src/editions.ts";
import type { Layer } from "../../../src/layers.ts";
import type { Call, ContactPoint, EditionSnapshot, Metric, NewsItem, Resource, Source } from "../../../src/types/edition.ts";
import type { Territories } from "../../../src/types/territories.ts";

/**
 * The repository's modules are loaded from the repository, not bundled into the site.
 *
 * They are the gate's own code and they resolve what they need — the schemas, the data — from their own
 * location, which is correct when the gate runs them and wrong the moment a bundler copies them next to
 * the output. Loading them from their real path keeps that resolution true, and `typeof import(...)` keeps
 * every type, so a schema change still breaks this site at type-check time. The types above are imported
 * statically because a type costs nothing at runtime.
 */
const fromRepository = <T>(file: string): Promise<T> =>
  import(/* @vite-ignore */ pathToFileURL(path.join(__REPOSITORY_ROOT__, file)).href) as Promise<T>;

const { loadSnapshots } = await fromRepository<typeof import("../../../src/editions.ts")>("src/editions.ts");
const { loadTerritories } = await fromRepository<typeof import("../../../src/territories.ts")>("src/territories.ts");
const { ancestorLayers, layerKey, snapshotLayer } = await fromRepository<typeof import("../../../src/layers.ts")>("src/layers.ts");

export type { Layer, Resource, EditionSnapshot, NewsItem, Source, Call, Metric, ContactPoint };

/** One territory of one edition: its file, its place in the tree, and what it publishes. */
export type Territory = { file: string; layer: Layer; data: EditionSnapshot };

/** A resource as a reader meets it, which includes where it came from: its own territory, or one above. */
export type ViewedResource = { resource: Resource; from: Territory; inherited: boolean };

const loaded = loadSnapshots({});
if (loaded.problems.length > 0) {
  const problems = loaded.problems.map(({ file, message }) => `${file} ${message}`).join("; ");
  throw new Error(`the site will not build over data the loader could not read: ${problems}`);
}

export const territories: Territories = loadTerritories();

const all: Territory[] = loaded.snapshots.map(({ file, data }: LoadedSnapshot) => ({ file, layer: snapshotLayer(data), data }));

/** The editions this repository holds, newest first, read from the paths rather than from a list. */
export const editions: string[] = [...new Set(all.map(({ file }) => file.slice(0, 4)))].toSorted().toReversed();

/** The edition the site publishes as current, which is simply the newest one there is. */
export const currentEdition: string = editions[0] ?? "";

export const territoriesOf = (edition = currentEdition): Territory[] => all.filter(({ file }) => file.startsWith(`${edition}/`));

const atLevel = (level: Layer["level"], edition = currentEdition): Territory[] =>
  territoriesOf(edition)
    .filter(({ layer }) => layer.level === level)
    .toSorted((a, b) => a.data.officialName.localeCompare(b.data.officialName));

export const euTerritory = (edition = currentEdition): Territory | undefined => atLevel("EU", edition)[0];
export const countryTerritories = (edition = currentEdition): Territory[] => atLevel("COUNTRY", edition);
export const hubTerritories = (edition = currentEdition): Territory[] => atLevel("HUB", edition);
export const regionTerritories = (edition = currentEdition): Territory[] => atLevel("REGION", edition);

export const regionsOf = (iso: string, edition = currentEdition): Territory[] =>
  regionTerritories(edition).filter(({ layer }) => layer.level === "REGION" && layer.country === iso);

/** The territory a path names, so a page can find its own data from its route. */
export function territoryAt(
  level: Layer["level"],
  of: { country?: string; slug?: string },
  edition = currentEdition,
): Territory | undefined {
  return territoriesOf(edition).find(({ layer }) => {
    if (layer.level !== level) return false;
    if (layer.level === "EU") return true;
    if (layer.level === "COUNTRY") return layer.country === of.country;
    if (layer.level === "HUB") return layer.country === of.country && layer.hub === of.slug;
    return layer.country === of.country && layer.region === of.slug;
  });
}

/**
 * Everything a reader of this territory sees, in the order they inherit: the EU layer, then the country,
 * then the grouping where one has a file of its own, then the territory itself. A lower layer adds; it
 * never hides what a higher one offers, and it never repeats it either, which is why this has to be
 * assembled rather than read from one file.
 */
export function view(territory: Territory): { layers: Territory[]; resources: ViewedResource[] } {
  const above = new Map(territoriesOf(territory.file.slice(0, 4)).map((other) => [layerKey(other.layer), other]));
  const inherited = ancestorLayers(territory.layer, territories)
    .map((layer) => above.get(layerKey(layer)))
    .filter((found): found is Territory => found !== undefined);
  const layers = [...inherited, territory];
  return {
    layers,
    resources: layers.flatMap((from) => from.data.resources.map((resource) => ({ resource, from, inherited: from !== territory }))),
  };
}

/** Where a territory lives on the site. The EU layer is the home, because it is what every reader shares. */
export function href(layer: Layer): string {
  if (layer.level === "EU") return "/";
  if (layer.level === "COUNTRY") return `/${layer.country.toLowerCase()}/`;
  if (layer.level === "HUB") return `/${layer.country.toLowerCase()}/${layer.hub}/`;
  return `/${layer.country.toLowerCase()}/${layer.region}/`;
}

/** The language a territory's text is written in, which is the language the page is in. */
export const languageOf = (territory: Territory): string => territory.data.metadata.language;

/** A review nobody has signed is the one thing a reader has to be told before anything else. */
export const isDraft = (territory: Territory): boolean => territory.data.review.status === "DRAFT";

/** A record and the territory whose file holds it, which is the one place on the site it has a page. */
export type RecordedResource = { resource: Resource; territory: Territory };

/**
 * Every record of an edition, each with the territory that documented it.
 *
 * A record is inherited by every territory below the one that holds it, and giving it a page under each of
 * them would mean the same evidence at thirty addresses, none of them the real one. It has one page, under
 * the territory that recorded it, and the territory pages that inherit it all link there.
 */
export const records = (edition = currentEdition): RecordedResource[] =>
  territoriesOf(edition).flatMap((territory) => territory.data.resources.map((resource) => ({ resource, territory })));

/**
 * Where a record lives: under its own territory, behind a segment of its own.
 *
 * The segment is what keeps the two routes apart by construction rather than by luck — a record id and a
 * region slug are both slugs, and nothing in the schema stops a national record from being called
 * `galicia`.
 */
export const recordHref = (layer: Layer, id: string): string => `${href(layer)}record/${id}/`;

/**
 * This edition's news about one record, wherever it was reported.
 *
 * An event about a national programme can perfectly well be recorded in a region's file — a regional
 * office announcing a closing date, say — so this looks across the whole edition rather than only in the
 * file the record itself lives in.
 */
export const newsAbout = (id: string, edition = currentEdition): NewsItem[] =>
  territoriesOf(edition)
    .flatMap(({ data }) => data.news)
    .filter((item) => item.resourceIds?.includes(id))
    .toSorted((a, b) => b.date.localeCompare(a.date));
