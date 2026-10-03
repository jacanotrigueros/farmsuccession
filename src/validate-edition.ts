import {
  identityFromPath,
  type LoadedSnapshot,
  SCOPE_LEVELS_BY_SNAPSHOT,
  snapshotCountry,
  snapshotHub,
  snapshotRegion,
} from "./editions.ts";
import { errorMessage } from "./errors.ts";
import { unsupportedFileFigures, unsupportedResourceFigures } from "./figures.ts";
import { ancestorLayers, layerKey, snapshotLayer } from "./layers.ts";
import { internalReferencesInText, schemaCodesInText } from "./reader-text.ts";
import { jurisdiction } from "./territories.ts";
import { textProblems } from "./text-hygiene.ts";
import type { EditionSnapshot, Metric, Resource, Source } from "./types/edition.ts";
import type { Territories } from "./types/territories.ts";
import { canonicalPage, samePage } from "./urls.ts";

/**
 * The units each measure can be expressed in, so the same measure stays comparable from one territory
 * to the next. A budget is money; land is parcels, properties or hectares; training is people or
 * hours. OTHER accepts any unit, which is the price of having an escape hatch at all.
 *
 * This is the one metric rule left in code rather than in the schema: the schema could forbid the
 * combination, but only the message can say which units that measure actually takes.
 */
export const UNITS_BY_MEASURE: Record<Metric["measure"], readonly Metric["unit"][] | undefined> = {
  BUDGET_TOTAL: ["EUR"],
  AID_PER_BENEFICIARY_BASE: ["EUR"],
  AID_PER_BENEFICIARY_MIN: ["EUR"],
  AID_PER_BENEFICIARY_MAX: ["EUR"],
  LOAN_PER_BENEFICIARY_MIN: ["EUR"],
  LOAN_PER_BENEFICIARY_MAX: ["EUR"],
  LAND_LISTINGS: ["PARCELS", "OFFERS", "PROPERTIES", "HOLDINGS"],
  LAND_AREA: ["HECTARES"],
  LAND_ANNOUNCED: ["PARCELS", "PROPERTIES", "HOLDINGS", "HECTARES"],
  PEOPLE_TRAINED: ["PEOPLE"],
  TRAINING_HOURS: ["HOURS"],
  OTHER: undefined,
};

/** How old the newest date on an ACTIVE resource's page may be before it is worth confirming. */
const STALE_EVIDENCE_YEARS = 2;

export type Finding = { file: string; message: string };
/** An error means the file states something that cannot be true; a warning asks a person to look. */
export type Report = { errors: Finding[]; warnings: Finding[] };

type Problems = {
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  error: (message: string) => void;
  warn: (message: string) => void;
};

function collect(): Problems {
  const errors: string[] = [];
  const warnings: string[] = [];
  return {
    errors,
    warnings,
    error: (message) => void errors.push(message),
    warn: (message) => void warnings.push(message),
  };
}

/** Every source of the file, each labelled with the record that cites it. */
function sourcesOf(data: EditionSnapshot): Array<{ at: string; source: Source }> {
  return [
    ...data.resources.flatMap((resource) => resource.sources.map((source) => ({ at: `resource "${resource.id}"`, source }))),
    ...data.news.flatMap((item) => item.sources.map((source) => ({ at: `news "${item.id}"`, source }))),
  ];
}

/**
 * The rules that one schema-valid file has to satisfy on its own: its location and the territorial
 * catalogue agree with what it says it is about, its dates are coherent with the edition and with
 * each other, each call's state matches what its source showed on the day it was read, and every
 * figure, contact and metric traces to one of the record's own sources.
 *
 * `today` is a parameter rather than the clock, so a test is not tied to the day it runs.
 */
export function checkSemantics(file: string, data: EditionSnapshot, territories: Territories, today: string): Report {
  const found = collect();
  checkIdentity(file, data, territories, found);
  checkDates(data, today, found);
  checkCoverage(data, found);

  const ids = new Set<string>();
  for (const resource of data.resources) {
    const at = `resource "${resource.id}"`;
    if (ids.has(resource.id)) found.error(`${at}: duplicate id`);
    ids.add(resource.id);
    checkResource(data, resource, today, found);
  }
  checkNews(data, found);

  for (const message of [...unsupportedResourceFigures(data), ...schemaCodesInText(data), ...textProblems(data, data.metadata.language)]) {
    found.error(message);
  }
  return {
    errors: found.errors.map((message) => ({ file, message })),
    warnings: found.warnings.map((message) => ({ file, message })),
  };
}

/**
 * The file is about the territory its path, its own fields and the catalogue all say it is about.
 * Three things have to agree, and a disagreement means one of them is wrong — never that the file can
 * be read anyway.
 */
function checkIdentity(file: string, data: EditionSnapshot, territories: Territories, found: Problems): void {
  const country = snapshotCountry(data);
  const region = snapshotRegion(data);
  const hubSlug = snapshotHub(data);
  const expected = identityFromPath(file);
  if (!expected) {
    found.error(
      "path is not <year>/eu.json, <year>/countries/<iso>.json, <year>/hubs/<iso>/<hub>.json or <year>/regions/<iso>/<region>.json",
    );
  } else {
    if (data.edition !== expected.edition) found.error(`edition "${data.edition}" does not match directory "${expected.edition}"`);
    if (data.schemaId !== expected.schemaId) found.error(`schemaId "${data.schemaId}" does not match its location (${expected.schemaId})`);
    if (expected.country && country !== expected.country) {
      found.error(`country "${country}" does not match its location (${expected.country})`);
    }
    if (expected.hub && hubSlug !== expected.hub) found.error(`hub "${hubSlug}" does not match its location (${expected.hub})`);
    if (expected.region && region !== expected.region) found.error(`region "${region}" does not match its location (${expected.region})`);
  }

  let entry;
  try {
    entry = jurisdiction(territories, country ?? "EU");
  } catch (error) {
    found.error(errorMessage(error));
    return;
  }

  let expectedName = entry.name;
  if (hubSlug) {
    const hub = entry.hubs.find((candidate) => candidate.slug === hubSlug);
    if (!hub) {
      found.error(`hub "${hubSlug}" is not a hub of ${country}`);
      return;
    }
    if (hub.members.length < 2) {
      found.error(`hub "${hubSlug}" groups a single region; write its resources in the region file of "${hub.members[0]}"`);
      return;
    }
    expectedName = hub.name;
  }
  if (region) {
    const leaf = entry.regions.find((candidate) => candidate.slug === region);
    if (!leaf) {
      const hub = entry.hubs.find((candidate) => candidate.slug === region);
      const hint = hub ? `; it is a hub, use one of: ${hub.members.join(", ")}` : "";
      found.error(`region "${region}" is not a region of ${country}${hint}`);
      return;
    }
    expectedName = leaf.name;
  }
  if (data.officialName !== expectedName) {
    found.error(`officialName "${data.officialName}" must be "${expectedName}" as in data/territories.json`);
  }
  if (data.metadata.language !== entry.lang) {
    found.error(`metadata.language "${data.metadata.language}" must be "${entry.lang}" for this territory`);
  }
}

/**
 * Dates that contradict each other, or the edition, or the day the file was written. Nothing read
 * from a page can be in the future, nothing can have been consulted after the file was published, and
 * a review signed before the last consultation covered less than it claims.
 */
function checkDates(data: EditionSnapshot, today: string, found: Problems): void {
  if (data.published > today) found.error(`published ${data.published} is in the future`);

  const editionStart = `${data.edition}-01-01`;
  for (const { at, source } of sourcesOf(data)) {
    if (source.consultedOn < editionStart) {
      found.error(`${at}: source consultedOn ${source.consultedOn} is before edition ${data.edition}`);
    }
    if (source.consultedOn > data.published) {
      found.error(`${at}: source consultedOn ${source.consultedOn} is after published ${data.published}`);
    }
    if (new Set(source.quotes).size !== source.quotes.length) found.warn(`${at}: ${source.url} repeats a quote`);
  }

  const reviewedOn = data.review.reviewedOn;
  if (reviewedOn === undefined) return;
  if (reviewedOn > data.published) found.error(`review.reviewedOn ${reviewedOn} is after published ${data.published}`);
  const lastConsulted = sourcesOf(data)
    .map(({ source }) => source.consultedOn)
    .toSorted()
    .at(-1);
  if (lastConsulted !== undefined && reviewedOn < lastConsulted) {
    found.error(
      `review.reviewedOn ${reviewedOn} is before the last consultation (${lastConsulted}), so part of the file was never reviewed`,
    );
  }
}

/** What the file says about its own searching has to match what it carries. */
function checkCoverage(data: EditionSnapshot, found: Problems): void {
  const { status, methods } = data.coverage;
  const hasContent = data.resources.length > 0 || data.news.length > 0;
  if (status === "NOT_STARTED") {
    if (hasContent) found.error("coverage.status NOT_STARTED cannot carry resources or news");
    if (methods.length > 0) found.error("coverage.status NOT_STARTED cannot list discovery methods, because none were run");
    return;
  }
  if (methods.length === 0) found.error(`coverage.status ${status} requires at least one discovery method`);
}

function checkResource(data: EditionSnapshot, resource: Resource, today: string, found: Problems): void {
  const at = `resource "${resource.id}"`;

  const levels = SCOPE_LEVELS_BY_SNAPSHOT[data.schemaId];
  if (!levels.includes(resource.scope.level)) {
    found.error(`${at}: scope ${resource.scope.level} does not belong in a ${data.schemaId}; use ${levels.join(" or ")}`);
  }

  const sourceUrls = new Set<string>();
  for (const source of resource.sources) {
    if (sourceUrls.has(source.url)) found.error(`${at}: source ${source.url} is listed twice`);
    sourceUrls.add(source.url);
  }
  if (!sourceUrls.has(resource.accessUrl)) {
    found.error(`${at}: accessUrl must be one of its sources, so its quotes verify the link readers follow`);
  }

  for (const contact of resource.contactPoints ?? []) {
    const label = `${at}: ${contact.channel} contact "${contact.label}"`;
    const source = resource.sources.find((candidate) => candidate.url === contact.sourceUrl);
    if (!source) {
      found.error(`${label} cites ${contact.sourceUrl}, which is not one of its sources`);
      continue;
    }
    // A form is published by being the page itself; a phone number or an address has to be quoted.
    const published =
      (contact.channel === "FORM" && samePage(contact.value, contact.sourceUrl)) ||
      source.quotes.some((quote) => quote.toLocaleLowerCase().includes(contact.value.toLocaleLowerCase()));
    if (!published) found.error(`${label} value is not present in the cited source quotes`);
  }

  checkCalls(at, resource, found);
  checkEvidenceDate(at, data, resource, today, found);

  for (const metric of resource.metrics ?? []) {
    const label = `${at}: metric ${metric.measure} ("${metric.label}")`;
    if (!sourceUrls.has(metric.sourceUrl)) found.error(`${label} cites ${metric.sourceUrl}, which is not one of its sources`);
    if (metric.asOf > today) found.error(`${label} asOf ${metric.asOf} is in the future`);
    const units = UNITS_BY_MEASURE[metric.measure];
    if (units && !units.includes(metric.unit)) found.error(`${label} is in ${metric.unit}; use ${units.join(" or ")}`);
    if (metric.measure === "OTHER") found.warn(`${label} uses OTHER; check whether a listed measure describes it`);
  }
}

/**
 * `lastEvidenceDate` is the newest date the page itself shows, which is what tells a reader how fresh
 * a resource is. Two things make it meaningless: a date from the future, and the date the page was
 * read, which is the easiest wrong answer to give. A page that has shown nothing new for years while
 * the file calls the resource ACTIVE is worth a second look rather than a failure.
 */
function checkEvidenceDate(at: string, data: EditionSnapshot, resource: Resource, today: string, found: Problems): void {
  const date = resource.lastEvidenceDate;
  if (date === undefined) return;
  if (date > today) found.error(`${at}: lastEvidenceDate ${date} is in the future`);
  const researchDates = new Set([data.published, ...resource.sources.map((source) => source.consultedOn)]);
  if (researchDates.has(date)) {
    found.warn(
      `${at}: lastEvidenceDate ${date} equals a consultation or publication date; it must be a date the page itself shows, or be omitted`,
    );
  }
  const staleBefore = `${Number(data.published.slice(0, 4)) - STALE_EVIDENCE_YEARS}${data.published.slice(4)}`;
  if (resource.status === "ACTIVE" && date < staleBefore) {
    found.warn(`${at}: ACTIVE, but the latest date its page shows is ${date}; confirm it still operates or use UNKNOWN`);
  }
}

/**
 * Each call's state is what its source showed on the day it was read, so the dates it carries have to
 * agree with that day. OPEN and UPCOMING contradictions are errors: they would tell a reader they can
 * still apply when they cannot. A CLOSED call whose published deadline has not passed only warns,
 * because calls do close early when the budget runs out, and the page says so.
 */
function checkCalls(at: string, resource: Resource, found: Problems): void {
  const consultedOn = new Map(resource.sources.map((source) => [source.url, source.consultedOn]));
  for (const call of resource.calls ?? []) {
    const where = `${at}: call "${call.name}"`;
    const consulted = consultedOn.get(call.sourceUrl);
    if (consulted === undefined) {
      found.error(`${where} cites ${call.sourceUrl}, which is not one of the resource's sources`);
      continue;
    }
    const { state, opens, closes } = call;
    if (opens && closes && closes < opens) found.error(`${where} closes before it opens`);
    if (state === "OPEN") {
      if (resource.status !== "ACTIVE") found.error(`${where} is OPEN, which requires status ACTIVE`);
      if (opens && opens > consulted) {
        found.error(`${where} is OPEN but opens on ${opens}, after the consultation (${consulted}); use UPCOMING`);
      }
      if (closes && closes < consulted) found.error(`${where} is OPEN but closed on ${closes}, before the consultation (${consulted})`);
    }
    if (state === "UPCOMING") {
      if (!opens) found.error(`${where} is UPCOMING and needs its opening date`);
      else if (opens <= consulted) found.error(`${where} is UPCOMING but opened on ${opens}, by the consultation (${consulted})`);
    }
    if (state === "NOT_PUBLISHED" && (opens || closes)) {
      found.error(`${where} is NOT_PUBLISHED but carries dates; use the state its dates and consultation show`);
    }
    if (state === "CLOSED") {
      if (opens && opens > consulted) {
        found.error(`${where} is CLOSED but opens on ${opens}, after the consultation (${consulted}); use UPCOMING`);
      }
      if (closes && closes >= consulted) {
        found.warn(
          `${where} is CLOSED although it closes on ${closes}, after the consultation (${consulted}); confirm the page says it closed early`,
        );
      }
    }
  }
}

/** An edition is one year, so its news is the events of that year, up to the day it was published. */
function checkNews(data: EditionSnapshot, found: Problems): void {
  const ids = new Set<string>();
  for (const item of data.news) {
    const at = `news "${item.id}"`;
    if (ids.has(item.id)) found.error(`${at}: duplicate id`);
    ids.add(item.id);
    if (item.date < `${data.edition}-01-01` || item.date > `${data.edition}-12-31`) {
      found.error(`${at}: date ${item.date} is outside edition ${data.edition}`);
    }
    if (item.date > data.published) found.error(`${at}: date ${item.date} is after published ${data.published}`);
  }
}

/**
 * What a shared access page means: the same page is cited as the way into two different records. It
 * can be one instrument written twice, or two real instruments that a portal describes on one page.
 * Only a person can tell, so it is listed for review and never fails a check.
 */
export type EditionReport = Report & { reviews: Finding[] };

const sharedPage = (id: string, url: string, other: { file: string; id: string }): string =>
  `resource "${id}" shares its access page ${url} with "${other.id}" in ${other.file}; check whether it is the same instrument`;

/** Higher layers come first, so the file that owns an id or a page is the widest one that has it. */
const LAYER_ORDER = { "eu-snapshot": 0, "country-snapshot": 1, "hub-snapshot": 2, "regional-snapshot": 3 } as const;

/**
 * The rules that span the files of one edition. A reader's view is cumulative — EU, then the country,
 * then the region's hub when it has a file, then the region — so:
 *
 * - a resource id and a news id are used once in the whole edition, because a view mixes files and
 *   two records with one id cannot both be linked;
 * - news may link only to resources the reader of that file can see, which is its own file and the
 *   layers above it, never a sibling region;
 * - a figure in the file's own voice — its summary, its limitations, its news — is supported by the
 *   evidence of that same view, because a lower layer never repeats what it inherits;
 * - reader-facing text names no resource id, territory slug or repository path;
 * - a resource whose access page already belongs to a resource in a higher layer, or in a sibling file
 *   of the same country at the same level, is listed for review.
 */
export function checkEdition(snapshots: readonly LoadedSnapshot[], territories: Territories): EditionReport {
  const errors: Finding[] = [];
  const reviews: Finding[] = [];
  const ordered = snapshots.toSorted((a, b) => LAYER_ORDER[a.data.schemaId] - LAYER_ORDER[b.data.schemaId] || a.file.localeCompare(b.file));

  const resourceOwner = new Map<string, string>();
  const newsOwner = new Map<string, string>();
  for (const { file, data } of ordered) {
    for (const [kind, owners, records] of [
      ["resource", resourceOwner, data.resources],
      ["news", newsOwner, data.news],
    ] as const) {
      for (const record of records) {
        const owner = owners.get(record.id);
        if (owner !== undefined && owner !== file) errors.push({ file, message: `${kind} id "${record.id}" is already used in ${owner}` });
        else owners.set(record.id, file);
      }
    }
  }

  /** The files this one inherits from: its ancestors in the tree, never a sibling or another country. */
  const inherited = (data: EditionSnapshot): LoadedSnapshot[] => {
    const ancestors = new Set(ancestorLayers(snapshotLayer(data), territories).map(layerKey));
    return ordered.filter((other) => ancestors.has(layerKey(snapshotLayer(other.data))));
  };

  // The first resource seen for each (country, level, page) among files that do not inherit from each other.
  const siblingPages = new Map<string, { file: string; id: string }>();
  for (const { file, data } of ordered) {
    const higher = inherited(data);
    const higherPages = new Map(
      higher.flatMap(({ file: other, data: above }) =>
        above.resources.map((resource) => [canonicalPage(resource.accessUrl), { file: other, id: resource.id }] as const),
      ),
    );
    for (const resource of data.resources) {
      const page = canonicalPage(resource.accessUrl);
      const above = higherPages.get(page);
      if (above) reviews.push({ file, message: sharedPage(resource.id, resource.accessUrl, above) });
      // The EU layer has no siblings, being the only file of its level.
      if (data.schemaId === "eu-snapshot") continue;
      const key = `${snapshotCountry(data)}|${data.schemaId}|${page}`;
      const sibling = siblingPages.get(key);
      if (!sibling) siblingPages.set(key, { file, id: resource.id });
      else if (sibling.file !== file) reviews.push({ file, message: sharedPage(resource.id, resource.accessUrl, sibling) });
    }

    const visible = new Set([...data.resources, ...higher.flatMap(({ data: above }) => above.resources)].map((resource) => resource.id));
    for (const item of data.news) {
      for (const id of item.resourceIds ?? []) {
        if (!visible.has(id)) {
          errors.push({ file, message: `news "${item.id}" links resource "${id}", which is not in this file or a higher layer` });
        }
      }
    }

    // The file's own voice is checked against the view a reader of it has, for the same reason: a region
    // that may not repeat the national aid it inherits still has to be able to describe it.
    for (const message of unsupportedFileFigures(
      data,
      higher.map(({ data: above }) => above),
    )) {
      errors.push({ file, message });
    }
  }

  // Every identifier a reader must never see in prose: the edition's own ids and the catalogue's slugs.
  const identifiers = new Set([
    ...resourceOwner.keys(),
    ...newsOwner.keys(),
    ...Object.values(territories.jurisdictions).flatMap((entry) => [...entry.hubs, ...entry.regions].map((leaf) => leaf.slug)),
  ]);
  for (const { file, data } of ordered) {
    errors.push(...internalReferencesInText(data, identifiers).map((message) => ({ file, message })));
  }
  return { errors, warnings: [], reviews };
}
