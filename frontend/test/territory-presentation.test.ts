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
// A European card may also lead to its national counterpart; that cross-reference is not one of the lists.
const links = (html: string) =>
  [...html.replace(/<p[^>]*data-counterpart[^>]*>[\s\S]*?<\/p>/gu, "").matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gu)].map((m) => m[1]!);

test("every regional and grouping page retains exactly its own and inherited resource destinations, including empty and large regions", () => {
  let checked = 0;
  for (const { layer } of snapshots) {
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
    const country = htmlAt(cc);
    const groupStart = country.indexOf(`href="${route}"`);
    assert.ok(groupStart >= 0, `${route}: country page is missing the grouping link`);
    const firstMember = Math.min(...members.map((member) => country.indexOf(`href="/${cc}/${regionSlug(layer.country)}/${member}/"`)));
    assert.ok(firstMember > groupStart, `${route}: member links must follow the grouping title`);
    for (const { id } of data.resources) {
      const position = country.indexOf(`href="${resourceUrl(id, layer.country)}"`);
      assert.ok(position > groupStart && position < firstMember, `${route}: shared record ${id} must appear above the members`);
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
  for (const iso of new Set(snapshots.flatMap(({ layer }) => (layer.level === "COUNTRY" ? [layer.country] : [])))) {
    if (iso === "EU") continue;
    const cc = iso.toLowerCase();
    const html = htmlAt(cc);
    assert.doesNotMatch(html, /id="all-records"/u, `${cc}: a second regional index duplicates territory navigation`);
    const regional = snapshots.filter(({ layer }) => (layer.level === "REGION" || layer.level === "HUB") && layer.country === iso);
    const local = regional.flatMap(({ data }) => data.resources);
    if (local.length === 0) continue;
    assert.match(html, /class="regional-resources /u, `${cc}: no in-place regional resources`);
    for (const resource of local) {
      const url = resourceUrl(resource.id, iso);
      assert.equal(links(html).filter((value) => value === url).length, 1, `${cc}: ${resource.id} must have exactly one direct index link`);
    }
  }
});

test("Spain points to its documented grants, puts loans inside the disclosure, and explains inherited island resources", () => {
  const html = htmlAt("es");
  const form = html.indexOf('role="search"');
  const shortcut = html.indexOf('href="#territories"');
  assert.ok(shortcut >= 0 && shortcut < form, "the primary action must come before the search form");
  assert.match(html, /<h2[^>]*id="territories"[^>]*>[\s\S]*?Ayudas y recursos por comunidad autónoma<\/h2>/u);
  assert.doesNotMatch(html, /aria-label="El directorio en cifras"/u);
  const aragon = html.slice(html.indexOf('href="/es/regiones/aragon/"'), html.indexOf('href="/es/regiones/cantabria/"'));
  const disclosure = aragon.indexOf("<details");
  assert.ok(disclosure > 0);
  assert.match(aragon.slice(0, disclosure), /Subvención para el establecimiento de jóvenes agricultores/u);
  assert.match(aragon.slice(disclosure), /Préstamos garantizados IFGC para jóvenes agricultores/u);
  assert.match(html, /href="\/es\/regiones\/el-hierro\/"[^>]*>[\s\S]*?Recursos de Canarias y de otros ámbitos<\/span>\s*<\/a>/u);
  assert.match(html, /href="\/es\/regiones\/formentera\/"[^>]*>[\s\S]*?Recursos de Illes Balears y de otros ámbitos<\/span>\s*<\/a>/u);
  assert.match(html, /Convocatoria 2024<\/span> · Cerrada · [^<]*<time datetime="2026-10-13"/u);
});

test("country search titles omit the suffix and use the optional description from data", () => {
  for (const { data } of snapshots) {
    if (data.schemaId !== "country-snapshot") continue;
    const html = htmlAt(data.country.toLowerCase());
    const title = words(data.metadata.language).countryMetaTitle.replace("{where}", data.officialName);
    assert.equal(/<title>([^<]+)<\/title>/u.exec(html)?.[1], title);
    assert.equal(
      decodeHTML(
        /<meta name="description" content="([^"]+)">/u.exec(
          readFileSync(path.join(DIST, data.country.toLowerCase(), "index.html"), "utf8"),
        )?.[1] ?? "",
      ),
      data.metaDescription ?? data.summary,
      `${data.country}: metadata must favour the short description when supplied`,
    );
  }
});

test("country context gives each observation its year and source after the resources", () => {
  for (const { data, layer } of snapshots) {
    if (layer.level === "EU") continue;
    const slug = layer.level === "COUNTRY" ? "" : layer.level === "HUB" ? layer.hub : layer.region;
    const route = slug ? `${layer.country.toLowerCase()}/${regionSlug(layer.country)}/${slug}` : layer.country.toLowerCase();
    const html = htmlAt(route);
    const block = /<section\b[^>]*aria-labelledby="country-context"[^>]*>([\s\S]*?)<\/section>/u.exec(html)?.[1];
    if (data.schemaId !== "country-snapshot" || !data.countryContext) {
      assert.equal(block, undefined, `${route}: only countries with observations show context`);
      continue;
    }
    const { land, economy, succession, consultedOn } = data.countryContext;
    assert.ok(block, `${route}: missing context`);
    assert.ok(html.indexOf('id="country-context"') > html.indexOf('id="inherited"'), `${route}: context precedes resources`);
    assert.deepEqual(
      [...block.matchAll(/data-year="(\d{4})"/gu)].map((match) => Number(match[1])).toSorted(),
      [land.year, economy.year, succession.year].toSorted(),
      `${route}: every figure states its year`,
    );
    // The API query is kept for audit; the reader's link opens the same table in Eurostat's data browser.
    for (const source of [land.sourceUrl, economy.sectorSourceUrl, economy.gdpSourceUrl, succession.sourceUrl]) {
      assert.ok(block.includes(source), `${route}: missing source ${source}`);
      const table = new URL(source).pathname.split("/").pop();
      assert.match(
        block,
        new RegExp(`href="https://ec\\.europa\\.eu/eurostat/databrowser/view/${table}/`, "u"),
        `${route}: no readable table for ${table}`,
      );
    }
    if (succession.europe) assert.match(block, /UE-27|EU-27/u, `${route}: the age bars have no EU-27 reference`);
    assert.ok(block.includes(`<time datetime="${consultedOn}"`));
  }
});

test("Europe's page compares every country's ages with its farms and land, and the EU-27 stays in the footer", () => {
  const html = htmlAt("eu");
  const block = /<section\b[^>]*aria-labelledby="age-comparison"[^>]*>([\s\S]*?)<\/section>/u.exec(html)?.[1];
  assert.ok(block, "/eu/: no age comparison");
  assert.equal([...block.matchAll(/<th scope="col"/gu)].length, 5, "/eu/: country, two age shares, farms and land");
  const countries = snapshots.filter(({ data }) => data.schemaId === "country-snapshot" && data.countryContext).length;
  const body = /<tbody>([\s\S]*?)<\/tbody>/u.exec(block)?.[1] ?? "";
  assert.equal([...body.matchAll(/<tr\b/gu)].length, countries, "/eu/: one sortable row per country");
  assert.match(block, /<tfoot>[\s\S]*(UE-27|EU-27)/u, "/eu/: the EU-27 reference must not be sorted with the countries");
});
