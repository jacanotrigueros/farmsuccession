import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { loadSnapshots } from "../src/editions.ts";
import { hostOf, loadSourceTerms, refuses } from "../src/source-terms.ts";
import type { SourceTerms } from "../src/types/source-terms.ts";

/**
 * The site tells a reader, in six languages, that an organisation which does not want to appear can
 * ask to be taken out. These are what stands behind that sentence. A register nobody checks is a
 * promise nobody keeps, and the first time this came up the answer was to delete the record and the
 * trace of having looked along with it.
 */

const register = loadSourceTerms();

/** Everywhere a published record puts an address in front of a reader. */
function citedUrls(): { where: string; url: string }[] {
  const { snapshots, problems } = loadSnapshots({ edition: "2026" });
  assert.deepEqual(problems, [], "an edition file that will not load cannot be checked against the register");
  return snapshots.flatMap(({ file, data }) =>
    (data.resources ?? []).flatMap((resource) =>
      [resource.accessUrl, ...(resource.sources ?? []).map((source) => source.url), ...(resource.calls ?? []).map((call) => call.sourceUrl)]
        .filter((url): url is string => typeof url === "string" && url !== "")
        .map((url) => ({ where: `${file}#${resource.id}`, url })),
    ),
  );
}

test("the register is readable, and no host is read twice", () => {
  assert.ok(register.sources.length > 0, "an empty register proves nothing: it is the same as not having one");
  for (const reading of register.sources) {
    if (reading.ground !== "TERMS") continue;
    assert.ok(reading.quote, `${reading.host}: a reading of a document has to quote it, or nobody can check it`);
    assert.ok(reading.termsUrl, `${reading.host}: a reading of a document has to name it`);
  }
});

test("no published record sends a reader to a source this project may not quote", () => {
  const cited = citedUrls();
  assert.ok(cited.length > 900, `only ${cited.length} addresses were checked; the corpus is larger than that`);
  const broken = cited.map(({ where, url }) => ({ where, url, reading: refuses(register, url) })).filter(({ reading }) => reading !== null);
  assert.deepEqual(
    broken.map(({ where, url }) => `${where} cites ${url}`),
    [],
    "a record cites a host whose own terms do not permit the quoting every record here rests on",
  );
});

test("the check is not vacuous: it finds a host the corpus really does cite", () => {
  const cited = citedUrls();
  const someHost = hostOf(cited[0]!.url);
  assert.ok(someHost, "the first cited address has no host, so this test cannot prove anything");
  const pretend: SourceTerms = {
    purpose: register.purpose,
    sources: [
      {
        host: someHost,
        uses: { quote: "PERMITTED", link: "NOT_PERMITTED", extract: "UNKNOWN" },
        ground: "REQUEST_WITHDRAWAL",
        finding: "A host invented for this test only.",
        readOn: "2026-10-18",
      },
    ],
  };
  const caught = cited.filter(({ url }) => refuses(pretend, url) !== null);
  assert.ok(caught.length > 0, `a register refusing ${someHost} caught nothing, so the real one would catch nothing either`);
});

test("a permission is not a refusal, and a refusal reaches a subdomain", () => {
  const pretend: SourceTerms = {
    purpose: register.purpose,
    sources: [
      {
        host: "allowed.example",
        uses: { quote: "PERMITTED", link: "PERMITTED", extract: "UNKNOWN" },
        ground: "REQUEST_WITHDRAWAL",
        finding: "Both uses permitted, for this test only.",
        readOn: "2026-10-18",
      },
      {
        host: "refused.example",
        uses: { quote: "PERMITTED", link: "NOT_PERMITTED", extract: "UNKNOWN" },
        ground: "REQUEST_WITHDRAWAL",
        finding: "Quoting permitted and linking refused, which is the shape a single verdict could not say.",
        readOn: "2026-10-18",
      },
    ],
  };
  assert.equal(refuses(pretend, "https://allowed.example/a"), null, "a host that permits both uses was treated as a refusal");
  assert.ok(
    refuses(
      {
        purpose: register.purpose,
        sources: [{ ...pretend.sources[0]!, uses: { quote: "UNKNOWN", link: "PERMITTED", extract: "UNKNOWN" } }],
      },
      "https://allowed.example/a",
    ),
    "a use nobody read is not permission, and must not pass as one",
  );
  assert.ok(refuses(pretend, "https://www.refused.example/a"), "a leading www made a refused host look like a different one");
  assert.ok(refuses(pretend, "https://news.refused.example/a"), "a refusal of a site has to reach the subdomains of that site");
  assert.equal(
    refuses(pretend, "https://refused.example.org/a"),
    null,
    "a host that merely starts the same way is a different organisation",
  );
  assert.equal(refuses(pretend, "not a url"), null, "an unparseable address should be ignored here, not treated as refused");
});

test("one host, one reading", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "terms-"));
  const file = path.join(dir, "source-terms.json");
  writeFileSync(
    file,
    JSON.stringify({
      purpose: register.purpose,
      sources: [
        {
          host: "twice.example",
          uses: { quote: "PERMITTED", link: "PERMITTED", extract: "UNKNOWN" },
          ground: "REQUEST_WITHDRAWAL",
          finding: "Read once, for this test only.",
          readOn: "2026-10-18",
        },
        {
          host: "twice.example",
          uses: { quote: "PERMITTED", link: "NOT_PERMITTED", extract: "UNKNOWN" },
          ground: "REQUEST_WITHDRAWAL",
          finding: "Read again, for this test only.",
          readOn: "2026-10-18",
        },
      ],
    }),
  );
  assert.throws(() => loadSourceTerms(file), /read twice/u, "two readings of one host leave it ambiguous which one governs");
});
