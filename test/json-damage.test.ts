import assert from "node:assert/strict";
import { test } from "node:test";

import { jsonDamage } from "../src/json-damage.ts";

const damage = (content: string): string =>
  jsonDamage(content, "a.json")
    .map((found) => `${found.type}: ${found.message}`)
    .join(" | ");

test("a sound file reports nothing", () => {
  assert.equal(damage('{"id": "a", "sources": [{"url": "https://example.test/{not-a-brace}"}]}'), "");
});

test("a key repeated in one object is reported, because the parser keeps only the last", () => {
  const content = '{\n  "quotes": ["first"],\n  "url": "https://example.test/a",\n  "quotes": ["second"]\n}';
  assert.equal(JSON.parse(content).quotes[0], "second", "this is what the parser does, and why the check exists");
  assert.match(damage(content), /duplicate-key: key "quotes" is repeated in the same object at line 4/u);
});

test("the same key in two different objects is ordinary JSON", () => {
  assert.equal(damage('{"a": {"url": "x"}, "b": {"url": "y"}}'), "");
  assert.equal(damage('{"sources": [{"url": "x"}, {"url": "y"}]}'), "", "every item of a list has the same keys");
});

test("two spellings of one key are one key, the way the parser reads them", () => {
  const content = '{"quotes": ["first"], "\\u0071uotes": ["second"]}';
  assert.equal(JSON.parse(content).quotes[0], "second", "the parser spells the escape out and keeps the last value");
  assert.match(damage(content), /key "quotes" is repeated/u);
});

test("a string that is never closed does not hang the scan", () => {
  assert.match(damage('{"id": "a'), /invalid-json/u);
});

test("a key name that only appears as a value is not a key", () => {
  assert.equal(damage('{"note": "the url field was empty", "url": "https://example.test/a"}'), "");
});

test("a duplicate deep inside the document is found", () => {
  const content = '{"resources": [{"id": "a", "metrics": [{"value": 1, "unit": "EUR", "value": 2}]}]}';
  assert.match(damage(content), /key "value" is repeated/u);
});

test("a pasted fragment after the end of the document says where the document ended", () => {
  const content = '{\n  "id": "a"\n}\n{\n  "id": "a-again"\n}\n';
  assert.match(damage(content), /invalid-json: not readable JSON/u);
  assert.match(
    damage(content),
    /trailing-content: a complete value ends at line 3 and \d+ more characters follow it, starting: \{ "id": "a-again"/u,
  );
});

test("a file that does not parse at all is reported once, with the parser's own words", () => {
  const content = '{\n  "id": "a",\n}';
  assert.match(damage(content), /^invalid-json: not readable JSON: /u);
  assert.doesNotMatch(damage(content), /trailing-content/u, "there is nothing after it; the fault is inside");
});
