/**
 * The site's own words, in each language a territory of the catalogue is written in.
 *
 * The records' text is never translated — it is quoted from a source, in the source's language — so this
 * holds only the chrome: labels, headings and the sentences the site says about itself. The words for the
 * codes the data uses live in `vocabulary.ts`, which is a different job: this file is what the site says,
 * that one is what the data means.
 */
import type { GoalId } from "./goals.ts";
import { asLanguage, type Language } from "./language.ts";

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
  edition: "{year} edition",
  whatThisIs: "What this is",
  whereToLook: "Where to look",
  siteNav: "Pages of this site",
  whereYouAre: "Where you are",
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
  whatDoYouNeed: "What do you need to sort out?",
  onThisPage: "On this page",
  territoriesTitle: "Territories",
  wholeCountry: "The whole country",
  sharedLayers: "Groupings with a layer of their own",
  inheritedFromAbove: "Everything above also applies here, and is listed with it.",
  notAService: "This is a directory of verified references, not a replacement for the official services.",
  trust:
    "Every record comes from a public administration or the body that runs the service, and carries its own sources and the dates they were read.",
  optOut: "If your organisation does not want to appear in the inventory, ask for it to be taken out:",
  licence: "Data, site and code under CC BY 4.0. The quoted excerpts belong to the public bodies that published them.",

  // The record page, in the order a reader needs it.
  offersTitle: "What it offers",
  datesTitle: "Can I apply now?",
  applyOpen: "Yes, the call is open",
  applyOpenByDates: "Yes, according to the documented dates: open until {date}",
  applyUpcoming: "Not yet: the call has not opened",
  applyClosed: "No: the call is closed",
  applyDeadlinePassed: "No: the deadline passed on {date}",
  applyShouldBeOpen: "The call was due to open on {date}; check the official page.",
  applyNoDates: "The source does not publish application dates.",
  applyAnnounced: "No: announced, not yet operating",
  applyHistorical: "No: it no longer operates",
  applyUnconfirmed: "Could not be confirmed",
  applyUnconfirmedDetail: "The sources consulted do not show whether an application period is open now.",
  checkedOn: "Status checked on {date}",
  periodsTitle: "Documented calls and deadlines",
  opensLabel: "Opens",
  closesLabel: "Closes",
  whoTitle: "Who it is for",
  accessTitle: "How to get it",
  factsTitle: "The details",
  figuresTitle: "Published figures",
  newsTitle: "What happened this year",
  evidenceTitle: "Where this comes from",
  notesTitle: "Also worth knowing",
  contactTitle: "Where to ask",
  officialPage: "Go to the official page",
  noPeriodRecorded: "The sources record no application period for this.",
  periodsExplained: "Each period is what its source said on the day that source was read, not a claim about today.",
  from: "from",
  until: "until",
  recordedOn: "page read on",
  asOf: "figure as of",
  quotesExplained: "Copied word for word from each page, so anyone can look for the same words and see whether they are still there.",
  sourceShort: "Source",
  whatItIsRow: "What it is",
  stateRow: "Situation",
  runByRow: "Run by",
  bodyTypeRow: "Kind of body",
  reachRow: "Where it applies",
  costRow: "Cost of using it",
  handlesRow: "What it handles",
  coversRow: "Covers",
  availableInRow: "Available in",
  forRow: "Aimed at",
  supportTypeRow: "Kind of support",
  paysForRow: "Pays for",
  taughtRow: "How it is taught",
  qualifiesRow: "Counts as the training required for first-establishment aid",
  latestPageDateRow: "Latest date the page itself shows",
  yes: "Yes",
  no: "No",

  // The search page.
  searchHere: "Search in {where}",
  searchEverywhere: "Search the whole catalogue",
  searchLabel: "What are you looking for?",
  searchAction: "Search",
  searchScoped: "Everything that applies in {where} is searched: the European layer, the country, and the territory itself.",
  searchWhole: "Every record of the edition is searched, wherever it was recorded. Each result says which territory it applies in.",
  searchNeedsScript:
    "Filtering as you type needs JavaScript, which this browser is not running. Everything in scope is listed below, in full.",
  result: ["result", "results"],
  nothingMatched: "Nothing matched what you typed. Everything in scope is still listed below.",
  narrowDown: "Narrow it down",
  clearFilters: "Clear the filters",
  everythingHere: "Everything that applies here",
  searchFailed:
    "The search index could not be loaded, so the list below is all of it. Nothing is missing from the page; only the typing is.",
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
  edition: "edición {year}",
  whatThisIs: "Qué es esto",
  whereToLook: "Dónde mirar",
  siteNav: "Páginas de este sitio",
  whereYouAre: "Dónde estás",
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
  whatDoYouNeed: "¿Qué necesitas resolver?",
  onThisPage: "En esta página",
  territoriesTitle: "Territorios",
  wholeCountry: "Todo el país",
  sharedLayers: "Agrupaciones con capa propia",
  inheritedFromAbove: "Todo lo de las capas superiores se aplica también aquí, y aparece en la misma lista.",
  notAService: "Es un directorio de referencias verificadas, no un sustituto de los servicios oficiales.",
  trust:
    "Cada ficha procede de una administración pública o de la entidad que gestiona el servicio, y lleva sus propias fuentes y las fechas en que se leyeron.",
  optOut: "Si tu entidad no quiere aparecer en el inventario, solicita su retirada:",
  licence: "Datos, sitio y código con licencia CC BY 4.0. Las citas pertenecen a los organismos públicos que las publicaron.",

  offersTitle: "Qué ofrece",
  datesTitle: "¿Se puede solicitar ahora?",
  applyOpen: "Sí, la convocatoria está abierta",
  applyOpenByDates: "Sí, según el plazo documentado: abierta hasta el {date}",
  applyUpcoming: "Todavía no: la convocatoria aún no ha abierto",
  applyClosed: "No: la convocatoria está cerrada",
  applyDeadlinePassed: "No: el plazo terminó el {date}",
  applyShouldBeOpen: "La convocatoria debía abrir el {date}; compruébalo en la página oficial.",
  applyNoDates: "La fuente no publica fechas de solicitud.",
  applyAnnounced: "No: anunciado, todavía no operativo",
  applyHistorical: "No: ya no está en funcionamiento",
  applyUnconfirmed: "No se ha podido confirmar",
  applyUnconfirmedDetail: "No hemos podido verificar en las fuentes consultadas si ahora hay un plazo abierto.",
  checkedOn: "Estado comprobado el {date}",
  periodsTitle: "Convocatorias y plazos documentados",
  opensLabel: "Abre",
  closesLabel: "Cierra",
  whoTitle: "Para quién es",
  accessTitle: "Cómo acceder",
  factsTitle: "Los datos",
  figuresTitle: "Cifras publicadas",
  newsTitle: "Qué ha pasado este año",
  evidenceTitle: "De dónde sale esto",
  notesTitle: "Además",
  contactTitle: "Dónde preguntar",
  officialPage: "Ir a la página oficial",
  noPeriodRecorded: "Las fuentes no recogen ningún plazo de solicitud.",
  periodsExplained: "Cada plazo es lo que decía su fuente el día en que se leyó, no una afirmación sobre hoy.",
  from: "del",
  until: "al",
  recordedOn: "página leída el",
  asOf: "cifra a fecha de",
  quotesExplained: "Copiado palabra por palabra de cada página, para que cualquiera pueda buscar esas mismas palabras y ver si siguen ahí.",
  sourceShort: "Fuente",
  whatItIsRow: "Qué es",
  stateRow: "Situación",
  runByRow: "Lo gestiona",
  bodyTypeRow: "Tipo de entidad",
  reachRow: "Dónde se aplica",
  costRow: "Coste de usarlo",
  handlesRow: "Qué gestiona",
  coversRow: "Cubre",
  availableInRow: "Disponible en",
  forRow: "Dirigido a",
  supportTypeRow: "Tipo de apoyo",
  paysForRow: "Sirve para",
  taughtRow: "Cómo se imparte",
  qualifiesRow: "Cuenta como la formación exigida para la ayuda de primera instalación",
  latestPageDateRow: "Fecha más reciente que muestra la página",
  yes: "Sí",
  no: "No",

  searchHere: "Buscar en {where}",
  searchEverywhere: "Buscar en todo el catálogo",
  searchLabel: "¿Qué estás buscando?",
  searchAction: "Buscar",
  searchScoped: "Se busca en todo lo que se aplica en {where}: la capa europea, el país y el propio territorio.",
  searchWhole: "Se busca en todas las fichas de la edición, estén recogidas donde estén. Cada resultado dice en qué territorio se aplica.",
  searchNeedsScript:
    "Filtrar mientras escribes necesita JavaScript, que este navegador no está ejecutando. Debajo está, entera, la lista de lo que entra en la búsqueda.",
  result: ["resultado", "resultados"],
  nothingMatched: "Nada coincide con lo que has escrito. Debajo sigue estando todo lo que entra en la búsqueda.",
  narrowDown: "Acotar",
  clearFilters: "Quitar los filtros",
  everythingHere: "Todo lo que se aplica aquí",
  searchFailed:
    "No se ha podido cargar el índice de búsqueda, así que la lista de abajo es todo lo que hay. A la página no le falta nada; sólo le falta poder escribir.",
} as const satisfies Record<keyof typeof EN, string | readonly [string, string]>;

const WORDS = { en: EN, es: ES };

/**
 * The situations, in the words somebody would use for their own. The hint under each one is what tells a
 * reader whether it is theirs without having to open it.
 */
const SITUATIONS = {
  en: {
    land: { title: "Find land", hint: "Land to rent, to buy, or to take on from somebody leaving it" },
    handover: { title: "Hand the holding over, or take one on", hint: "Help with passing a farm to whoever will keep it going" },
    money: { title: "Pay for starting out", hint: "Aid, loans and guarantees for setting up as a farmer" },
    learn: { title: "Learn, or get somebody to advise you", hint: "Courses that qualify you, and people who walk you through it" },
    context: { title: "The rules behind all of it", hint: "Frameworks, networks and the official portals they live on" },
  },
  es: {
    land: { title: "Encontrar tierra", hint: "Tierra para arrendar, comprar o hacerse cargo de quien la deja" },
    handover: { title: "Dejar la explotación, o hacerse cargo", hint: "Ayuda para pasar una explotación a quien va a continuarla" },
    money: { title: "Pagar la puesta en marcha", hint: "Ayudas, préstamos y avales para instalarse" },
    learn: { title: "Formarte, o que alguien te asesore", hint: "Cursos que habilitan, y personas que acompañan el proceso" },
    context: { title: "Las normas que hay detrás", hint: "Marcos, redes y los portales oficiales donde viven" },
  },
} as const satisfies Record<Language, Record<GoalId, { title: string; hint: string }>>;

export const situation = (goal: GoalId, language: string): { title: string; hint: string } => SITUATIONS[asLanguage(language)][goal];

/**
 * The shape of one language's chrome: every key the English table has, widened from its exact wording, so
 * the two tables are one thing and no page can come to depend on the words of a particular language.
 */
export type Words = {
  readonly [Key in keyof typeof EN]: (typeof EN)[Key] extends readonly [string, string] ? readonly [string, string] : string;
};

export const words = (language: string): Words => WORDS[asLanguage(language)];

/**
 * The edition a page belongs to, named the way the language names it. English puts the year first and
 * Spanish puts it last, which is why the whole phrase is translated rather than the word on its own.
 */
export const editionNamed = (year: string, language: string): string => words(language).edition.replace("{year}", year);

/** A number with its noun in the right form. One source and two sources are both worth getting right. */
export const counted = (howMany: number, forms: readonly [string, string]): string => `${howMany} ${forms[howMany === 1 ? 0 : 1]}`;
