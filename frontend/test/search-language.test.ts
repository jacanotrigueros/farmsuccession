import assert from "node:assert/strict";
import { test } from "node:test";

import { words } from "../src/lib/words.ts";

for (const language of ["en", "es", "de", "fr", "it", "pt"]) {
  test(`${language}: the unfiltered search counts records, not current availability`, () => {
    assert.doesNotMatch(
      words(language).available.join(" "),
      /available|verfügbar|disponible|disponibili|disponível|disponíveis/iu,
      `${language}: the search includes announced, historical and unconfirmed records; decisions 015 and 019 do not let their count promise availability. Describe what the directory contains, as the English and Spanish versions already do.`,
    );
  });
  test(`${language}: the method explains searching without engine terminology`, () => {
    assert.doesNotMatch(
      words(language).methodLead,
      /\bquery\b/iu,
      `${language}: explain the words a reader searches for; "query" adds engine terminology to a first visit without adding meaning`,
    );
  });
}
