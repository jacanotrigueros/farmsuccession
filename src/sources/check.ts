/**
 * Turning what a page answered into a verdict, and visiting portals politely enough that nobody has a
 * reason to block us.
 *
 * Nothing here fetches anything: the fetcher is a parameter, so every rule below is driven by a
 * function in the tests and the network is never touched to prove one.
 */
import { looksLikeBotChallenge, looksLikeSoftNotFound, matchQuote, type QuoteMatch } from "./document.ts";
import type { FetchedPage, Fetcher } from "./fetch.ts";
import { samePage } from "../urls.ts";

/**
 * PASS: the page answered and every quote was found again.
 * FAIL: evidence that the citation no longer holds — an address that is gone, a page telling readers
 * it does not exist, or a quote that is not there.
 * UNCHECKED: this run could not read the page. Not a failure, and not proof of anything either, which
 * is why it is its own answer instead of being folded into one of the other two.
 */
export type CheckStatus = "PASS" | "FAIL" | "UNCHECKED";

/** One URL to check, with every quote recorded against it and who cites it. */
export type PlannedCheck = { url: string; quotes: string[]; citedBy: string[] };

export type CheckReport = {
  url: string;
  status: CheckStatus;
  httpStatus: number | null;
  finalUrl: string;
  elapsedMs: number;
  notes: string[];
  quotes: QuoteMatch[];
  citedBy: string[];
};

/**
 * Below this much readable text, a page whose quotes are missing is taken to be a shell a script fills
 * in later rather than a page that changed. The consequence, stated plainly: a page with less text than
 * this can never fail a quote check — it comes back UNCHECKED, which is the side that asks a person to
 * look rather than the side that quietly certifies or quietly condemns.
 */
export const SCRIPT_SHELL_CHARS = 200;

/**
 * What one answer means for one citation.
 *
 * The order of the rules is the point. A bot challenge is recognised before the status code, because a
 * challenge usually arrives as 403 and "a challenge replaced the page" says more than "the host
 * refused". A 403 or 429 is a host declining automation and a 5xx is a host having a bad day: neither
 * says anything about the citation. Only a 4xx that means the address is gone is a failure.
 *
 * A page whose quotes are all missing but which has almost no text at all was never rendered for us,
 * so it is unchecked rather than failed: that is the difference between "the evidence is gone" and
 * "this page needs a browser".
 */
export function evaluate(check: PlannedCheck, page: FetchedPage): CheckReport {
  const base = {
    url: check.url,
    httpStatus: page.httpStatus,
    finalUrl: page.finalUrl,
    elapsedMs: page.elapsedMs,
    citedBy: check.citedBy,
  };
  const notes: string[] = [];
  const result = (status: CheckStatus, note: string): CheckReport => ({ ...base, status, notes: [...notes, note], quotes: [] });

  if (page.httpStatus === null) return result("UNCHECKED", `no response: ${page.error ?? "unknown error"}`);
  if (looksLikeBotChallenge(page.finalUrl, page.document)) {
    return result("UNCHECKED", `host answered with a bot challenge (${new URL(page.finalUrl).hostname}) instead of the page`);
  }
  if (!samePage(check.url, page.finalUrl)) notes.push(`redirects to ${page.finalUrl}; consider citing the final page`);
  if (page.httpStatus === 403 || page.httpStatus === 429) {
    return result("UNCHECKED", `HTTP ${page.httpStatus}: host refused an automated request`);
  }
  if (page.httpStatus >= 500) return result("UNCHECKED", `HTTP ${page.httpStatus}: server error`);
  if (page.httpStatus >= 400) return result("FAIL", `HTTP ${page.httpStatus}`);
  if (!page.document) return result("UNCHECKED", page.error ?? `content type ${page.contentType ?? "unknown"} could not be read`);
  if (looksLikeSoftNotFound(page.document)) {
    return result("FAIL", `page answers ${page.httpStatus} but its title says it does not exist: "${page.document.title}"`);
  }

  const document = page.document;
  const quotes = check.quotes.map((quote) => matchQuote(document, quote));
  const missing = quotes.filter((quote) => quote.foundIn === null).length;
  if (missing && document.text.length < SCRIPT_SHELL_CHARS) {
    return result(
      "UNCHECKED",
      `the page has almost no readable text (${document.text.length} characters); it is probably rendered by JavaScript`,
    );
  }
  if (missing) notes.push(`${missing} of ${quotes.length} quote(s) not found on the page`);
  return { ...base, status: missing ? "FAIL" : "PASS", notes, quotes };
}

/**
 * One retry, and only when there was no response at all: small portals time out now and then, and a
 * timeout is the one answer that says nothing. An HTTP status is an answer and is never retried.
 */
export async function fetchWithRetry(
  url: string,
  fetcher: Fetcher,
  sleep: (ms: number) => Promise<void>,
  retryDelayMs = 10_000,
): Promise<FetchedPage> {
  const first = await fetcher(url);
  if (first.httpStatus !== null) return first;
  await sleep(retryDelayMs);
  const second = await fetcher(url);
  // Both attempts are reported, because two different failures are a different story from one repeated.
  return second.httpStatus === null ? { ...second, error: `${second.error} (also on first attempt: ${first.error})` } : second;
}

export type RunOptions = {
  concurrentHosts?: number;
  perHostDelayMs?: number;
  retryDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  onReport?: (report: CheckReport) => void;
};

/**
 * Runs the checks politely: a bounded number of hosts at a time, and within one host a single request
 * at a time with a pause between them. A ministry portal should not be able to tell that a check ran.
 *
 * Grouping by host is what makes that possible, and it is also why the reports are reordered at the
 * end: the answer belongs to the citation, not to the order the hosts happened to finish in.
 */
export async function runChecks(checks: readonly PlannedCheck[], fetcher: Fetcher, options: RunOptions = {}): Promise<CheckReport[]> {
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const byHost = new Map<string, PlannedCheck[]>();
  for (const check of checks) {
    const host = new URL(check.url).host;
    const queue = byHost.get(host);
    if (queue) queue.push(check);
    else byHost.set(host, [check]);
  }
  const queues = [...byHost.values()];
  const reports = new Map<string, CheckReport>();

  const worker = async (): Promise<void> => {
    for (let queue = queues.shift(); queue; queue = queues.shift()) {
      for (const [index, check] of queue.entries()) {
        // Sequential on purpose: one request at a time per host is the politeness guarantee.
        // oxlint-disable-next-line no-await-in-loop
        if (index > 0) await sleep(options.perHostDelayMs ?? 1_000);
        // oxlint-disable-next-line no-await-in-loop
        const report = evaluate(check, await fetchWithRetry(check.url, fetcher, sleep, options.retryDelayMs));
        reports.set(check.url, report);
        options.onReport?.(report);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(options.concurrentHosts ?? 6, queues.length) }, worker));

  return checks.map((check) => {
    const report = reports.get(check.url);
    if (!report) throw new Error(`no report produced for ${check.url}`);
    return report;
  });
}

export type Totals = { pass: number; fail: number; unchecked: number };

export function summarize(reports: readonly CheckReport[]): Totals {
  const count = (status: CheckStatus): number => reports.filter((report) => report.status === status).length;
  return { pass: count("PASS"), fail: count("FAIL"), unchecked: count("UNCHECKED") };
}
