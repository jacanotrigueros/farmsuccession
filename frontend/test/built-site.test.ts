import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { recordSlug, regionSlug, SEARCH_SLUGS } from "../public/search-scope.js";
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
    if (html.includes("data-search")) allowed.add("/search.js");
    if (html.includes('class="apply')) allowed.add("/apply.js");
    if (html.includes("data-filter")) allowed.add("/filter.js");
    if (html.includes("data-report")) allowed.add("/report.js");

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

/**
 * The home page counts the drafts rather than warning about one file, because it is about all of them;
 * every page about a single territory or record carries the warning itself. Either way the claim has to
 * follow the data, which is the one thing a reader cannot check for themselves.
 */
test("a page says what has not been reviewed, and the count follows the data", () => {
  const editions = readdirSync(path.join(REPOSITORY, "data", "editions"))
    .toSorted()
    .toReversed();
  const edition = editions[0];
  assert.ok(edition, "no edition to render");

  const files = (function walk(dir: string): { review: { status: string } }[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".json") ? [JSON.parse(readFileSync(full, "utf8")) as { review: { status: string } }] : [];
    });
  })(path.join(REPOSITORY, "data", "editions", edition));
  const drafts = files.filter(({ review }) => review.status === "DRAFT").length;

  const home = pages.find(({ file }) => file === "index.html");
  assert.ok(home, "no home page was built");
  const said = /All (\d+) of its files are drafts|(\d+) of its (\d+) files are drafts/u.exec(home.html);
  assert.ok(said, "the home page does not say how much of the edition nobody has checked yet");
  const counted = Number(said[1] ?? said[2]);
  assert.equal(counted, drafts, `the home page says ${counted} drafts and the edition has ${drafts}`);

  const eu = pages.find(({ file }) => file === path.join("resources", "eu-cap-network-generational-renewal", "index.html"));
  assert.ok(eu, "no European record page was built");
  assert.ok(
    eu.html.includes(words("en").draftNotice),
    "a record page of a draft file does not carry the warning, which is the first thing its reader is owed",
  );
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
test("the page for an address that does not exist speaks every language of the site", () => {
  const notFound = pages.find(({ file }) => file === "404.html");
  assert.ok(notFound, "the build produced no 404 page: an unknown address would answer with nothing at all");

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
    assert.ok(
      notFound.html.includes(words(lang).notFoundText),
      `the 404 page does not say what happened in ${lang}. One file answers every unknown address on a site written in six languages, so it says it in all of them.`,
    );
  }
});

test("the sitemap lists every page the build produced, except the ones that ask not to be listed", () => {
  const xml = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const listed = new Set([...xml.matchAll(/<loc>https:\/\/farmsuccession\.eu([^<]*)<\/loc>/gu)].map(([, url]) => url ?? ""));
  const built = pages.filter(({ file }) => file.endsWith("index.html"));
  const asked = (html: string) => /<meta\s+name="robots"\s+content="noindex/u.test(html);
  const address = ({ file }: { file: string }) => `/${file.replace(/index\.html$/u, "")}`;

  const offered = built.filter(({ html }) => !asked(html)).map(address);
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

test("robots.txt sends a crawler to the sitemap and keeps nothing from it", () => {
  const robots = readFileSync(path.join(import.meta.dirname, "..", "public", "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/farmsuccession\.eu\/sitemap\.xml/u, "robots.txt does not say where the sitemap is");
  assert.doesNotMatch(
    robots,
    /Disallow: \/\s*$/mu,
    "robots.txt hides part of the site. Everything here is public evidence meant to be found.",
  );
});

/**
 * A title is what a search result and a shared link show, and for five milestones every territory page
 * offered the bare name of the place — "España — FarmSuccession" — which says nothing about what is on
 * it. It says what the page is about now, in the page's own language.
 */
test("a territory page says in its title what the page is about", () => {
  // A territory is a country page, or a page under that country's own segment for territories, and
  // nothing else: /de/ and /de/regionen/bayern/ are territories, /de/geschichte/ is a page of the site.
  const territories = pages.filter(({ file }) => {
    const parts = file.split(path.sep);
    const iso = parts[0] ?? "";
    if (!/^[a-z]{2}$/u.test(iso)) return false;
    return parts.length === 2 || parts[1] === regionSlug(iso.toUpperCase());
  });
  assert.ok(territories.length > 0, "no territory page was built: this check would pass without checking anything");

  for (const { file, html } of territories) {
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1] ?? "";
    const title = /<title>([^<]*)<\/title>/u.exec(html)?.[1] ?? "";
    const about = words(language).territoryTitle.replace("{where}", "").trim();
    assert.ok(
      title.includes(about),
      `${file} is titled "${title}", which is a name and not a subject. A reader meets this in a search result before they meet the page.`,
    );
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
        const own = says(text.ownRecords).test(heading.text) || heading.text.startsWith(flat(text.wholeCountryTitle));
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

    assert.ok(
      policy.includes("'wasm-unsafe-eval'"),
      `${file} forbids WebAssembly, and the search compiles it: every search page would fail to load its index`,
    );
  }
});
