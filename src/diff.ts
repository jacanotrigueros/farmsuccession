/**
 * What changed from one edition to the next: `npm run diff -- <from year> <to year>`.
 *
 * A yearly edition is only worth publishing if the difference between two of them can be read, which is
 * the whole reason a resource keeps the same id for as long as it exists. This compares two editions by
 * that id and says what was added, what disappeared, what changed in a way a reader would notice, and
 * what the newer edition recorded as news.
 *
 * It also reports the two ways continuity breaks, which `npm run validate` turns into warnings: a
 * resource that simply vanishes instead of being kept as DISCONTINUED or HISTORICAL, and the same page
 * coming back under a new id. Both destroy the only thing that makes a series of editions a series.
 */
import { loadSnapshots, type LoadedSnapshot } from "./editions.ts";
import { isEntryPoint, runMain } from "./paths.ts";
import type { Metric, Resource } from "./types/edition.ts";
import { canonicalPage } from "./urls.ts";

type Located = { id: string; file: string; name: string };

export type EditionDiff = {
  from: string;
  to: string;
  added: Array<Located & { status: string }>;
  removed: Located[];
  changed: Array<Located & { changes: string[] }>;
  renamedIds: Array<{ previousId: string; id: string; file: string; url: string }>;
  news: Array<{ id: string; file: string; date: string; headline: string }>;
};

function indexById(snapshots: readonly LoadedSnapshot[]): Map<string, { file: string; resource: Resource }> {
  return new Map(snapshots.flatMap(({ file, data }) => data.resources.map((resource) => [resource.id, { file, resource }] as const)));
}

const metricKey = (metric: Metric): string => `${metric.measure}|${metric.label}`;

/**
 * What a reader would notice between two editions of the same record: it stopped operating, the link
 * moved, the name changed, a figure moved, a call opened or closed. Deliberately not a field-by-field
 * diff — an enriched description or a new quote is work, not news.
 */
function describeChanges(before: Resource, after: Resource): string[] {
  const changes: string[] = [];
  if (before.status !== after.status) changes.push(`status ${before.status} → ${after.status}`);
  if (before.name !== after.name) changes.push(`renamed from "${before.name}"`);
  if (canonicalPage(before.accessUrl) !== canonicalPage(after.accessUrl)) changes.push(`link ${before.accessUrl} → ${after.accessUrl}`);

  const previousMetrics = new Map((before.metrics ?? []).map((metric) => [metricKey(metric), metric]));
  for (const metric of after.metrics ?? []) {
    const old = previousMetrics.get(metricKey(metric));
    if (old && old.value !== metric.value) {
      changes.push(`${metric.measure} ${old.value} → ${metric.value} ${metric.unit}`);
    }
  }

  const previousCalls = new Map((before.calls ?? []).map((call) => [call.name, call]));
  const currentCalls = new Map((after.calls ?? []).map((call) => [call.name, call]));
  for (const [name, call] of currentCalls) {
    const old = previousCalls.get(name);
    if (!old) changes.push(`new call "${name}" (${call.state})`);
    else if (old.state !== call.state) changes.push(`call "${name}" ${old.state} → ${call.state}`);
  }
  for (const name of previousCalls.keys()) {
    if (!currentCalls.has(name)) changes.push(`call "${name}" is no longer listed`);
  }
  return changes;
}

export function diffEditions(
  from: string,
  previous: readonly LoadedSnapshot[],
  to: string,
  current: readonly LoadedSnapshot[],
): EditionDiff {
  const before = indexById(previous);
  const after = indexById(current);
  // The page a record was reached by in the older edition, which is how a renamed id is recognised.
  const previousIdByPage = new Map([...before.values()].map(({ resource }) => [canonicalPage(resource.accessUrl), resource.id]));

  const diff: EditionDiff = { from, to, added: [], removed: [], changed: [], renamedIds: [], news: [] };
  for (const [id, { file, resource }] of after) {
    const old = before.get(id);
    if (old) {
      const changes = describeChanges(old.resource, resource);
      if (changes.length > 0) diff.changed.push({ id, file, name: resource.name, changes });
      continue;
    }
    diff.added.push({ id, file, name: resource.name, status: resource.status });
    const previousId = previousIdByPage.get(canonicalPage(resource.accessUrl));
    // Only when the old id is gone: two records may legitimately share a page, and that is a review, not a rename.
    if (previousId !== undefined && !after.has(previousId)) {
      diff.renamedIds.push({ previousId, id, file, url: resource.accessUrl });
    }
  }
  for (const [id, { file, resource }] of before) {
    if (!after.has(id)) diff.removed.push({ id, file, name: resource.name });
  }
  diff.news = current
    .flatMap(({ file, data }) => data.news.map((item) => ({ id: item.id, file, date: item.date, headline: item.headline })))
    .toSorted((a, b) => a.date.localeCompare(b.date));
  return diff;
}

/**
 * The continuity breaks of a diff, as warnings rather than errors: both are about what a reader of two
 * editions can follow, and only a person can say whether a record really ended or was renamed by
 * mistake.
 */
export function continuityWarnings(diff: EditionDiff): Array<{ file: string; message: string }> {
  const renamed = new Set(diff.renamedIds.map((item) => item.previousId));
  return [
    ...diff.removed
      .filter(({ id }) => !renamed.has(id))
      .map(({ id, file }) => ({
        file,
        message: `resource "${id}" is in edition ${diff.from} and not in ${diff.to}: keep its id, with status DISCONTINUED or HISTORICAL if it ended`,
      })),
    ...diff.renamedIds.map(({ previousId, id, file, url }) => ({
      file,
      message: `resource "${id}" is reached by the page of "${previousId}" in ${diff.from} (${url}): an id stays with its instrument across editions`,
    })),
  ];
}

export function renderDiff(diff: EditionDiff): string {
  const lines = [`# Changes from ${diff.from} to ${diff.to}`, ""];
  const section = (title: string, items: readonly string[]): void => {
    lines.push(`## ${title} (${items.length})`, "", ...(items.length > 0 ? items : ["None."]), "");
  };
  section(
    "Added",
    diff.added.map((item) => `- \`${item.id}\` ${item.name} — ${item.status} (${item.file})`),
  );
  section(
    "No longer listed",
    diff.removed.map((item) => `- \`${item.id}\` ${item.name} (${item.file})`),
  );
  section(
    "Changed",
    diff.changed.map((item) => `- \`${item.id}\` ${item.name}: ${item.changes.join("; ")}`),
  );
  section(
    `News recorded in ${diff.to}`,
    diff.news.map((item) => `- ${item.date} ${item.headline} (${item.file})`),
  );
  if (diff.renamedIds.length > 0) {
    section(
      "Same page, different id",
      diff.renamedIds.map((item) => `- ${item.previousId} → ${item.id} (${item.file})`),
    );
  }
  return lines.join("\n");
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const [from, to] = process.argv.slice(2);
    if (!from || !to || !/^\d{4}$/u.test(from) || !/^\d{4}$/u.test(to)) {
      console.error("usage: npm run diff -- <from year> <to year>");
      return 2;
    }
    const previous = loadSnapshots({ edition: from });
    const current = loadSnapshots({ edition: to });
    const problems = [...previous.problems, ...current.problems];
    // A file that cannot be read is a comparison that would quietly understate what changed.
    for (const problem of problems) console.error(`cannot compare ${problem.file}: ${problem.message}`);
    console.log(renderDiff(diffEditions(from, previous.snapshots, to, current.snapshots)));
    return problems.length > 0 ? 1 : 0;
  });
}
