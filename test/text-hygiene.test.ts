import assert from "node:assert/strict";
import { test } from "node:test";

import { loadTerritories } from "../src/territories.ts";
import { foreignLanguage, LANGUAGE_NAMES, textProblems } from "../src/text-hygiene.ts";

/** One problem of a document holding a single string, so a test reads as the rule it checks. */
const problem = (value: unknown, language = "es"): string => textProblems(value, language).join(" | ");

test("a control character or an invisible space is reported with its code point", () => {
  assert.match(problem({ summary: "Ayuda\u0007al relevo" }), /U\+0007/u);
  assert.match(
    problem({ summary: "Ayuda​al relevo" }),
    /U\+200B/u,
    "a zero-width space survives a copy from a web page and shows as nothing",
  );
  assert.match(problem({ summary: "Primera línea\nsegunda línea" }), /U\+000A.*one line/u);
  assert.equal(problem({ summary: "Ayuda al relevo generacional" }), "", "a no-break space is typography, not a stray character");
});

test("text decoded with the wrong encoding is reported as such, not as a typo", () => {
  assert.match(problem({ summary: "FormaciÃ³n agraria" }), /wrong encoding/u);
  assert.match(problem({ summary: "lâ€™exploitation agricole" }, "fr"), /wrong encoding/u, "a right quotation mark read as Windows-1252");
});

test("a string of only spaces is empty, however long it is", () => {
  assert.equal(problem({ summary: "   " }), "/summary: is empty");
});

test("markup and placeholders left in prose are reported, because the site shows text as written", () => {
  assert.match(problem({ summary: "Ayuda <br> al relevo" }), /markup "<br>"/u);
  assert.match(problem({ summary: "Ayuda **destacada** al relevo" }), /markup "\*\*"/u);
  assert.match(problem({ summary: "Ayuda&nbsp;al relevo" }), /markup "&nbsp;"/u);
  assert.match(problem({ summary: "Comprobar el importe (TODO)" }), /placeholder "TODO"/u);
});

test("a URL is checked as a URL, and a tracking link is not a citation", () => {
  assert.match(problem({ url: "https://example.test/ayuda?utm_source=boletin" }), /tracking or highlight part "\?utm_source="/u);
  assert.match(problem({ url: "https://example.test/la ayuda" }), /URL with a space/u);
  assert.equal(problem({ url: "https://example.test/ayuda?id=4" }), "");
});

test("a quote is left as the page wrote it", () => {
  const data = { resources: [{ sources: [{ quotes: ["La **ayuda**  se concede a jóvenes"] }] }] };
  assert.equal(problem(data), "", "spacing, markup and language rules would ask a researcher to rewrite a quotation");
  assert.match(problem({ resources: [{ sources: [{ quotes: ["La ayuda​ se concede"] }] }] }), /U\+200B/u);
});

test("a search query is typed, not read, so it keeps its own wording", () => {
  assert.equal(problem({ queries: [{ query: "banc de terres  cessió" }] }), "");
});

test("a problem is addressed by JSON pointer, so it can be found in any document", () => {
  const data = { resources: [{ id: "a" }, { id: "b", notes: "Nota  con dos espacios" }] };
  assert.equal(problem(data), "/resources/1/notes: has two spaces in a row");
});

test("prose left in another language of the catalogue is reported", () => {
  const english = "This page was not translated and still reads as English, which is what the check should catch";
  assert.match(problem({ summary: english }), /reads as English .*not Spanish/u);
  const italian = "La Regione pubblica il bando per i giovani agricoltori con una dotazione di 14 milioni di euro";
  assert.match(problem({ summary: italian }, "de"), /reads as Italian .*not German/u);
});

test("the particles of an official name are part of the name, not the language of the sentence", () => {
  const text = "La Xunta gestiona el Banco de Terras; la web da Consellería do Medio Rural publica las fincas.";
  assert.equal(foreignLanguage(text, "es"), undefined, "Spanish prose names Galician and Catalan bodies in their own language");
});

test("one shared word is not another language", () => {
  const german = "Das Seminarangebot ist eine Bildungsleistung des Trägers; es ist nicht gleichzusetzen.";
  assert.equal(foreignLanguage(german, "de"), undefined, '"es" is a German word as well as the Spanish article');
});

test("every language the real catalogue declares can be checked", () => {
  const territories = loadTerritories();
  for (const [code, jurisdiction] of Object.entries(territories.jurisdictions)) {
    assert.ok(
      LANGUAGE_NAMES[jurisdiction.lang],
      `${code} is written in "${jurisdiction.lang}", which has no name or word list, so its files would skip the language check in silence`,
    );
    assert.notEqual(foreignLanguage("x", jurisdiction.lang), null);
  }
});
