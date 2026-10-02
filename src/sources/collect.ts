/**
 * What there is to check, and the difference between the two live checks.
 *
 * The evidence check asks whether the quotes a record rests on are still on the page it cites. The link
 * check asks only whether an address still answers, which covers every URL the repository points a
 * reader or a researcher at, quotes or no quotes.
 *
 * Both plan before they fetch, so a page cited by twenty records is read once.
 */
import type { LoadedSnapshot } from "../editions.ts";
import type { Territories } from "../types/territories.ts";
import type { PlannedCheck } from "./check.ts";

type Plan = {
  add: (url: string, citedBy: string, quotes?: readonly string[]) => void;
  checks: () => PlannedCheck[];
};

/** Accumulates references per URL, so each URL is visited once however many records cite it. */
function plan(): Plan {
  const byUrl = new Map<string, { quotes: Set<string>; citedBy: Set<string> }>();
  return {
    add: (url, citedBy, quotes = []) => {
      const entry = byUrl.get(url) ?? { quotes: new Set<string>(), citedBy: new Set<string>() };
      for (const quote of quotes) entry.quotes.add(quote);
      entry.citedBy.add(citedBy);
      byUrl.set(url, entry);
    },
    checks: () =>
      [...byUrl]
        .map(([url, entry]) => ({ url, quotes: [...entry.quotes], citedBy: [...entry.citedBy].toSorted() }))
        .toSorted((a, b) => a.url.localeCompare(b.url)),
  };
}

/** Every source of every resource and news item, with its quotes: what the evidence check reads. */
export function collectSourceChecks(snapshots: readonly LoadedSnapshot[]): PlannedCheck[] {
  const checks = plan();
  for (const { file, data } of snapshots) {
    for (const resource of data.resources) {
      for (const source of resource.sources) checks.add(source.url, `${file}#${resource.id}`, source.quotes);
    }
    for (const item of data.news) {
      for (const source of item.sources) checks.add(source.url, `${file}#news:${item.id}`, source.quotes);
    }
  }
  return checks.checks();
}

const HTTPS_URL = /https:\/\/[^\s"'<>)]+/gu;
/** A URL written at the end of a sentence or a list item keeps its closing punctuation out of itself. */
const urlsIn = (text: string): string[] => (text.match(HTTPS_URL) ?? []).map((url) => url.replace(/[.,;:]+$/u, ""));

/**
 * Every address the repository points at, without quotes: what the link check reads. The sources and
 * access links of every record, the portals and queries named in a coverage method, and the sources of
 * the territorial catalogue itself, which is where the territorial model claims to come from.
 */
export function collectLinkChecks(snapshots: readonly LoadedSnapshot[], territories: Territories): PlannedCheck[] {
  const checks = plan();
  for (const { file, data } of snapshots) {
    const at = `data/editions/${file}`;
    for (const resource of data.resources) {
      checks.add(resource.accessUrl, `${at}#${resource.id}`);
      for (const source of resource.sources) checks.add(source.url, `${at}#${resource.id}`);
    }
    for (const item of data.news) {
      for (const source of item.sources) checks.add(source.url, `${at}#news:${item.id}`);
    }
    for (const method of data.coverage.methods) {
      for (const url of urlsIn(method.detail)) checks.add(url, `${at}#coverage`);
    }
  }
  for (const [iso, jurisdiction] of Object.entries(territories.jurisdictions)) {
    for (const source of jurisdiction.sources) checks.add(source.url, `data/territories.json#${iso}`);
  }
  return checks.checks();
}
