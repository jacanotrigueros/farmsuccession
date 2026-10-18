/**
 * How much of each host's listing this research has taken, which is the number a right over a
 * collection is about.
 *
 * `config/source-terms.json` answers three uses and the citation check can guard only two: a record
 * shows the page it quotes and the page it links, so a refusal of either is visible in the corpus.
 * The third is not. A directory the research walked and never cited leaves no trace in any published
 * record, and in the EU the question about a listing is not whether one page was copied but whether a
 * substantial part of a collection was.
 *
 * Two numbers, because the briefs record two different things and neither alone is the answer:
 *
 *   leads   — leads whose own address is on that host. This is the closest thing to "entries taken
 *             from them": each one is something somebody found there and wrote down.
 *   portals — briefs that declare the host as a place they went looking. A host declared by many
 *             territories was walked systematically even where few leads came back.
 *
 * What the briefs do not record is which host supplied which lead: `foundBy` names the search that
 * found it, and a search is a string, not a place. So neither number is an extraction count, and
 * calling either one that would be inventing a measurement.
 *
 * It decides nothing and reaches no network. It is the number to look at before writing `extract`
 * into a reading.
 */
import { loadBriefs } from "../src/briefs.ts";
import { isEntryPoint, runMain } from "../src/paths.ts";

export type DiscoveryCount = { host: string; leads: number; admitted: number; portals: number };

function hostOf(url: string | undefined): string | null {
  if (url === undefined) return null;
  try {
    return new URL(url).host.replace(/^www\./u, "").toLowerCase();
  } catch {
    return null;
  }
}

export function discoveryCounts(): { counts: DiscoveryCount[]; leadsPlaced: number; leadsWithoutHost: number } {
  const { briefs } = loadBriefs();
  const rows = new Map<string, { leads: number; admitted: number; portals: number }>();
  const row = (host: string) => rows.get(host) ?? { leads: 0, admitted: 0, portals: 0 };
  let leadsPlaced = 0;
  let leadsWithoutHost = 0;

  for (const { brief } of briefs) {
    for (const lead of brief.leads ?? []) {
      const host = hostOf(lead.url);
      if (host === null) {
        leadsWithoutHost += 1;
        continue;
      }
      leadsPlaced += 1;
      const current = row(host);
      current.leads += 1;
      if (lead.status === "ADMITTED") current.admitted += 1;
      rows.set(host, current);
    }
    // A portal counts once per brief that declares it, however many times it appears inside one.
    for (const host of new Set((brief.portals ?? []).map((portal) => hostOf(portal.url)).filter((h): h is string => h !== null))) {
      const current = row(host);
      current.portals += 1;
      rows.set(host, current);
    }
  }

  const counts = [...rows.entries()]
    .map(([host, values]) => ({ host, leads: values.leads, admitted: values.admitted, portals: values.portals }))
    .toSorted((a, b) => b.leads - a.leads || b.portals - a.portals || a.host.localeCompare(b.host));
  return { counts, leadsPlaced, leadsWithoutHost };
}

if (isEntryPoint(import.meta.url)) {
  runMain(() => {
    const { counts, leadsPlaced, leadsWithoutHost } = discoveryCounts();
    console.log(`leads with an address: ${leadsPlaced}; without one: ${leadsWithoutHost}; distinct hosts: ${counts.length}`);
    console.log("\nleads  admitted  briefs  host");
    for (const r of counts.slice(0, 30)) {
      console.log(String(r.leads).padStart(5), String(r.admitted).padStart(9), String(r.portals).padStart(7), " ", r.host);
    }
    const over = (n: number): number => counts.filter((r) => r.leads >= n).length;
    console.log(`\nhosts with 3 or more leads: ${over(3)}   5 or more: ${over(5)}   10 or more: ${over(10)}`);
    console.log("Neither column is an extraction count: read the host's own terms before writing extract into config/source-terms.json.");
    return 0;
  });
}
