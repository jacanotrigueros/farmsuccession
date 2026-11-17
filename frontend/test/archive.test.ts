/**
 * Retired editions stay readable under /<edition>/ (decisions/038). These tests pin how a published page
 * becomes an archived one, on a small case and on a real page of the current build, and what
 * archives.json may list.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { archivedAddress, archivePage, leftOut } from "../scripts/archive.ts";

const FRONTEND = path.join(import.meta.dirname, "..");
const notice = { edition: "2026", path: "/es/", notice: "This is the 2026 edition.", link: "Go to the current edition" };

test("an archived page keeps readers inside its edition, except for the search", () => {
  assert.equal(archivedAddress("/es/regiones/galicia/", "2026"), "/2026/es/regiones/galicia/");
  assert.equal(archivedAddress("/_astro/page.css", "2026"), "/2026/_astro/page.css");
  assert.equal(
    archivedAddress("/es/buscar/?kind=TRAINING", "2026"),
    "/es/buscar/?kind=TRAINING",
    "an archived search would send readers out of the archive unannounced",
  );
  assert.equal(archivedAddress("/search/", "2026"), "/search/");
  assert.equal(archivedAddress("https://example.org/a", "2026"), "https://example.org/a");
  assert.equal(archivedAddress("//cdn.example.org/a", "2026"), "//cdn.example.org/a");
  assert.equal(archivedAddress("#own", "2026"), "#own");
});

test("an archived page asks not to be indexed, names no canonical, and opens with the notice", () => {
  const html =
    '<html lang="es"><head><link rel="canonical" href="https://farmsuccession.eu/es/"><link rel="alternate" hreflang="de" href="/de/">' +
    '<meta name="robots" content="index"></head><body class="x"><a href="/es/recursos/a/">A</a><img src="/img/a.webp" srcset="/img/a.webp 1x, /img/b.webp 2x"></body></html>';
  const archived = archivePage(html, notice);
  assert.doesNotMatch(archived, /rel="canonical"|rel="alternate"/u, "the current edition is the one search engines should offer");
  assert.match(archived, /<meta name="robots" content="noindex">/u);
  assert.equal((archived.match(/name="robots"/gu) ?? []).length, 1, "two robots instructions contradict each other");
  assert.match(
    archived,
    /<body class="x"><div class="fs-archive" role="note"><p>This is the 2026 edition\. <a href="\/es\/">Go to the current edition<\/a><\/p><\/div>/u,
  );
  assert.match(archived, /<link rel="stylesheet" href="\/archive\.css">/u, "the notice is styled by the current site's own stylesheet");
  assert.match(archived, /href="\/2026\/es\/recursos\/a\/"/u);
  assert.match(archived, /srcset="\/2026\/img\/a\.webp 1x, \/2026\/img\/b\.webp 2x"/u);
  assert.doesNotMatch(archived, /\sstyle="/u, "an inline style would break the Content-Security-Policy (decisions/034)");
});

test("an archive leaves out the search and what belongs to the whole site", () => {
  for (const file of [
    "sitemap.xml",
    "robots.txt",
    "CNAME",
    "404.html",
    "pagefind/pagefind.js",
    "search/index.html",
    "es/buscar/index.html",
  ])
    assert.ok(leftOut(file), `${file} must not be archived`);
  for (const file of ["index.html", "es/index.html", "es/regiones/galicia/index.html", "_astro/page.css"])
    assert.ok(!leftOut(file), `${file} must be archived`);
});

test("a real page of this build, archived, has no internal link outside its edition but the search", () => {
  const built = path.join(FRONTEND, "dist", "es", "index.html");
  assert.ok(existsSync(built), "build the site before testing: the Spanish country page is missing");
  const archived = archivePage(readFileSync(built, "utf8"), notice);
  const escaping = [...archived.matchAll(/\b(?:href|src|action)="(\/[^/"][^"]*)"/gu)]
    .map(([, address]) => address!)
    .filter(
      (address) =>
        !address.startsWith("/2026/") &&
        address !== "/archive.css" &&
        address !== notice.path && // the notice's own link to the current edition
        !/^\/(?:[a-z]{2}\/)?(?:search|buscar|rechercher|cerca|pesquisar|suchen)\//u.test(address) &&
        !address.startsWith("/pagefind/"),
    );
  assert.deepEqual(escaping, [], "these links would take a reader of the archive into the current edition without saying so");
});

test("archives.json lists only editions older than the current one, each with the tag that published it", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the repository's own file, checked right here
  const { archives } = JSON.parse(readFileSync(path.join(FRONTEND, "archives.json"), "utf8")) as {
    archives: Array<{ edition: string; tag: string }>;
  };
  const current =
    readdirSync(path.join(FRONTEND, "..", "data", "editions"))
      .toSorted()
      .at(-1) ?? "";
  for (const { edition, tag } of archives) {
    assert.match(edition, /^\d{4}$/u, `${edition}: an edition is a year`);
    assert.ok(edition < current, `${edition}: the current edition (${current}) is published at the site's own addresses, not archived`);
    assert.match(tag, /^v\d+\.\d+\.\d+$/u, `${edition}: an archive is rebuilt from a release tag, not from a branch that moves`);
  }
  assert.equal(new Set(archives.map(({ edition }) => edition)).size, archives.length, "an edition archived twice");
});
