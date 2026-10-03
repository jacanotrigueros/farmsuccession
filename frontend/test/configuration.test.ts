import assert from "node:assert/strict";
import { test } from "node:test";

import config from "../astro.config.mjs";

test("no image may be fetched from anywhere, which is what makes the one open advisory unreachable", () => {
  // Astro reaches http-cache-semantics — CVE-2026-93748, high, no patched version in any release — from
  // exactly one file, the build-time cache for remote images. Both lists empty means that file cannot run.
  // If a remote image is ever needed, this test is the place where somebody has to decide again, with the
  // reasoning in decisions/017.
  assert.deepEqual(config.image?.domains, [], "a remote image domain would make the advisory reachable at build time");
  assert.deepEqual(config.image?.remotePatterns, [], "a remote image pattern would make the advisory reachable at build time");
});

test("the site is static, and says so where it cannot drift", () => {
  assert.equal(config.output ?? "static", "static", "a server would make this site a request handler, which it is not");
  assert.equal(config.site, "https://farmsuccession.eu", "canonical URLs and the sitemap come from here");
  assert.equal(config.trailingSlash, "always", "one shape of URL, so a link cannot be right on one host and wrong on another");
});

test("nothing adds a client runtime", () => {
  // An integration is the usual way framework JavaScript arrives on a page, so the list is named rather
  // than merely counted: astro-icon writes each icon into the markup while the site is built and leaves
  // nothing behind it. Whatever is added here next has to be read the same way before it is allowed in.
  const names = (config.integrations ?? []).flat(9).map((integration) => (integration ? integration.name : ""));
  assert.deepEqual(names, ["astro-icon"], "an integration is the usual way framework JavaScript arrives on a page");
  assert.equal(config.prefetch ?? false, false, "prefetching spends a rural connection on pages nobody asked for");
});
