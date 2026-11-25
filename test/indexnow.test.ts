import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { INDEXNOW_KEY, SITE, sitemapUrls, submission } from "../scripts/indexnow.ts";
import { ROOT } from "../src/paths.ts";

test("the IndexNow key the script sends is the file the site publishes", () => {
  // The engines fetch /<key>.txt and compare it with the key in the request; a mismatch rejects every
  // submission, silently from the reader's side.
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/u, "an IndexNow key is 8 to 128 characters of a-z, A-Z, 0-9 and dashes; this one is 32 hex");
  const file = path.join(ROOT, "frontend", "public", `${INDEXNOW_KEY}.txt`);
  assert.ok(existsSync(file), `frontend/public/${INDEXNOW_KEY}.txt is missing, so the key cannot be verified`);
  assert.equal(readFileSync(file, "utf8").trim(), INDEXNOW_KEY, "the key file holds another key than the script sends");
});

test("a submission names this site and only its pages", () => {
  const xml = `<urlset><url><loc>${SITE}/</loc></url><url><loc>${SITE}/fr/</loc></url><url><loc>https://elsewhere.example/x</loc></url></urlset>`;
  const urls = sitemapUrls(xml);
  assert.deepEqual(urls, [`${SITE}/`, `${SITE}/fr/`], "a URL of another host would make the engines refuse the whole request");
  const body = submission(urls);
  assert.equal(body.host, "farmsuccession.eu");
  assert.equal(body.keyLocation, `${SITE}/${INDEXNOW_KEY}.txt`);
});

test("the site is announced only after it is published, from the publish workflow alone", () => {
  const workflow = readFileSync(path.join(ROOT, ".github", "workflows", "publish.yml"), "utf8");
  const notify = workflow.indexOf("node scripts/indexnow.ts");
  assert.ok(notify > 0, "publishing does not tell IndexNow, so a new edition waits on a crawl");
  assert.ok(notify > workflow.indexOf("actions/deploy-pages"), "IndexNow is told before the pages it names exist");
  const checks = readFileSync(path.join(ROOT, ".github", "workflows", "checks.yml"), "utf8");
  assert.ok(!checks.includes("indexnow"), "the checks on a pull request must not announce anything");
});
