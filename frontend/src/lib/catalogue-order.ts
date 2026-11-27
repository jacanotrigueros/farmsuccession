/**
 * The one order the catalogue is listed in when a reader has not asked for anything yet: the European
 * layer, then country by country — the country itself, its groupings, its regions.
 *
 * The list a search page carries for readers without JavaScript is built in this order, and every record
 * page gives the search index its position in it, so the results of an empty search come out the same way.
 * Before, the empty search showed whichever language bundle loaded first, which put nineteen Austrian
 * records in German at the top of the English European search.
 */
import { countryTerritories, euTerritory, hubTerritories, regionTerritories, type Territory } from "./corpus.ts";
import { layerCountry } from "../../../src/layers.ts";

export function catalogueOrder(): Territory[] {
  const europe = euTerritory();
  const of = (iso: string, territories: Territory[]) => territories.filter(({ layer }) => layerCountry(layer) === iso);
  return [
    ...(europe ? [europe] : []),
    ...countryTerritories().flatMap((country) => {
      const iso = layerCountry(country.layer) ?? "";
      return [country, ...of(iso, hubTerritories()), ...of(iso, regionTerritories())];
    }),
  ];
}

const positions = new Map(
  catalogueOrder()
    .flatMap((territory) => territory.data.resources.map((resource) => `${territory.file}#${resource.id}`))
    .map((key, index) => [key, index]),
);

/** A record's place in that order, which the search index sorts an empty query by. */
export function catalogueOrderOf(territory: Territory, id: string): number {
  const position = positions.get(`${territory.file}#${id}`);
  if (position === undefined) throw new Error(`${territory.file}#${id} is not in the catalogue order`);
  return position;
}

/** The search bundles a scope loads, in the order its territories come: the European layer's language first. */
export function bundleLanguages(territories: readonly Territory[], languageOf: (territory: Territory) => string): string[] {
  return [...new Set(territories.filter(({ data }) => data.resources.length > 0).map(languageOf))];
}
