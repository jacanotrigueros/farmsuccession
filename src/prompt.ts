/**
 * Fills the research process for one territory: `npm run prompt -- <year> eu | <iso> | <iso>/<region or hub>`.
 *
 * The same prompt serves a person, a chat with no access to anything, and a coding agent inside the
 * repository. That is the point: who does the research is not what makes it trustworthy — the evidence
 * rules and the checks are — so the process must not assume a particular tool.
 *
 * `prompts/research-territory.md` is the template. What gets filled in is the territory, its language,
 * the paths the pass must write, an example resource to imitate, and the research context: the brief of
 * this territory, the briefs of every layer above it, the resources those layers already list, the
 * current edition file and both schemas.
 *
 * Full mode inlines all of it, for a chat that cannot open a repository. `--compact` names the shared
 * files by path instead, for an assistant that can read them, and inlines only what this pass changes.
 *
 * The result is written to `reports/prompts/` and its path printed, because a prompt is a working file
 * and not something to keep: the template and the data it was filled from are what the repository keeps.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { briefPathFor, RESEARCH_DIR } from "./briefs.ts";
import { EDITIONS_DIR, editionPathFor } from "./editions.ts";
import { ancestorLayers, type Layer, layerCountry, layerFromSpec, layerHub, layerRegion } from "./layers.ts";
import { isEntryPoint, ROOT, runMain } from "./paths.ts";
import { currentPromptVersion } from "./prompt-version.ts";
import { compileSchema } from "./schema.ts";
import { jurisdiction, loadTerritories } from "./territories.ts";
import type { EditionSnapshot, Resource } from "./types/edition.ts";
import type { Territories } from "./types/territories.ts";

export type PromptMode = "full" | "compact";
export type PromptRequest = { edition: string; territory: string; today: string; mode?: PromptMode };
export type PromptDirs = { root: string; research: string; editions: string };

const read = (file: string): string => readFileSync(file, "utf8").trim();
const readOr = (file: string, fallback: string): string => (existsSync(file) ? read(file) : fallback);
const fenced = (title: string, json: string): string => `### ${title}\n\n\`\`\`json\n${json}\n\`\`\`\n`;

/**
 * A resource from the most recent edition, shown as the level of evidence to imitate — chosen by how
 * completely it is documented rather than named in code, so it cannot become a reference to a record
 * somebody has since renamed, and so the example improves as the data does.
 */
export function exampleResource(editionsDir: string): string {
  const schema = compileSchema<EditionSnapshot>("schema/edition.schema.json");
  const years = existsSync(editionsDir) ? readdirSync(editionsDir).filter((name) => /^[0-9]{4}$/u.test(name)) : [];
  for (const year of years.toSorted().toReversed()) {
    const resources: Resource[] = [];
    for (const file of listEditionJson(path.join(editionsDir, year))) {
      const data: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (schema.accepts(data)) resources.push(...data.resources);
    }
    const best = resources.toSorted((a, b) => richness(b) - richness(a) || a.id.localeCompare(b.id))[0];
    if (best) return JSON.stringify(best, null, 2);
  }
  return `{ "note": "No example is available yet; follow the schema and the rules above." }`;
}

/** How much of a record is actually documented: the fields a researcher most often leaves empty. */
function richness(resource: Resource): number {
  const quotes = resource.sources.reduce((total, source) => total + source.quotes.length, 0);
  return (
    quotes +
    (resource.metrics?.length ?? 0) * 3 +
    (resource.calls?.length ?? 0) * 3 +
    (resource.contactPoints?.length ?? 0) * 3 +
    (resource.notes === undefined ? 0 : 2)
  );
}

function listEditionJson(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .toSorted();
}

const LAYER_TITLES = { EU: "EU brief", COUNTRY: "Country brief", HUB: "Hub brief", REGION: "Region brief" } as const;

const missingBrief = (layer: Layer): string =>
  `{ "note": "No ${layer.level.toLowerCase()} brief exists yet. Write it against the research brief schema." }`;

/**
 * A region or hub pass needs its country brief: the national institutions, the vocabulary and the
 * instruments a region is expected to have are established there. Without it a pass would infer them,
 * which is the one thing the process exists to prevent.
 */
function requireCountryBrief(layer: Layer, researchDir: string): void {
  if (layer.level !== "REGION" && layer.level !== "HUB") return;
  const file = path.join(researchDir, briefPathFor({ level: "COUNTRY", country: layer.country }));
  if (existsSync(file)) return;
  const name = layerHub(layer) ?? layerRegion(layer);
  throw new Error(`the country brief ${path.relative(ROOT, file)} is required: research ${layer.country} before ${name}`);
}

/** The resources a reader of this territory already sees, which this pass must not write again. */
function higherLayerResources(layer: Layer, territories: Territories, edition: string, editionsDir: string): string {
  const schema = compileSchema<EditionSnapshot>("schema/edition.schema.json");
  const lines = ancestorLayers(layer, territories).flatMap((above) => {
    const file = editionPathFor(above);
    const full = path.join(editionsDir, edition, file);
    // A hub file is optional, so its absence is not a gap worth reporting.
    if (!existsSync(full)) return above.level === "HUB" ? [] : [`- ${file}: not written yet for ${edition}`];
    const data: unknown = JSON.parse(readFileSync(full, "utf8"));
    if (!schema.accepts(data)) return [`- ${file}: not valid against the schema; run npm run validate`];
    return data.resources.map((resource) => `- ${file}: \`${resource.id}\` — ${resource.name} — ${resource.accessUrl}`);
  });
  return lines.length ? lines.join("\n") : "None: this is the highest layer.";
}

/**
 * The material the researcher works from. The brief of this territory, the resources of the layers
 * above and the current edition file are always inline, because they are what this pass reads and
 * changes. The higher briefs and the two schemas are inline in full mode and named by path in compact
 * mode.
 */
function buildContext(layer: Layer, request: PromptRequest, dirs: PromptDirs, territories: Territories): string {
  const higher = ancestorLayers(layer, territories)
    // A hub brief is optional: a region shows it only when it exists.
    .filter((above) => above.level !== "HUB" || existsSync(path.join(dirs.research, briefPathFor(above))))
    .map((above) => ({
      title: LAYER_TITLES[above.level],
      file: `research/${briefPathFor(above)}`,
      content: (): string => readOr(path.join(dirs.research, briefPathFor(above)), missingBrief(above)),
    }));
  const shared = [
    ...higher,
    {
      title: "Edition schema",
      file: "schema/edition.schema.json",
      content: (): string => read(path.join(dirs.root, "schema/edition.schema.json")),
    },
    {
      title: "Research brief schema",
      file: "schema/research-brief.schema.json",
      content: (): string => read(path.join(dirs.root, "schema/research-brief.schema.json")),
    },
  ];
  const sharedSection =
    request.mode === "compact"
      ? [
          "## Repository files to open",
          "",
          "Open these before starting. If you cannot open them, ask for the full prompt (`npm run prompt`",
          "without `--compact`) instead of guessing what they say.",
          "",
          ...shared.map(({ title, file }) => `- ${title}: \`${file}\``),
          "",
        ]
      : ["## Research context", "", ...shared.map(({ title, file, content }) => fenced(`${title} (${file})`, content()))];

  const editionFile = `${request.edition}/${editionPathFor(layer)}`;
  return [
    ...sharedSection,
    "## This territory",
    "",
    fenced(
      `Brief of this territory (research/${briefPathFor(layer)})`,
      readOr(path.join(dirs.research, briefPathFor(layer)), missingBrief(layer)),
    ),
    "### Resources already listed in higher layers (do not repeat)",
    "",
    higherLayerResources(layer, territories, request.edition, dirs.editions),
    "",
    fenced(
      `Current edition file (data/editions/${editionFile})`,
      readOr(path.join(dirs.editions, editionFile), `{ "note": "No file yet for ${request.edition}. Write it." }`),
    ),
  ]
    .join("\n")
    .trim();
}

/** What a territory is called and what kind of territory it is, in the words the prompt addresses it by. */
function describe(layer: Layer, territories: Territories): { name: string; label: string } {
  const country = layerCountry(layer);
  const entry = jurisdiction(territories, country ?? "EU");
  const hub = layerHub(layer);
  const region = layerRegion(layer);
  if (hub !== undefined) {
    const found = entry.hubs.find((candidate) => candidate.slug === hub);
    return { name: found?.name ?? hub, label: `hub ${hub} of ${country}, grouping ${found?.members.join(", ") ?? "its regions"}` };
  }
  if (region !== undefined) {
    const found = entry.regions.find((candidate) => candidate.slug === region);
    return { name: found?.name ?? region, label: `region ${region} of ${country}` };
  }
  return { name: entry.name, label: country === undefined ? "EU layer" : `country ${country}` };
}

export function buildPrompt(
  request: PromptRequest,
  territories: Territories = loadTerritories(),
  dirs: PromptDirs = { root: ROOT, research: RESEARCH_DIR, editions: EDITIONS_DIR },
): { layer: Layer; text: string } {
  const layer = layerFromSpec(request.territory, territories);
  requireCountryBrief(layer, dirs.research);
  const { name, label } = describe(layer, territories);
  const templatePath = path.join(dirs.root, "prompts/research-territory.md");

  const values: Record<string, string> = {
    territoryName: name,
    territoryLabel: label,
    edition: request.edition,
    today: request.today,
    language: jurisdiction(territories, layerCountry(layer) ?? "EU").lang,
    editionPath: editionPathFor(layer),
    briefPath: briefPathFor(layer),
    territorySpec: request.territory.toLowerCase(),
    promptVersion: currentPromptVersion(templatePath),
    exampleResource: exampleResource(dirs.editions),
    context: buildContext(layer, request, dirs, territories),
  };

  // An unknown placeholder is an error rather than empty text: a prompt with a hole in it would send a
  // researcher off with an instruction nobody finished writing.
  const text = read(templatePath).replaceAll(/\{\{(\w+)\}\}/gu, (placeholder: string, key: string) => {
    const value = values[key];
    if (value === undefined) throw new Error(`prompts/research-territory.md uses an unknown placeholder ${placeholder}`);
    return value;
  });
  return { layer, text: `${text}\n` };
}

/**
 * The request on the command line, or undefined when it is not one. An unknown option or an extra
 * argument is refused rather than ignored, so a mistyped `--compact` never quietly yields full mode.
 */
export function parsePromptArgs(args: readonly string[]): Omit<PromptRequest, "today"> | undefined {
  const options = args.filter((arg) => arg.startsWith("--"));
  const [edition, territory, ...extra] = args.filter((arg) => !arg.startsWith("--"));
  if (!edition || !/^[0-9]{4}$/u.test(edition) || !territory || extra.length > 0) return undefined;
  if (options.some((option) => option !== "--compact")) return undefined;
  return { edition, territory, mode: options.length > 0 ? "compact" : "full" };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const request = parsePromptArgs(process.argv.slice(2));
    if (!request) {
      console.error("usage: npm run prompt -- <year> eu | <iso> | <iso>/<region or hub> [--compact]");
      return 2;
    }
    const { text } = buildPrompt({ ...request, today: new Date().toISOString().slice(0, 10) });
    const outDir = path.join(ROOT, "reports/prompts");
    mkdirSync(outDir, { recursive: true });
    const name = [request.edition, request.territory.toLowerCase().replaceAll("/", "-"), request.mode === "compact" ? "compact" : undefined]
      .filter(Boolean)
      .join("-");
    const outFile = path.join(outDir, `${name}.md`);
    writeFileSync(outFile, text);
    console.log(path.relative(ROOT, outFile));
    return 0;
  });
}
