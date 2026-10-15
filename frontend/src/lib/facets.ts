/**
 * The facets of a search, built from the records that are in scope.
 *
 * An option a scope has nothing for is never offered: a filter that can only ever return nothing is a
 * promise the page cannot keep. The counts here are the counts before anybody searches, which is what the
 * page can honestly show while the index is still loading; once it answers, they are replaced by the
 * counts of what the query actually found.
 *
 * Every value is a code from the schema and every label is a word from `vocabulary.ts`. That is what lets
 * a search be shared between languages: the link carries codes, the page carries words.
 */
import { countryFilters } from "../../public/search-scope.js";
import { countryTerritories, leafLayers, territories, type Resource, type Territory } from "./corpus.ts";
import { ICON } from "./icons.ts";
import { kindLabel, profileLabel, reachLabel, standing, stateLabel } from "./vocabulary.ts";
import { words } from "./words.ts";

export type FacetOption = { value: string; label: string; count: number; group?: string };
export type Facet = { name: string; legend: string; icon: string; options: FacetOption[] };
export type Listed = { resource: Resource; from: Territory; inherited: boolean };

/** How many of the listed records answer to each value, with the values nothing answers to left out. */
function tally<Value extends string>(
  listed: readonly Listed[],
  valuesOf: (entry: Listed) => readonly Value[],
  label: (value: Value) => string,
): FacetOption[] {
  const counts = new Map<Value, number>();
  for (const entry of listed) for (const value of valuesOf(entry)) counts.set(value, (counts.get(value) ?? 0) + 1);
  // Most answered first, and the catch-all last whatever it counts: "Other" is where a reader looks
  // when nothing above it fitted, and a list that opens with it has buried its own answers.
  const last = (value: string) => (value === "OTHER" ? 1 : 0);
  return [...counts]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .toSorted((a, b) => last(a.value) - last(b.value) || b.count - a.count || a.label.localeCompare(b.label));
}

/** Every region a record reaches, which is where a reader can ask for it by territory. */
const reachOf = (entry: Listed): string[] =>
  leafLayers(entry.from.layer, territories).flatMap((leaf) => (leaf.level === "REGION" ? [`${leaf.country}/${leaf.region}`] : []));

const countryOf = (entry: Listed): string => (entry.from.layer.level === "EU" ? "EU" : entry.from.layer.country);

export function facetsFor(listed: readonly Listed[], language: string, country?: string): Facet[] {
  const text = words(language);

  /**
   * The name of each region, from the catalogue rather than from the records: a territory that documents
   * nothing of its own still appears here, because what the layers above it record applies there too, and
   * it is exactly the one whose name no record could have supplied.
   */
  const regionNames = new Map<string, string>();
  for (const [iso, jurisdiction] of Object.entries(territories.jurisdictions)) {
    for (const region of jurisdiction.regions) regionNames.set(`${iso}/${region.slug}`, region.name);
  }

  /** The name of each country, which is what a reader chooses by — never the two letters of its code. */
  const countryNames = new Map(
    countryTerritories().flatMap((territory) =>
      territory.layer.level === "EU" ? [] : [[territory.layer.country, territory.data.officialName] as const],
    ),
  );
  const countryName = (code: string) => (code === "EU" ? text.euName : (countryNames.get(code) ?? code));

  const facets: Facet[] = [
    {
      name: "kind",
      legend: text.kindFacet,
      icon: ICON.kind,
      options: tally(
        listed,
        (e) => [e.resource.kind],
        (kind) => kindLabel(kind, language),
      ),
    },
    {
      name: "status",
      legend: text.statusFacet,
      icon: ICON.status,
      options: tally(
        listed,
        (e) => [e.resource.status],
        (status) => stateLabel(status, language),
      ),
    },
    ...(country
      ? []
      : [
          {
            name: "country",
            legend: text.countryFacet,
            icon: ICON.europe,
            options: tally(listed, (entry) => countryFilters(countryOf(entry), reachOf(entry)), countryName),
          },
        ]),
    {
      name: "scope",
      legend: text.scopeFacet,
      icon: ICON.scope,
      options: tally(
        listed,
        (e) => [e.resource.scope.level],
        (level) => reachLabel(level, language),
      ),
    },
    {
      name: "profile",
      legend: text.profileFacet,
      icon: ICON.profile,
      options: tally(
        listed,
        (e) => e.resource.targetProfiles ?? [],
        (profile) => standing(profileLabel(profile, language), language),
      ),
    },
    {
      name: "territory",
      legend: text.territoryFacet,
      icon: ICON.territory,
      options: tally(listed, reachOf, (value) => regionNames.get(value) ?? value)
        .filter(({ value }) => !country || value.startsWith(`${country}/`))
        .map((option) => ({ ...option, group: countryName(option.value.split("/")[0] ?? "") }))
        .toSorted((a, b) => (a.group ?? "").localeCompare(b.group ?? "", language) || a.label.localeCompare(b.label, language)),
    },
  ];

  return facets.filter(({ options }) => options.length > 1);
}
