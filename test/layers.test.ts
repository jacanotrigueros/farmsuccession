import assert from "node:assert/strict";
import { test } from "node:test";

import { ancestorLayers, documentaryHub, type Layer, layerKey, leafLayers, regionHub, relation, viewLayers } from "../src/layers.ts";
import { loadTerritories } from "../src/territories.ts";
import { fakeTerritories } from "./fixtures.ts";

const keys = (layers: Layer[]): string[] => layers.map(layerKey);

test("a layer key names the territory and nothing else", () => {
  assert.equal(layerKey({ level: "EU" }), "EU");
  assert.equal(layerKey({ level: "COUNTRY", country: "XA" }), "COUNTRY/XA");
  assert.equal(layerKey({ level: "HUB", country: "XA", hub: "archipelago" }), "HUB/XA/archipelago");
  assert.equal(layerKey({ level: "REGION", country: "XA", region: "north-isle" }), "REGION/XA/north-isle");
});

test("a region of a hub of several regions inherits that hub", () => {
  const territories = fakeTerritories();
  const layer: Layer = { level: "REGION", country: "XA", region: "north-isle" };
  assert.deepEqual(keys(ancestorLayers(layer, territories)), ["EU", "COUNTRY/XA", "HUB/XA/archipelago"]);
  assert.deepEqual(keys(viewLayers(layer, territories)), ["EU", "COUNTRY/XA", "HUB/XA/archipelago", "REGION/XA/north-isle"]);
});

test("a region whose hub is itself inherits no hub layer", () => {
  const territories = fakeTerritories();
  const layer: Layer = { level: "REGION", country: "XA", region: "mainland" };
  assert.deepEqual(
    keys(ancestorLayers(layer, territories)),
    ["EU", "COUNTRY/XA"],
    "a hub of one region is that region, so inheriting it would show the same page twice",
  );
  assert.equal(regionHub(territories, "XA", "mainland"), undefined);
  assert.equal(documentaryHub(territories, "XA", "mainland"), undefined);
});

test("only a hub of several regions can carry records", () => {
  const territories = fakeTerritories();
  assert.equal(documentaryHub(territories, "XA", "archipelago")?.slug, "archipelago");
  assert.equal(documentaryHub(territories, "XA", "mainland"), undefined, "a hub of one region carries nothing of its own");
  assert.equal(documentaryHub(territories, "XA", "nowhere"), undefined, "an unknown slug is not a hub");
});

test("the wider layers inherit nothing from below", () => {
  const territories = fakeTerritories();
  assert.deepEqual(keys(ancestorLayers({ level: "EU" }, territories)), []);
  assert.deepEqual(keys(ancestorLayers({ level: "COUNTRY", country: "XA" }, territories)), ["EU"]);
  assert.deepEqual(keys(ancestorLayers({ level: "HUB", country: "XA", hub: "archipelago" }, territories)), ["EU", "COUNTRY/XA"]);
});

test("a sibling region is never related, however close it looks", () => {
  const territories = fakeTerritories();
  const north: Layer = { level: "REGION", country: "XA", region: "north-isle" };
  const south: Layer = { level: "REGION", country: "XA", region: "south-isle" };
  const hub: Layer = { level: "HUB", country: "XA", hub: "archipelago" };

  assert.equal(relation(north, north, territories), "own");
  assert.equal(relation(hub, north, territories), "inherited", "the hub is above the region");
  assert.equal(relation(north, hub, territories), "contained", "the region is inside the hub");
  assert.equal(relation(south, north, territories), undefined, "two islands of one hub share a parent but never each other's records");
});

test("the leaves a layer covers", () => {
  const territories = fakeTerritories();
  assert.deepEqual(keys(leafLayers({ level: "REGION", country: "XA", region: "mainland" }, territories)), ["REGION/XA/mainland"]);
  assert.deepEqual(keys(leafLayers({ level: "HUB", country: "XA", hub: "archipelago" }, territories)), [
    "REGION/XA/north-isle",
    "REGION/XA/south-isle",
  ]);
  assert.deepEqual(keys(leafLayers({ level: "COUNTRY", country: "XA" }, territories)).toSorted(), [
    "REGION/XA/mainland",
    "REGION/XA/north-isle",
    "REGION/XA/south-isle",
  ]);
  assert.deepEqual(
    keys(leafLayers({ level: "EU" }, territories)).toSorted(),
    ["REGION/XA/mainland", "REGION/XA/north-isle", "REGION/XA/south-isle"],
    "the EU layer covers every region of every country, and the EU itself is not one of them",
  );
});

test("the real catalogue behaves the same, including its hubs of several regions", () => {
  const territories = loadTerritories();
  for (const hub of ["canarias", "illes-balears", "pais-vasco"]) {
    assert.ok(documentaryHub(territories, "ES", hub), `${hub} groups several regions, so it may carry records`);
  }
  assert.deepEqual(keys(ancestorLayers({ level: "REGION", country: "ES", region: "tenerife" }, territories)), [
    "EU",
    "COUNTRY/ES",
    "HUB/ES/canarias",
  ]);
  assert.deepEqual(
    keys(ancestorLayers({ level: "REGION", country: "ES", region: "galicia" }, territories)),
    ["EU", "COUNTRY/ES"],
    "Galicia is its own hub, so it inherits only the country and the EU",
  );
});
