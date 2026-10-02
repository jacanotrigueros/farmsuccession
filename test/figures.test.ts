import assert from "node:assert/strict";
import { test } from "node:test";

import { evidenceOf, type Figure, figuresIn, isSupported } from "../src/figures.ts";

const pad = (part: number): string => String(part).padStart(2, "0");

/** A figure as a short string, so a test reads like what the page says. */
function described(figure: Figure): string {
  if (figure.kind === "DATE") return `${figure.year ?? "????"}-${pad(figure.month)}-${pad(figure.day)}`;
  return figure.unit ? `${figure.value} ${figure.unit}` : String(figure.value);
}

const read = (text: string): string[] => figuresIn(text).map(described);
const kinds = (text: string): string[] => figuresIn(text).map((figure) => figure.kind);

/** The one figure of a short text, for a test that asks whether the evidence states it. */
const one = (text: string): Figure => {
  const figures = figuresIn(text);
  assert.equal(figures.length, 1, `"${text}" has to state exactly one figure for this test to mean anything`);
  return figures[0]!;
};

test("a number is read whatever thousands separator the page used", () => {
  assert.deepEqual(read("20.405 euros"), ["20405 EUR"]);
  assert.deepEqual(read("20,405 euros"), ["20405 EUR"]);
  assert.deepEqual(read("20405 euros"), ["20405 EUR"]);
  assert.deepEqual(read("1.500,00 €"), ["1500 EUR"], "zero cents are not part of the figure a reader would check");
});

test("trailing zero cents are dropped, so 1.500 and 1.500,00 are the same figure", () => {
  assert.deepEqual(read("1.500,00"), read("1.500"));
});

test("digits glued to letters are codes, not figures", () => {
  assert.deepEqual(read("expediente MR404A"), [], "a reference code is not an amount a reader could check");
  assert.deepEqual(read("orden A919 de la consejería"), []);
});

test("a lone digit is a counted word, not a figure", () => {
  assert.deepEqual(read("en 2 tramos"), [], "flagging every small count would train a researcher to ignore the check");
  assert.deepEqual(read("hasta 15 hectáreas"), ["15 HECTARES"]);
});

test("a unit stuck to the number does not swallow it", () => {
  assert.deepEqual(read("500m2 de invernadero"), ["500 SQUARE_METRES"]);
  assert.deepEqual(read("500m² de invernadero"), ["500 SQUARE_METRES"]);
});

test("the unit written next to a figure is read with it", () => {
  assert.deepEqual(read("hasta 1.500 €"), ["1500 EUR"]);
  assert.deepEqual(read("cubre el 90% del gasto"), ["90 PERCENT"]);
  assert.deepEqual(read("un taux de 50 % à 80 %"), ["50 PERCENT", "80 PERCENT"]);
  assert.deepEqual(read("corso di 150 ore"), ["150 HOURS"]);
  assert.deepEqual(read("curso de 150 horas"), ["150 HOURS"]);
});

test("an abbreviation that is also a word carries no unit", () => {
  assert.deepEqual(read("una finca de 23 ha"), ["23"], "ha is also a verb in Spanish, Italian and Portuguese");
  assert.deepEqual(read("nel 2024 ha ricevuto 30 candidature"), ["2024", "30"]);
  assert.deepEqual(read("menores de 41 años"), ["41"], "años is an age here and a duration elsewhere, so it is no unit");
  assert.deepEqual(read("das 09h00 às 12h30"), [], "an opening time is not a figure a reader checks against a source");
});

test("a date is one figure, not its three numbers", () => {
  assert.deepEqual(read("del 2026-10-01 al 2026-12-31"), ["2026-10-01", "2026-12-31"]);
  assert.deepEqual(read("el plazo acaba el 31/12/2027"), ["2027-12-31"]);
  assert.deepEqual(read("28 de setembro de 2026"), ["2026-09-28"]);
  assert.deepEqual(read("10 aprile 2026"), ["2026-04-10"]);
  assert.deepEqual(read("20 de juliol de 2026"), ["2026-07-20"], "a Spanish region writing in Catalan dates the same way");
  assert.deepEqual(read("31. Oktober 2025"), ["2025-10-31"]);
  assert.deepEqual(read("28 avril 2026"), ["2026-04-28"]);
  assert.deepEqual(read("la graduatoria del 06.08.2026"), ["2026-08-06"], "decrees and German pages date with full stops");
});

test("a grouped amount is not a dotted date", () => {
  assert.deepEqual(read("Risorse a bando: 11.200.000,00 euro"), ["11200000 EUR"]);
});

test("a date with no year is still a date", () => {
  assert.deepEqual(read("abierto hasta el 15 de octubre"), ["????-10-15"]);
});

test("numbers separated by full stops are not dates", () => {
  assert.deepEqual(kinds("el artículo 7.1/2026"), ["QUANTITY", "QUANTITY"], "a decree number is a number, never 1 July 2026");
  assert.deepEqual(kinds("a las 13.00.00"), ["QUANTITY"], "a clock time is not a date either");
});

test("a number is supported by the same number in a compatible unit", () => {
  const evidence = evidenceOf(figuresIn("ayuda de 1.500 € y 90% del gasto"));
  assert.equal(isSupported(evidence, one("1.500 euros")), true);
  assert.equal(isSupported(evidence, one("1.500")), true, "text that states no unit may mean the unit the evidence states");
  assert.equal(isSupported(evidence, one("1.500 horas")), false, "the same number in another unit is another figure");
  assert.equal(isSupported(evidence, one("1.600 €")), false);
});

test("the month and day of a date in the evidence support no number of the text", () => {
  const evidence = evidenceOf(figuresIn("consultado el 2026-10-15"));
  assert.equal(isSupported(evidence, one("15 de octubre de 2026")), true);
  assert.equal(isSupported(evidence, one("15 de octubre")), true, "text that states no year may mean the year of the evidence");
  assert.equal(isSupported(evidence, one("15 de octubre de 2027")), false, "another year is another deadline");
  assert.equal(isSupported(evidence, one("15 hectáreas")), false, "a day of the month never supported an area");
  assert.equal(isSupported(evidence, one("2026")), true, "a year is cited on its own, so a dated source states it");
});

test("a date a page publishes as digits supports the date the text spells out", () => {
  const evidence = evidenceOf(figuresIn("DATA PUBBLICAZIONE 20261002"));
  assert.equal(isSupported(evidence, one("2 ottobre 2026")), true);
  assert.deepEqual(kinds("DATA PUBBLICAZIONE 20261002"), ["QUANTITY"], "only the evidence reads a number as a date, never the text");
});
