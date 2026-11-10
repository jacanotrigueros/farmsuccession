import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

/**
 * The illustrated journeys and the recovery page may use transparency, but no invented colours.
 * Their hex values must come from the same brand and wheat tokens as the rest of the site.
 * SVGs are served as <img>, so CSS variables in the HTML cannot style their internals.
 */
const root = path.join(import.meta.dirname, "..");
const css = readFileSync(path.join(root, "src/styles/global.css"), "utf8");
const palette = new Set(
  [...css.matchAll(/--color-(?:brand|brand-strong|brand-tint|accent|accent-line|accent-tint|on-brand):\s*(#[\da-f]{6})/giu)].map(
    ([, color]) => color!.toLowerCase(),
  ),
);

test("illustrations reuse only the site's approved identity palette", () => {
  assert.ok(palette.size >= 7, "brand colour tokens were not found in global.css");
  for (const file of [
    "img/needs/handover.svg",
    "img/needs/land.svg",
    "img/needs/funding.svg",
    "img/needs/training.svg",
    "img/needs/advice.svg",
    "img/404-wayfinding.svg",
  ]) {
    const svg = readFileSync(path.join(root, "public", file), "utf8");
    assert.match(svg, /<svg\b/u, `${file} is not a vector illustration`);
    const colors = [...new Set([...svg.matchAll(/#[\da-f]{6}\b/giu)].map(([hex]) => hex.toLowerCase()))];
    assert.ok(colors.length > 1, `${file} is missing its illustration colours`);
    for (const color of colors) {
      assert.ok(palette.has(color), `${file} uses ${color}, which is not in the shared brand palette`);
    }
    assert.doesNotMatch(svg, /<script\b|https?:\/\//iu, `${file} must be a self-contained local asset`);
  }
});
