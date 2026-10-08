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
  tagline: "Farm succession across Europe",
  lead: "Find land, funding, training and advice to start farming, take over a holding or hand one on.",
  searchAcrossEurope: "Search resources across Europe",
  browseAcrossEurope: "See every resource across Europe",
  statsLabel: "The directory, by the numbers",
  statRecords: ["documented resource", "documented resources"],
  statCountries: ["country", "countries"],
  statTerritories: ["territory", "territories"],
  statSources: ["source cited", "sources cited"],
  trustSourced: "Source-linked",
  trustDated: "Sources dated",
  trustOpen: "Openly licensed data",
  countriesTitle: "Countries",
  countriesLead: "{territories} across {countries}.",
  statApplicable: ["applicable resource", "applicable resources"],
  euAlso: "Each total includes the {n} European resources that apply in every country.",
  kindsTitle: "Other types of resources",
  newsCount: "{n} dated updates in the {edition} edition",
  editionAllDrafts:
    "{edition} edition. All {files} files are drafts: checked automatically, waiting for a person. Check the official source before acting.",
  editionSomeDrafts: "{edition} edition. {drafts} of {files} files are drafts: checked automatically, waiting for a person.",
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

  // The project page.
  aboutSlug: "about",
  aboutTitle: "About this project",
  aboutIntro:
    "An independent directory maintained by José Antonio Cano Trigueros. It brings together land, funding, training and advice to start farming, take over a holding or hand one on. Applications and services are handled by the organisations linked in each record.",
  overviewTitle: "What this project is",
  overviewLead:
    "FarmSuccession is a documentary inventory of public resources for farm succession and access to farming. It helps people find land, funding, training, advice and transfer services; it is not a marketplace, an advisory service or an application portal.",
  methodTitle: "Method and coverage",
  methodLead:
    "The directory is not exhaustive. Content stays in its original language, and searching across languages does not translate your words. Automated checks are separate from human review. A resource marked as operating does not necessarily have an open application period: each record says whether you can apply now, and on what date a page said so.",
  methodSteps: [
    ["Primary sources", "Public administrations and the bodies that run each resource."],
    ["Quoted word for word", "Each record carries the words that were on the page, so its summary can be checked against them."],
    [
      "Checked by machine",
      "Structure, consistency and reachable sources. These checks do not replace a person, and they confirm nothing about current availability.",
    ],
    ["Dated", "Every source says when it was read. Circumstances may have changed since."],
  ],
  notOfficial: "FarmSuccession is not an official service and does not represent the administrations or organisations it links to.",
  contactTitle2: "Contact and corrections",
  contactLead:
    "Something out of date, a broken link, a resource missing: write and say so. Every suggestion is checked against public sources before anything changes here.",
  privacyTitle: "Privacy",
  privacyLead:
    "This site has no analytics, no advertising cookies and no accounts. Searching runs in your browser and nothing you type leaves it. The hosting provider may keep technical access logs. Writing to us shares whatever you choose to put in the message.",
  // The project that held this domain before.
  historySlug: "history",
  historyNav: "The 2014-2016 project",
  historyTitle: "The European Farm Succession project and this domain",
  historyIntro:
    "Between 2016 and 2018 this domain hosted the results of a different European project. This page records what that project was, what it produced and how it relates to the present site.",
  historyObjectivesTitle: "Problem and objectives",
  historyObjectivesLead:
    "The project responded to an ageing farming population, holdings without an identified successor and the difficulty faced by people entering farming from outside a farming family. The partners shared and adapted methods for family and extra-family transfer, and aimed to place generational renewal on the European policy agenda.",
  historyPartnersTitle: "Countries and partners",
  historyPartnersLead:
    "Farm Succession in Europe was an Erasmus+ project (2014-2016), coordinated by FRCIVAM Bretagne with InterAFOCG in France, Terre-en-vue in Belgium, NEL in Austria and Land & Co / Landgilde in the Netherlands.",
  historyResultsTitle: "Principal results",
  historyResultsLead:
    "The partners shared methods for family and extra-family transfer. Their main surviving output is a 52-page toolkit covering an eight-stage succession process and twelve practical tools, presented at the Brussels conference on 7 and 8 November 2016.",
  historyDocumentsTitle: "Original documents and preservation",
  historyDocument: "Read the original 2016 toolkit (PDF, 3.9 MB)",
  historyPreservation:
    "The original toolkit has been recovered and is kept at the address it had, so links to it from elsewhere still work. No copy of the separate concept note or of the opening slides has been located, so their contents are not reconstructed here.",
  historyCurrentTitle: "Relationship with the current site",
  historyCurrentLead:
    "The original project ended and the domain later lapsed. José Antonio Cano Trigueros registered it again in 2026 for this independent, non-commercial inventory. The current site is not a continuation of, and does not represent, the former consortium.",
  backAbout: "Return to About this project",
  licenceTitle: "Licence",
  licenceLead:
    "Original directory content is offered under CC BY 4.0. Quotations and linked materials keep the rights of whoever published them.",
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
  searchHereLabel: "Search what applies in {where}",
  browseAll: "See everything that applies in {where}",
  searchAction: "Search",
  searchScoped: "Everything that applies in {where} is searched: the European layer, the country, and the territory itself.",
  searchWhole: "Every record of the edition is searched, wherever it was recorded. Each result says which territory it applies in.",
  searchNeedsScript:
    "Filtering as you type needs JavaScript, which this browser is not running. Everything in scope is listed below, in full.",
  result: ["result", "results"],
  nothingMatched: "Nothing matched what you typed. Everything in scope is still listed below.",
  narrowDown: "Narrow it down",
  kindFacet: "Kind",
  statusFacet: "Situation",
  scopeFacet: "Reach",
  profileFacet: "Aimed at",
  territoryFacet: "Territory",
  countryFacet: "Country",
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
  tagline: "Relevo agrario en Europa",
  lead: "Encuentra tierras, ayudas, formación y asesoramiento para incorporarte al campo, hacerte cargo de una explotación o traspasar la tuya.",
  searchAcrossEurope: "Buscar recursos en toda Europa",
  browseAcrossEurope: "Ver todos los recursos de Europa",
  statsLabel: "El directorio en cifras",
  statRecords: ["recurso documentado", "recursos documentados"],
  statCountries: ["país", "países"],
  statTerritories: ["territorio", "territorios"],
  statSources: ["fuente citada", "fuentes citadas"],
  trustSourced: "Con fuente enlazada",
  trustDated: "Fuentes fechadas",
  trustOpen: "Datos con licencia abierta",
  countriesTitle: "Países",
  countriesLead: "{territories} en {countries}.",
  statApplicable: ["recurso aplicable", "recursos aplicables"],
  euAlso: "Cada total incluye los {n} recursos europeos que se aplican en todos los países.",
  kindsTitle: "Otros tipos de recursos",
  newsCount: "{n} novedades fechadas en la edición {edition}",
  editionAllDrafts:
    "Edición {edition}. Los {files} archivos son borradores: comprobados automáticamente, a la espera de una persona. Comprueba la fuente oficial antes de actuar.",
  editionSomeDrafts:
    "Edición {edition}. {drafts} de {files} archivos son borradores: comprobados automáticamente, a la espera de una persona.",
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

  aboutSlug: "proyecto",
  aboutTitle: "Sobre el proyecto",
  aboutIntro:
    "Directorio independiente mantenido por José Antonio Cano Trigueros. Reúne tierras, ayudas, formación y asesoramiento para incorporarse al campo, hacerse cargo de una explotación o traspasarla. Los trámites y servicios corresponden a las entidades enlazadas en cada ficha.",
  overviewTitle: "Qué es este proyecto",
  overviewLead:
    "FarmSuccession es un inventario documental de recursos públicos para el relevo agrario y el acceso a la actividad. Sirve para encontrar tierra, ayudas, formación, asesoramiento y servicios de transmisión; no es un mercado, ni un servicio de asesoría, ni un portal de solicitudes.",
  methodTitle: "Método y cobertura",
  methodLead:
    "El directorio no es exhaustivo. El contenido se mantiene en su idioma original, y buscar en varios idiomas no traduce tus palabras. Las comprobaciones automáticas no sustituyen la revisión de una persona. Que un recurso figure en funcionamiento no significa que haya un plazo abierto: cada ficha dice si se puede solicitar ahora, y en qué fecha lo decía una página.",
  methodSteps: [
    ["Fuentes primarias", "Administraciones públicas y las entidades que gestionan cada recurso."],
    ["Citado palabra por palabra", "Cada ficha lleva las palabras que había en la página, para poder contrastar el resumen con ellas."],
    [
      "Comprobado por máquina",
      "Estructura, coherencia y fuentes alcanzables. Estas comprobaciones no sustituyen a una persona y no confirman nada sobre la disponibilidad actual.",
    ],
    ["Fechado", "Cada fuente dice cuándo se leyó. Las circunstancias pueden haber cambiado desde entonces."],
  ],
  notOfficial: "FarmSuccession no es un servicio oficial y no representa a las administraciones ni a las entidades que enlaza.",
  contactTitle2: "Contacto y correcciones",
  contactLead:
    "Algo desactualizado, un enlace roto, un recurso que falta: escríbenos y dilo. Cada aviso se comprueba contra fuentes públicas antes de que aquí cambie nada.",
  privacyTitle: "Privacidad",
  privacyLead:
    "Este sitio no tiene analítica, ni cookies publicitarias, ni cuentas. La búsqueda se ejecuta en tu navegador y nada de lo que escribes sale de él. El proveedor de alojamiento puede conservar registros técnicos de acceso. Al escribirnos compartes lo que decidas poner en el mensaje.",
  historySlug: "historia",
  historyNav: "El proyecto de 2014-2016",
  historyTitle: "El proyecto European Farm Succession y este dominio",
  historyIntro:
    "Entre 2016 y 2018 este dominio alojó los resultados de otro proyecto europeo. Esta página documenta qué fue, qué produjo y qué relación tiene con el sitio actual.",
  historyObjectivesTitle: "Problema y objetivos",
  historyObjectivesLead:
    "El proyecto respondía al envejecimiento de la población agraria, a las explotaciones sin sucesor identificado y a las dificultades para incorporarse al campo desde fuera de una familia agraria. Los socios compartieron y adaptaron métodos para transmisiones familiares y extrafamiliares e intentaron situar el relevo generacional en la agenda política europea.",
  historyPartnersTitle: "Países y socios",
  historyPartnersLead:
    "Farm Succession in Europe fue un proyecto Erasmus+ (2014-2016), coordinado por FRCIVAM Bretagne junto con InterAFOCG en Francia, Terre-en-vue en Bélgica, NEL en Austria y Land & Co / Landgilde en los Países Bajos.",
  historyResultsTitle: "Resultados principales",
  historyResultsLead:
    "Los socios compartieron métodos para la transmisión familiar y extrafamiliar. Su principal resultado conservado es una guía de 52 páginas con un proceso de ocho fases y doce herramientas prácticas, presentada en la conferencia de Bruselas del 7 y 8 de noviembre de 2016.",
  historyDocumentsTitle: "Documentos originales y conservación",
  historyDocument: "Leer la guía original de 2016 (PDF, 3,9 MB)",
  historyPreservation:
    "Se ha recuperado la guía original y se conserva en la dirección que tenía, para que los enlaces que apuntan a ella desde fuera sigan funcionando. No se ha localizado copia de la nota conceptual ni de las diapositivas iniciales, así que aquí no se reconstruye su contenido.",
  historyCurrentTitle: "Relación con el sitio actual",
  historyCurrentLead:
    "El proyecto original terminó y el dominio caducó después. José Antonio Cano Trigueros lo registró de nuevo en 2026 para este inventario independiente y no comercial. El sitio actual no continúa ni representa al antiguo consorcio.",
  backAbout: "Volver a Sobre el proyecto",
  licenceTitle: "Licencia",
  licenceLead:
    "El contenido original del directorio se ofrece con licencia CC BY 4.0. Las citas y los materiales enlazados conservan los derechos de quien los publicó.",
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
  searchHereLabel: "Buscar lo que se aplica en {where}",
  browseAll: "Ver todo lo que se aplica en {where}",
  searchAction: "Buscar",
  searchScoped: "Se busca en todo lo que se aplica en {where}: la capa europea, el país y el propio territorio.",
  searchWhole: "Se busca en todas las fichas de la edición, estén recogidas donde estén. Cada resultado dice en qué territorio se aplica.",
  searchNeedsScript:
    "Filtrar mientras escribes necesita JavaScript, que este navegador no está ejecutando. Debajo está, entera, la lista de lo que entra en la búsqueda.",
  result: ["resultado", "resultados"],
  nothingMatched: "Nada coincide con lo que has escrito. Debajo sigue estando todo lo que entra en la búsqueda.",
  narrowDown: "Acotar",
  kindFacet: "Tipo",
  statusFacet: "Situación",
  scopeFacet: "Ámbito",
  profileFacet: "Dirigido a",
  territoryFacet: "Territorio",
  countryFacet: "País",
  clearFilters: "Quitar los filtros",
  everythingHere: "Todo lo que se aplica aquí",
  searchFailed:
    "No se ha podido cargar el índice de búsqueda, así que la lista de abajo es todo lo que hay. A la página no le falta nada; sólo le falta poder escribir.",
} as const satisfies Record<keyof typeof EN, string | readonly [string, string] | readonly (readonly [string, string])[]>;

/**
 * German. The chrome of the country that arrived with this milestone, in the register this site uses for
 * every other language: the plain word a reader would use, never the administrative one.
 */
const DE = {
  siteName: "FarmSuccession",
  tagline: "Hofnachfolge in Europa",
  lead: "Finden Sie Flächen, Förderung, Ausbildung und Beratung, um in die Landwirtschaft einzusteigen, einen Betrieb zu übernehmen oder ihn zu übergeben.",
  searchAcrossEurope: "Angebote in ganz Europa suchen",
  browseAcrossEurope: "Alle Angebote in Europa ansehen",
  statsLabel: "Das Verzeichnis in Zahlen",
  statRecords: ["dokumentiertes Angebot", "dokumentierte Angebote"],
  statCountries: ["Land", "Länder"],
  statTerritories: ["Gebiet", "Gebiete"],
  statSources: ["zitierte Quelle", "zitierte Quellen"],
  trustSourced: "Quelle verlinkt",
  trustDated: "Quellen datiert",
  trustOpen: "Offen lizenzierte Daten",
  countriesTitle: "Länder",
  countriesLead: "{territories} in {countries}.",
  statApplicable: ["geltendes Angebot", "geltende Angebote"],
  euAlso: "Jede Zahl enthält die {n} europäischen Angebote, die in allen Ländern gelten.",
  kindsTitle: "Weitere Angebotsarten",
  newsCount: "{n} datierte Aktualisierungen in der Ausgabe {edition}",
  editionAllDrafts:
    "Ausgabe {edition}. Alle {files} Dateien sind Entwürfe: automatisch geprüft, menschliche Durchsicht steht aus. Prüfen Sie die offizielle Quelle, bevor Sie handeln.",
  editionSomeDrafts:
    "Ausgabe {edition}. {drafts} von {files} Dateien sind Entwürfe: automatisch geprüft, menschliche Durchsicht steht aus.",
  europe: "Europa",
  skip: "Zum Inhalt springen",
  draftTitle: "Diese Seite hat noch niemand geprüft",
  draftBody:
    "Jede Angabe auf ihr nennt eine öffentliche Seite, das Datum ihres Abrufs und die Worte, die dort standen, und die automatischen Prüfungen sind bestanden. Freigegeben hat sie noch keine Person.",
  publishedOn: "Veröffentlicht",
  edition: "Ausgabe {year}",
  whatThisIs: "Was das hier ist",
  whereToLook: "Wo Sie nachsehen können",
  siteNav: "Seiten dieser Website",
  whereYouAre: "Wo Sie sind",
  inherited: "Gilt hier von",
  limits: "Was diese Seite nicht abdeckt",
  coverageNote: "Wie dafür recherchiert wurde",
  record: ["Eintrag", "Einträge"],
  territory: ["Gebiet", "Gebiete"],
  source: ["Quelle", "Quellen"],
  readOn: "abgerufen am",
  opensOfficialPage: "öffnet die offizielle Seite",
  noRecords: "Noch kein Eintrag",
  appliesHere: "Was hier gilt",
  whatDoYouNeed: "Was möchten Sie klären?",
  onThisPage: "Auf dieser Seite",
  territoriesTitle: "Gebiete",
  wholeCountry: "Das ganze Bundesgebiet",
  sharedLayers: "Zusammenschlüsse mit eigener Ebene",
  inheritedFromAbove: "Alles von den Ebenen darüber gilt auch hier und ist dort mit aufgeführt.",
  notAService: "Dies ist ein Verzeichnis geprüfter Verweise und kein Ersatz für die amtlichen Stellen.",

  // The project page.
  aboutSlug: "projekt",
  aboutTitle: "Über das Projekt",
  aboutIntro:
    "Unabhängiges Verzeichnis, betreut von José Antonio Cano Trigueros. Es bündelt Flächen, Förderung, Ausbildung und Beratung für den Einstieg in die Landwirtschaft, die Übernahme eines Betriebs oder seine Übergabe. Zuständig für Anträge und Leistungen sind die in jedem Eintrag verlinkten Organisationen.",
  overviewTitle: "Was dieses Projekt ist",
  overviewLead:
    "FarmSuccession ist ein dokumentarisches Verzeichnis öffentlicher Angebote zur Hofnachfolge und zum Einstieg in die Landwirtschaft. Es hilft dabei, Flächen, Förderung, Ausbildung, Beratung und Übergabedienste zu finden; es ist weder Marktplatz noch Beratungsstelle oder Antragsportal.",
  methodTitle: "Methode und Abdeckung",
  methodLead:
    "Das Verzeichnis ist nicht vollständig. Inhalte bleiben in ihrer Originalsprache, und die Suche über Sprachen hinweg übersetzt Ihre Suchbegriffe nicht. Automatische Prüfungen sind etwas anderes als eine menschliche Durchsicht. Ein Angebot in Betrieb hat nicht zwangsläufig eine offene Antragsfrist: Jeder Eintrag sagt, ob Sie jetzt einen Antrag stellen können und an welchem Tag eine Seite das so sagte.",
  methodSteps: [
    ["Vorrang für Primärquellen", "Öffentliche Stellen und die Organisationen, die das jeweilige Angebot bereitstellen."],
    ["Wörtlich zitiert", "Jeder Eintrag trägt die Worte, die auf der Seite standen, damit sich seine Zusammenfassung daran prüfen lässt."],
    [
      "Maschinell geprüft",
      "Struktur, Konsistenz und erreichbare Quellen. Diese Prüfungen ersetzen keine Person, und sie bestätigen nichts über die aktuelle Verfügbarkeit.",
    ],
    ["Datiert", "Jede Quelle nennt ihr Abrufdatum. Die Umstände können sich seitdem geändert haben."],
  ],
  notOfficial: "FarmSuccession ist kein offizieller Dienst und vertritt nicht die Verwaltungen oder Organisationen, auf die es verlinkt.",
  contactTitle2: "Kontakt und Korrekturen",
  contactLead:
    "Etwas ist veraltet, ein Link führt ins Nichts, ein Angebot fehlt: Schreiben Sie es. Jeder Hinweis wird an öffentlichen Quellen geprüft, bevor sich hier etwas ändert.",
  privacyTitle: "Datenschutz",
  privacyLead:
    "Diese Website nutzt keine Nutzungsanalyse, keine Werbe-Cookies und keine Benutzerkonten. Die Suche läuft in Ihrem Browser, und nichts, was Sie eingeben, verlässt ihn. Der Hostinganbieter kann technische Zugriffsprotokolle verarbeiten. Wenn Sie schreiben, teilen Sie genau das mit, was Sie selbst in die Nachricht setzen.",
  // The project that held this domain before.
  historySlug: "geschichte",
  historyNav: "Das Projekt 2014-2016",
  historyTitle: "Das Projekt European Farm Succession und diese Domain",
  historyIntro:
    "Zwischen 2016 und 2018 beherbergte diese Domain die Ergebnisse eines anderen europäischen Projekts. Diese Seite hält fest, was dieses Projekt war, was es hervorgebracht hat und wie es zur heutigen Website steht.",
  historyObjectivesTitle: "Problem und Ziele",
  historyObjectivesLead:
    "Das Projekt reagierte auf eine alternde landwirtschaftliche Bevölkerung, auf Betriebe ohne feststehende Nachfolge und auf die Schwierigkeiten von Menschen, die ohne landwirtschaftliche Familie einsteigen. Die Partner teilten und passten Methoden für inner- und außerfamiliäre Übergaben an und wollten den Generationswechsel auf die europäische politische Agenda setzen.",
  historyPartnersTitle: "Länder und Partner",
  historyPartnersLead:
    "Farm Succession in Europe war ein Erasmus+-Projekt (2014-2016), koordiniert von FRCIVAM Bretagne mit InterAFOCG in Frankreich, Terre-en-vue in Belgien, NEL in Österreich und Land & Co / Landgilde in den Niederlanden.",
  historyResultsTitle: "Wichtigste Ergebnisse",
  historyResultsLead:
    "Die Partner teilten Methoden für inner- und außerfamiliäre Übergaben. Ihr wichtigstes erhaltenes Ergebnis ist ein 52-seitiger Leitfaden mit einem achtstufigen Übergabeprozess und zwölf praktischen Werkzeugen, vorgestellt auf der Brüsseler Konferenz am 7. und 8. November 2016.",
  historyDocumentsTitle: "Originaldokumente und Erhaltung",
  historyDocument: "Ursprünglichen Leitfaden von 2016 lesen (PDF, 3,9 MB)",
  historyPreservation:
    "Der ursprüngliche Leitfaden wurde wiedergefunden und liegt weiter unter der Adresse, die er hatte, damit Verweise von anderswo noch funktionieren. Von der gesonderten Konzeptnotiz und von den Eröffnungsfolien wurde keine Kopie gefunden; ihr Inhalt wird hier daher nicht rekonstruiert.",
  historyCurrentTitle: "Verhältnis zur heutigen Website",
  historyCurrentLead:
    "Das ursprüngliche Projekt endete, und die Domain lief später aus. José Antonio Cano Trigueros registrierte sie 2026 erneut für dieses unabhängige, nicht kommerzielle Verzeichnis. Die heutige Website ist weder eine Fortsetzung noch eine Vertretung des früheren Konsortiums.",
  backAbout: "Zurück zu Über das Projekt",
  licenceTitle: "Lizenz",
  licenceLead:
    "Eigene Verzeichnisinhalte stehen unter CC BY 4.0. Zitate und verlinkte Materialien behalten die Rechte derjenigen, die sie veröffentlicht haben.",
  trust:
    "Jeder Eintrag stammt von einer öffentlichen Verwaltung oder von der Stelle, die den Dienst betreibt, und trägt seine eigenen Quellen und die Daten ihres Abrufs.",
  optOut: "Wenn Ihre Organisation nicht im Verzeichnis erscheinen möchte, beantragen Sie die Entfernung:",
  licence: "Daten, Website und Code unter CC BY 4.0. Die zitierten Auszüge gehören den öffentlichen Stellen, die sie veröffentlicht haben.",

  // The record page, in the order a reader needs it.
  offersTitle: "Was es bietet",
  datesTitle: "Kann ich jetzt einen Antrag stellen?",
  applyOpen: "Ja, der Aufruf ist offen",
  applyOpenByDates: "Ja, laut den dokumentierten Daten: offen bis {date}",
  applyUpcoming: "Noch nicht: der Aufruf ist noch nicht geöffnet",
  applyClosed: "Nein: der Aufruf ist geschlossen",
  applyDeadlinePassed: "Nein: die Frist endete am {date}",
  applyShouldBeOpen: "Der Aufruf sollte am {date} öffnen; prüfen Sie die offizielle Seite.",
  applyNoDates: "Die Quelle nennt keine Antragsdaten.",
  applyAnnounced: "Nein: angekündigt, noch nicht in Betrieb",
  applyHistorical: "Nein: es ist nicht mehr in Betrieb",
  applyUnconfirmed: "Nicht bestätigt",
  applyUnconfirmedDetail: "Die geprüften Quellen zeigen nicht, ob derzeit eine Antragsfrist läuft.",
  checkedOn: "Stand geprüft am {date}",
  periodsTitle: "Dokumentierte Aufrufe und Fristen",
  opensLabel: "Beginn",
  closesLabel: "Ende",
  whoTitle: "Für wen es ist",
  accessTitle: "Wie Sie es bekommen",
  factsTitle: "Die Angaben",
  figuresTitle: "Veröffentlichte Zahlen",
  newsTitle: "Was in diesem Jahr passiert ist",
  evidenceTitle: "Woher das kommt",
  notesTitle: "Auch gut zu wissen",
  contactTitle: "Wo Sie fragen können",
  officialPage: "Zur offiziellen Seite",
  noPeriodRecorded: "Die Quellen verzeichnen dafür keine Antragsfrist.",
  periodsExplained: "Jeder Zeitraum ist das, was seine Quelle am Tag ihres Abrufs sagte, und keine Aussage über heute.",
  from: "ab",
  until: "bis",
  recordedOn: "Seite abgerufen am",
  asOf: "Zahl mit Stand",
  quotesExplained:
    "Wort für Wort von jeder Seite übernommen, damit jede Person nach denselben Worten suchen und sehen kann, ob sie noch dort stehen.",
  sourceShort: "Quelle",
  whatItIsRow: "Was es ist",
  stateRow: "Stand",
  runByRow: "Betrieben von",
  bodyTypeRow: "Art der Stelle",
  reachRow: "Wo es gilt",
  costRow: "Kosten der Nutzung",
  handlesRow: "Womit es sich befasst",
  coversRow: "Umfasst",
  availableInRow: "Verfügbar auf",
  forRow: "Richtet sich an",
  supportTypeRow: "Art der Unterstützung",
  paysForRow: "Zahlt für",
  taughtRow: "Wie unterrichtet wird",
  qualifiesRow: "Gilt als die für die Niederlassungsbeihilfe verlangte Ausbildung",
  latestPageDateRow: "Neuestes Datum auf der Seite selbst",
  yes: "Ja",
  no: "Nein",

  // The search page.
  searchHere: "Suchen in {where}",
  searchEverywhere: "Im ganzen Verzeichnis suchen",
  searchLabel: "Was suchen Sie?",
  searchHereLabel: "Suchen, was in {where} gilt",
  browseAll: "Alles ansehen, was in {where} gilt",
  searchAction: "Suchen",
  searchScoped: "Es wird alles durchsucht, was in {where} gilt: die europäische Ebene, das Land und das Gebiet selbst.",
  searchWhole:
    "Es werden alle Einträge der Ausgabe durchsucht, wo auch immer sie erfasst wurden. Jedes Ergebnis nennt das Gebiet, in dem es gilt.",
  searchNeedsScript:
    "Filtern während des Tippens braucht JavaScript, das dieser Browser nicht ausführt. Alles, was in die Suche fällt, steht vollständig darunter.",
  result: ["Treffer", "Treffer"],
  nothingMatched: "Nichts passt zu Ihrer Eingabe. Alles, was in die Suche fällt, steht weiter unten.",
  narrowDown: "Eingrenzen",
  kindFacet: "Art",
  statusFacet: "Stand",
  scopeFacet: "Ebene",
  profileFacet: "Zielgruppe",
  territoryFacet: "Gebiet",
  countryFacet: "Land",
  clearFilters: "Filter löschen",
  everythingHere: "Alles, was hier gilt",
  searchFailed:
    "Der Suchindex konnte nicht geladen werden; die Liste unten ist daher alles, was es gibt. Der Seite fehlt nichts, nur das Tippen.",
} as const satisfies Record<keyof typeof EN, string | readonly [string, string] | readonly (readonly [string, string])[]>;

const WORDS = { en: EN, es: ES, de: DE };

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
  de: {
    land: { title: "Flächen finden", hint: "Flächen zum Pachten, zum Kaufen oder von jemandem, der sie abgibt" },
    handover: {
      title: "Den Betrieb übergeben oder übernehmen",
      hint: "Hilfe dabei, einen Betrieb an die Person weiterzugeben, die ihn weiterführt",
    },
    money: { title: "Den Start bezahlen", hint: "Zuschüsse, Darlehen und Bürgschaften für die Niederlassung" },
    learn: { title: "Sich ausbilden oder beraten lassen", hint: "Kurse, die qualifizieren, und Menschen, die begleiten" },
    context: { title: "Die Regeln dahinter", hint: "Rechtsrahmen, Netzwerke und die amtlichen Portale, auf denen sie stehen" },
  },
} as const satisfies Record<Language, Record<GoalId, { title: string; hint: string }>>;

export const situation = (goal: GoalId, language: string): { title: string; hint: string } => SITUATIONS[asLanguage(language)][goal];

/**
 * The shape of one language's chrome: every key the English table has, widened from its exact wording, so
 * the two tables are one thing and no page can come to depend on the words of a particular language.
 */
export type Words = {
  readonly [Key in keyof typeof EN]: (typeof EN)[Key] extends readonly [string, string]
    ? readonly [string, string]
    : (typeof EN)[Key] extends readonly (readonly [string, string])[]
      ? readonly (readonly [string, string])[]
      : string;
};

export const words = (language: string): Words => WORDS[asLanguage(language)];

/**
 * The edition a page belongs to, named the way the language names it. English puts the year first and
 * Spanish puts it last, which is why the whole phrase is translated rather than the word on its own.
 */
export const editionNamed = (year: string, language: string): string => words(language).edition.replace("{year}", year);

/** A number with its noun in the right form. One source and two sources are both worth getting right. */
export const counted = (howMany: number, forms: readonly [string, string]): string => `${howMany} ${forms[howMany === 1 ? 0 : 1]}`;
