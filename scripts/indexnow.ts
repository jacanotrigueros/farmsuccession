/**
 * Tell the search engines that take IndexNow (Bing, Yandex, Seznam, Naver and others) which pages a
 * publication changed, instead of waiting for them to crawl the sitemap again.
 *
 * It runs after a publication, against the site as readers now get it: the sitemap it reads is the one
 * that was just deployed, so a page is never announced before it exists. Bing had indexed 210 of the 479
 * pages the sitemap then declared, with no crawl errors: it knew the addresses and had not come for them.
 *
 * The key is public by design. The protocol proves the site is ours by asking for /<key>.txt, which the
 * build publishes from frontend/public; a key here and a file there that disagree would make every
 * submission fail, which test/indexnow.test.ts guards.
 */
import { isEntryPoint, runMain } from "../src/paths.ts";

export const INDEXNOW_KEY = "7a6f1d45a89aff326fb379ee92d79797";
export const SITE = "https://farmsuccession.eu";
const ENDPOINT = "https://api.indexnow.org/indexnow";
/** The protocol accepts up to 10,000 URLs in one request. */
const BATCH = 10_000;

/** The page addresses of a sitemap, only those on this site. */
export function sitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map(([, url]) => url!.trim()).filter((url) => url.startsWith(`${SITE}/`));
}

/** The request body the protocol asks for. */
export function submission(urls: readonly string[]): { host: string; key: string; keyLocation: string; urlList: string[] } {
  return { host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: [...urls] };
}

async function main(): Promise<number> {
  const key = await fetch(`${SITE}/${INDEXNOW_KEY}.txt`);
  if (!key.ok || (await key.text()).trim() !== INDEXNOW_KEY) {
    console.error(`the key file ${SITE}/${INDEXNOW_KEY}.txt is not served (HTTP ${key.status}); nothing was submitted`);
    return 1;
  }
  const sitemap = await fetch(`${SITE}/sitemap.xml`);
  if (!sitemap.ok) {
    console.error(`the published sitemap answered HTTP ${sitemap.status}; nothing was submitted`);
    return 1;
  }
  const urls = sitemapUrls(await sitemap.text());
  if (urls.length === 0) {
    console.error("the published sitemap lists no page of this site; nothing was submitted");
    return 1;
  }
  const batches = Array.from({ length: Math.ceil(urls.length / BATCH) }, (_, i) => urls.slice(i * BATCH, (i + 1) * BATCH));
  const results = await Promise.all(
    batches.map(async (batch) => {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(submission(batch)),
      });
      return { size: batch.length, status: response.status, text: await response.text() };
    }),
  );
  // 200 and 202 both mean received; anything else is reported with the engine's own words.
  let refused = 0;
  for (const { size, status, text } of results) {
    if (status === 200 || status === 202) {
      console.log(`IndexNow received ${size} URLs (HTTP ${status})`);
    } else {
      console.error(`IndexNow refused ${size} URLs: HTTP ${status} ${text.slice(0, 300)}`);
      refused += 1;
    }
  }
  if (refused > 0) return 1;
  return 0;
}

if (isEntryPoint(import.meta.url)) runMain(main);
