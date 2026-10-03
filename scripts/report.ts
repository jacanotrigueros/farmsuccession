/**
 * What one edition's research concluded, territory by territory:
 *
 *   npm run report -- <year>           write research/findings-<year>.md
 *   npm run report -- <year> --check   fail if the committed file is stale
 *
 * The data files say what was found. This says what was looked for, what was deliberately left out and
 * why, and which of the instruments a region is expected to have went unanswered — the part of the work
 * that is invisible in the result and is most of the cost of it.
 *
 * It is generated rather than written, and `npm run check` fails when the committed file is not what the
 * data produces, because an account of the evidence that can drift from the evidence is worth nothing.
 * Its own prose is English; what a researcher or a page wrote is quoted verbatim in its own language,
 * since translating a conclusion would be inventing one. Nothing here is dated from the day it runs: a
 * document that changed every morning could not be checked.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { type LoadedBrief, loadBriefs } from "../src/briefs.ts";
import { EDITIONS_DIR, editionOf, type LoadedSnapshot, loadSnapshots } from "../src/editions.ts";
import { layerKey, snapshotLayer } from "../src/layers.ts";
import { isEntryPoint, ROOT, runMain } from "../src/paths.ts";
import type { EditionSnapshot } from "../src/types/edition.ts";
import type { ResearchBrief } from "../src/types/research-brief.ts";

const LEVELS = {
  "eu-snapshot": { label: "the European layer", plural: "European layer", order: 0 },
  "country-snapshot": { label: "country", plural: "countries", order: 1 },
  "hub-snapshot": { label: "grouping of several regions", plural: "groupings of several regions", order: 2 },
  "regional-snapshot": { label: "region", plural: "regions", order: 3 },
} as const;

/** A territory as this report tells it: its file, its brief, and nothing inferred from either. */
type Territory = { data: EditionSnapshot; brief: ResearchBrief | undefined };

const plural = (count: number, one: string, many = `${one}s`): string => `${count} ${count === 1 ? one : many}`;

const sentence = (text: string): string => (text.endsWith(".") || text.endsWith("!") || text.endsWith("?") ? text : `${text}.`);

function counted(values: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => `${count} ${value.toLowerCase().replaceAll("_", " ")}`)
    .join(", ");
}

/** How many territories of each level, named as the level is named in the singular or in the plural. */
function levels(territories: readonly Territory[]): string {
  const order = [...new Set(territories.map(({ data }) => data.schemaId))].toSorted((a, b) => LEVELS[a].order - LEVELS[b].order);
  return order
    .map((schemaId) => {
      const count = territories.filter(({ data }) => data.schemaId === schemaId).length;
      const { label, plural: many } = LEVELS[schemaId];
      return `${count} ${count === 1 ? label.replace(/^the /u, "") : many}`;
    })
    .join(", ");
}

function territoriesOf(snapshots: readonly LoadedSnapshot[], briefs: readonly LoadedBrief[]): Territory[] {
  const byLayer = new Map(briefs.map(({ brief }) => [layerKey(brief.territory), brief]));
  return snapshots
    .map(({ data }) => ({ data, brief: byLayer.get(layerKey(snapshotLayer(data))) }))
    .toSorted(
      (a, b) => LEVELS[a.data.schemaId].order - LEVELS[b.data.schemaId].order || a.data.officialName.localeCompare(b.data.officialName),
    );
}

/**
 * The instruments a region is expected to have answered, taken from every brief rather than from the
 * briefs of the territories being reported: a country brief sets them, and an edition reported without
 * its country file would otherwise print identifiers where a reader needs the instrument's name.
 */
function expectedInstruments(briefs: readonly LoadedBrief[]): Map<string, string> {
  const expected = new Map<string, string>();
  for (const { brief } of briefs) {
    for (const instrument of brief.expectedInstruments ?? []) expected.set(instrument.id, instrument.name);
  }
  return expected;
}

function overview(territories: readonly Territory[], expected: Map<string, string>): string[] {
  const resources = territories.flatMap(({ data }) => data.resources);
  const sources = resources.flatMap((resource) => resource.sources);
  const leads = territories.flatMap(({ brief }) => brief?.leads ?? []);
  const checks = territories.flatMap(({ brief }) => brief?.instrumentChecks ?? []);
  const news = territories.reduce((total, { data }) => total + data.news.length, 0);
  const queries = territories.reduce((total, { brief }) => total + (brief?.queries.length ?? 0), 0);
  const quotes = sources.reduce((total, source) => total + source.quotes.length, 0);
  const lines = [
    "## The edition in numbers",
    "",
    `- ${plural(territories.length, "territory", "territories")}: ${levels(territories)}.`,
    `- ${plural(resources.length, "record")}: ${counted(resources.map((resource) => resource.kind))}.`,
    `- Published as ${counted(resources.map((resource) => resource.status))}.`,
    `- ${plural(sources.length, "source")} on ${plural(new Set(sources.map((source) => source.url)).size, "distinct page")}, with ${plural(quotes, "quote")} copied from them.`,
    ...(news > 0 ? [`- ${plural(news, "dated development")} of the year.`] : []),
    `- ${plural(leads.length, "lead")} considered: ${counted(leads.map((lead) => lead.status))}.`,
    `- ${plural(queries, "search query", "search queries")} recorded, so a second pass can repeat them.`,
  ];
  if (expected.size === 0) return lines;

  lines.push(
    "",
    `## What the checklist asked`,
    "",
    `A country brief lists the instruments a region of that country usually has, and each region answers every one of them. That is how "we looked and there is none" stays distinguishable from "nobody looked".`,
    "",
  );
  for (const [id, name] of expected) {
    const answers = checks.filter((check) => check.expectedId === id);
    const found = answers.filter((check) => check.status === "FOUND").length;
    const missing = answers.filter((check) => check.status === "NOT_FOUND").length;
    const notApplicable = answers.filter((check) => check.status === "NOT_APPLICABLE").length;
    const parts = [`${found} found`];
    if (missing > 0) parts.push(`${missing} looked for and not found`);
    if (notApplicable > 0) parts.push(`${notApplicable} not applicable`);
    lines.push(`- **${name}** — ${parts.join(", ")}, of ${plural(answers.length, "territory", "territories")} that answered.`);
  }
  return lines;
}

function territorySection(territory: Territory, expected: Map<string, string>): string[] {
  const { data, brief } = territory;
  const lines = [`### ${data.officialName} — ${LEVELS[data.schemaId].label}`, ""];

  if (data.resources.length === 0) {
    lines.push(
      "Publishes nothing, which is a finding rather than a gap: the pass ran and found nothing a reader of this territory could use.",
      "",
    );
  } else {
    lines.push(`Publishes ${plural(data.resources.length, "record")}:`, "");
    for (const resource of data.resources.toSorted((a, b) => a.name.localeCompare(b.name))) {
      const state = resource.status === "ACTIVE" ? "" : ` _(${resource.status.toLowerCase().replaceAll("_", " ")})_`;
      lines.push(`- ${resource.name} — ${resource.kind.toLowerCase().replaceAll("_", " ")}${state}`);
    }
    lines.push("");
  }

  const checks = brief?.instrumentChecks ?? [];
  if (checks.length > 0) {
    lines.push("Against the checklist:", "");
    for (const check of checks) {
      const name = expected.get(check.expectedId) ?? check.expectedId;
      const answer =
        check.status === "FOUND" ? "**found**" : check.status === "NOT_FOUND" ? "**looked for, not found**" : "**not applicable**";
      lines.push(`- ${name} — ${answer}${check.reason ? `: ${sentence(check.reason)}` : "."}`);
    }
    lines.push("");
  }

  const rejected = (brief?.leads ?? []).filter((lead) => lead.status === "REJECTED");
  if (rejected.length > 0) {
    lines.push(`Considered and left out — ${plural(rejected.length, "lead")}:`, "");
    for (const lead of rejected) lines.push(`- ${lead.name}${lead.reason ? ` — ${sentence(lead.reason)}` : ""}`);
    lines.push("");
  }

  const pending = (brief?.leads ?? []).filter((lead) => lead.status === "TO_CHECK");
  if (pending.length > 0) {
    lines.push("Still open:", "");
    for (const lead of pending) lines.push(`- ${lead.name}${lead.reason ? ` — ${sentence(lead.reason)}` : ""}`);
    lines.push("");
  }

  if (data.news.length > 0) {
    lines.push("What happened during the year:", "");
    for (const item of data.news.toSorted((a, b) => a.date.localeCompare(b.date))) lines.push(`- ${item.date} — ${item.headline}`);
    lines.push("");
  }

  if (data.limitations.length > 0) {
    lines.push("What this file does not cover:", "");
    for (const limitation of data.limitations) lines.push(`- ${sentence(limitation)}`);
    lines.push("");
  }

  if (brief === undefined) {
    lines.push("_No research brief, so how this territory was searched is not recorded._", "");
  }
  return lines;
}

export function renderReport(edition: string, snapshots: readonly LoadedSnapshot[], briefs: readonly LoadedBrief[]): string {
  const territories = territoriesOf(snapshots, briefs);
  const expected = expectedInstruments(briefs);
  const lines = [
    `# What the ${edition} research found`,
    "",
    `Territory by territory: what each pass published, what it looked for and did not find, what it considered and left out, and what it has still to settle. The data files hold the evidence; this holds the conclusions, which are most of the work and invisible in the result.`,
    "",
    "Generated by `npm run report -- " +
      edition +
      "` from the edition files and the research briefs, and `npm run check` fails when the committed file is not what the data produces. The prose is English; what a researcher or a page wrote is quoted in its own language, because translating a conclusion would be inventing one.",
    "",
    ...overview(territories, expected),
    "",
    "## Territory by territory",
    "",
  ];
  for (const territory of territories) lines.push(...territorySection(territory, expected));
  return `${lines
    .join("\n")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .trimEnd()}\n`;
}

export const reportPathFor = (edition: string): string => path.join("research", `findings-${edition}.md`);

/**
 * Writes, or checks, the report of every edition asked for — all of them when none is named, since a
 * second edition that nobody reported on would otherwise go unnoticed until somebody looked.
 */
export function report(editions: readonly string[], checkOnly: boolean, editionsDir = EDITIONS_DIR): number {
  const { snapshots, problems } = loadSnapshots({ editionsDir });
  for (const problem of problems) console.error(`skipped ${problem.file}: ${problem.message}`);
  const years = [...new Set(snapshots.map(({ file }) => editionOf(file)))].toSorted();
  const wanted = editions.length === 0 ? years : editions;
  const unknown = wanted.filter((edition) => !years.includes(edition));
  if (unknown.length > 0) {
    console.error(`no edition file for ${unknown.join(", ")} in ${editionsDir}: there is nothing to report`);
    return 1;
  }
  if (wanted.length === 0) {
    console.log("no edition to report on");
    return 0;
  }

  const { briefs } = loadBriefs();
  let stale = 0;
  for (const edition of wanted) {
    const content = renderReport(
      edition,
      snapshots.filter(({ file }) => editionOf(file) === edition),
      briefs,
    );
    const target = reportPathFor(edition);
    const file = path.join(ROOT, target);
    const current = existsSync(file) ? readFileSync(file, "utf8") : "";
    if (current === content) {
      console.log(`${target} is current`);
      continue;
    }
    if (checkOnly) {
      stale += 1;
      console.error(`${target} is stale: run npm run report -- ${edition}`);
      continue;
    }
    writeFileSync(file, content);
    console.log(`wrote ${target}`);
  }
  return stale > 0 ? 1 : 0;
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const argv = process.argv.slice(2);
    return report(
      argv.filter((argument) => !argument.startsWith("--")),
      argv.includes("--check"),
    );
  });
}
