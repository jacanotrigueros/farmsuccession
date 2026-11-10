import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { loadSnapshots } from "../../src/editions.ts";
import { ancestorLayers, layerKey, leafLayers, snapshotLayer } from "../../src/layers.ts";
import { loadTerritories } from "../../src/territories.ts";
import { recordSlug, regionSlug, searchPath } from "../public/search-scope.js";
import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
const loaded = loadSnapshots({});
assert.equal(loaded.problems.length, 0);
const catalogue = loadTerritories();
const edition = loaded.snapshots
  .map(({ file }) => file.split("/")[0]!)
  .toSorted()
  .at(-1)!;
const snapshots = loaded.snapshots
  .filter(({ file }) => file.startsWith(`${edition}/`))
  .map(({ data }) => ({ data, layer: snapshotLayer(data) }));
const byLayer = new Map(snapshots.map((entry) => [layerKey(entry.layer), entry]));
const htmlAt = (url: string) => decodeHTML(readFileSync(path.join(DIST, url, "index.html"), "utf8"));
const resourceUrl = (id: string, country?: string) =>
  country ? `/${country.toLowerCase()}/${recordSlug(country)}/${id}/` : `/resources/${id}/`;
const allRecords = new Set(
  snapshots.flatMap(({ data }) => data.resources.map((r) => resourceUrl(r.id, "country" in data ? data.country : undefined))),
);
const links = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gu)].map((m) => m[1]!);

test("every regional and grouping page retains exactly its own and inherited resource destinations, including empty and large regions", () => {
  let checked = 0;
  for (const { data, layer } of snapshots) {
    if (layer.level !== "REGION" && layer.level !== "HUB") continue;
    const slug = layer.level === "REGION" ? layer.region : layer.hub;
    const route = `/${layer.country.toLowerCase()}/${regionSlug(layer.country)}/${slug}/`;
    const scopes = [...ancestorLayers(layer, catalogue), layer].flatMap((l) => byLayer.get(layerKey(l)) ?? []);
    const expected = scopes
      .flatMap(({ data }) => data.resources.map((r) => resourceUrl(r.id, "country" in data ? data.country : undefined)))
      .toSorted();
    const actual = links(htmlAt(route))
      .filter((url) => allRecords.has(url))
      .toSorted();
    assert.deepEqual(actual, expected, `${route}: density changes must not omit, repeat or widen resource destinations`);
    checked++;
  }
  assert.ok(checked > 100, "the check must cover the territorial corpus, not only a selected region");
});

test("documentary groupings show their children and pin every local search to all and only those children", () => {
  const hubs = snapshots.filter(({ layer }) => layer.level === "HUB");
  assert.ok(hubs.length > 0, "no grouping pages to inspect");
  for (const { data, layer } of hubs) {
    if (layer.level !== "HUB") continue;
    const cc = layer.country.toLowerCase();
    const route = `/${cc}/${regionSlug(layer.country)}/${layer.hub}/`;
    const html = htmlAt(route);
    const members = leafLayers(layer, catalogue).flatMap((leaf) => (leaf.level === "REGION" ? [leaf.region] : []));
    const expected = members.map((member) => `${layer.country}/${member}`).toSorted();
    for (const member of members) {
      assert.ok(html.includes(`href="/${cc}/${regionSlug(layer.country)}/${member}/"`), `${route}: missing child ${member}`);
    }
    const form = /<form\b[^>]*role="search"[^>]*>([\s\S]*?)<\/form>/u.exec(html)?.[1];
    assert.ok(form, `${route}: missing scoped search form`);
    const pins = [...form.matchAll(/name="territory" value="([^"]+)"/gu)].map((m) => m[1]!).toSorted();
    assert.deepEqual(pins, expected, `${route}: a grouping search must not leave its member regions`);
    for (const link of links(html).filter((url) => url.startsWith(searchPath("/", layer.country)) && url.includes("?"))) {
      assert.deepEqual(
        new URL(link, "https://farmsuccession.eu").searchParams.getAll("territory").toSorted(),
        expected,
        `${route}: ${link} loses grouping scope`,
      );
    }
    if (data.resources.length > 0) {
      assert.ok(
        htmlAt(`/${cc}/`).includes(`href="${route}#own"`),
        `${route}: common-resource count must lead to the common records, not the full regional search`,
      );
    }
    const scopes = [...ancestorLayers(layer, catalogue), layer, ...leafLayers(layer, catalogue)].flatMap(
      (l) => byLayer.get(layerKey(l)) ?? [],
    );
    const total = scopes.reduce((n, { data }) => n + data.resources.length, 0);
    const statsLabel = words(data.metadata.language).statsLabel;
    const stats = html.slice(html.indexOf(`aria-label="${statsLabel}"`));
    const displayed = /<span\b[^>]*tabular-nums[^>]*>(\d+)<\/span>/u.exec(stats)?.[1];
    assert.equal(Number(displayed), total, `${route}: headline total must match its complete search scope`);
  }
});

test("the kind filter cannot push a page wider than a 320px screen", () => {
  // German kind names made this select wider than the phone, and with it the whole page.
  const html = htmlAt("de/regionen/baden-wuerttemberg");
  assert.match(html, /<select[^>]*id="only"[^>]*max-w-full/u);
});

test("country pages expose each regional resource inside its territory rather than a duplicate section", () => {
  for (const iso of new Set(snapshots.flatMap(({ layer }) => layer.level === "COUNTRY" ? [layer.country] : []))) {
    if (iso === "EU") continue;
    const cc = iso.toLowerCase();
    const html = htmlAt(cc);
    assert.doesNotMatch(html, /id="all-records"/u, `${cc}: a second regional index duplicates territory navigation`);
    const regional = snapshots.filter(({ layer }) => layer.level === "REGION" && layer.country === iso);
    const local = regional.flatMap(({ data }) => data.resources);
    if (local.length === 0) continue;
    assert.match(html, /class="regional-resources /u, `${cc}: no in-place regional resources`);
    for (const resource of local) {
      const url = resourceUrl(resource.id, iso);
      assert.equal(
        links(html).filter((value) => value === url).length,
        1,
        `${cc}: ${resource.id} must have exactly one direct index link`,
      );
    }
  }
});
