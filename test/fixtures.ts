import type { CountrySnapshot, RegionalSnapshot, Resource, Source } from "../src/types/edition.ts";
import type { Lead, Query, ResearchBrief } from "../src/types/research-brief.ts";
import type { Territories } from "../src/types/territories.ts";

/**
 * A fictional catalogue, so the territorial rules are tested on shapes the real one does not have
 * to contain: a hub of several regions, a hub of one, and a jurisdiction whose only hub is itself.
 * Deliberately not a real country, so nobody can mistake it for data.
 */
export function fakeTerritories(): Territories {
  return {
    schemaVersion: "1.0.0",
    frozenOn: "2026-01-01",
    principle: "A fictional catalogue used only to test the territorial rules of the tree.",
    jurisdictions: {
      EU: {
        name: "European Union",
        lang: "en",
        hubLabel: "European Union",
        leafLevel: "supranational",
        leafLabel: "European Union",
        sources: [],
        rationale: "The EU is the supranational inherited layer and has no subnational territory.",
        hubs: [],
        regions: [],
      },
      XA: {
        name: "Terra Nostra",
        lang: "en",
        hubLabel: "Provinces",
        leafLevel: "province",
        leafLabel: "Documentary provinces",
        sources: [{ url: "https://example.test/territory", authority: "Fictional Ministry", purpose: "Territorial division" }],
        rationale: "A fictional division written to exercise a hub of several regions and a hub of one.",
        hubs: [
          { slug: "archipelago", name: "Archipelago", members: ["north-isle", "south-isle"] },
          { slug: "mainland", name: "Mainland", members: ["mainland"] },
        ],
        regions: [
          { slug: "north-isle", name: "North Isle", inPhrase: "on North Isle", parentHub: "archipelago", kind: "island" },
          { slug: "south-isle", name: "South Isle", inPhrase: "on South Isle", parentHub: "archipelago", kind: "island" },
          { slug: "mainland", name: "Mainland", inPhrase: "on the Mainland", parentHub: "mainland" },
        ],
      },
    },
  };
}

/** The source every fixture record cites, so a test only writes the part of it that it is about. */
export function fakeSource(overrides: Partial<Source> = {}): Source {
  return {
    url: "https://example.test/land-bank",
    title: "Land bank of North Isle",
    consultedOn: "2026-09-20",
    quotes: ["The land bank lists plots offered for rent."],
    ...overrides,
  };
}

export function fakeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "north-isle-land-bank",
    name: "Land bank of North Isle",
    kind: "LAND_BANK",
    status: "ACTIVE",
    scope: { level: "REGIONAL" },
    operator: "Fictional Ministry",
    operatorType: "PUBLIC",
    whatItOffers: "It puts people who want to let land in touch with people looking for it.",
    accessUrl: "https://example.test/land-bank",
    sources: [fakeSource()],
    ...overrides,
  };
}

/**
 * A fictional region file for North Isle of Terra Nostra, the catalogue `fakeTerritories` describes.
 * Its path is `2026/regions/xa/north-isle.json`, which is what the semantic rules compare it against.
 */
export function fakeEdition(overrides: Partial<RegionalSnapshot> = {}): RegionalSnapshot {
  return {
    schemaId: "regional-snapshot",
    schemaVersion: "1.0.0",
    country: "XA",
    region: "north-isle",
    edition: "2026",
    officialName: "North Isle",
    published: "2026-09-27",
    summary: "What North Isle documents for people taking over or starting a holding.",
    coverage: {
      status: "PARTIAL",
      note: "The official portal was searched; municipal pages were not.",
      methods: [{ method: "OFFICIAL_PORTAL", detail: "https://example.test/portal, section on land and succession" }],
    },
    review: { status: "DRAFT" },
    metadata: { language: "en", sourcePolicy: "PUBLIC_SOURCES_ONLY", generatedBy: [{ id: "person-1", tool: "PERSON" }] },
    resources: [fakeResource()],
    news: [],
    limitations: ["Municipal by-laws were not reviewed."],
    ...overrides,
  };
}

/** The path `fakeEdition` belongs at, so a test that is not about the path does not restate it. */
export const FAKE_EDITION_FILE = "2026/regions/xa/north-isle.json";

/**
 * The country file North Isle inherits from, for the rules about what a reader of a region sees. Its
 * resource is national, which is the only scope a country file may carry.
 */
export function fakeCountryEdition(overrides: Partial<CountrySnapshot> = {}): CountrySnapshot {
  const { region: _region, ...base } = fakeEdition();
  return {
    ...base,
    schemaId: "country-snapshot",
    officialName: "Terra Nostra",
    summary: "What Terra Nostra documents nationally for people taking over or starting a holding.",
    resources: [
      fakeResource({
        id: "terra-nostra-establishment-aid",
        name: "Establishment aid",
        kind: "FINANCIAL_SUPPORT",
        scope: { level: "NATIONAL" },
        instrumentType: "GRANT",
        purposes: ["FIRST_ESTABLISHMENT"],
        accessUrl: "https://example.test/establishment-aid",
        whatItOffers: "A one-off payment for people setting up a holding for the first time.",
        sources: [fakeSource({ url: "https://example.test/establishment-aid", title: "Establishment aid" })],
      }),
    ],
    ...overrides,
  };
}

export const FAKE_COUNTRY_FILE = "2026/countries/xa.json";

/** The lead that became the resource `fakeEdition` publishes, which is what ties the two fixtures. */
export function fakeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "island-land-bank",
    name: "Land bank of North Isle",
    url: "https://example.test/land-bank",
    kind: "LAND_BANK",
    status: "ADMITTED",
    resourceId: "north-isle-land-bank",
    checkedOn: "2026-09-20",
    ...overrides,
  };
}

export function fakeQuery(overrides: Partial<Query> = {}): Query {
  return { id: "land-bank", kinds: ["LAND_BANK"], query: "North Isle land bank", ...overrides };
}

/**
 * The research brief of North Isle: how the territory was searched and which lead became the resource
 * that `fakeEdition` publishes. The two fixtures are deliberately consistent, because the rule worth
 * testing is that every published resource traces back to a lead somebody admitted.
 */
export function fakeBrief(overrides: Partial<ResearchBrief> = {}): ResearchBrief {
  return {
    schemaVersion: "1.0.0",
    territory: { level: "REGION", country: "XA", region: "north-isle" },
    language: "en",
    updatedOn: "2026-09-27",
    context: ["Land and succession are regional matters on North Isle, so the island's own portal is the first place to look."],
    portals: [{ name: "Island portal", url: "https://example.test/portal", what: "Land, succession and training pages of the island." }],
    openData: [],
    queries: [fakeQuery()],
    leads: [fakeLead()],
    log: [{ date: "2026-09-27", by: "person-1", summary: "First pass over the island portal and the regional gazette." }],
    ...overrides,
  };
}

/** The path `fakeBrief` belongs at, relative to `research/`. */
export const FAKE_BRIEF_FILE = "xa/north-isle.json";

/**
 * The country brief above it, which is the only brief that may say which instruments a region usually
 * has. Its one expected instrument is what a region brief has to answer before its pass can close.
 */
export function fakeCountryBrief(overrides: Partial<ResearchBrief> = {}): ResearchBrief {
  return {
    ...fakeBrief(),
    territory: { level: "COUNTRY", country: "XA" },
    context: ["Terra Nostra legislates nationally on establishment aid and leaves land and succession to the islands."],
    queries: [fakeQuery({ id: "regional-land-bank", query: "{region} land bank" })],
    leads: [
      fakeLead({
        id: "national-establishment-aid",
        name: "Establishment aid",
        url: "https://example.test/establishment-aid",
        kind: "FINANCIAL_SUPPORT",
        resourceId: "terra-nostra-establishment-aid",
      }),
    ],
    expectedInstruments: [
      {
        id: "regional-land-bank",
        name: "A regional land bank",
        kinds: ["LAND_BANK"],
        lookFor: "Every island runs one, usually on the island's own portal under land.",
      },
    ],
    ...overrides,
  };
}

export const FAKE_COUNTRY_BRIEF_FILE = "xa/country.json";
