import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { loadSnapshots } from "../../src/editions.ts";
import { ancestorLayers, layerKey, leafLayers, snapshotLayer } from "../../src/layers.ts";
import { loadTerritories } from "../../src/territories.ts";
import { recordSlug, regionSlug, searchPath } from "../public/search-scope.js";
import { isFirstEstablishmentAid } from "../src/lib/goals.ts";
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

test("inherited-only pages put applicable resources before discovery controls and omit the empty local list", () => {
  let checked = 0;
  for (const { data, layer } of snapshots) {
    if ((layer.level !== "REGION" && layer.level !== "HUB") || data.resources.length > 0) continue;
    const slug = layer.level === "REGION" ? layer.region : layer.hub;
    const route = `/${layer.country.toLowerCase()}/${regionSlug(layer.country)}/${slug}/`;
    const html = htmlAt(route);
    const nearestFirst = ancestorLayers(layer, catalogue)
      .toReversed()
      .flatMap((above) => byLayer.get(layerKey(above)) ?? [])
      .filter(({ data }) => data.resources.length > 0);
    assert.doesNotMatch(
      html,
      /id="own"|href="#own"|id="only"|data-filter\b|aria-label="[^"]*"[^>]*data-figure/u,
      `${route}: an empty local list must not offer its jump, count or filter`,
    );
    const language = data.metadata.language;
    const search = html.indexOf('role="search"');
    const firstSection = html.indexOf('aria-labelledby="inherited"');
    const nearby = html.slice(search, firstSection >= 0 ? firstSection : html.indexOf('id="needs"'));
    assert.ok(search >= 0, `${route}: the shortcut belongs with the territorial search`);
    const shortcut = /<a href="#needs" class="([^"]+)"[^>]*>\s*([^<]+)\s*<\/a>/u.exec(nearby);
    assert.ok(
      shortcut?.[1]?.includes("min-h-(--spacing-target)") && shortcut[2]?.trim() === words(language).navNeeds,
      `${route}: readers need a visible, tappable shortcut to the topics beside the territorial search, before the long inherited list`,
    );
    assert.ok(html.includes('id="needs"'), `${route}: the shortcut must lead to the topic block`);
    assert.ok(
      !html.includes(`aria-label="${words(language).statsLabel}"`),
      `${route}: an inherited-only page needs no zero local statistic`,
    );
    if (nearestFirst.length > 0) {
      const inherited = html.indexOf('id="inherited"');
      assert.ok(inherited >= 0 && inherited < html.indexOf('id="needs"'), `${route}: the usable records precede topic shortcuts`);
      const layerNames = [...html.matchAll(/<h3\b[^>]*data-layer[^>]*>\s*([^<]+)/gu)].map(([, name]) => name!.trim());
      assert.deepEqual(
        layerNames,
        nearestFirst.map(({ layer, data }) => (layer.level === "EU" ? words(language).euName : data.officialName)),
        `${route}: the closest contributing layer must be open first`,
      );
      assert.equal(
        [...html.matchAll(/<details\b[^>]*data-record-group[^>]*\bopen(?:\s|>)/gu)].length,
        nearestFirst.length,
        `${route}: readers should not have to disclose groups to see what applies`,
      );
    }
    checked++;
  }
  assert.ok(checked > 0, "the regression needs at least one inherited-only territory");
});

test("Europe-wide discovery and the EU layer have distinct entry points", () => {
  const home = htmlAt("/");
  const header = home.slice(0, home.indexOf("</header>"));
  assert.match(
    header,
    /<a\b[^>]*href="\/eu\/"[^>]*>[\s\S]*?European Union\s*<\/span>/u,
    "the selector must identify the EU layer by its institutional name",
  );
  assert.match(
    home,
    /<a\b(?=[^>]*href="\/eu\/#own")(?=[^>]*min-h-\(--spacing-target\))[^>]*>\s*See all European Union resources\s*<\/a>/u,
    "the home page needs a visible, tappable shortcut to the EU layer's documented resources",
  );
  assert.match(htmlAt("eu"), /id="own"/u, "the shortcut must reach the EU resource list");
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

test("territory names lead to the territory and only separate disclosures open more resources", () => {
  for (const { data, layer } of snapshots) {
    if (layer.level !== "REGION") continue;
    const language = data.metadata.language;
    const country = htmlAt(layer.country.toLowerCase());
    const route = `/${layer.country.toLowerCase()}/${regionSlug(layer.country)}/${layer.region}/`;
    const start = country.indexOf(`href="${route}"`);
    assert.ok(start >= 0, `${route}: every card needs the same primary destination`);
    const anchor = country.slice(start, country.indexOf("</a>", start));
    assert.match(anchor, /class="territory-link(?: grow)?"/u, `${route}: the link must use the shared full-width territory target`);
    assert.ok(anchor.includes(data.officialName), `${route}: the primary link names the territory`);
    assert.doesNotMatch(anchor, /<summary\b/u, `${route}: the resource disclosure must be a separate keyboard target`);
    if (data.resources.length === 0) {
      assert.match(anchor, /territory-coverage/u, `${route}: the inherited coverage label must meet the functional text size`);
      assert.ok(
        anchor.includes(words(language).inheritedResources) ||
          words(language)
            .inheritedFromGroup.split("{where}")
            .every((part) => anchor.includes(part)),
        `${route}: the inherited coverage note must describe its scope`,
      );
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

test("country search metadata uses the optional title and description from data", () => {
  for (const { data } of snapshots) {
    if (data.schemaId !== "country-snapshot") continue;
    const html = htmlAt(data.country.toLowerCase());
    const title = data.metaTitle ?? words(data.metadata.language).countryMetaTitle.replace("{where}", data.officialName);
    assert.equal(/<title>([^<]+)<\/title>/u.exec(html)?.[1], title);
    assert.ok(title.includes(data.officialName), `${data.country}: a search title must name the country it is about`);
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

test("Austria, whose first-establishment aid is national, points to it before the search", () => {
  const html = htmlAt("at");
  const shortcut = html.indexOf('href="#own"');
  assert.ok(shortcut >= 0 && shortcut < html.indexOf("<form"), "the way to the national aid must come before the search");
  assert.match(html, /<a href="#own"[^>]*>\s*Niederlassungsförderung ansehen\s*<\/a>/u);
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

test("a country page shows every grant to set up in a territory before its disclosure, with its whole name", () => {
  // Readers come to a country page for the grants to set up, and two grants of one territory usually differ
  // only at the end of their names (young farmers or young livestock farmers, a regional or a provincial
  // call). So none of them goes behind "other resources" and none of their names is cut short.
  let checked = 0;
  for (const { data, layer } of snapshots) {
    if (layer.level !== "REGION") continue;
    const aid = data.resources.filter(isFirstEstablishmentAid);
    if (aid.length === 0) continue;
    const cc = layer.country.toLowerCase();
    const html = htmlAt(cc);
    const start = html.indexOf(`href="/${cc}/${regionSlug(layer.country)}/${layer.region}/"`);
    assert.ok(start >= 0, `${cc}/${layer.region}: no territory card on the country page`);
    const next = html.indexOf('class="territory card', start);
    const card = html.slice(start, next >= 0 ? next : html.length);
    const disclosure = card.indexOf("<details");
    const shown = disclosure >= 0 ? card.slice(0, disclosure) : card;
    for (const resource of aid) {
      const url = resourceUrl(resource.id, layer.country);
      const link = shown.indexOf(`href="${url}"`);
      assert.ok(link >= 0, `${cc}/${layer.region}: ${resource.id} is not shown before the disclosure`);
      assert.ok(
        shown.slice(link, shown.indexOf("</a>", link)).includes(resource.name),
        `${cc}/${layer.region}: show the complete grant name so similarly named grants can be distinguished`,
      );
    }
    assert.doesNotMatch(shown, /line-clamp/u, `${cc}/${layer.region}: a grant's name is cut short`);
    checked += aid.length;
  }
  assert.ok(checked > 0, "no territory grant checked");
});

test("documented access stays with the offer and official PDF links disclose their format", () => {
  for (const { data } of snapshots) {
    for (const resource of data.resources) {
      const url = resourceUrl(resource.id, "country" in data ? data.country : undefined);
      const html = htmlAt(url);
      const start = html.indexOf('data-pagefind-meta="summary"');
      const end = html.indexOf("</header>", start);
      const overview = html.slice(start, end);
      if (resource.howToAccess) {
        assert.match(overview, /id="access"/u, `${url}: readers need the documented next step beside the offer`);
        assert.ok(
          overview.replace(/<[^>]*>/gu, "").includes(resource.howToAccess),
          `${url}: the header must present the documented access instructions`,
        );
      }
      const official = overview.indexOf(`href="${resource.accessUrl}"`);
      assert.ok(official >= 0, `${url}: the header must lead to its cited official address`);
      const label = overview.slice(official, overview.indexOf("</a>", official));
      assert.equal(
        label.includes(" (PDF)"),
        new URL(resource.accessUrl).pathname.toLowerCase().endsWith(".pdf"),
        `${url}: label a PDF destination from its URL without guessing the format of other documents`,
      );
    }
  }
});

test("the shared header follows its visible order at both breakpoints", () => {
  for (const route of ["/", "at", "es/regiones/el-hierro", "es/buscar"]) {
    const header = /<header\b[\s\S]*?<\/header>/u.exec(htmlAt(route))?.[0] ?? "";
    const picker = header.indexOf('class="territory-picker relative"');
    const searches = [...header.matchAll(/<a href="([^"]+)" class="btn btn-quiet ([^"]+)"/gu)];
    assert.equal(searches.length, 2, `${route}: each layout needs a search link at its own visible position`);
    const [mobile, desktop] = searches;
    assert.ok(
      mobile && desktop && mobile.index < picker && picker < desktop.index,
      `${route}: Tab must follow the top-row search on mobile and the picker first on desktop`,
    );
    assert.match(mobile[2] ?? "", /\bsm:hidden\b/u, `${route}: the mobile link must leave desktop keyboard order`);
    assert.match(desktop[2] ?? "", /^hidden\b.*\bsm:inline-flex\b/u, `${route}: the desktop link must leave mobile keyboard order`);
    assert.equal(mobile[1], desktop[1], `${route}: both header layouts must search the same territory`);
  }
});

test("each on-page index link keeps a full tap target even if its label is short", () => {
  const html = htmlAt("at");
  const index = /<nav\b[^>]*class="border-y border-line bg-page"[^>]*>([\s\S]*?)<\/nav>/u.exec(html)?.[1] ?? "";
  const links = [...index.matchAll(/<a href="(#[^"]+)" class="([^"]+)"/gu)];
  assert.ok(
    links.some(([, href]) => href === "#territories"),
    "Austria must exercise the short territory index link",
  );
  for (const [, href, classes] of links) {
    assert.ok(
      classes?.includes("min-h-(--spacing-target)") && classes.includes("min-w-(--spacing-target)"),
      `${href}: text width alone can leave a section jump under the 44px tap target`,
    );
  }
});

test("the access instructions link only the literal emails they already contain", () => {
  let checked = 0;
  for (const { data } of snapshots) {
    for (const resource of data.resources) {
      if (!resource.howToAccess) continue;
      const url = resourceUrl(resource.id, "country" in data ? data.country : undefined);
      const html = htmlAt(url);
      const access = /<section\b[^>]*aria-labelledby="access"[^>]*>[\s\S]*?<\/section>/u.exec(html)?.[0] ?? "";
      const expected = resource.howToAccess.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/giu) ?? [];
      const links = [...access.matchAll(/<a href="mailto:([^"]+)"[^>]*>([^<]+)<\/a>/gu)];
      assert.deepEqual(
        links.map(([, href, label]) => [href, label?.trim()]),
        expected.map((email) => [email, email]),
        `${url}: only addresses present verbatim in the access instructions may become links`,
      );
      checked += expected.length;
    }
  }
  assert.ok(checked > 0, "the built records must exercise links inside access instructions");
});

test("the active-status note remains only where an active resource has no documented call", () => {
  for (const { data } of snapshots) {
    const note = words(data.metadata.language).statusExplained;
    for (const resource of data.resources) {
      const url = resourceUrl(resource.id, "country" in data ? data.country : undefined);
      const html = htmlAt(url);
      assert.equal(
        html.includes(note),
        resource.status === "ACTIVE" && !resource.calls?.length,
        `${url}: keep the qualification when the active badge stands alone, and let dated call answers speak for themselves`,
      );
    }
  }
});
