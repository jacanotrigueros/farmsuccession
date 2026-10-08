import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { words } from "../src/lib/words.ts";

/**
 * What a record page owes a reader.
 *
 * The promises here are the ones this project exists for: every record the data holds is reachable, every
 * claim on its page is followed by the page it came from, the words quoted from that page are the words
 * that were on it, and nothing a reader sees is a code from the schema. Each of them is the kind of promise
 * that is broken by an ordinary edit months later — a field printed directly instead of through its label,
 * a quote shortened to fit a layout — so each is a test rather than an intention.
 */
const DIST = path.join(import.meta.dirname, "..", "dist");
const REPOSITORY = path.join(import.meta.dirname, "..", "..");
const EDITIONS = path.join(REPOSITORY, "data", "editions");

type Source = { url: string; title: string; consultedOn: string; quotes: string[] };
type Resource = { id: string; name: string; sources: Source[]; calls?: unknown[] };
type Snapshot = { schemaId: string; country?: string; region?: string; hub?: string; resources: Resource[] };

const edition = readdirSync(EDITIONS).toSorted().toReversed()[0];
assert.ok(edition, "no edition to render");

function snapshots(dir: string): Snapshot[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return snapshots(full);
    return entry.name.endsWith(".json") ? [JSON.parse(readFileSync(full, "utf8")) as Snapshot] : [];
  });
}

/** Where the site puts a record: one address that names the record and nothing else. */
const recordDirectory = (id: string): string => path.join("resources", id);

const built = snapshots(path.join(EDITIONS, edition)).flatMap((snapshot) =>
  snapshot.resources.map((resource) => ({
    resource,
    directory: recordDirectory(resource.id),
  })),
);

/** The same escaping the renderer applies to text, so a quote can be compared against the markup. */
const escaped = (text: string): string =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

const pageOf = (directory: string): string => readFileSync(path.join(DIST, directory, "index.html"), "utf8");

test("every record the data holds has a page of its own", () => {
  assert.ok(built.length > 0, "no records in the newest edition: nothing to check");
  for (const { resource, directory } of built) {
    assert.doesNotThrow(
      () => pageOf(directory),
      `${resource.id} has no page at /${directory.replaceAll(path.sep, "/")}/: a record a list links to has to exist`,
    );
  }
});

test("a record page quotes its sources word for word", () => {
  for (const { resource, directory } of built) {
    const html = pageOf(directory);
    for (const source of resource.sources) {
      assert.ok(html.includes(escaped(source.url)), `${resource.id} does not print the address of ${source.url}`);
      for (const quote of source.quotes) {
        assert.ok(
          html.includes(escaped(quote)),
          `${resource.id} does not carry this quote as it was copied: "${quote}". A quote shortened to fit a layout stops being evidence, because nobody can search the page for it any more.`,
        );
      }
    }
  }
});

test("a record page never folds its evidence away behind something a reader has to open", () => {
  for (const { resource, directory } of built) {
    const html = pageOf(directory);
    const opened = html.indexOf('id="evidence"');
    const evidence = html.slice(opened, html.indexOf("</section>", opened));
    assert.doesNotMatch(
      evidence,
      // A disclosure widget, the `hidden` attribute, or a class that takes an element out of the page.
      // Not `aria-hidden`, which is how a decorative copy of a number is kept from being read out twice.
      /<details\b|\shidden(?=[\s>])|class="[^"]*\bhidden\b/iu,
      `${resource.id} hides part of its evidence: the quotes are the proof, and a reader should not have to ask for them`,
    );
  }
});

/**
 * The phrase a page uses for this is read from the site's own words, in the language the page declares,
 * rather than listed here: the catalogue gains a language with every country, and a test naming the
 * phrasings it happens to know would pass for those and say nothing at all about the new one.
 */
test("a dated application period always says which page said so, and when it was read", () => {
  for (const { resource, directory } of built) {
    if (!resource.calls || resource.calls.length === 0) continue;
    const html = pageOf(directory);
    const language = /<html lang="([^"]+)"/u.exec(html)?.[1];
    assert.ok(language, `${directory} does not declare the language it is written in`);
    const dates = html.slice(html.indexOf('id="dates"'), html.indexOf('id="access"'));
    assert.ok(
      dates.includes(words(language).recordedOn),
      `${resource.id} states an application period without the date its source was read. A yearly edition cannot say whether something is open today; it can only say what a page said on a day.`,
    );
  }
});

test("no code from the schema reaches a reader", () => {
  const schema: unknown = JSON.parse(readFileSync(path.join(REPOSITORY, "schema", "edition.schema.json"), "utf8"));
  const codes = new Set<string>();
  const collect = (node: unknown): void => {
    if (Array.isArray(node)) return void node.forEach(collect);
    if (node === null || typeof node !== "object") return;
    const values = (node as { enum?: unknown }).enum;
    if (Array.isArray(values)) {
      for (const value of values) if (typeof value === "string" && /^[A-Z][A-Z_]+$/u.test(value)) codes.add(value);
    }
    Object.values(node).forEach(collect);
  };
  collect(schema);
  // "EU" is a code *and* how ordinary prose writes the European Union, and the records are full of the
  // second one. Anything else that turns out to be both belongs here too, with the reason it is both.
  codes.delete("EU");
  assert.ok(codes.size > 0, "no codes found in the schema: this check would pass without checking anything");

  const pages = (function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith(".html") ? [full] : [];
    });
  })(DIST);

  for (const file of pages) {
    // What a reader sees, which is the text between the tags. A code inside an attribute is a hook for a
    // machine — a filter value, the state a script re-reads — and no reader is ever shown one.
    const html = readFileSync(file, "utf8").replaceAll(/<[^>]*>/gu, " ");
    for (const code of codes) {
      assert.doesNotMatch(
        html,
        new RegExp(`\\b${code}\\b`, "u"),
        `${path.relative(DIST, file)} prints ${code}. The schema holds codes so a check can reason about them; a reader is handed words, from vocabulary.ts.`,
      );
    }
  }
});
