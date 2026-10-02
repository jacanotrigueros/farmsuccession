/**
 * Reading one cited page: the only module in the repository that goes out to the network.
 *
 * Everything that decides a verdict is kept out of here, so every rule can be tested without a
 * request. What this module owes the rest is an honest account of what happened, including the
 * failures: a page that could not be read is reported as such and never as a page that said nothing.
 */
import { extractText, getDocumentProxy } from "unpdf";

import { describeError } from "../errors.ts";
import { normalizeHtml, normalizePlainText, type NormalizedDocument } from "./document.ts";

/**
 * What one request came back with.
 *
 * `httpStatus: null` means there was no response at all — DNS, TLS, a timeout — and `error` says
 * which. A response whose body could not be read keeps its status and carries `error` too, so it is
 * never confused with an unreachable host: one means the page may be fine and we failed, the other
 * means nobody answered.
 */
export type FetchedPage = {
  httpStatus: number | null;
  finalUrl: string;
  contentType: string | null;
  document: NormalizedDocument | null;
  error: string | null;
  elapsedMs: number;
};

/** Injected wherever pages are checked, so the rules can be driven by a function instead of a portal. */
export type Fetcher = (url: string) => Promise<FetchedPage>;

export type FetchOptions = { userAgent?: string; acceptLanguage?: string; maxBytes?: number; timeoutMs?: number };

/**
 * The checker says what it is rather than posing as a browser: a public project reading public pages
 * has no reason to disguise itself, and a portal that wants to refuse automation is entitled to. If a
 * portal starts refusing it, CHECKER_USER_AGENT overrides it for one run and the pitfall belongs in
 * that territory's research notes, not in a permanent disguise.
 */
export const DEFAULT_USER_AGENT = "FarmSuccessionChecker/1.0 (+https://github.com/jacanotrigueros/farmsuccession)";
/** Gazette PDFs run to tens of megabytes; past this a body is cancelled rather than held in memory. */
export const MAX_BYTES = 20 * 1024 * 1024;
const TIMEOUT_MS = 45_000;

/** Reads a body up to `maxBytes`, cancelling anything larger instead of buffering it. */
export async function readLimited(response: Response, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length"));
  if (declared > maxBytes) {
    await response.body?.cancel();
    throw new Error(`body of ${declared} bytes exceeds the ${maxBytes}-byte limit`);
  }
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    // A stream arrives chunk by chunk, so the await belongs in the loop.
    // oxlint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) break;
    chunks.push(value);
  }
  if (size > maxBytes) {
    await reader.cancel();
    throw new Error(`body exceeds the ${maxBytes}-byte limit`);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/**
 * The character set the page declares: the Content-Type header first, then a `<meta charset>` near the
 * top, UTF-8 otherwise. Plenty of official portals still serve ISO-8859-1, and reading those as UTF-8
 * would break every accented quote and report the evidence as missing.
 */
export function charsetOf(contentType: string | null, head: Uint8Array): string {
  const fromHeader = /charset=["']?([\w-]+)/iu.exec(contentType ?? "")?.[1];
  const fromMeta = /<meta[^>]+charset=["']?([\w-]+)/iu.exec(new TextDecoder("latin1").decode(head.subarray(0, 4096)))?.[1];
  const label = (fromHeader ?? fromMeta ?? "utf-8").toLowerCase();
  try {
    return new TextDecoder(label).encoding;
  } catch {
    // An unknown label is a fault of the page, not a reason to drop it: read it as UTF-8, as a browser would.
    return "utf-8";
  }
}

/** A PDF starts with "%PDF-" in its first kilobyte, whatever the server calls it. */
const PDF_SIGNATURE = /^\s*%PDF-/u;
const looksLikePdf = (body: Uint8Array): boolean => PDF_SIGNATURE.test(new TextDecoder("latin1").decode(body.subarray(0, 1024)));

/**
 * The page as text, or null when the content is something no quote could be checked against.
 *
 * PDFs are read because the strongest evidence is often a decree, and a download endpoint frequently
 * serves one as a generic binary stream, so the signature decides rather than the header.
 */
async function readDocument(response: Response, maxBytes: number): Promise<NormalizedDocument | null> {
  const contentType = response.headers.get("content-type");
  const declaredPdf = contentType?.includes("pdf") === true || new URL(response.url).pathname.toLowerCase().endsWith(".pdf");
  const genericBinary = contentType?.includes("octet-stream") ?? false;
  if (!declaredPdf && !genericBinary && contentType !== null && !/html|xml|text/u.test(contentType)) {
    await response.body?.cancel();
    return null;
  }
  const body = await readLimited(response, maxBytes);
  const isPdf = declaredPdf || looksLikePdf(body);
  if (genericBinary && !isPdf) return null;
  if (isPdf) {
    // verbosity 0 keeps pdf.js font warnings out of the report; they say nothing about the evidence.
    const pdf = await getDocumentProxy(body, { verbosity: 0 });
    const { text } = await extractText(pdf, { mergePages: true });
    return normalizePlainText(text);
  }
  return normalizeHtml(new TextDecoder(charsetOf(contentType, body)).decode(body));
}

/** Fetches one page, following redirects, and reads HTML, plain text or a PDF into matchable text. */
export async function fetchPage(url: string, options: FetchOptions = {}): Promise<FetchedPage> {
  const started = Date.now();
  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(options.timeoutMs ?? TIMEOUT_MS),
      headers: {
        "user-agent": options.userAgent ?? process.env.CHECKER_USER_AGENT ?? DEFAULT_USER_AGENT,
        "accept-language": options.acceptLanguage ?? "es,fr,it,pt,de,en;q=0.8",
        accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
      },
    });
  } catch (error) {
    // Reported with its cause, never swallowed: nobody answered, so the page was left uninspected.
    return {
      httpStatus: null,
      finalUrl: url,
      contentType: null,
      document: null,
      error: describeError(error),
      elapsedMs: Date.now() - started,
    };
  }

  const base = { httpStatus: response.status, finalUrl: response.url, contentType: response.headers.get("content-type") };
  if (!response.ok) {
    // Release the socket: an unread body keeps the connection busy.
    await response.body?.cancel();
    return { ...base, document: null, error: null, elapsedMs: Date.now() - started };
  }
  try {
    return { ...base, document: await readDocument(response, options.maxBytes ?? MAX_BYTES), error: null, elapsedMs: Date.now() - started };
  } catch (error) {
    return { ...base, document: null, error: `body could not be read: ${describeError(error)}`, elapsedMs: Date.now() - started };
  }
}
