import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { loadSnapshots } from "../../src/editions.ts";
import { recordSlug } from "../public/search-scope.js";

test("configured European cross-references render once and lead to a national record in the same edition", () => {
  const { snapshots, problems } = loadSnapshots({});
  assert.deepEqual(problems, []);
  const current = snapshots
    .map(({ data }) => data.edition)
    .toSorted()
    .at(-1);
  for (const { data } of snapshots) {
    if (data.schemaId !== "country-snapshot" || !data.euCounterparts) continue;
    const europe = snapshots.find(({ data: other }) => other.schemaId === "eu-snapshot" && other.edition === data.edition);
    const cc = data.country.toLowerCase();
    const html =
      data.edition === current ? readFileSync(path.join(import.meta.dirname, "..", "dist", cc, "index.html"), "utf8") : undefined;
    const cards = html ? [...html.matchAll(/<li\b[^>]*class="[^"]*(?:resource-card|result-row)[^"]*"[^>]*>[\s\S]*?<\/li>/gu)] : [];
    for (const [euId, national] of Object.entries(data.euCounterparts)) {
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
