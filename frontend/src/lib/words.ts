/**
 * The site's own words, in each language a territory of the catalogue is written in.
 *
 * The records' text is never translated — it is quoted from a source, in the source's language — so this
 * holds only the chrome: labels, headings and the sentences the site says about itself. An unknown
 * language throws rather than falling back to English, because English chrome around Portuguese content
 * is a page nobody reviewed and the build is the place to find that out.
 */
import type { Resource } from "../../../src/types/edition.ts";

export type Language = "en" | "es";

const isLanguage = (value: string): value is Language => value === "en" || value === "es";

function asLanguage(language: string): Language {
  if (!isLanguage(language)) {
    throw new Error(`no chrome is written in "${language}": add it to words.ts before publishing a territory in that language`);
  }
  return language;
}

/** The English chrome, which is also the list every other language has to answer in full. */
const EN = {
  siteName: "FarmSuccession",
  tagline: "Public, sourced information about taking over or starting a farm in Europe",
  europe: "Europe",
  skip: "Skip to the content",
  draftTitle: "Nobody has reviewed this page yet",
  draftBody:
    "Every claim on it cites a public page, the date it was read and the words that were on it, and automatic checks have passed. A person has not signed it off.",
  publishedOn: "Published",
  edition: "edition",
  whatThisIs: "What this is",
  whereToLook: "Where to look",
  inherited: "Applies here from",
  limits: "What this page does not cover",
  coverageNote: "How this was searched",
  record: ["record", "records"],
  territory: ["territory", "territories"],
  source: ["source", "sources"],
  readOn: "read on",
  opensOfficialPage: "opens the official page",
  noRecords: "No record yet",
  appliesHere: "What applies here",
  byKind: "By kind",
  allKinds: "Everything",
  territoriesTitle: "Territories",
  sharedLayers: "Groupings with a layer of their own",
  inheritedFromAbove: "Everything above also applies here, and is listed with it.",
  seeTerritory: "See what applies",
  notAService: "This is a directory of verified references, not a replacement for the official services.",
  licence: "Data, site and code under CC BY 4.0. The quoted excerpts belong to the public bodies that published them.",
} as const;

/**
 * Spanish. `satisfies` against the English keys means a word nobody translated is a compile error, not
 * a page that silently falls back to another language in front of a reader.
 */
const ES = {
  siteName: "FarmSuccession",
  tagline: "Información pública y con fuente sobre tomar el relevo de una explotación o empezar una en Europa",
  europe: "Europa",
  skip: "Ir al contenido",
  draftTitle: "Nadie ha revisado todavía esta página",
  draftBody:
    "Cada dato cita una página pública, la fecha en que se leyó y las palabras que había en ella, y ha pasado las comprobaciones automáticas. Una persona no la ha dado por buena.",
  publishedOn: "Publicado",
  edition: "edición",
  whatThisIs: "Qué es esto",
  whereToLook: "Dónde mirar",
  inherited: "Se aplica aquí desde",
  limits: "Qué no cubre esta página",
  coverageNote: "Cómo se buscó",
  record: ["ficha", "fichas"],
  territory: ["territorio", "territorios"],
  source: ["fuente", "fuentes"],
  readOn: "leída el",
  opensOfficialPage: "abre la página oficial",
  noRecords: "Todavía sin fichas",
  appliesHere: "Qué se aplica aquí",
  byKind: "Por tipo",
  allKinds: "Todo",
  territoriesTitle: "Territorios",
  sharedLayers: "Agrupaciones con capa propia",
  inheritedFromAbove: "Todo lo de las capas superiores se aplica también aquí, y aparece en la misma lista.",
  seeTerritory: "Ver qué se aplica",
  notAService: "Es un directorio de referencias verificadas, no un sustituto de los servicios oficiales.",
  licence: "Datos, sitio y código con licencia CC BY 4.0. Las citas pertenecen a los organismos públicos que las publicaron.",
} as const satisfies Record<keyof typeof EN, string | readonly [string, string]>;

const WORDS = { en: EN, es: ES };

/**
 * The codes a reader never sees. The data says `ANNOUNCED_NOT_OPERATING` because a check has to be able
 * to reason about it; a page says what that means in the territory's own language. `satisfies` ties both
 * tables to the schema's enums, so adding a kind or a state to `schema/` breaks this file at type-check
 * time instead of printing a code at a reader.
 */
const KINDS = {
  en: {
    LAND_BANK: "Land",
    SUCCESSION_SERVICE: "Taking over",
    FINANCIAL_SUPPORT: "Money",
    TRAINING: "Training",
    ADVICE: "Advice",
    OFFICIAL_PORTAL: "Official portal",
    POLICY: "Rules",
    NETWORK: "Network",
    OTHER: "Other",
  },
  es: {
    LAND_BANK: "Tierra",
    SUCCESSION_SERVICE: "Tomar el relevo",
    FINANCIAL_SUPPORT: "Dinero",
    TRAINING: "Formación",
    ADVICE: "Asesoramiento",
    OFFICIAL_PORTAL: "Portal oficial",
    POLICY: "Normas",
    NETWORK: "Red",
    OTHER: "Otro",
  },
} as const satisfies Record<Language, Record<Resource["kind"], string>>;

const STATES = {
  en: {
    ACTIVE: "operating",
    ANNOUNCED_NOT_OPERATING: "announced, not operating",
    HISTORICAL: "closed, kept for the record",
    DISCONTINUED: "no longer offered",
    UNKNOWN: "could not be confirmed",
  },
  es: {
    ACTIVE: "en funcionamiento",
    ANNOUNCED_NOT_OPERATING: "anunciado, sin funcionar",
    HISTORICAL: "cerrado, se conserva como registro",
    DISCONTINUED: "ya no se ofrece",
    UNKNOWN: "no se pudo confirmar",
  },
} as const satisfies Record<Language, Record<Resource["status"], string>>;

export const kindLabel = (kind: Resource["kind"], language: string): string => KINDS[asLanguage(language)][kind];
export const stateLabel = (status: Resource["status"], language: string): string => STATES[asLanguage(language)][status];

/**
 * The shape of one language's chrome: every key the English table has, widened from its exact wording, so
 * the two tables are one thing and no page can come to depend on the words of a particular language.
 */
export type Words = {
  readonly [Key in keyof typeof EN]: (typeof EN)[Key] extends readonly [string, string] ? readonly [string, string] : string;
};

export const words = (language: string): Words => WORDS[asLanguage(language)];

/** A number with its noun in the right form. One source and two sources are both worth getting right. */
export const counted = (howMany: number, forms: readonly [string, string]): string => `${howMany} ${forms[howMany === 1 ? 0 : 1]}`;
