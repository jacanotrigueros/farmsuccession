import type { Layer } from "../../../src/layers.ts";
import type { Territories } from "../../../src/types/territories.ts";

/** Local-language place names are search aliases for records filed at that leaf. */
export function territorySearchNames(layer: Layer, catalogue: Territories): string[] {
  if (layer.level !== "REGION") return [];
  const leaf = catalogue.jurisdictions[layer.country]?.regions.find(({ slug }) => slug === layer.region);
  return Object.values(leaf?.searchNames ?? {});
}
