import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { searchPath, SEARCH_SLUGS } from "../public/search-scope.js";
import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
for (const country of Object.keys(SEARCH_SLUGS)) {
  const scope = country === "EU" ? undefined : country;
  const route = searchPath("/", scope);
  const html = readFileSync(path.join(DIST, route, "index.html"), "utf8");
  const language = /<html[^>]*lang="([^"]+)"/u.exec(html)?.[1];
  assert.ok(language, `${route}: no language for the fallback`);
  const text = words(language);

  test(`${route}: the inert status never claims to be loading without a script`, () => {
    const state = /<p\b([^>]*\bdata-state\b[^>]*)>([\s\S]*?)<\/p>/u.exec(html);
    assert.ok(state, `${route}: the enhanced search still needs its status slot`);
    assert.match(
      state[1]!,
      /\shidden(?:\s|$)/u,
      `${route}: a static page cannot finish loading an engine it never starts; keep the inert status hidden`,
    );
    assert.equal(state[2]?.trim(), "", `${route}: loading belongs to an actual engine request, not the fallback HTML`);
  });

  test(`${route}: the fallback discloses that URL terms and filters have not run and offers browsing`, () => {
    const fallback = /<aside\b([^>]*\bdata-search-fallback\b[^>]*)>([\s\S]*?)<\/aside>/u.exec(html);
    assert.ok(
      fallback,
      `${route}: a shared URL may contain q and territory, but static HTML has applied neither; say that before listing everything`,
    );
    assert.doesNotMatch(fallback[1]!, /\shidden(?:\s|$)/u, `${route}: the unrun-query warning must be visible before JavaScript works`);
    const body = decodeHTML(fallback[2]!);
    assert.ok(body.includes(text.searchNotRun), `${route}: use this page language's complete unrun-query explanation`);
    const browse = scope ? `/${scope.toLowerCase()}/#territories` : "/#countries";
    assert.ok(body.includes(`href="${browse}"`), `${route}: the fallback must lead to real territorial browsing, not another inert query`);
    assert.ok(
      body.includes(text.searchNeedsScript),
      `${route}: the no-script explanation must describe searching, not only filtering while typing`,
    );
    const everything = /<section\b[^>]*\bdata-everything\b[^>]*>([\s\S]*?)<\/section>/u.exec(html)?.[1];
    assert.ok(everything?.includes("data-record"), `${route}: the warning must keep the complete scoped catalogue available`);
  });
}
