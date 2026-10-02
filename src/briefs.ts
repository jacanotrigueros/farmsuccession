/**
 * The research memory of a territory: where a brief lives, how it is loaded, and the rules it has to
 * satisfy beyond its schema.
 *
 * A brief is not a draft of an edition file. It records how a territory was searched — which portals,
 * which queries, what was found and what was rejected and why — so the next pass starts where the last
 * one stopped instead of repeating it. That is why the rules below are mostly about *tracing*: every
 * resource that reached an edition file came in through a lead this brief admitted, and every lead that
 * claims to have become a resource names one that exists.
 */
import path from "node:path";

import type { LoadedSnapshot } from "./editions.ts";
import { errorMessage } from "./errors.ts";
import { listJsonFiles, readJson } from "./json-files.ts";
import { type Layer, layerCountry, layerHub, layerKey, layerRegion, snapshotLayer, viewLayers } from "./layers.ts";
import { ROOT } from "./paths.ts";
import { compileSchema } from "./schema.ts";
import { jurisdiction } from "./territories.ts";
import { textProblems } from "./text-hygiene.ts";
import type { ResearchBrief } from "./types/research-brief.ts";
import type { Territories } from "./types/territories.ts";

export const RESEARCH_DIR = path.join(ROOT, "research");

export type LoadedBrief = { file: string; brief: ResearchBrief };
export type BriefProblem = { file: string; message: string };

/**
 * The layer a brief is about, read from its path relative to `research/`: `eu.json`,
 * `<iso>/country.json`, `<iso>/hubs/<hub>.json` or `<iso>/<region>.json`. Null when the path is not one
 * the layout defines, which is how a stray file is reported instead of quietly ignored.
 *
 * A region sits directly under its country because that is the common case and the one a researcher
 * types most; a hub is the exception and says so in its path.
 */
export function layerFromBriefPath(relativePath: string): Layer | null {
  const parts = relativePath.split(/[\\/]/u);
  if (parts.length === 1 && parts[0] === "eu.json") return { level: "EU" };
  const [first, second, third] = parts;
  if (parts.length === 3 && first && /^[a-z]{2}$/u.test(first) && second === "hubs" && third?.endsWith(".json")) {
    return { level: "HUB", country: first.toUpperCase(), hub: third.slice(0, -".json".length) };
  }
  if (parts.length !== 2 || !first || !/^[a-z]{2}$/u.test(first) || !second?.endsWith(".json")) return null;
  const name = second.slice(0, -".json".length);
  if (name === "country") return { level: "COUNTRY", country: first.toUpperCase() };
  return { level: "REGION", country: first.toUpperCase(), region: name };
}

/** Where the brief of one layer belongs, the inverse of `layerFromBriefPath`. */
export function briefPathFor(layer: Layer): string {
  if (layer.level === "EU") return "eu.json";
  const iso = layer.country.toLowerCase();
  if (layer.level === "COUNTRY") return `${iso}/country.json`;
  if (layer.level === "HUB") return `${iso}/hubs/${layer.hub}.json`;
  return `${iso}/${layer.region}.json`;
}

export function listBriefFiles(researchDir = RESEARCH_DIR): string[] {
  return listJsonFiles(researchDir);
}

/**
 * Loads the briefs that parse and pass their schema. Every other file comes back as a problem with its
 * reason, the same way edition files do: a file nobody can read is the one most likely to hide a mistake.
 */
export function loadBriefs(researchDir = RESEARCH_DIR): { briefs: LoadedBrief[]; problems: BriefProblem[] } {
  const schema = compileSchema<ResearchBrief>("schema/research-brief.schema.json");
  const briefs: LoadedBrief[] = [];
  const problems: BriefProblem[] = [];
  for (const file of listBriefFiles(researchDir)) {
    let data: unknown;
    try {
      data = readJson(researchDir, file);
    } catch (error) {
      problems.push({ file, message: errorMessage(error) });
      continue;
    }
    if (schema.accepts(data)) briefs.push({ file, brief: data });
    else problems.push(...schema.errors(data).map((message) => ({ file, message })));
  }
  return { briefs, problems };
}

/** The brief of one layer, by its path, so a caller does not have to search the list itself. */
export function briefOf(briefs: readonly LoadedBrief[], layer: Layer): ResearchBrief | undefined {
  const wanted = briefPathFor(layer);
  return briefs.find(({ file }) => file === wanted)?.brief;
}

/**
 * Rules for one schema-valid brief: its path, its own `territory` and the catalogue agree; identifiers
 * are used once; a lead that claims to have become a resource names one a reader of this territory can
 * actually see; and every resource of this territory's own edition file came in through a lead the brief
 * admitted, so the next researcher can see how it was found and why it was kept.
 *
 * `today` is a parameter rather than the clock, so a test is not tied to the day it runs.
 */
export function checkBrief(
  file: string,
  brief: ResearchBrief,
  territories: Territories,
  editions: readonly LoadedSnapshot[],
  today: string,
): string[] {
  const problems: string[] = [];
  const { territory } = brief;
  const country = layerCountry(territory);
  const region = layerRegion(territory);
  const hub = layerHub(territory);

  const expected = layerFromBriefPath(file);
  if (!expected) {
    problems.push("path is not eu.json, <iso>/country.json, <iso>/hubs/<hub>.json or <iso>/<region>.json");
  } else if (layerKey(expected) !== layerKey(territory)) {
    problems.push(`territory ${JSON.stringify(territory)} does not match its location`);
  }

  try {
    const entry = jurisdiction(territories, country ?? "EU");
    if (region !== undefined && !entry.regions.some((leaf) => leaf.slug === region)) {
      problems.push(`region "${region}" is not a region of ${country}`);
    }
    const hubEntry = hub === undefined ? undefined : entry.hubs.find((candidate) => candidate.slug === hub);
    if (hub !== undefined && !hubEntry) problems.push(`hub "${hub}" is not a hub of ${country}`);
    else if (hubEntry && hubEntry.members.length < 2) {
      problems.push(`hub "${hub}" groups a single region; use the brief of "${hubEntry.members[0]}"`);
    }
    if (brief.language !== entry.lang) problems.push(`language "${brief.language}" must be "${entry.lang}" for this territory`);
  } catch (error) {
    problems.push(errorMessage(error));
  }

  if (brief.updatedOn > today) problems.push(`updatedOn ${brief.updatedOn} is in the future`);
  for (const [label, ids] of [
    ["query", brief.queries.map((query) => query.id)],
    ["lead", brief.leads.map((lead) => lead.id)],
  ] as const) {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`duplicate ${label} id "${id}"`);
      seen.add(id);
    }
  }

  // A country brief writes one query for every region of the country; nobody else has regions to fill in.
  if (territory.level !== "COUNTRY") {
    for (const query of brief.queries) {
      if (query.query.includes("{region}")) problems.push(`query "${query.id}": only a country brief may use {region}`);
    }
  }

  problems.push(...leadProblems(brief, territories, editions, today));
  problems.push(...instrumentProblems(brief, today));
  problems.push(...textProblems(brief, brief.language));
  return problems;
}

/**
 * What a lead claims against what the editions hold. A lead admitted as a resource has to name one a
 * reader of this territory can see — its own layer or a layer it inherits from, never a sibling region,
 * another hub or another country — because an id that is not visible here is a different instrument.
 */
function leadProblems(brief: ResearchBrief, territories: Territories, editions: readonly LoadedSnapshot[], today: string): string[] {
  const problems: string[] = [];
  const visibleLayers = new Set(viewLayers(brief.territory, territories).map(layerKey));
  const resourcesIn = (layers: ReadonlySet<string>): Set<string> =>
    new Set(
      editions
        .filter(({ data }) => layers.has(layerKey(snapshotLayer(data))))
        .flatMap(({ data }) => data.resources.map((resource) => resource.id)),
    );

  const visible = resourcesIn(visibleLayers);
  const admitted = new Set<string>();
  for (const lead of brief.leads) {
    if (lead.checkedOn !== undefined && lead.checkedOn > today)
      problems.push(`lead "${lead.id}": checkedOn ${lead.checkedOn} is in the future`);
    if (lead.status !== "ADMITTED" || lead.resourceId === undefined) continue;
    admitted.add(lead.resourceId);
    if (!visible.has(lead.resourceId)) {
      problems.push(
        `lead "${lead.id}" is ADMITTED as "${lead.resourceId}", which is no resource of this territory or of a territory it inherits from`,
      );
    }
  }

  for (const id of resourcesIn(new Set([layerKey(brief.territory)]))) {
    if (!admitted.has(id)) {
      problems.push(`resource "${id}" has no ADMITTED lead in this brief; record how it was found and why it was admitted`);
    }
  }
  return problems;
}

/**
 * The instruments a country brief says a region usually has, and the answers a region brief gives. The
 * schema already decides which brief may carry which; what is left is that each is listed once, answered
 * once, and that a check reporting an instrument as found points at a lead that was actually admitted.
 */
function instrumentProblems(brief: ResearchBrief, today: string): string[] {
  const problems: string[] = [];
  const expectedIds = new Set<string>();
  for (const instrument of brief.expectedInstruments ?? []) {
    if (expectedIds.has(instrument.id)) problems.push(`duplicate expected instrument id "${instrument.id}"`);
    expectedIds.add(instrument.id);
  }

  const answered = new Set<string>();
  for (const check of brief.instrumentChecks ?? []) {
    const at = `instrument check "${check.expectedId}"`;
    if (answered.has(check.expectedId)) problems.push(`${at} is answered twice`);
    answered.add(check.expectedId);
    if (check.checkedOn > today) problems.push(`${at}: checkedOn ${check.checkedOn} is in the future`);
    if (check.leadId === undefined) continue;
    const lead = brief.leads.find((candidate) => candidate.id === check.leadId);
    if (lead?.status !== "ADMITTED") problems.push(`${at} is FOUND as lead "${check.leadId}", which is not an ADMITTED lead of this brief`);
  }
  return problems;
}

/**
 * Expected instruments of the country brief that a region brief has not answered, or answers with an id
 * the country brief does not list.
 *
 * This is deliberately not part of `checkBrief`: a brief with an unanswered instrument is work in
 * progress, not a broken file. It is the strict gate for closing one territory that requires an answer
 * for each, so that no regional pass quietly skips an instrument that usually exists at that level.
 */
export function instrumentCoverageProblems(regionBrief: ResearchBrief, countryBrief: ResearchBrief | undefined): string[] {
  const expected = countryBrief?.expectedInstruments ?? [];
  const answered = new Set((regionBrief.instrumentChecks ?? []).map((check) => check.expectedId));
  const known = new Set(expected.map((instrument) => instrument.id));
  return [
    ...expected
      .filter((instrument) => !answered.has(instrument.id))
      .map((instrument) => `expected instrument "${instrument.id}" (${instrument.name}) has no instrumentChecks answer`),
    ...[...answered]
      .filter((id) => !known.has(id))
      .map((id) => `instrument check "${id}" matches no expectedInstruments id of the country brief`),
  ];
}
