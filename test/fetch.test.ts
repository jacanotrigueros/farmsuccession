import assert from "node:assert/strict";
import { test } from "node:test";

import { charsetOf, type FetchedPage, fetchPage, readLimited } from "../src/sources/fetch.ts";

/**
 * A response the way a server would send one. `url` is the address after redirects, which a Response
 * built by hand leaves empty, so it is defined here as the runtime would.
 */
function respond(body: BodyInit, options: { status?: number; headers?: Record<string, string>; url?: string } = {}): Response {
  const response = new Response(body, { status: options.status ?? 200, headers: options.headers });
  Object.defineProperty(response, "url", { value: options.url ?? "https://example.test/page" });
  return response;
}

/** Runs `fetchPage` against a stand-in for the network, so no test ever leaves the machine. */
async function fetching(answer: () => Response, url = "https://example.test/page"): Promise<FetchedPage> {
  const real = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve(answer());
  try {
    return await fetchPage(url);
  } finally {
    globalThis.fetch = real;
  }
}

test("the character set a page declares is the one it is read with", () => {
  const head = new TextEncoder().encode('<meta charset="iso-8859-15">');
  assert.equal(charsetOf("text/html; charset=ISO-8859-1", new Uint8Array()), "windows-1252", "the header wins");
  assert.equal(charsetOf("text/html", head), "iso-8859-15", "a page that only declares it in a meta tag still says it");
  assert.equal(charsetOf(null, new Uint8Array()), "utf-8", "nothing declared means UTF-8, as a browser assumes");
  assert.equal(charsetOf("text/html; charset=cp-nonsense", new Uint8Array()), "utf-8", "an unknown label is a fault of the page");
});

test("an accented quote survives a page served as Latin-1", async () => {
  const latin1 = new Uint8Array(Buffer.from("<p>Formación agraria</p>", "latin1"));
  const page = await fetching(() => respond(latin1, { headers: { "content-type": "text/html; charset=ISO-8859-1" } }));
  assert.equal(page.document?.text, "Formación agraria");
});

test("a body larger than the limit is cancelled instead of being held in memory", async () => {
  const declared = respond("x".repeat(10), { headers: { "content-length": "999999" } });
  await assert.rejects(readLimited(declared, 100), /exceeds the 100-byte limit/u);
  const undeclared = respond("x".repeat(500));
  await assert.rejects(readLimited(undeclared, 100), /exceeds the 100-byte limit/u);
  assert.equal((await readLimited(respond("hola"), 100)).byteLength, 4);
});

test("no response at all is reported with its cause, not as an empty page", async () => {
  const page = await fetching(() => {
    throw new Error("fetch failed", { cause: Object.assign(new Error("getaddrinfo ENOTFOUND"), { code: "ENOTFOUND" }) });
  });
  assert.equal(page.httpStatus, null);
  assert.match(page.error ?? "", /fetch failed \(ENOTFOUND\)/u, "the cause is what tells a down portal from a blocked one");
  assert.equal(page.document, null);
});

test("a status that is not 200 keeps its status and reads no body", async () => {
  const page = await fetching(() => respond("<p>Nope</p>", { status: 404 }));
  assert.equal(page.httpStatus, 404);
  assert.equal(page.document, null, "the body of an error page is not evidence");
  assert.equal(page.error, null, "the server answered, so nothing failed on our side");
});

test("a content type no quote could be checked against is read as no document", async () => {
  const page = await fetching(() => respond("binary", { headers: { "content-type": "image/png" } }));
  assert.equal(page.httpStatus, 200);
  assert.equal(page.document, null);
  assert.equal(page.contentType, "image/png");
});

test("the final address is recorded, because a redirect may lead somewhere else", async () => {
  const page = await fetching(() => respond("<p>Ayudas</p>", { url: "https://example.test/aid/2026" }));
  assert.equal(page.finalUrl, "https://example.test/aid/2026");
});
