import assert from "node:assert/strict";
import { test } from "node:test";

import { looksLikeBotChallenge, looksLikeSoftNotFound, matchQuote, normalizeHtml, normalizePlainText } from "../src/sources/document.ts";

/** Whether a quote recorded earlier is still found on this page. */
const finds = (html: string, quote: string): "text" | "raw" | null => matchQuote(normalizeHtml(html), quote).foundIn;

test("a quote is matched against what a reader sees, not the markup around it", () => {
  assert.equal(finds("<p>El <b>Banco</b> de Terras publica as fincas</p>", "El Banco de Terras publica as fincas"), "text");
  assert.equal(finds("<p>Le 1<sup>er</sup> janvier 2026</p>", "Le 1er janvier 2026"), "text", "a superscript renders inside the word");
  assert.equal(finds("<p><strong>Banco</strong>s de terras</p>", "Bancos de terras"), "text");
});

test("a quote may run from one block of the page into the next", () => {
  assert.equal(
    finds("<h2>Ayudas</h2><p>para jóvenes agricultores</p>", "Ayudas para jóvenes agricultores"),
    "text",
    "pages split a sentence across blocks for styling, so refusing this would fail quotes a reader reads as one line",
  );
});

test("a page's own scripts and styles are not its text", () => {
  const html = "<style>.a{content:'Banco de Terras'}</style><script>var x='Banco de Terras'</script><p>Otra cosa</p>";
  assert.equal(normalizeHtml(html).text, "Otra cosa");
  assert.equal(finds(html, "Banco de Terras"), "raw", "it is still in the markup, which is where the match is reported from");
});

test("entities and invisible characters are read the way a browser shows them", () => {
  assert.equal(finds("<p>Xunta&nbsp;de&nbsp;Galicia</p>", "Xunta de Galicia"), "text");
  assert.equal(finds("<p>Terras &amp; Montes</p>", "Terras & Montes"), "text");
  assert.equal(finds("<p>Über­gän­ge</p>", "Übergänge"), "text", "a soft hyphen is a line-break hint");
  assert.equal(finds("<p>Banco\n   de    Terras</p>", "Banco de Terras"), "text", "a line break in the source is a space");
});

test("a difference a reader would notice is a difference", () => {
  assert.equal(finds("<p>PECHADO</p>", "Pechado"), "text", "a portal restyling a heading has not lost the claim");
  assert.equal(finds("<p>2026-2027</p>", "2026–2027"), null, "a hyphen is not an en dash");
  assert.equal(finds("<p>Formacion agraria</p>", "Formación agraria"), null, "a missing accent may be a transcription error");
});

test("evidence that lives in an attribute is still evidence", () => {
  const html = '<a href="/docs/orden-2026-05-04.pdf">Descargar</a>';
  assert.equal(finds(html, "orden-2026-05-04.pdf"), "raw");
  assert.equal(finds(html, "Descargar"), "text");
});

test("a PDF has no markup, so what it says is all it has", () => {
  const pdf = normalizePlainText("Determinazione   n. 4757\n\ndel 06.08.2026");
  assert.equal(pdf.text, "Determinazione n. 4757 del 06.08.2026");
  assert.equal(pdf.raw, pdf.text);
  assert.equal(pdf.title, null);
});

test("a bot challenge is neither a pass nor a failure", () => {
  assert.equal(looksLikeBotChallenge("https://validate.perfdrive.com/?ssa=1", null), true);
  assert.equal(looksLikeBotChallenge("https://example.test/shield?u=/aid/young-farmers", null), true);
  assert.equal(looksLikeBotChallenge("https://example.test/aid", normalizeHtml("<p>Verify you are human to continue</p>")), true);
  assert.equal(looksLikeBotChallenge("https://example.test/aid", normalizeHtml("<p>Ayudas para jóvenes agricultores</p>")), false);
});

test("a page that answers 200 and says it does not exist has not verified anything", () => {
  assert.equal(looksLikeSoftNotFound(normalizeHtml("<title>Error 404 - Page introuvable</title><p>…</p>")), true);
  assert.equal(looksLikeSoftNotFound(normalizeHtml("<title>Pagina non trovata</title>")), true);
  assert.equal(looksLikeSoftNotFound(normalizeHtml("<title>Banco de Terras de Galicia</title>")), false);
  assert.equal(looksLikeSoftNotFound(normalizePlainText("Any PDF text")), false, "a PDF carries no title to judge");
});
