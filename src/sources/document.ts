/**
 * A fetched page reduced to something a recorded quote can be compared against, and the two ways a
 * page can answer without being the page: a bot challenge and a 200 that says the page is gone.
 *
 * This is where the evidence check becomes either trustworthy or useless. Normalise too little and
 * every restyled heading reads as a lost claim; normalise too much and a transcription error passes as
 * verified. The line drawn here is: ignore what a reader cannot see, keep everything a reader can.
 */
import { decodeHTML } from "entities";

/**
 * `text` is what a reader sees: scripts and styles removed, tags stripped, entities decoded,
 * whitespace collapsed. `raw` keeps the markup, decoded and collapsed, because some evidence lives
 * only in an attribute — the date inside the href of a regulation PDF, a figure in an alt text.
 */
export type NormalizedDocument = { title: string | null; text: string; raw: string };

/**
 * Soft hyphens and zero-width characters only tell a browser where it may break a line or join
 * glyphs. A reader never sees them, so "Über­gän­ge" on the page is "Übergänge" in a quote.
 */
const INVISIBLE = /[­​-‍⁠﻿]/gu;
const collapse = (value: string): string => value.replaceAll(INVISIBLE, "").replaceAll(/\s+/gu, " ").trim();

/**
 * Phrasing elements render inside a line without a break, so removing them must not insert a space:
 * "1<sup>er</sup> janvier" reads "1er janvier" and "<b>Banco</b>s" reads "Bancos". Every other tag
 * separates text, because a heading and the paragraph under it are not one word.
 */
const INLINE_TAG = /<\/?(?:a|abbr|b|bdi|bdo|cite|code|data|dfn|em|i|kbd|mark|q|s|samp|small|span|strong|sub|sup|time|u|var)\b[^>]*>/giu;

export function normalizeHtml(html: string): NormalizedDocument {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/iu.exec(html)?.[1];
  const visible = html
    .replaceAll(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/giu, " ")
    .replaceAll(INLINE_TAG, "")
    .replaceAll(/<[^>]+>/gu, " ");
  return {
    title: title === undefined ? null : collapse(decodeHTML(title)),
    text: collapse(decodeHTML(visible)),
    raw: collapse(decodeHTML(html)),
  };
}

/** A PDF or a text file: there is no markup, so what a reader sees is all there is. */
export function normalizePlainText(text: string): NormalizedDocument {
  const collapsed = collapse(text);
  return { title: null, text: collapsed, raw: collapsed };
}

export type QuoteMatch = { quote: string; foundIn: "text" | "raw" | null };

/**
 * Case-insensitive and whitespace-insensitive, and nothing else. Portals restyle headings, so
 * "PECHADO" becoming "Pechado" is not a lost claim; but a hyphen is not an en dash and an "o" is not
 * an "ó", and equating them would let a transcription error pass as verified evidence.
 *
 * The limit of what this can promise: `text` is one stream of what a reader sees, so a quote that runs
 * from a heading into the paragraph under it matches, even though the page never shows that sentence
 * on one line. Keeping the blocks apart instead would fail the many pages that split a single sentence
 * for styling, which is the more common case by far. What a match proves is that the words are on the
 * page in that order, not that they are one sentence.
 */
export function matchQuote(document: NormalizedDocument, quote: string): QuoteMatch {
  const needle = collapse(quote).toLowerCase();
  if (document.text.toLowerCase().includes(needle)) return { quote, foundIn: "text" };
  if (document.raw.toLowerCase().includes(needle)) return { quote, foundIn: "raw" };
  return { quote, foundIn: null };
}

const CHALLENGE_HOST = /(?:^|\.)(?:perfdrive\.com|radware\.com)$/iu;
const CHALLENGE_MARKER = /cf-chl-|challenge-platform|verify you are human|checking your browser before|radware bot manager/iu;
/** Enough of the body to carry a challenge script, without scanning a whole gazette for it. */
const CHALLENGE_SCAN_CHARS = 20_000;

/**
 * A bot-protection interstitial instead of the page: a redirect to a known challenge service, or a
 * body carrying a challenge marker. What it says about the cited page is nothing, so it must never
 * count as a pass and never as a failure.
 */
export function looksLikeBotChallenge(finalUrl: string, document: NormalizedDocument | null): boolean {
  const url = new URL(finalUrl);
  if (CHALLENGE_HOST.test(url.hostname)) return true;
  // A shield page that carries the path to return to after the check, in a `u` parameter.
  if (/^\/shield\/?$/iu.test(url.pathname) && url.searchParams.has("u")) return true;
  return document !== null && CHALLENGE_MARKER.test(document.raw.slice(0, CHALLENGE_SCAN_CHARS));
}

/** Said in the title of a page that is gone, in the languages the sources are written in. */
const NOT_FOUND_TITLE =
  /\b404\b|not found|page introuvable|no encontrad|no existe|non trovata|non trovato|não encontrada|nicht gefunden|existiert nicht/iu;

/**
 * A page that answers 200 and tells the reader it does not exist. Portals do this constantly, and
 * trusting the status code alone would report a dead citation as a live one.
 */
export function looksLikeSoftNotFound(document: NormalizedDocument): boolean {
  return document.title !== null && NOT_FOUND_TITLE.test(document.title);
}
