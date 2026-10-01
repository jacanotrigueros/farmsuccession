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
