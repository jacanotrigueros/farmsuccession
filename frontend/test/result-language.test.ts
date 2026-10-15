import assert from "node:assert/strict";
import { test } from "node:test";

import { setResultLanguage } from "../public/result-description.js";

/** A unit-level attribute sink, not a browser or an assertion about a screen reader's voice. */
function row() {
  const nodes = new Map(
    ["link", "excerpt", "operator", "area", "kind", "status"].map((part) => {
      const attributes = new Map<string, string>();
      return [
        `[data-result-${part}]` as string,
        {
          attributes,
          setAttribute: (name: string, value: string) => {
            attributes.set(name, value);
          },
        },
      ] as const;
    }),
  );
  return { nodes, querySelector: (selector: string) => nodes.get(selector) ?? null };
}

for (const language of ["en", "es", "de", "fr", "it", "pt"]) {
  test(`${language}: a live result labels source prose without changing translated interface labels`, () => {
    const result = row();
    setResultLanguage(result, { meta: { language } });
    for (const part of ["link", "excerpt", "operator", "area"]) {
      assert.equal(
        result.nodes.get(`[data-result-${part}]`)?.attributes.get("lang"),
        language,
        `${part}: the reader's search language is not necessarily the record's language`,
      );
    }
    for (const part of ["kind", "status"]) {
      assert.equal(
        result.nodes.get(`[data-result-${part}]`)?.attributes.size,
        0,
        `${part}: interface labels stay in the search page's language`,
      );
    }
  });
}

test("missing record-language metadata is unknown, rather than guessed from the page", () => {
  const result = row();
  setResultLanguage(result, {});
  assert.equal(
    result.nodes.get("[data-result-excerpt]")?.attributes.get("lang"),
    "",
    "an empty lang marks an unknown language; omitting it silently inherits the wrong page language",
  );
});

test("separating served-area prose preserves the complete visible place", async () => {
  const { resourcePlace, resourcePlaceParts } = await import("../public/resource-place.js");
  for (const separator of [": ", "\u00a0: "]) {
    for (const area of [undefined, "", "Seis zonas regables", "<district>"]) {
      const parts = resourcePlaceParts("España · Extremadura", area, "Scope", separator);
      assert.equal(
        parts.label + parts.area,
        resourcePlace("España · Extremadura", area, "Scope", separator),
        "adding language boundaries must preserve the documented area and the interface’s own separator",
      );
      assert.equal(parts.area, area ?? "", "the source area must not absorb translated labels or be interpreted as HTML");
    }
  }
});
