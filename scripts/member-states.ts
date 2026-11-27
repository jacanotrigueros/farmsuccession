/**
 * Writes the EU-27 comparison table into the European file: for every member state, the farm managers' age
 * groups and the utilised agricultural area from Eurostat's farm structure survey, so Europe's page can compare
 * all of them and not only the countries this directory documents.
 *
 * `node scripts/member-states.ts <edition> <year>` reads the two Eurostat datasets once each, for all 27 member
 * states, and replaces `memberStates` in `data/editions/<edition>/eu.json`. Every row keeps the exact API query
 * it came from, so anyone can fetch the same number again.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";
// Eurostat writes Greece as EL; the directory uses ISO 3166-1, where it is GR.
const MEMBER_STATES = [
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "EL",
  "ES",
  "FI",
  "FR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
];
const iso = (geo: string) => (geo === "EL" ? "GR" : geo);
const AGES = { holdings: "TOTAL", under25: "Y_LT25", from25To34: "Y25-34", from35To39: "Y35-39", atLeast65: "Y_GE65" } as const;

type JsonStat = {
  value: Record<string, number>;
  status?: Record<string, string>;
  id: string[];
  size: number[];
  dimension: Record<string, { category: { index: Record<string, number> } }>;
};

/** Eurostat's answer is external input, so its shape is checked before the numbers are read from it. */
function isJsonStat(body: unknown): body is JsonStat {
  return (
    typeof body === "object" &&
    body !== null &&
    "value" in body &&
    typeof body.value === "object" &&
    body.value !== null &&
    "id" in body &&
    Array.isArray(body.id) &&
    "size" in body &&
    Array.isArray(body.size) &&
    body.id.length === body.size.length &&
    "dimension" in body &&
    typeof body.dimension === "object" &&
    body.dimension !== null
  );
}

async function dataset(url: string): Promise<JsonStat> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Eurostat answered ${response.status} for ${url}`);
  const body: unknown = JSON.parse(await response.text());
  if (!isJsonStat(body)) throw new Error();
  return body;
}

/** The observation at the given category of each named dimension; every other dimension has one category. */
function observation(data: JsonStat, at: Record<string, string>): { value: number; status?: string } {
  let offset = 0;
  data.id.forEach((dimension, i) => {
    const index = at[dimension] === undefined ? 0 : data.dimension[dimension]!.category.index[at[dimension]];
    if (index === undefined) throw new Error(`${dimension}=${at[dimension]} is not in the Eurostat answer`);
    offset = offset * data.size[i]! + index;
  });
  const value = data.value[String(offset)];
  if (value === undefined) throw new Error(`no Eurostat observation for ${JSON.stringify(at)}`);
  return { value, status: data.status?.[String(offset)] };
}

// Eurostat marks imputed values "i", estimates "e" and provisional ones "p"; the schema records the first two as
// IMPUTED and the last as PROVISIONAL, and anything else is final.
const flagOf = (statuses: (string | undefined)[]) =>
  statuses.some((s) => s?.includes("p"))
    ? "PROVISIONAL"
    : statuses.some((s) => s?.includes("i") || s?.includes("e"))
      ? "IMPUTED"
      : undefined;

const [edition, yearText] = process.argv.slice(2);
if (!edition || !yearText) throw new Error("usage: node scripts/member-states.ts <edition> <year>");
const year = Number(yearText);
const geos = MEMBER_STATES.map((g) => `&geo=${g}`).join("");
const agesUrl = (geo: string) =>
  `${API}/ef_fsi_agesex?lang=en&time=${year}&so_eur=TOTAL&sex=T&unit=HLD${Object.values(AGES)
    .map((a) => `&age=${a}`)
    .join("")}&geo=${geo}`;
const landUrl = (geo: string) => `${API}/ef_fsi_lus?lang=en&time=${year}&so_eur=TOTAL&crops=UAA&unit=HA&geo=${geo}`;

const ages = await dataset(agesUrl(MEMBER_STATES[0]!).replace(`&geo=${MEMBER_STATES[0]}`, geos));
const land = await dataset(landUrl(MEMBER_STATES[0]!).replace(`&geo=${MEMBER_STATES[0]}`, geos));

const countries = MEMBER_STATES.map((geo) => {
  const byAge = Object.fromEntries(Object.entries(AGES).map(([key, age]) => [key, observation(ages, { geo, age })]));
  const area = observation(land, { geo });
  const ageFlag = flagOf(Object.values(byAge).map((o) => o.status));
  const landFlag = flagOf([area.status]);
  return {
    country: iso(geo),
    succession: {
      year,
      ...Object.fromEntries(Object.entries(byAge).map(([key, o]) => [key, o.value])),
      sourceUrl: agesUrl(geo),
      ...(ageFlag ? { flag: ageFlag } : {}),
    },
    land: { year, hectares: area.value, sourceUrl: landUrl(geo), ...(landFlag ? { flag: landFlag } : {}) },
  };
});

const file = join("data", "editions", edition, "eu.json");
const eu = JSON.parse(await readFile(file, "utf8"));
eu.memberStates = { consultedOn: new Date().toISOString().slice(0, 10), countries };
await writeFile(file, `${JSON.stringify(eu, null, 2)}\n`);
console.log(`${file}: ${countries.length} member states for ${year}`);
