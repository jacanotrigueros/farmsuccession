import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { reportEndpoint } from "../reporting.config.mjs";
import { recordSlug, regionSlug, searchPath, SEARCH_SLUGS } from "../public/search-scope.js";
import { words } from "../src/lib/words.ts";

/**
 * What the built pages may and may not contain. These are the promises the site makes to a reader on a
 * phone on a rural connection, and they are the kind that get broken by accident months later — one
 * component that pulls a font from a CDN, one integration that ships a runtime — so they are assertions
 * rather than intentions.
 *
 * It reads `dist/`, so `npm run check` builds before it tests.
 */
const DIST = path.join(import.meta.dirname, "..", "dist");
/** Every jurisdiction of the catalogue, so a count follows the catalogue instead of a number written down once. */
const catalogueJurisdictions = (
  JSON.parse(readFileSync(path.join(path.join(import.meta.dirname, "..", ".."), "data", "territories.json"), "utf8")) as {
    jurisdictions: Record<string, unknown>;
  }
).jurisdictions;
const REPOSITORY = path.join(import.meta.dirname, "..", "..");

function builtPages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

const pages = builtPages().map((file) => ({ file: path.relative(DIST, file), html: readFileSync(file, "utf8") }));

test("the build produced pages at all, so an empty run cannot pass as a clean one", () => {
  assert.ok(pages.length > 0, "no HTML in dist/: run npm run build before the tests");
});

/**
 * The whole licence the site gives JavaScript: a page may load a file only because of something it
 * actually carries, and never inline.
 *
 * `/search.js` fills in a list that is already complete; `/apply.js` answers "can I apply now?" again for
 * the reader's own day, from dates that are already on the page. Both only re-say something the HTML has
 * already said, and neither is how anything gets read. An inline script would break the other half of the
 * promise, because it cannot be read before it runs or audited afterwards.
 */
test("a page ships JavaScript only for what it actually carries", () => {
  for (const { file, html } of pages) {
    const allowed = new Set<string>();
    if (html.includes('class="territory-picker')) allowed.add("/territory-picker.js");
    if (html.includes("data-search")) allowed.add("/search.js");
    if (html.includes('class="apply')) allowed.add("/apply.js");
    if (html.includes("data-filter")) allowed.add("/filter.js");
    if (html.includes("data-report")) allowed.add("/report.js");
    if (html.includes("data-sortable")) allowed.add("/sort.js");

    for (const [, src] of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/giu)) {
      assert.ok(
        allowed.has(src ?? ""),
        `${file} loads ${src}, and nothing on it needs that: a page that is only read is read without JavaScript`,
      );
    }
    // A block of application/ld+json is the page's own breadcrumb, as data a search engine reads. No
    // browser executes it, so it is not the thing this rule is about.
    const written = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/giu)]
      .filter(([, attributes]) => !(attributes ?? "").includes("application/ld+json"))
      .map(([, , body]) => (body ?? "").trim());
    assert.ok(
      written.every((body) => body === ""),
      `${file} has an inline script, which cannot be read before it runs or audited afterwards`,
    );
  }
});

/** The `rel` values that make the browser fetch something. `canonical` and `alternate` only name a URL. */
const FETCHING = new Set(["stylesheet", "preload", "prefetch", "preconnect", "dns-prefetch", "modulepreload", "icon", "manifest"]);

test("no page asks the reader's browser for anything from another host", () => {
  // A link to an official page is the point of the site; a *request* to another host is not, because it
  // costs the reader bytes they did not ask for and tells that host they were here.
  const subresource = /<(?:img|iframe|source|video|audio|embed|object|script)\b[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\//giu;
  for (const { file, html } of pages) {
    assert.equal(html.match(subresource), null, `${file} loads a subresource from another host`);
    for (const [tag] of html.matchAll(/<link\b[^>]*>/giu)) {
      const rel = /\brel\s*=\s*["']([^"']+)/iu.exec(tag)?.[1]?.toLowerCase() ?? "";
      const href = /\bhref\s*=\s*["']([^"']+)/iu.exec(tag)?.[1] ?? "";
      const offHost = /^(https?:)?\/\//u.test(href);
      const fetches = rel.split(/\s+/u).some((value) => FETCHING.has(value));
      assert.ok(!(offHost && fetches), `${file} fetches ${href} from another host as rel="${rel}"`);
    }
  }
});

const STORAGE = /document\.cookie|localStorage|sessionStorage|indexedDB/u;

test("no page stores anything in the reader's browser", () => {
  for (const { file, html } of pages) {
    assert.doesNotMatch(html, STORAGE, `${file} touches browser storage`);
  }
});

/**
 * The promise has to survive a dependency. The search engine is somebody else's code running in the
 * reader's browser, so what it may do is checked rather than assumed — and checked in `dist/`, which is
 * what a reader would receive, not in the package it was built from.
 */
test("nothing the site ships to a browser stores anything there", () => {
  const scripts = (function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".js") ? [full] : [];
    });
  })(DIST);

  assert.ok(
    scripts.some((file) => path.basename(file) === "search.js"),
    "no search.js in dist/: the enhancement is missing, and this check would pass without checking anything",
  );
  for (const file of scripts) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      STORAGE,
      `${path.relative(DIST, file)} touches browser storage. Nothing a reader is sent may keep anything on their machine, this project's own code or anybody else's.`,
    );
  }
});

test("every link inside the site reaches a page the build produced", () => {
  const built = new Set(pages.map(({ file }) => `/${file.replace(/index\.html$/u, "")}`));
  const PUBLIC = path.join(import.meta.dirname, "..", "public");
  const assets = new Set(
    (function walk(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [`/${path.relative(PUBLIC, full).split(path.sep).join("/")}`];
      });
    })(PUBLIC),
  );
  for (const { file, html } of pages) {
    for (const [, link] of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](\/[^"'#]*)/giu)) {
      // A query narrows what a page shows; it does not name a different page.
      const href = (link ?? "").split("?")[0] ?? "";
      assert.ok(built.has(href) || assets.has(href), `${file} links ${href}, which the build did not produce`);
    }
  }
});

/** Exclude editorial cross-references from Europe to the country's own records. */
const withoutCounterparts = (html: string): string => html.replace(/<p\b[^>]*data-counterpart[^>]*>[\s\S]*?<\/p>/gu, "");

/**
 * A country's page is the stable, indexable entrance to everything documented below it. Search pages can
 * narrow the same corpus, but they deliberately ask not to be indexed, so they cannot be the only place
 * where the country names its records.
 */
test("a country page links every one of its records by name", () => {
  let checked = 0;
  for (const { file, html } of pages) {
    const parts = file.split(path.sep);
    const iso = (parts[0] ?? "").toUpperCase();
    if (!/^[A-Z]{2}$/u.test(iso) || parts[1] !== recordSlug(iso)) continue;

    const country = pages.find((page) => page.file === path.join(iso.toLowerCase(), "index.html"));
    assert.ok(country, `${file} has no country page to link it`);

    const address = `/${file.replace(/index\.html$/u, "")}`;
    const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/u.exec(html)?.[1];
    assert.ok(heading, `${file} has no record name in its h1`);
    const name = heading
      .replaceAll(/<[^>]*>/gu, " ")
      .replaceAll(/\s+/gu, " ")
      .trim();
    const listing = withoutCounterparts(country.html);
    const link = [...listing.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gu)].find(([, href]) => href === address);
    assert.ok(link, `${country.file} does not link ${address}`);
    const copies = [...listing.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gu)].filter(([, href]) => href === address);
    assert.equal(copies.length, 1, `${country.file} repeats ${address} in competing lists`);
    const linkedName = (link[2] ?? "")
      .replaceAll(/<[^>]*>/gu, " ")
      .replaceAll(/\s+/gu, " ")
      .trim();
    assert.equal(linkedName, name, `${country.file} links ${address} without naming the record`);
    checked += 1;
  }
  assert.ok(checked > 250, `only ${checked} country records were checked; the index did not cover the corpus`);
});

/** The complete country catalogue survives progressive disclosure, including inherited EU records. */
test("country entry pages expose the same unique record destinations as their complete search fallback", () => {
  const recordAddresses = new Set(
    pages.filter(({ html }) => html.includes("data-pagefind-body")).map(({ file }) => `/${file.replace(/index\.html$/u, "")}`),
  );
  assert.ok(recordAddresses.size > 250, "no complete record corpus to compare");
  const listedRecords = (html: string) =>
    [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gu)]
      .map(([, href]) => href!)
      .filter((href) => recordAddresses.has(href))
      .toSorted();
  for (const iso of Object.keys(catalogueJurisdictions)) {
    // Europe's page lists only what applies at EU level; its search covers every country, so the two
    // are not meant to match (founder, 16 Nov 2026).
    if (iso === "EU") continue;
    const country = pages.find(({ file }) => file === path.join(iso.toLowerCase(), "index.html"));
    if (!country) continue;
    const search = pages.find(({ file }) => file === path.join(searchPath("/", iso).slice(1), "index.html"));
    assert.ok(search, `${iso}: missing complete national search fallback`);
    const actual = listedRecords(withoutCounterparts(country.html));
    assert.equal(actual.length, new Set(actual).size, `${iso}: a resource destination is repeated`);
    assert.deepEqual(actual, listedRecords(search.html), `${iso}: progressive disclosure lost or widened the country's records`);
  }
});

/**
 * Every page shares the same footer. A page deep in the catalogue must offer the same
 * project, method, privacy and history destinations as an entry page, in its own language.
 */
test("the complete, localized footer is shared by every built page", () => {
  let checked = 0;
  for (const { file, html } of pages) {
    const footer = /<footer\b[\s\S]*?<\/footer>/u.exec(html)?.[0];
    assert.ok(footer, `${file} has no footer`);
    const language = /<html\b[^>]*\blang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const first = file.split(path.sep)[0] ?? "";
    // Europe's page (/eu/) is no country: its footer links are the site's own.
    const root = /^[a-z]{2}$/u.test(first) && first !== "eu" ? `/${first}/` : "/";
    const about = `${root}${words(language).aboutSlug}/`;
    for (const target of [about, `${about}#method`, `${about}#privacy`]) {
      assert.ok(footer.includes(`href="${target}"`), `${file}: footer omits ${target}`);
    }
    checked++;
  }
  assert.ok(checked > 400, "too few built pages checked for footer consistency");
});

test("the 2014-2016 history stays reachable from each project page", () => {
  // The footer no longer links it (founder, 26 Nov 2026: nobody asked for it in months), so the project
  // page is the way in; without that link the history would be an orphan page.
  let checked = 0;
  for (const { file, html } of pages) {
    const language = /<html\b[^>]*\blang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const text = words(language);
    const first = file.split(path.sep)[0] ?? "";
    const root = /^[a-z]{2}$/u.test(first) && first !== "eu" ? `/${first}/` : "/";
    if (file !== path.join(...`${root}${text.aboutSlug}/index.html`.split("/").filter(Boolean))) continue;
    const body = html.replace(/<footer\b[\s\S]*?<\/footer>/u, "");
    assert.ok(body.includes(`href="${root}${text.historySlug}/"`), `${file}: the project page no longer leads to the history`);
    checked++;
  }
  assert.ok(checked >= 7, `only ${checked} project pages checked`);
});

/**
 * A record never tells a reader it awaits a person's review: that reads as an unfinished product and says
 * nothing about the evidence (founder, 24 Nov 2026). What it says instead, on each source, is the last day
 * every quote was found again on the official page.
 */
test("a record shows its plan code and the act it rests on, labelled in the page's language", () => {
  const editions = readdirSync(path.join(REPOSITORY, "data", "editions"))
    .toSorted()
    .toReversed();
  const files = readdirSync(path.join(REPOSITORY, "data", "editions", editions[0]!), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".json"))
    .map(
      (file) =>
        JSON.parse(readFileSync(path.join(REPOSITORY, "data", "editions", editions[0]!, file), "utf8")) as {
          metadata: { language: string };
          resources: Array<{ id: string; interventionCodes?: Array<{ code: string }>; legalBasis?: Array<{ title: string }> }>;
        },
    );
  const find = (field: "interventionCodes" | "legalBasis") => {
    for (const file of files) {
      const record = file.resources.find((resource) => resource[field]);
      if (record) return { record, language: file.metadata.language };
    }
    assert.fail(`no record carries ${field}, so nothing shows that the page renders it`);
  };
  const pageOf = (id: string) => {
    const page = pages.find(({ file }) => file.split(path.sep).includes(id));
    assert.ok(page, `no page was built for ${id}`);
    return decodeHTML(page.html);
  };
  const coded = find("interventionCodes");
  const codedHtml = pageOf(coded.record.id);
  assert.ok(codedHtml.includes(words(coded.language).planCodeRow), `${coded.record.id}: the plan code has no label in ${coded.language}`);
  assert.ok(codedHtml.includes(coded.record.interventionCodes![0]!.code), `${coded.record.id}: its plan code is not on its page`);
  const based = find("legalBasis");
  const basedHtml = pageOf(based.record.id);
  assert.ok(basedHtml.includes(words(based.language).legalBasisRow), `${based.record.id}: the legal basis has no label`);
  assert.ok(basedHtml.includes(based.record.legalBasis![0]!.title), `${based.record.id}: the act it rests on is not on its page`);
});

test("a measure and the records that apply it link to each other, so neither page stands alone", () => {
  const editions = readdirSync(path.join(REPOSITORY, "data", "editions"))
    .toSorted()
    .toReversed();
  const links = readdirSync(path.join(REPOSITORY, "data", "editions", editions[0]!), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".json"))
    .flatMap((file) => {
      const data = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "editions", editions[0]!, file), "utf8")) as {
        resources: Array<{ id: string; implements?: Array<{ resourceId: string }> }>;
      };
      return data.resources.flatMap(({ id, implements: applied }) => (applied ?? []).map(({ resourceId }) => ({ id, resourceId })));
    });
  assert.ok(links.length > 0, "no record applies a higher measure, so nothing shows that the pages render the link");
  const pageOf = (id: string): string => {
    const page = pages.find(({ file }) => file.split(path.sep).includes(id));
    assert.ok(page, `no page was built for ${id}`);
    return page.html;
  };
  for (const { id, resourceId } of links) {
    assert.match(pageOf(id), new RegExp(`href="[^"]*/${resourceId}/"`, "u"), `${id} does not link the measure it applies, ${resourceId}`);
    const applied = pageOf(resourceId).split('id="applied"')[1];
    assert.ok(applied, `${resourceId} has no list of the records that apply it`);
    assert.match(applied, new RegExp(`href="[^"]*/${id}/"`, "u"), `${resourceId} does not list ${id}, which applies it`);
  }
});

test("a record says when each source was verified, and never that it awaits review", () => {
  const editions = readdirSync(path.join(REPOSITORY, "data", "editions"))
    .toSorted()
    .toReversed();
  const edition = editions[0];
  assert.ok(edition, "no edition to render");
  for (const { file, html } of pages) {
    assert.ok(!html.includes('data-review="pending"'), `${file}: a page still says a review is pending`);
  }

  const austria = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "editions", edition, "countries", "at.json"), "utf8")) as {
    resources: Array<{ id: string; sources: Array<{ verification?: { checkedOn: string; method: string } }> }>;
  };
  const record = austria.resources.find(({ sources }) => sources.some(({ verification }) => verification));
  assert.ok(record, "no Austrian record has a verified source to render");
  const page = pages.find(({ file }) => file === path.join("at", "angebote", record.id, "index.html"));
  assert.ok(page, `no page was built for ${record.id}`);
  const checked = record.sources.find(({ verification }) => verification)!.verification!;
  assert.ok(
    page.html.includes(`<time datetime="${checked.checkedOn}" data-verified="${checked.method}"`),
    "a verified source does not show the day its quotes were found again",
  );
  assert.ok(page.html.includes(words("de").sourceCheckedOn), "the verification date is not labelled as a check");
});

/**
 * Two namespaces that must not become one.
 *
 * The pages a country has of its own — searching, the project, its history — are a closed list this
 * repository writes. The territories under it are an open list the catalogue grows, one more with every
 * research pass. Published side by side, the first territory slug that happens to equal one of those
 * words takes the page, in whichever language it happens. So everything below a country lives under one
 * segment of its own, and this is the check that it stays there.
 */
test("a territory never shares a namespace with a page of the site", () => {
  const catalogue = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "territories.json"), "utf8")) as {
    jurisdictions: Record<string, { lang: string }>;
  };
  const countries = Object.entries(catalogue.jurisdictions).filter(([iso]) => iso !== "EU");
  assert.ok(countries.length > 0, "no country in the catalogue: this check would pass without checking anything");

  for (const [iso, { lang }] of countries) {
    const text = words(lang);
    const own = new Set([text.aboutSlug, text.historySlug, text.reportSlug, SEARCH_SLUGS[iso] ?? "", regionSlug(iso), recordSlug(iso)]);
    const published = new Set(
      pages
        .map(({ file }) => file.split(path.sep))
        .filter((parts) => parts[0] === iso.toLowerCase() && parts.length > 2)
        .map((parts) => parts[1] ?? ""),
    );
    for (const segment of published) {
      assert.ok(
        own.has(segment),
        `/${iso.toLowerCase()}/${segment}/ sits beside this country's own pages. A territory belongs under /${iso.toLowerCase()}/${regionSlug(iso)}/, or the day a territory is called "${text.aboutSlug}" it takes that page.`,
      );
    }
    assert.ok(published.has(regionSlug(iso)), `${iso} published no territory under /${iso.toLowerCase()}/${regionSlug(iso)}/`);
  }
});

/**
 * The first thing on every page is a link for somebody who cannot use a mouse, and for four milestones it
 * said "Skip to the content" in English on every Spanish page on the site. Nothing caught it: it sits in
 * the layout, outside the part of the page anybody reads, and it is invisible until it is focused. So the
 * check is here — the one piece of chrome a reader meets before any other has to be in their language.
 */
test("the first link of a page is written in that page's language", () => {
  for (const { file, html } of pages) {
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1];
    assert.ok(language, `${file} does not declare the language it is written in`);
    const skip = /<a\b[^>]*\bhref="#content"[^>]*>([\s\S]*?)<\/a>/u.exec(html)?.[1]?.trim();
    assert.ok(skip, `${file} has no link that skips to the content`);
    assert.equal(skip, words(language).skip, `${file} offers its skip link in another language than its own`);
  }
});

test("a page declares the language its text is actually written in", () => {
  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "no home page was built");
  assert.match(home.html, /<html lang="en"/u, "the European layer is written in English, and a screen reader has to be told");
});

/**
 * What a reader who mistyped an address gets, and what a crawler is told. Both are easy to leave out —
 * nothing on the site links to either — and both are how somebody arrives at all.
 */
test("the illustrated 404 gives clear recovery actions and localized country links", () => {
  const notFound = pages.find(({ file }) => file === "404.html");
  assert.ok(notFound, "the build produced no 404 page: an unknown address would answer with nothing at all");

  assert.match(notFound.html, /src="\/img\/404-wayfinding\.webp"/u, "404 illustration missing");
  assert.match(notFound.html, /href="\/search\/"/u, "404 lacks a direct route to search");
  assert.match(notFound.html, /href="\/"/u, "404 lacks a route to the home page");
  assert.doesNotMatch(notFound.html, /data-search/u, "404 must not carry a second search form or client index");

  // This file is served for every address that does not exist, so it is the one page with no address of
  // its own. Requested directly it answers 200, which is what static hosting can do; what it must not do
  // is ask to be indexed, or name an address nobody can open.
  assert.match(
    notFound.html,
    /<meta name="robots" content="noindex/u,
    "the 404 page does not ask to stay out of the index, so a search engine may offer a reader the apology instead of the answer",
  );
  assert.doesNotMatch(
    notFound.html,
    /rel="canonical"/u,
    "the 404 page claims an address of its own, and the only address it could claim is the one the reader mistyped",
  );
  assert.ok(!notFound.html.includes("/404/"), "the 404 page points at /404/, which this build does not produce");

  const catalogue = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "territories.json"), "utf8")) as {
    jurisdictions: Record<string, { lang: string }>;
  };
  const countries = Object.entries(catalogue.jurisdictions).filter(([iso]) => iso !== "EU");
  for (const [iso, { lang }] of countries) {
    assert.match(
      notFound.html,
      new RegExp(`href="/${iso.toLowerCase()}/"`, "u"),
      `the 404 page offers no way back into ${iso}, so a reader lost under /${iso.toLowerCase()}/ is sent to another country`,
    );
    assert.ok(notFound.html.includes(`${words(lang).startHere}:`), `the 404 page offers no localized way back for ${lang}`);
  }
});

/**
 * The crawl budget one form was spending.
 *
 * Every record and every territory offers the correction form with its own parameters already filled in,
 * so the build emits hundreds of distinct addresses that a crawler fetches and then discards against the
 * noindex the form carries. Nothing a reader sees is wrong: what it costs is the crawl of pages that have
 * never been indexed at all. The links stay exactly as they are, and they stop asking to be followed.
 */
test("a link to the correction form does not ask a crawler to follow it", () => {
  const slugs = [...new Set(["en", "es", "de", "fr", "it", "pt", "nl"].map((language) => words(language).reportSlug))];
  const toTheForm = new RegExp(`<a\\b[^>]*href="(/(?:[a-z]{2}/)?(?:${slugs.join("|")})/[^"]*)"[^>]*>`, "gu");
  let checked = 0;
  for (const { file, html } of pages) {
    for (const [tag, address] of html.matchAll(toTheForm)) {
      checked += 1;
      assert.match(
        tag,
        /rel="[^"]*nofollow/u,
        `${file} asks a crawler to follow ${address}, one of the hundreds of permutations of one form that a crawl spends itself on while most of the site has never been indexed`,
      );
    }
  }
  assert.ok(checked > 400, `only ${checked} links to the form were checked; every record and every territory offers one`);
});

test("the sitemap lists every page the build produced, except the ones that ask not to be listed", () => {
  const xml = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const listed = new Set([...xml.matchAll(/<loc>https:\/\/farmsuccession\.eu([^<]*)<\/loc>/gu)].map(([, url]) => url ?? ""));
  const built = pages.filter(({ file }) => file.endsWith("index.html"));
  const asked = (html: string) => /<meta\s+name="robots"\s+content="noindex/u.test(html);
  const address = ({ file }: { file: string }) => `/${file.replace(/index\.html$/u, "")}`;
  const canonicalOf = (html: string) => /<link\s+rel="canonical"\s+href="([^"]+)"/u.exec(html)?.[1];
  const aCopy = (page: { file: string; html: string }) => {
    const canonical = canonicalOf(page.html);
    return canonical !== undefined && canonical !== `https://farmsuccession.eu${address(page)}`;
  };

  const offered = built.filter((page) => !asked(page.html) && !aCopy(page)).map(address);
  for (const page of offered) {
    assert.ok(listed.has(page), `${page} was built and is not in the sitemap, so nothing will find it unless a page links to it`);
  }
  for (const url of listed) {
    assert.ok(offered.includes(url), `the sitemap offers ${url}, which the build did not produce or which asked not to be indexed`);
  }
  // A page that carries noindex and a page a sitemap offers are the same page saying two opposite things.
  const quiet = built.filter(({ html }) => asked(html)).map(address);
  assert.ok(quiet.length > 0, "no page asked to stay out of the index, so this check proved nothing");
  for (const page of quiet) {
    assert.ok(!listed.has(page), `${page} asks search engines not to index it and the sitemap offers it anyway`);
  }
  assert.ok(!xml.includes("/404/"), "the sitemap offers the page for addresses that do not exist");
  // A page that names another as its original is a copy; offering it tells a search engine the opposite.
  const copies = built.filter(aCopy).map(address);
  assert.ok(copies.length > 0, "no page names another as its original, so this check proved nothing");
  for (const page of copies) {
    assert.ok(!listed.has(page), `${page} names another page as its original and the sitemap offers it anyway`);
  }
});

/**
 * Which pages those are: a search, which is not a document of its own, and a region that documented
 * nothing itself, whose list is the list its country and the European layer already publish. Both stay
 * reachable and their links are followed — this is about what a search engine is asked to keep a copy of.
 */
test("a region that documented nothing of its own is not offered as a page to index", () => {
  const quiet = pages.filter(({ html }) => /<meta\s+name="robots"\s+content="noindex/u.test(html)).map(({ file }) => file);
  const searches = quiet.filter((file) => !file.split(path.sep).includes(regionSlug((file.split(path.sep)[0] ?? "").toUpperCase())));
  assert.ok(searches.length > 0, "no search page asked to stay out of the index");

  const regions = quiet.filter((file) => file.split(path.sep).includes(regionSlug((file.split(path.sep)[0] ?? "").toUpperCase())));
  assert.ok(regions.length > 0, "no region asked to stay out of the index, and some region documents nothing of its own");
  for (const file of regions) {
    const { html } = pages.find((page) => page.file === file)!;
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1] ?? "";
    assert.ok(
      html.includes(words(language).noneOwn.split("{where}")[0]!.trim()),
      `${file} is kept out of the index without saying on the page that it documents nothing of its own`,
    );
  }
});

/**
 * A date in a sitemap is a claim about freshness, which is the one claim this project is not allowed to
 * invent. So every lastmod has to be the day a territory's own file says its evidence was published.
 */
test("every date in the sitemap is a date the data gives", () => {
  const xml = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const editions = path.join(REPOSITORY, "data", "editions");
  const dates = new Set(
    (function walk(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        const data = JSON.parse(readFileSync(full, "utf8")) as { published?: string };
        return data.published ? [data.published] : [];
      });
    })(editions),
  );
  assert.ok(dates.size > 0, "no published date in the data: this check would pass without checking anything");

  const stated = [...xml.matchAll(/<lastmod>([^<]*)<\/lastmod>/gu)].map(([, date]) => date ?? "");
  assert.ok(stated.length > 0, "the sitemap carries no dates at all");
  for (const date of stated) {
    assert.ok(dates.has(date), `the sitemap says a page changed on ${date}, which no edition file says about anything`);
  }
});

/**
 * robots.txt keeps one thing from a crawler: the search index under /pagefind/, which is compiled chunks
 * the search page reads in the browser, not documents. In its first two weeks it was 28 % of everything
 * Googlebot fetched. Everything a reader can read stays open, and the index can only be withheld because
 * no page offered to search engines needs it to show its content.
 */
test("robots.txt sends a crawler to the sitemap and keeps nothing from it but the search index", () => {
  const robots = readFileSync(path.join(import.meta.dirname, "..", "public", "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/farmsuccession\.eu\/sitemap\.xml/u, "robots.txt does not say where the sitemap is");
  const withheld = [...robots.matchAll(/^Disallow:\s*(\S*)\s*$/gmu)].map(([, rule]) => rule ?? "");
  assert.deepEqual(
    withheld,
    ["/pagefind/"],
    "robots.txt withholds something besides the search index. Everything else here is public evidence meant to be found.",
  );

  const xml = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const listed = [...xml.matchAll(/<loc>https:\/\/farmsuccession\.eu([^<]*)<\/loc>/gu)].map(([, url]) => url ?? "");
  for (const url of listed) {
    assert.ok(!withheld.some((rule) => url.startsWith(rule)), `the sitemap offers ${url}, which robots.txt tells a crawler not to fetch`);
  }

  // A page Google renders without the index must not need it: only pages that ask not to be indexed may search.
  const indexed = pages.filter(({ html }) => !/<meta\s+name="robots"\s+content="noindex/u.test(html));
  assert.ok(indexed.length > 0, "no indexable page was built, so this check proved nothing");
  for (const { file, html } of indexed) {
    assert.ok(
      !html.includes('src="/search.js"') && !html.includes("/pagefind/"),
      `${file} is offered to search engines and loads the search index robots.txt withholds, so Google would render it without its content`,
    );
  }
});

/**
 * A record's title no longer spends its room on the site's name, so the name has to be said where a search
 * engine reads it for the line it prints above a result: on every page, and as a WebSite on the home page.
 */
test("every page names the site where a result reads it, and the home page names it as a WebSite", () => {
  for (const { file, html } of pages) {
    assert.match(html, /<meta property="og:site_name" content="FarmSuccession"/u, `${file} does not say which site it belongs to`);
  }
  const home = pages.find(({ file }) => file === "index.html")?.html ?? "";
  const data = [...home.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/gu)].map(
    ([, json]) => JSON.parse(json ?? "{}") as { "@type"?: string; name?: string; url?: string },
  );
  assert.ok(
    data.some((item) => item["@type"] === "WebSite" && item.name === "FarmSuccession" && item.url === "https://farmsuccession.eu/"),
    "the home page does not name the site as a WebSite, so a result has to guess the name from a title",
  );
});

/**
 * A title is what a search result and a shared link show, and for five milestones every territory page
 * offered the bare name of the place — "España — FarmSuccession" — which says nothing about what is on
 * it. It says what the page is about now, in the page's own language.
 */
test("a territory page says in its title what the page is about", () => {
  // A territory is Europe's page or a page under a country's own segment for territories, and nothing
  // else: /de/regionen/bayern/ is a territory, /de/geschichte/ is a page of the site. A country page may
  // carry its own search title in its data, so territory-presentation.test.ts checks it against that.
  const territories = pages.filter(({ file }) => {
    if (file === path.join("eu", "index.html")) return true;
    const parts = file.split(path.sep);
    const iso = parts[0] ?? "";
    return /^[a-z]{2}$/u.test(iso) && parts[1] === regionSlug(iso.toUpperCase());
  });
  assert.ok(territories.length > 0, "no territory page was built: this check would pass without checking anything");

  // A region or hub may carry a search title of its own, written from how people there search for it
  // ("Ayudas, tierras y formación agraria en Andalucía"); that title is its subject.
  const ownTitles = new Set(
    readdirSync(path.join(REPOSITORY, "data", "editions"), { recursive: true, encoding: "utf8" })
      .filter((file) => /(regions|hubs)[\\/].+\.json$/u.test(file))
      .map(
        (file) => (JSON.parse(readFileSync(path.join(REPOSITORY, "data", "editions", file), "utf8")) as { metaTitle?: string }).metaTitle,
      )
      .filter((title): title is string => title !== undefined),
  );
  assert.ok(ownTitles.size > 0, "no region carries its own search title: that path is not exercised");
  for (const { file, html } of territories) {
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const title = /<title>([^<]*)<\/title>/u.exec(html)?.[1] ?? "";
    if (ownTitles.has(decodeHTML(title))) continue;
    // Europe's page has a search title of its own, which names the subject in full.
    const about =
      file === path.join("eu", "index.html") ? words(language).euMetaTitle : words(language).territoryTitle.replace("{where}", "").trim();
    assert.ok(
      title.includes(about),
      `${file} is titled "${title}", which is a name and not a subject. A reader meets this in a search result before they meet the page.`,
    );
  }
});

/**
 * Country pages are about different countries, not translations of one another, so they carry no
 * alternates between them (decision recorded in CLAUDE.md). Each still says in its structured data which
 * language it is written in, and its breadcrumb trail is the path a reader takes: from the overview of
 * every country, not from inside Europe's page.
 */
test("a country page states its own language and is reached from the overview of every country", () => {
  const countries = pages.filter(({ file }) => /^[a-z]{2}$/u.test(file.split(path.sep)[0] ?? "") && file.split(path.sep).length === 2);
  assert.ok(countries.length > 0, "no country page was built: this check would pass without checking anything");
  for (const { file, html } of countries) {
    if (file === path.join("eu", "index.html")) continue;
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const data = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/gu)].map(([, json]) => JSON.parse(json!));
    assert.ok(
      data.some((item) => item["@type"] === "WebPage" && item.inLanguage === language),
      `${file} does not state its language as a WebPage, so a search engine has only the text to guess from`,
    );
    const trail = data.find((item) => item["@type"] === "BreadcrumbList");
    assert.equal(
      trail?.itemListElement?.[0]?.item,
      "https://farmsuccession.eu/",
      `${file} starts its trail somewhere other than the overview of every country`,
    );
    assert.ok(!html.includes('hreflang="'), `${file} declares language alternates, but a country page translates no other page`);
  }
});

/**
 * A European measure is applied by each country in its own way, so a European record leads on to every
 * country page; and a record's trail is the path a reader takes, which passes through Europe's page only
 * when the record is European (founder, 17 Nov 2026).
 */
test("a European record leads to every country, and only a European record's trail passes through Europe", () => {
  const trailOf = (html: string): string[] => {
    const data = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/gu)].map(([, json]) => JSON.parse(json!));
    return (data.find((item) => item["@type"] === "BreadcrumbList")?.itemListElement ?? []).map((item: { item: string }) => item.item);
  };
  const countryPages = pages
    .filter(({ file }) => /^[a-z]{2}[\/]index\.html$/u.test(file) && !file.startsWith("eu"))
    .map(({ file }) => `/${file.split(/[\/]/u)[0]}/`);
  const european = pages.filter(({ file }) => file.startsWith(`resources${path.sep}`));
  assert.ok(european.length > 0 && countryPages.length > 0, "no European record or country page was built");
  for (const { file, html } of european) {
    for (const country of countryPages) {
      assert.ok(html.includes(`href="${country}"`), `${file} does not lead to ${country}, where the country applies the measure`);
    }
    assert.deepEqual(
      trailOf(html).slice(0, 2),
      ["https://farmsuccession.eu/", "https://farmsuccession.eu/eu/"],
      `${file}: a European record's trail must pass through Europe's page`,
    );
  }
  const national = pages.filter(
    ({ file, html }) => /^[a-z]{2}[\/][^\/]+[\/][^\/]+[\/]index\.html$/u.test(file) && trailOf(html).length > 2,
  );
  assert.ok(national.length > 0, "no national record page was checked");
  for (const { file, html } of national) {
    assert.ok(
      !trailOf(html).includes("https://farmsuccession.eu/eu/"),
      `${file}: a national record's trail passes through Europe's page, which a reader did not take`,
    );
  }
});

/**
 * A European record is English and applies everywhere, so its kind, audience and "European Union" are given
 * to the search index in every language the site writes, as an attribute nothing on the page displays.
 * A national record is already written in its readers' language and carries none.
 */
test("a European record can be searched for in every language, through the site's own vocabulary only", () => {
  const european = pages.filter(({ file }) => file.startsWith(`resources${path.sep}`));
  assert.ok(european.length > 0, "no European record page was built");
  for (const { file, html } of european) {
    const terms = /data-pagefind-index-attrs="data-terms" data-terms="([^"]*)"/u.exec(html)?.[1];
    assert.ok(terms, `${file} gives the search no words in other languages, so a Spanish or Dutch reader finds it only by luck`);
    for (const language of ["en", "es", "de", "fr", "it", "pt", "nl"]) {
      assert.ok(terms.includes(words(language).euName), `${file}: the search terms leave out ${language}`);
    }
  }
  const national = pages.filter(({ file, html }) => /^[a-z]{2}[\/]/u.test(file) && html.includes("data-pagefind-body"));
  assert.ok(national.length > 0, "no national record page was built");
  for (const { file, html } of national) {
    assert.ok(!html.includes("data-terms="), `${file} is written in its readers' language and needs no translated terms`);
  }
});

test("a search box shows what kind of word goes in it, in the page's language", () => {
  const boxes = pages.filter(({ html }) => html.includes('type="search"'));
  assert.ok(boxes.length > 0, "no page offers a search box: this check would pass without checking anything");

  for (const { file, html } of boxes) {
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1] ?? "";
    assert.ok(
      html.includes(`placeholder="${words(language).searchExamples}"`),
      `the search box on ${file} is an empty box with a label. Somebody who has never searched a catalogue is left guessing what belongs in it.`,
    );
  }
});

/**
 * A territory shows what applies in it, which is its own records and everything above it, and the
 * difference matters: an aid or a course recorded for the country and not for the region is one a reader
 * keeps if they move, and one they can use wherever they are inside it. So no record is ever listed
 * without a heading above it saying whose layer it comes from, and the layers run closest first.
 */
test("a record is never listed without saying which layer it comes from", () => {
  const territories = pages.filter(({ file }) => {
    const parts = file.split(path.sep);
    const iso = parts[0] ?? "";
    if (!/^[a-z]{2}$/u.test(iso)) return false;
    return parts.length === 2 || parts[1] === regionSlug(iso.toUpperCase());
  });
  assert.ok(territories.length > 0, "no territory page was built: this check would pass without checking anything");

  let grouped = 0;
  for (const { file, html } of territories) {
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const text = words(language);
    const headings = [...html.matchAll(/<(h[234])\b([^>]*)>([\s\S]*?)<\/\1>/gu)].map(([, level, attributes, inner]) => ({
      level: level ?? "",
      attributes: attributes ?? "",
      text: (inner ?? "")
        .replaceAll(/<[^>]*>/gu, " ")
        .replaceAll(/\s+/gu, " ")
        .trim(),
    }));

    // A template with the name in the middle — "Für {where} erfasst" — is matched as one. The heading
    // text above had its whitespace collapsed, and French writes a no-breaking space before a colon, so
    // the template is collapsed the same way. This check is about which layer a heading names, never
    // about which space character stands before its colon.
    const flat = (value: string) => value.replaceAll(/\s+/gu, " ");
    const says = (template: string) =>
      new RegExp(
        `^${flat(template)
          .replaceAll(/[.*+?^$()|[\]\\]/gu, "\\$&")
          .replace("{where}", ".+")}`,
        "u",
      );
    let group = "";
    for (const heading of headings) {
      if (heading.level === "h2") {
        // The records of this territory hang from the heading that names it — "the whole country" on a
        // country, the territory's name below one — and the ones that reach it from a wider layer hang
        // from a heading naming that layer, one level further down.
        // Europe's page names its layer in "Understand the EU framework".
        const own =
          says(text.ownRecords).test(heading.text) ||
          heading.text.startsWith(flat(text.wholeCountryTitle)) ||
          heading.text.startsWith(flat(text.euFrameworkTitle));
        group = own ? heading.text : "";
        if (group) grouped += 1;
      }
      if (heading.level === "h3" && heading.attributes.includes("data-layer")) {
        group = heading.text;
        grouped += 1;
      } else if (heading.attributes.includes("data-record")) {
        assert.ok(group, `${file} lists "${heading.text}" with nothing above it saying which layer recorded it`);
      }
    }
  }
  assert.ok(grouped > 0, "no list of records was grouped by layer at all, so this check proved nothing");
});

/**
 * A filter offers a territory by its name, never by the fragment of URL that identifies it. The three
 * that lost their name were the three that document nothing of their own — El Hierro, Formentera and
 * Fuerteventura — because the names were read from the records, and those are exactly the territories no
 * record could name. They are in the filter because what Europe and the country record applies there too.
 */
test("a filter names a territory, and never shows the slug in its link", () => {
  const catalogue = JSON.parse(readFileSync(path.join(REPOSITORY, "data", "territories.json"), "utf8")) as {
    jurisdictions: Record<string, { regions: { slug: string; name: string }[] }>;
  };
  const names = new Map<string, string>();
  for (const [iso, { regions }] of Object.entries(catalogue.jurisdictions)) {
    for (const region of regions) names.set(`${iso}/${region.slug}`, region.name);
  }

  let checked = 0;
  for (const { file, html } of pages) {
    for (const [, value, label] of html.matchAll(
      /<input type="checkbox" name="territory" value="([^"]+)"[^>]*>\s*<span[^>]*>([^<]*)<\/span>/gu,
    )) {
      const expected = names.get(value ?? "");
      assert.ok(expected, `${file} offers a filter for ${value}, which the catalogue does not know`);
      assert.equal(label, expected, `${file} offers "${label}" where the catalogue calls that territory "${expected}"`);
      checked += 1;
    }
  }
  assert.ok(checked > 0, "no territory filter was built at all, so this check proved nothing");
});

/**
 * Every image is a file this site ships. The flags used to be emoji — two regional indicator letters,
 * which Windows has no glyph for, so most readers saw "ES" where the page meant Spain. A file always
 * draws, and a file that is missing is a broken image, which is why the build is asked to prove it ships
 * every one it asks for.
 */
test("every image a page asks for is a file the site ships", () => {
  const PUBLIC = path.join(import.meta.dirname, "..", "public");
  const assets = new Set(
    (function walk(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [`/${path.relative(PUBLIC, full).split(path.sep).join("/")}`];
      });
    })(PUBLIC),
  );

  let checked = 0;
  for (const { file, html } of pages) {
    for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc="(\/[^"]*)"/gu)) {
      assert.ok(assets.has(src ?? ""), `${file} asks for ${src}, which this site does not ship`);
      checked += 1;
    }
    assert.doesNotMatch(
      html,
      /[\u{1F1E6}-\u{1F1FF}]/u,
      `${file} draws a flag as a pair of regional indicator letters, which most systems render as letters`,
    );
  }
  assert.ok(checked > 0, "no page asked for an image at all, so this check proved nothing");
});

/**
 * A figure beside a list is rewritten when a reader narrows the page, so it carries the two sentences it
 * can become — one record, or several — with the number left out. Writing a count into a page without
 * them is how a heading ends up saying "undefined" the first time somebody uses the control.
 */
test("a figure the filter rewrites says what it becomes at one record and at several", () => {
  let checked = 0;
  for (const { file, html } of pages) {
    for (const [tag] of html.matchAll(/<[a-z0-9]+\b[^>]*\sdata-figure\b[^>]*>/gu)) {
      const one = /\sdata-one="([^"]*)"/u.exec(tag)?.[1];
      const many = /\sdata-many="([^"]*)"/u.exec(tag)?.[1];
      assert.ok(
        one?.includes("{n}") && many?.includes("{n}"),
        `${file} counts something without saying what it reads at one record and at several: ${tag}`,
      );
      assert.match(
        html,
        /<script[^>]*src="\/filter\.js"/u,
        `${file} carries a figure to rewrite and never loads the script that rewrites it`,
      );
      checked += 1;
    }
  }
  assert.ok(checked > 0, "no page carried a figure the filter rewrites, so this check proved nothing");
});

/**
 * The promise above, made to the browser rather than only kept by the build.
 *
 * "No page asks the reader's browser for anything from another host" is checked by reading the markup,
 * which proves what the build produced and nothing about what a page may do once it is open. A
 * Content-Security-Policy turns the same sentence into a rule the browser enforces: a script, a
 * stylesheet, a font, an image or a connection that did not come from this site is refused, and so is a
 * form that would post somewhere else.
 *
 * The policy is a `<meta>` because the site is served by GitHub Pages, which sends no headers of its own
 * on a custom domain. That costs `frame-ancestors`, which only exists as a header — the policy therefore
 * covers injected content and not framing.
 *
 * `'wasm-unsafe-eval'` is in it because Pagefind compiles WebAssembly to search, and it reaches every
 * page rather than only the six that search, because one policy is configured for the whole build. It
 * permits WebAssembly and nothing else: it is not `'unsafe-eval'`, and no page may run a string as code.
 *
 * Inline styles are allowed by their hash, which Astro computes at build time. The moment anything here
 * needs `'unsafe-inline'`, the policy stops being worth having, which is why that is the assertion.
 */
test("a page tells the browser to refuse anything that did not come from this site", () => {
  for (const { file, html } of pages) {
    const policy = /<meta http-equiv="content-security-policy" content="([^"]*)"/iu.exec(html)?.[1];
    assert.ok(policy, `${file} ships no Content-Security-Policy: a page that is only read has nothing to allow`);

    for (const unsafe of ["'unsafe-inline'", "'unsafe-eval'"]) {
      assert.ok(
        !policy.includes(unsafe),
        `${file} allows ${unsafe}, which permits exactly what the policy exists to refuse: fix what needs it instead`,
      );
    }

    for (const directive of ["default-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'self' mailto:"]) {
      assert.ok(policy.includes(directive), `${file} is missing ${directive} from its Content-Security-Policy`);
    }

    assert.equal(
      policy
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("form-action ")),
      `form-action 'self' mailto:${reportEndpoint ? " https://formspree.io" : ""}`,
      `${file}: only the configured provider may receive an explicit report`,
    );
    assert.equal(
      policy
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("connect-src ")),
      "connect-src 'self'",
      `${file}: form delivery must not permit third-party background connections`,
    );

    assert.ok(
      policy.includes("'wasm-unsafe-eval'"),
      `${file} forbids WebAssembly, and the search compiles it: every search page would fail to load its index`,
    );
  }
});

/**
 * The one way the policy above breaks quietly, written down as a failure instead.
 *
 * Astro hashes the `<style>` elements it generates, so the policy needs no
 * `'unsafe-inline'`. A hash cannot cover a `style="…"` attribute: allowing one means
 * allowing every inline style on every page, which is most of what the policy exists to
 * refuse. So an attribute is a build error, not a reason to loosen it — `decisions/034`.
 *
 * It will be met before anything else here. Astro's Markdown highlighting, Shiki, puts an
 * inline style on every token it emits, and the build already warns about it. No page uses
 * a code block today. The day one does, the browser would blank the highlighting and say so
 * only in a console nobody is reading; this says it at the build instead, and names the page.
 */
test("no page styles anything inline, because the policy cannot cover an attribute", () => {
  for (const { file, html } of pages) {
    const [found] = html.match(/<[a-z][^>]*\sstyle="[^"]*"/iu) ?? [];
    assert.ok(
      !found,
      `${file} carries an inline style, which the Content-Security-Policy blocks and no hash can allow: ${found}\n` +
        "If this came from a code block, the highlighter has to emit classes rather than styles — see decisions/034.",
    );
  }
});

/** Reader feedback must lead to an actionable, contextual report, never a pretend vote. */
test("every record prioritises actionable feedback with its context and retains the email alternative", () => {
  const byLanguage = new Set<string>();
  let checked = 0;
  for (const { file, html } of pages) {
    const at = html.indexOf('id="helpful"');
    if (at < 0) continue;
    const language = /<html\b[^>]*\blang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const text = words(language);
    byLanguage.add(language);
    checked += 1;

    const end = html.indexOf("</section>", at);
    assert.ok(end > at, `${file} never closes the section that asks the question`);
    const section = html.slice(at, end);

    assert.ok(section.includes(text.helpfulQuestion), `${file} asks whether it helped in another language`);
    assert.ok(section.includes(text.helpfulFeedbackLead));
    assert.ok(section.includes(text.helpfulFeedbackAction));
    const target = /<a\b[^>]*data-record-feedback[^>]*href="([^"]+)"/u.exec(section)?.[1];
    assert.ok(target, `${file}: a reader who was not helped has no direct report action`);
    const feedback = new URL(decodeHTML(target), "https://farmsuccession.eu");
    assert.equal(feedback.searchParams.get("type"), "feedback");
    assert.equal(feedback.searchParams.get("from"), "/" + file.replace(/index\.html$/u, ""));
    assert.ok(feedback.searchParams.get("record"), `${file}: the reader must identify the record again`);
    assert.ok(feedback.searchParams.get("territory"));
    assert.ok(feedback.pathname.endsWith(`/${text.reportSlug}/`));
    assert.doesNotMatch(section, /<button\b/u, "feedback must not pretend to store a vote");
    assert.ok(section.includes(text.helpfulWriteIn), `${file} asks the question without saying where an answer goes`);
    assert.ok(
      section.includes(">contact@farmsuccession.eu<"),
      `${file} keeps the address inside a link only, so a reader whose browser does nothing with mailto: cannot read or copy it`,
    );

    for (const [, href] of section.matchAll(/<a\b[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*href="([^"]*)"/gu)) {
      assert.ok(
        !(href ?? "").startsWith("mailto:"),
        `${file} offers a mailto: link shaped like a button: where no mail client is configured, pressing it does nothing at all`,
      );
    }
  }
  assert.ok(checked > 100, `only ${checked} records asked the question; every record page should`);
  assert.equal(byLanguage.size, 7, "the question was not checked in all seven languages: Dutch records joined the six on 20 Nov 2026");
});

test("every page links its scoped licence notice and every evidence block warns about third-party rights", () => {
  for (const { file, html } of pages) {
    const language = /<html\b[^>]*\blang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const text = words(language);
    const footer = /<footer\b[\s\S]*?<\/footer>/u.exec(html)?.[0] ?? "";
    const owner = text.licence.replace(/\s*:\s*CC BY 4\.0\.?$/u, "");
    assert.ok(owner !== text.licence, `${language}: the licence sentence no longer ends with the licence name`);
    const notice = /<a\b[^>]*#licence"[^>]*>([\s\S]*?)<\/a>/u.exec(footer)?.[1] ?? "";
    assert.ok(notice.includes(owner) && notice.includes("CC BY 4.0"), `${file}: missing scoped licence notice`);
    const first = file.split(path.sep)[0] ?? "";
    // Europe's page (/eu/) is no country: its footer links are the site's own.
    const root = /^[a-z]{2}$/u.test(first) && first !== "eu" ? `/${first}/` : "/";
    assert.ok(footer.includes(`href="${root}${text.aboutSlug}/#licence"`), `${file}: cannot inspect reuse conditions`);
    if (html.includes("<blockquote")) {
      assert.ok(html.includes(text.sourceRights), `${file}: quotations have no adjacent third-party rights notice`);
    }
  }
});

/**
 * Short entry-point explanations may use more width than running prose, and a search whose
 * index is still loading must not look like a small dialog stranded at the left edge.
 */
test("search fallback and primary controls are sized for the full content area", () => {
  const html = pages.find(({ file }) => file === path.join("search", "index.html"))?.html ?? "";
  assert.ok(html, "Europe search page was not built");
  const fallback = /<aside\b[^>]*data-search-fallback[^>]*>/u.exec(html)?.[0] ?? "";
  assert.match(fallback, /\bw-full\b/u, "search initial state is constrained to a narrow column");
  assert.doesNotMatch(fallback, /max-w-3xl/u);
  const form = /<div\b[^>]*data-field[^>]*>/u.exec(html)?.[0] ?? "";
  assert.match(form, /\bw-full\b/u, "loaded query controls must also use the available width");
});

test("on-page navigation wraps onto more lines instead of scrolling sideways, and is not pill buttons", () => {
  const html = pages.find(({ file }) => file === path.join("es", "index.html"))?.html ?? "";
  assert.ok(html, "Spanish country page was not built");
  const nav =
    [...html.matchAll(/<nav\b[^>]*data-pagefind-ignore[^>]*>[\s\S]*?<\/nav>/gu)]
      .map(([markup]) => markup)
      .find((markup) => markup.includes(`aria-label="${words("es").onThisPage}"`)) ?? "";
  assert.ok(nav, "the Spanish country page has no on-page navigation");
  // A sideways strip hides every link past the edge of a phone, with nothing to say they are there;
  // the audience is older readers with little digital practice, so every link must stay visible.
  assert.match(nav, /\bflex-wrap\b/u, "section navigation must wrap so every link is visible on a phone");
  assert.doesNotMatch(nav, /overflow-x-(?:auto|scroll)/u, "section navigation must never scroll sideways");
  assert.doesNotMatch(nav, /rounded-full/u, "section navigation must not become a second button menu");
});

// Reuse the same recognizable symbols as resource cards, rendered inline with no image fetch.
test("practical needs retain descriptive icons from the shared resource vocabulary", () => {
  const home = pages.find(({ file }) => file === "index.html")?.html ?? "";
  assert.ok(home, "Europe home page was not built");
  // The project's own two-tone set (src/icons/farm), one drawing per concept.
  for (const name of ["handover", "land", "funding", "training", "advice"]) {
    assert.ok(home.includes(`data-icon="farm/${name}"`), `the ${name} entry has no descriptive icon`);
  }
  assert.doesNotMatch(home, /src="\/img\/needs\//u, "retired illustrations must not be fetched");
});

/**
 * A list of countries read in one language names them in that language: "Germany" on the English home
 * page, not "Deutschland" next to English words, which a reader has to translate before they can choose
 * (founder, 17 Nov 2026). The place picker adds each country's own name on a quieter line, marked with
 * its language, because somebody looking for their own country recognises it first.
 */
test("country lists name each country in the page's language", () => {
  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "the home page was not built");
  const html = decodeHTML(home.html);
  const start = html.indexOf("territory-options");
  const picker = html.slice(start, html.indexOf("</ul>", start));
  const cards = html.match(/<ul\b[^>]*\bdata-country-cards\b[^>]*>[\s\S]*?<\/ul>/u)?.[0] ?? "";
  const english = new Intl.DisplayNames(["en"], { type: "region" });
  const published = Object.entries(catalogueJurisdictions as Record<string, { name: string; lang: string }>).filter(
    ([iso]) => iso !== "EU" && cards.includes(`href="/${iso.toLowerCase()}/"`),
  );
  assert.ok(published.length > 0, "no country card on the home page: this check would pass without checking anything");
  for (const [iso, { name, lang }] of published) {
    const label = english.of(iso)!;
    assert.ok(cards.includes(`>${label}<`), `${iso}: the home page's country card should read "${label}"`);
    assert.ok(picker.includes(label), `${iso}: the place picker should name "${label}"`);
    if (name === label) continue;
    assert.ok(!cards.includes(`>${name}<`), `${iso}: the English card shows "${name}", a name in another language`);
    assert.match(
      picker,
      new RegExp(`lang="${lang}"[^>]*>\\s*${name}\\s*<`, "u"),
      `${iso}: the picker should add "${name}" marked lang="${lang}"`,
    );
  }
});

/**
 * A territory page's description is what a result shows of it. Its summary is written for the page and ran
 * to 456 characters in France, so a result cut it mid-sentence; it now ends inside what a result shows.
 */
test("a territory page's description ends inside what a search result shows", () => {
  const territories = pages.filter(({ file }) => {
    const parts = file.split(path.sep);
    const iso = parts[0] ?? "";
    return /^[a-z]{2}$/u.test(iso) && (parts.length === 2 || parts[1] === regionSlug(iso.toUpperCase()));
  });
  assert.ok(territories.length > 100, `only ${territories.length} territory pages were checked`);
  for (const { file, html } of territories) {
    const description = decodeHTML(/<meta name="description" content="([^"]*)"/u.exec(html)?.[1] ?? "");
    assert.ok(description.length > 0, `${file} has no description`);
    assert.ok(description.length <= 160, `${file}: the description runs to ${description.length} characters, past what a result shows`);
  }
});

/**
 * French readers name a département by its number — `safer 29`, `rdi 22`, `commission des structures 59` —
 * and no French page carried one. The numbers come from the territory catalogue (Insee), and a record of a
 * whole region or of one département now shows them where search reads them.
 */
test("a region's search title fits a result once the site name is set aside", () => {
  // The site name trails every built title and may be cut; what comes before it is the part a reader
  // reads. Six French regions without a title of their own reached 104 characters of it.
  const long = readdirSync(DIST, { recursive: true, encoding: "utf8" })
    .filter((file) => /(^|\/)(regions|regiones|regioni|regionen|regioes|provincies)\/[^/]+\/index\.html$/u.test(file.replaceAll("\\", "/")))
    .map(
      (file) =>
        [
          file,
          decodeHTML(/<title>([^<]*)<\/title>/u.exec(readFileSync(path.join(DIST, file), "utf8"))?.[1] ?? "").replace(
            / · FarmSuccession$/u,
            "",
          ),
        ] as const,
    )
    .filter(([, title]) => title.length > 60);
  assert.deepEqual(long.slice(0, 3), [], `${long.length} region title(s) run past 60 characters before the site name`);
});

test("a French record and region page show the département numbers readers type", () => {
  const page = (route: string): string => readFileSync(path.join(DIST, route, "index.html"), "utf8");
  const region = page(path.join("fr", "regions", "bretagne"));
  assert.match(region, /<title>[^<]*\(22, 29, 35, 56\)/u, "the Bretagne page does not carry its département numbers in its title");
  const regional = decodeHTML(page(path.join("fr", "ressources", "bretagne-safer-bretagne")));
  assert.ok(regional.includes("(22, 29, 35, 56)"), "the Safer Bretagne record does not show the numbers of the départements it covers");
});
test("a territory list sizes each row to its own cards", () => {
  // In a territory list one card may hold an aid preview and a disclosure while its neighbours hold only a
  // name. A grid sizes each row to its own tallest card; a shared 1fr row height gives every row the
  // height of the tallest card in the whole list, and on a phone the Canary Islands, El Hierro and
  // Fuerteventura became boxes of empty space (about 1,500 px on the Spanish page). Record, country and
  // search cards keep their shared height on purpose: their contents are clamped to the same few lines.
  const css = readdirSync(path.join(DIST, "_astro"))
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(path.join(DIST, "_astro", file), "utf8"))
    .concat(pages.flatMap(({ html }) => [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gu)].map(([, rules]) => rules ?? "")))
    .join("\n");
  const sharedRows = [...css.matchAll(/([^{}]*\.territory-list[^{}]*)\{([^}]*)\}/gu)]
    .filter(([, , body]) => /grid-auto-rows:\s*1fr/u.test(body ?? ""))
    .map(([, selector]) => selector?.trim());
  assert.deepEqual(sharedRows, [], "territory-list rules that give every row the tallest card's height");
  const offenders = pages
    .filter(({ html }) => /<ul\b[^>]*class="[^"]*\bterritory-list\b[^"]*\bauto-rows-fr\b/u.test(html))
    .map(({ file }) => file);
  assert.deepEqual(offenders, [], "pages whose territory list gives every row the tallest card's height");
});
