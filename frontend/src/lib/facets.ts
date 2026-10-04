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
import { leafLayers, territories, type Resource, type Territory } from "./corpus.ts";
import { kindLabel, profileLabel, reachLabel, stateLabel } from "./vocabulary.ts";
import { words } from "./words.ts";

export type Facet = { name: string; legend: string; options: { value: string; label: string; count: number }[] };
export type Listed = { resource: Resource; from: Territory; inherited: boolean };

/** How many of the listed records answer to each value, with the values nothing answers to left out. */
function tally<Value extends string>(
  listed: readonly Listed[],
  valuesOf: (entry: Listed) => readonly Value[],
  label: (value: Value) => string,
): { value: string; label: string; count: number }[] {
  const counts = new Map<Value, number>();
  for (const entry of listed) for (const value of valuesOf(entry)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .toSorted((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Every region a record reaches, which is where a reader can ask for it by territory. */
const reachOf = (entry: Listed): string[] =>
  leafLayers(entry.from.layer, territories).flatMap((leaf) => (leaf.level === "REGION" ? [`${leaf.country}/${leaf.region}`] : []));

const countryOf = (entry: Listed): string => (entry.from.layer.level === "EU" ? "EU" : entry.from.layer.country);

export function facetsFor(listed: readonly Listed[], language: string, country?: string): Facet[] {
  const text = words(language);

  /** The name of each region, from the catalogue, so a facet never shows a slug. */
  const regionNames = new Map<string, string>();
  for (const entry of listed) {
    if (entry.from.layer.level === "REGION")
      regionNames.set(`${entry.from.layer.country}/${entry.from.layer.region}`, entry.from.data.officialName);
  }

  const facets: Facet[] = [
    {
      name: "kind",
      legend: text.kindFacet,
      options: tally(
        listed,
        (e) => [e.resource.kind],
        (kind) => kindLabel(kind, language),
      ),
    },
    {
      name: "status",
      legend: text.statusFacet,
      options: tally(
        listed,
        (e) => [e.resource.status],
        (status) => stateLabel(status, language),
      ),
    },
    {
      name: "scope",
      legend: text.scopeFacet,
      options: tally(
        listed,
        (e) => [e.resource.scope.level],
        (level) => reachLabel(level, language),
      ),
    },
    {
      name: "profile",
      legend: text.profileFacet,
      options: tally(
        listed,
        (e) => e.resource.targetProfiles ?? [],
        (profile) => profileLabel(profile, language),
      ),
    },
  ];

  if (country) {
    facets.push({
      name: "territory",
      legend: text.territoryFacet,
      options: tally(listed, reachOf, (value) => regionNames.get(value) ?? value.split("/")[1] ?? value).filter(({ value }) =>
        value.startsWith(`${country}/`),
      ),
    });
  } else {
    facets.push({
      name: "country",
      legend: text.countryFacet,
      options: tally(
        listed,
        (entry) => [countryOf(entry)],
        (code) => (code === "EU" ? text.europe : code),
      ),
    });
  }

  return facets.filter(({ options }) => options.length > 1);
}
