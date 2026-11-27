import type { LoadedSnapshot } from "../../../src/editions.ts";

/**
 * A country's empty research scaffolding is validated with the corpus, but it
 * does not offer a public directory until an edition contains a resource of its own.
 * Resources documented at any layer of the country count.
 */
export function publicSnapshots(snapshots: readonly LoadedSnapshot[]): LoadedSnapshot[] {
  const countryPages = new Set<string>();
  const countriesWithResources = new Set<string>();
  const key = (data: LoadedSnapshot["data"] & { country: string }) => `${data.edition}/${data.country}`;

  for (const { data } of snapshots) {
    if (data.schemaId === "eu-snapshot") continue;
    if (data.schemaId === "country-snapshot") countryPages.add(key(data));
    if (data.resources.length > 0) countriesWithResources.add(key(data));
  }

  return snapshots.filter(({ data }) => {
    if (data.schemaId === "eu-snapshot") return true;
    const country = key(data);
    return countryPages.has(country) && countriesWithResources.has(country);
  });
}
