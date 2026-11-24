import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { loadSnapshots } from "../../src/editions.ts";
import { recordSlug } from "../public/search-scope.js";

test("a national record that applies a European measure is named once on that measure's card on its country page", () => {
  const { snapshots, problems } = loadSnapshots({});
  assert.deepEqual(problems, []);
  const current = snapshots
    .map(({ data }) => data.edition)
    .toSorted()
    .at(-1);
  for (const { data } of snapshots) {
    if (data.schemaId !== "country-snapshot") continue;
    const applied = new Map<string, string[]>();
    for (const resource of data.resources) {
      for (const { resourceId } of resource.implements ?? []) applied.set(resourceId, [...(applied.get(resourceId) ?? []), resource.id]);
    }
    if (applied.size === 0) continue;
    const europe = snapshots.find(({ data: other }) => other.schemaId === "eu-snapshot" && other.edition === data.edition);
    const cc = data.country.toLowerCase();
    const html =
      data.edition === current ? readFileSync(path.join(import.meta.dirname, "..", "dist", cc, "index.html"), "utf8") : undefined;
    const cards = html ? [...html.matchAll(/<li\b[^>]*class="[^"]*(?:resource-card|result-row)[^"]*"[^>]*>[\s\S]*?<\/li>/gu)] : [];
    for (const [euId, national] of applied) {
      assert.ok(
        europe?.data.resources.some(({ id }) => id === euId),
        `${data.edition}: no European record ${euId}`,
      );
      const card = cards.find(([markup]) => markup.includes(`href="/resources/${euId}/"`))?.[0];
      if (html) assert.ok(card, `${cc}: missing European card ${euId}`);
      for (const id of national) {
        assert.ok(
          data.resources.some((resource) => resource.id === id),
          `${euId}: ${cc} has no record ${id}`,
        );
        if (!card) continue;
        const target: string = `href="/${cc}/${recordSlug(data.country)}/${id}/"`;
        const links = [...card.matchAll(/<p\b[^>]*data-counterpart[^>]*>[\s\S]*?<\/p>/gu)];
        assert.equal(
          links.filter(([link]): boolean => link.includes(target)).length,
          1,
          `${cc}: missing or repeated ${euId} cross-reference`,
        );
      }
    }
  }
});
