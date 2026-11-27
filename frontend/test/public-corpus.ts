import { loadSnapshots } from "../../src/editions.ts";
import { loadTerritories } from "../../src/territories.ts";
import { publicSnapshots } from "../src/lib/publication.ts";

const loaded = loadSnapshots({});
export const current = loaded.snapshots
  .map(({ data }) => data.edition)
  .toSorted()
  .at(-1);
export const published = publicSnapshots(loaded.snapshots.filter(({ data }) => data.edition === current));
export const publicCountryCodes = published.flatMap(({ data }) => (data.schemaId === "country-snapshot" ? [data.country] : []));
export const publicJurisdictions = Object.entries(loadTerritories().jurisdictions).filter(
  ([country]) => country === "EU" || publicCountryCodes.includes(country),
);
