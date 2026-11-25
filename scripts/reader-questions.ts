/**
 * The inventory of reader questions each record of the current edition leaves open, as JSON on stdout:
 * one row per record with its territory file, kind, answers and open questions, then a count by kind.
 * It reads the edition and writes nothing, so the review that fills the gaps can be planned from it.
 */
import { loadSnapshots } from "../src/editions.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";
import { questionsOf } from "../src/reader-questions.ts";

export function inventory(): { records: unknown[]; byKind: Record<string, { total: number; complete: number }> } {
  const { snapshots, problems } = loadSnapshots({});
  if (problems.length) throw new Error(`the edition does not load: ${JSON.stringify(problems)}`);
  const edition = snapshots
    .map(({ data }) => data.edition)
    .toSorted()
    .at(-1);
  const current = snapshots.filter(({ data }) => data.edition === edition);
  const appliedBy = new Map<string, number>();
  for (const { data } of current) {
    for (const resource of data.resources) {
      for (const { resourceId } of resource.implements ?? []) appliedBy.set(resourceId, (appliedBy.get(resourceId) ?? 0) + 1);
    }
  }
  const records = current.flatMap(({ file, data }) =>
    data.resources.map((resource) => ({
      id: resource.id,
      file,
      kind: resource.kind,
      ...questionsOf(resource, appliedBy.get(resource.id)),
    })),
  );
  const byKind: Record<string, { total: number; complete: number }> = {};
  for (const record of records) {
    const row = (byKind[record.kind] ??= { total: 0, complete: 0 });
    row.total += 1;
    if (record.open.length === 0) row.complete += 1;
  }
  return { records, byKind };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    process.stdout.write(`${JSON.stringify(inventory(), null, 2)}\n`);
    return 0;
  });
}
