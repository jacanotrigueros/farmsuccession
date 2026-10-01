/**
 * The territorial tree every reader and validator follows, in one place: EU → country → hub →
 * region. A view is cumulative: it shows its own layer and every layer above it, and never a
 * sibling's. A hub of one region is that region, so it never carries a layer of its own.
 *
 * This is the only implementation of the tree. Anything that needs to know what a page shows asks
 * here, so a reader and a validator can never disagree about what a territory inherits.
 */
import type { BriefTerritory } from "./types/research-brief.ts";
import type { Hub, Territories } from "./types/territories.ts";

/** One layer of the tree. The same shape names the territory a research brief is about. */
export type Layer = BriefTerritory;

export const layerCountry = (layer: Layer): string | undefined => (layer.level === "EU" ? undefined : layer.country);
export const layerHub = (layer: Layer): string | undefined => (layer.level === "HUB" ? layer.hub : undefined);
export const layerRegion = (layer: Layer): string | undefined => (layer.level === "REGION" ? layer.region : undefined);

/** A stable string for comparing layers: "EU", "COUNTRY/ES", "HUB/ES/canarias", "REGION/ES/tenerife". */
export function layerKey(layer: Layer): string {
  return [layer.level, layerCountry(layer), layerHub(layer) ?? layerRegion(layer)].filter(Boolean).join("/");
}

/**
 * The hub `slug` of country `iso`, but only when it groups several regions. A hub of one region is
 * that region, so returning nothing here is what stops the site publishing two pages for it.
 */
export function documentaryHub(territories: Territories, iso: string, slug: string): Hub | undefined {
  const hub = territories.jurisdictions[iso.toUpperCase()]?.hubs.find((candidate) => candidate.slug === slug);
  return hub && hub.members.length > 1 ? hub : undefined;
}

/** The documentary hub a region belongs to, if its hub groups more than it alone. */
export function regionHub(territories: Territories, iso: string, region: string): Hub | undefined {
  const leaf = territories.jurisdictions[iso.toUpperCase()]?.regions.find((candidate) => candidate.slug === region);
  return leaf ? documentaryHub(territories, iso, leaf.parentHub) : undefined;
}

/** The layers above `layer`, widest first. A region's hub is included whether or not it has a file. */
export function ancestorLayers(layer: Layer, territories: Territories): Layer[] {
  if (layer.level === "EU") return [];
  const eu: Layer = { level: "EU" };
  if (layer.level === "COUNTRY") return [eu];
  const country: Layer = { level: "COUNTRY", country: layer.country };
  if (layer.level === "HUB") return [eu, country];
  const hub = regionHub(territories, layer.country, layer.region);
  return hub ? [eu, country, { level: "HUB", country: layer.country, hub: hub.slug }] : [eu, country];
}

/** The layers a view of `layer` shows, widest first, ending with `layer` itself. */
export const viewLayers = (layer: Layer, territories: Territories): Layer[] => [...ancestorLayers(layer, territories), layer];

/**
 * How a layer relates to the page being looked at: its own layer, one it inherits from (a wider
 * territory), or one it contains (a narrower territory of its own). Anything else — a sibling
 * region, another hub, another country — is unrelated, and never appears on that page.
 */
export function relation(owner: Layer, page: Layer, territories: Territories): "own" | "inherited" | "contained" | undefined {
  const key = layerKey(owner);
  if (key === layerKey(page)) return "own";
  if (ancestorLayers(page, territories).some((layer) => layerKey(layer) === key)) return "inherited";
  if (ancestorLayers(owner, territories).some((layer) => layerKey(layer) === layerKey(page))) return "contained";
  return undefined;
}

/**
 * The regions a layer covers: itself for a region, its members for a hub, and every region of the
 * country or of every country for the wider layers.
 */
export function leafLayers(layer: Layer, territories: Territories): Layer[] {
  if (layer.level === "REGION") return [layer];
  const countries = layer.level === "EU" ? Object.keys(territories.jurisdictions).filter((iso) => iso !== "EU") : [layer.country];
  return countries.flatMap((iso) =>
    (territories.jurisdictions[iso]?.regions ?? [])
      .filter((leaf) => layer.level !== "HUB" || leaf.parentHub === layer.hub)
      .map((leaf): Layer => ({ level: "REGION", country: iso, region: leaf.slug })),
  );
}
