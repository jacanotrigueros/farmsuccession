import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import type { EditionSnapshot } from "../../src/types/edition.ts";
import { regionSlug } from "../public/search-scope.js";
import { dateIn } from "../src/lib/language.ts";

const ROOT = path.join(import.meta.dirname, "..", "..");
const DIST = path.join(ROOT, "frontend", "dist");
const editions = path.join(ROOT, "data", "editions");
const edition = readdirSync(editions).toSorted().at(-1);
assert.ok(edition, "no edition: a news check over nothing would prove nothing");
function read(dir: string): EditionSnapshot[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? read(file)
      : entry.name.endsWith(".json")
        ? [JSON.parse(readFileSync(file, "utf8")) as EditionSnapshot]
        : [];
  });
}
const snapshots = read(path.join(editions, edition));

test("standalone news remains news and reaches its own territory with its full evidence", () => {
  let checked = 0;
  for (const snapshot of snapshots) {
    const standalone = snapshot.news.filter((item) => !item.resourceIds?.length);
    if (!standalone.length) continue;
    const inside = "region" in snapshot ? snapshot.region : "hub" in snapshot ? snapshot.hub : undefined;
    const country = "country" in snapshot ? snapshot.country : undefined;
    const route = country ? `${country.toLowerCase()}/${inside ? `${regionSlug(country)}/${inside}/` : ""}` : "";
    const html = readFileSync(path.join(DIST, route, "index.html"), "utf8");
    for (const item of standalone) {
      checked++;
      const article = new RegExp(`<article\\b[^>]*id="news-${item.id}"[^>]*>([\\s\\S]*?)</article>`, "u").exec(html)?.[1];
      assert.ok(
        article,
        `${item.id}: sourced news without a resource association needs a visible article on /${route}; decision 016 must not become unpublished evidence`,
      );
      const text = decodeHTML(article);
      for (const claim of [item.headline, item.summary, dateIn(item.date, snapshot.metadata.language)]) {
        assert.ok(text.includes(claim), `${item.id}: standalone news lost its headline, summary or dated event`);
      }
      for (const source of item.sources) {
        for (const evidence of [source.url, source.title, dateIn(source.consultedOn, snapshot.metadata.language), ...source.quotes]) {
          assert.ok(
            text.includes(evidence),
            `${item.id}: news must carry its source, consultation date and unabridged quotes: ${evidence}`,
          );
        }
      }
      assert.doesNotMatch(article, /<details\b|\shidden(?=[\s>])/u, `${item.id}: evidence must be visible without opening a control`);
      assert.ok(
        !snapshot.resources.some((resource) => resource.id === item.id),
        `${item.id}: reporting an event must not invent a service`,
      );
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/gu)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${route}: news evidence must not reuse another article's source anchors`);
    assert.ok(html.includes('href="#news"'), `${route}: the in-page index must lead to the standalone news it now publishes`);
  }
  assert.ok(checked > 0, "no standalone news checked: this regression would prove nothing");
});
