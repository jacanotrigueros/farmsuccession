import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { decodeHTML } from "entities";

import { words } from "../src/lib/words.ts";

const DIST = path.join(import.meta.dirname, "..", "dist");
function pages(dir = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? pages(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

test("the rendered call-state separator belongs to the page's language, not to the template", () => {
  const checked = new Set<string>();
  for (const file of pages()) {
    const html = decodeHTML(readFileSync(file, "utf8"));
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1];
    if (!language) continue;
    const text = words(language);
    if (!html.includes(text.asConsulted)) continue;
    checked.add(language);
    assert.ok(
      html.includes(text.asConsulted + text.labelSeparator),
      `${file}: the call-state template wrote its own colon. French needs the non-breaking space before it, even when every string-table test passes.`,
    );
  }
  assert.ok(checked.has("fr"), "no French call states checked: a correct table cannot prove that the rendered separator uses it");
});
