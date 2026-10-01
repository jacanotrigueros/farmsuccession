import assert from "node:assert/strict";
import { test } from "node:test";

import { countryCodes, jurisdiction, loadTerritories, region, validateTerritories } from "../src/territories.ts";
import type { Territories } from "../src/types/territories.ts";
import { fakeTerritories } from "./fixtures.ts";

/** Applies one deliberate break to a valid catalogue, so each test states exactly what it broke. */
function broken(change: (catalogue: Territories) => void): Territories {
  const catalogue = fakeTerritories();
  change(catalogue);
  return catalogue;
}

const complains = (catalogue: Territories, match: RegExp): void => {
  const problems = validateTerritories(catalogue);
  assert.ok(
    problems.some((problem) => match.test(problem)),
    `expected a problem matching ${String(match)}, got: ${problems.join("; ") || "none"}`,
  );
};

test("the shipped catalogue is valid", () => {
  assert.deepEqual(validateTerritories(fakeTerritories()), []);
  assert.deepEqual(validateTerritories(JSON.parse(JSON.stringify(loadTerritories()))), []);
});

test("a region must belong to exactly one hub", () => {
  complains(
    broken((c) => {
      c.jurisdictions.XA?.hubs[1]?.members.push("north-isle");
    }),
    /north-isle: a region belongs to exactly one hub, found 2/,
  );
  complains(
    broken((c) => {
      c.jurisdictions.XA?.regions.push({
        slug: "orphan",
        name: "Orphan",
        inPhrase: "on Orphan",
        parentHub: "archipelago",
      });
    }),
    /orphan: a region belongs to exactly one hub, found 0/,
  );
});

test("a one-region hub must reuse its region's slug, or the territory gets two pages", () => {
  complains(
    broken((c) => {
      const hub = c.jurisdictions.XA?.hubs[1];
      if (hub) hub.slug = "the-mainland";
      const leaf = c.jurisdictions.XA?.regions[2];
      if (leaf) leaf.parentHub = "the-mainland";
    }),
    /a one-region hub must reuse its region's slug/,
  );
});

test("a hub of several regions must not take a region's slug", () => {
  complains(
    broken((c) => {
      const hub = c.jurisdictions.XA?.hubs[0];
      if (hub) hub.slug = "mainland";
    }),
    /must not reuse a region's slug|is not a hub/,
  );
});

test("a hub member must be a region of the same jurisdiction", () => {
  complains(
    broken((c) => {
      c.jurisdictions.XA?.hubs[0]?.members.push("somewhere-else");
    }),
    /member "somewhere-else" is not a region of XA/,
  );
});

test("a region's parentHub must exist", () => {
  complains(
    broken((c) => {
      const leaf = c.jurisdictions.XA?.regions[0];
      if (leaf) leaf.parentHub = "nowhere";
    }),
    /parentHub "nowhere" is not a hub/,
  );
});

test("the EU layer is required and carries no territory of its own", () => {
  complains(
    broken((c) => {
      delete c.jurisdictions.EU;
    }),
    /the EU layer is required/,
  );
  complains(
    broken((c) => {
      c.jurisdictions.EU?.hubs.push({ slug: "eu-hub", name: "EU hub", members: ["eu-hub"] });
    }),
    /EU: the supranational layer has no hubs and no regions/,
  );
});

test("loading a broken catalogue fails loudly instead of returning it", () => {
  assert.throws(
    () => loadTerritories("test/fixtures.ts"),
    /not a valid catalogue|Unexpected|JSON/,
    "a file that is not a catalogue must never load as one",
  );
});

test("the real catalogue carries the EU layer and Spain", () => {
  const territories = loadTerritories();
  assert.deepEqual(countryCodes(territories), ["ES"], "this milestone proves the model on one country before widening it");
  assert.equal(jurisdiction(territories, "es").lang, "es", "a lowercase code resolves the same jurisdiction");
  assert.equal(region(territories, "ES", "tenerife").parentHub, "canarias");
  assert.throws(() => jurisdiction(territories, "ZZ"), /not a jurisdiction/);
  assert.throws(() => region(territories, "ES", "canarias"), /not a region of ES/, "a hub slug is not a region");
});
