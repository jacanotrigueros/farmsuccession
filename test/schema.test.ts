import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { Ajv2020, type AnySchema, type ValidateFunction } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";

import { ROOT } from "../src/paths.ts";

type Enumerated = { enum?: string[]; $defs?: Record<string, Enumerated> };

function read(name: string): Enumerated & AnySchema {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- schema files are repository content, not external input
  return JSON.parse(readFileSync(path.join(ROOT, "schema", name), "utf8")) as Enumerated & AnySchema;
}

/**
 * Compiles with AJV in strict mode, which is what the validators will use. Strict mode rejects
 * schemas that merely look right, so compiling here is already a test of the schema itself.
 */
function compile(name: string): ValidateFunction {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- ajv-formats ships CommonJS
  (addFormatsModule as unknown as { default: (a: Ajv2020) => void }).default(ajv);
  return ajv.compile(read(name));
}

function values(document: Enumerated, definition: string): string[] {
  const found = document.$defs?.[definition]?.enum;
  assert.ok(found, `schema has no $defs/${definition} with an enum`);
  return found;
}

test("every schema compiles under AJV strict mode", () => {
  for (const name of ["edition.schema.json", "territories.schema.json", "research-brief.schema.json"]) {
    assert.doesNotThrow(() => compile(name), `${name} does not compile in strict mode`);
  }
});

test("a lead kind is a resource kind, plus NEWS for an event", () => {
  const resourceKinds = values(read("edition.schema.json"), "resourceKind");
  const leadKinds = values(read("research-brief.schema.json"), "leadKind");
  assert.deepEqual(
    leadKinds,
    [...resourceKinds, "NEWS"],
    "the brief's LeadKind must be the edition's ResourceKind in the same order, plus NEWS: a lead that cannot become a resource is a lead nobody can publish",
  );
});

const brief = (level: string, extra: Record<string, unknown>): Record<string, unknown> => ({
  schemaVersion: "1.0.0",
  territory: {
    level,
    ...(level === "EU" ? {} : { country: "ES" }),
    ...(level === "REGION" ? { region: "galicia" } : {}),
    ...(level === "HUB" ? { hub: "pais-vasco" } : {}),
  },
  language: "es",
  updatedOn: "2026-10-01",
  context: ["La competencia agraria es autonomica."],
  portals: [],
  openData: [],
  queries: [],
  leads: [],
  log: [],
  ...extra,
});

const EXPECTED = [
  {
    id: "banco-tierras",
    name: "Verificar banco de tierras",
    kinds: ["LAND_BANK"],
    lookFor: "Buscar banco de tierras regional.",
  },
];
const CHECKS = [
  {
    expectedId: "banco-tierras",
    status: "NOT_FOUND",
    reason: "Buscado en el portal oficial, sin resultado.",
    checkedOn: "2026-10-01",
  },
];

test("expected instruments belong to a country brief and to no other level", () => {
  const validate = compile("research-brief.schema.json");
  assert.ok(validate(brief("COUNTRY", { expectedInstruments: EXPECTED })), "a country brief may list them");
  for (const level of ["EU", "HUB", "REGION"]) {
    assert.ok(
      !validate(brief(level, { expectedInstruments: EXPECTED })),
      `a ${level} brief must not list expected instruments: only a country sets the checklist its regions answer`,
    );
  }
});

test("instrument checks belong to a region brief and to no other level", () => {
  const validate = compile("research-brief.schema.json");
  assert.ok(validate(brief("REGION", { instrumentChecks: CHECKS })), "a region brief may answer them");
  for (const level of ["EU", "COUNTRY", "HUB"]) {
    assert.ok(
      !validate(brief(level, { instrumentChecks: CHECKS })),
      `a ${level} brief must not answer instrument checks: only a region answers its country's checklist`,
    );
  }
});

const resource = (scope: Record<string, unknown>, extra: Record<string, unknown>): Record<string, unknown> => ({
  id: "banco-de-terras",
  name: "Banco de Terras de Galicia",
  kind: "LAND_BANK",
  status: "ACTIVE",
  scope,
  operator: "Xunta de Galicia",
  operatorType: "PUBLIC",
  whatItOffers: "Pon en contacto a quen cede terras con quen as precisa.",
  accessUrl: "https://example.gal/banco",
  sources: [
    {
      url: "https://example.gal/banco",
      title: "Banco de Terras",
      consultedOn: "2026-10-01",
      quotes: ["O Banco de Terras de Galicia"],
    },
  ],
  ...extra,
});

const snapshot = (scope: Record<string, unknown>, resourceExtra: Record<string, unknown> = {}): Record<string, unknown> => ({
  schemaId: "regional-snapshot",
  schemaVersion: "1.0.0",
  country: "ES",
  region: "galicia",
  edition: "2026",
  officialName: "Galicia",
  published: "2026-10-01",
  summary: "Resumen de lo que ofrece el territorio para la sucesion agraria.",
  coverage: { status: "PARTIAL", note: "Revisados los portales principales.", methods: [] },
  review: { status: "DRAFT" },
  metadata: { language: "gl", sourcePolicy: "PUBLIC_SOURCES_ONLY", generatedBy: [{ id: "person-1", tool: "PERSON" }] },
  resources: [resource(scope, resourceExtra)],
  news: [],
  limitations: ["Non se revisaron as ordenanzas municipais."],
});

test("a served area is named below region level, and never above it", () => {
  const validate = compile("edition.schema.json");
  assert.ok(
    validate(snapshot({ level: "LOCAL", area: "Concello de Lugo" })),
    `a local resource names its area: ${JSON.stringify(validate.errors)}`,
  );
  assert.ok(validate(snapshot({ level: "REGIONAL" })), `a regional resource needs no area: ${JSON.stringify(validate.errors)}`);
  assert.ok(!validate(snapshot({ level: "LOCAL" })), "a local resource without an area leaves the reader guessing which municipality");
  assert.ok(
    !validate(snapshot({ level: "REGIONAL", area: "Concello de Lugo" })),
    "an area above region level could contradict the territory the file is already about",
  );
});

test("a field that describes one kind of resource cannot appear on another", () => {
  const validate = compile("edition.schema.json");
  const regional = { level: "REGIONAL" };
  const accepts = (extra: Record<string, unknown>): boolean => validate(snapshot(regional, extra));
  assert.ok(accepts({ assetTypes: ["PLOTS"] }), `a land bank hands over plots: ${JSON.stringify(validate.errors)}`);
  assert.ok(
    !accepts({ kind: "TRAINING", assetTypes: ["PLOTS"] }),
    "a training course handing over plots is a field filled by habit, not a fact about the course",
  );
  assert.ok(
    accepts({ kind: "FINANCIAL_SUPPORT", instrumentType: "GRANT", purposes: ["FIRST_ESTABLISHMENT"] }),
    `financial support carries its mechanism and purpose: ${JSON.stringify(validate.errors)}`,
  );
  assert.ok(!accepts({ instrumentType: "GRANT" }), "a land bank with a financial mechanism promises money it does not hand out");
  assert.ok(!accepts({ purposes: ["INVESTMENT"] }), "a purpose belongs to the support that pays for it");
  assert.ok(
    accepts({ kind: "TRAINING", trainingFormats: ["ONLINE"], qualifiesForEstablishmentAid: true }),
    `training carries its format: ${JSON.stringify(validate.errors)}`,
  );
  assert.ok(!accepts({ trainingFormats: ["ONLINE"] }), "a land bank has no delivery format");
  assert.ok(!accepts({ qualifiesForEstablishmentAid: false }), "only a course can satisfy a training requirement for establishment aid");
});

const withReview = (review: Record<string, unknown>): Record<string, unknown> => ({
  ...snapshot({ level: "REGIONAL" }),
  review,
});

test("a claimed review names who did it and when, and a draft claims neither", () => {
  const validate = compile("edition.schema.json");
  assert.ok(validate(withReview({ status: "DRAFT" })), "a plain draft is valid");
  assert.ok(
    validate(withReview({ status: "REVIEWED", reviewedBy: "José Antonio Cano", reviewedOn: "2026-10-01" })),
    `a signed and dated review is valid: ${JSON.stringify(validate.errors)}`,
  );
  assert.ok(
    !validate(withReview({ status: "REVIEWED" })),
    "REVIEWED with no reviewer and no date would let a file claim a review nobody performed",
  );
  assert.ok(
    !validate(withReview({ status: "REVIEWED", reviewedBy: "José Antonio Cano" })),
    "a review with no date cannot be told from a stale one",
  );
  assert.ok(
    !validate(withReview({ status: "DRAFT", reviewedBy: "José Antonio Cano" })),
    "a draft carrying a reviewer is a half-filled review that reads as a finished one",
  );
});

const withLead = (lead: Record<string, unknown>): Record<string, unknown> =>
  brief("REGION", { leads: [{ id: "banco-de-terras", name: "Banco de Terras", kind: "LAND_BANK", ...lead }] });

test("a lead's status decides what it has to carry", () => {
  const validate = compile("research-brief.schema.json");
  assert.ok(
    validate(withLead({ status: "ADMITTED", resourceId: "banco-de-terras" })),
    `an admitted lead names the resource it became: ${JSON.stringify(validate.errors)}`,
  );
  assert.ok(
    !validate(withLead({ status: "ADMITTED" })),
    "an admission with no resource is a claim nobody can follow to anything published",
  );
  assert.ok(
    validate(withLead({ status: "REJECTED", reason: "El servicio ya non existe segundo a propia paxina." })),
    `a rejection explains itself: ${JSON.stringify(validate.errors)}`,
  );
  assert.ok(
    !validate(withLead({ status: "REJECTED" })),
    "a rejection with no reason makes the next pass evaluate the same candidate from scratch",
  );
  assert.ok(validate(withLead({ status: "TO_CHECK" })), "a lead not yet judged needs neither");
  assert.ok(
    !validate(withLead({ status: "REJECTED", reason: "Non existe.", resourceId: "banco-de-terras" })),
    "a rejected lead that points at a published resource contradicts itself",
  );
});

test("a brief with neither list is valid at every level", () => {
  const validate = compile("research-brief.schema.json");
  for (const level of ["EU", "COUNTRY", "HUB", "REGION"]) {
    assert.ok(validate(brief(level, {})), `a plain ${level} brief must validate: ${JSON.stringify(validate.errors)}`);
  }
});
