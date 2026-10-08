/**
 * The words for the codes the data uses.
 *
 * The schema records `ANNOUNCED_NOT_OPERATING`, `FIRST_ESTABLISHMENT` and `FEE_REQUIRED` because a check
 * has to be able to reason about them and because a closed list is what keeps two territories comparable.
 * None of those is a thing anybody says out loud, and the audience this site is built for — a working
 * farmer, not a policy specialist — should never be handed one. Every code the data can hold is answered
 * here, in each language the site writes, and that is the only place a page is allowed to get it from.
 *
 * `satisfies` against the generated types is what makes this safe: a value added to `schema/` and
 * regenerated breaks this file at type-check time, instead of printing a code at a reader.
 */
import type { Call, ContactPoint, Metric, NewsItem, Resource, Scope } from "../../../src/types/edition.ts";
import { asLanguage, listIn, moneyIn, numberIn, type Language } from "./language.ts";

/**
 * One translated vocabulary: a complete table per language, read by key. Missing a key in either language
 * is a compile error, which is the point — a half-translated table is a page that shows a reader a code.
 */
const vocabulary =
  <Key extends string>(tables: Record<Language, Record<Key, string>>) =>
  (key: Key, language: string): string =>
    tables[asLanguage(language)][key];

/** Nouns that have to agree with a count, so "1 sources" never reaches a page. */
const countedVocabulary =
  <Key extends string>(tables: Record<Language, Record<Key, readonly [string, string]>>) =>
  (key: Key, howMany: number, language: string): string =>
    tables[asLanguage(language)][key][howMany === 1 ? 0 : 1];

export const kindLabel = vocabulary<Resource["kind"]>({
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
  de: {
    LAND_BANK: "Flächen",
    SUCCESSION_SERVICE: "Übernahme",
    FINANCIAL_SUPPORT: "Geld",
    TRAINING: "Ausbildung",
    ADVICE: "Beratung",
    OFFICIAL_PORTAL: "Amtliches Portal",
    POLICY: "Regeln",
    NETWORK: "Netzwerk",
    OTHER: "Sonstiges",
  },
  fr: {
    LAND_BANK: "Terres",
    SUCCESSION_SERVICE: "Reprise",
    FINANCIAL_SUPPORT: "Argent",
    TRAINING: "Formation",
    ADVICE: "Conseil",
    OFFICIAL_PORTAL: "Portail officiel",
    POLICY: "Règles",
    NETWORK: "Réseau",
    OTHER: "Autre",
  },
});

/**
 * Existence is not availability, and this is the table where that rule meets a reader: `ACTIVE` says the
 * page shows current operation, never that a call is open today.
 */
export const stateLabel = vocabulary<Resource["status"]>({
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
  de: {
    ACTIVE: "in Betrieb",
    ANNOUNCED_NOT_OPERATING: "angekündigt, nicht in Betrieb",
    HISTORICAL: "beendet, als Nachweis erhalten",
    DISCONTINUED: "wird nicht mehr angeboten",
    UNKNOWN: "nicht bestätigt",
  },
  fr: {
    ACTIVE: "en service",
    ANNOUNCED_NOT_OPERATING: "annoncé, pas encore en service",
    HISTORICAL: "terminé, conservé comme trace",
    DISCONTINUED: "n’est plus proposé",
    UNKNOWN: "n’a pas pu être confirmé",
  },
});

/** How far a resource reaches. Said as an extent a reader can place themselves in, not as a tier name. */
export const reachLabel = vocabulary<Scope["level"]>({
  en: {
    EU: "Everywhere in the European Union",
    NATIONAL: "The whole country",
    REGIONAL: "The whole region",
    SUBREGIONAL: "Part of the region",
    LOCAL: "One or more municipalities",
  },
  es: {
    EU: "Toda la Unión Europea",
    NATIONAL: "Todo el país",
    REGIONAL: "Toda la región",
    SUBREGIONAL: "Parte de la región",
    LOCAL: "Uno o varios municipios",
  },
  de: {
    EU: "Überall in der Europäischen Union",
    NATIONAL: "Das ganze Bundesgebiet",
    REGIONAL: "Das ganze Bundesland",
    SUBREGIONAL: "Ein Teil des Bundeslandes",
    LOCAL: "Eine oder mehrere Gemeinden",
  },
  fr: {
    EU: "Partout dans l’Union européenne",
    NATIONAL: "Tout le pays",
    REGIONAL: "Toute la région",
    SUBREGIONAL: "Une partie de la région",
    LOCAL: "Une ou plusieurs communes",
  },
});

/** What kind of body runs it, which is how a reader weighs a public register against a private listing. */
export const operatorTypeLabel = vocabulary<Resource["operatorType"]>({
  en: {
    PUBLIC: "Public body",
    NONPROFIT: "Non-profit organisation",
    PRIVATE: "Private company",
    MIXED: "Public and private together",
    UNKNOWN: "The sources do not say",
  },
  es: {
    PUBLIC: "Organismo público",
    NONPROFIT: "Entidad sin ánimo de lucro",
    PRIVATE: "Empresa privada",
    MIXED: "Pública y privada a la vez",
    UNKNOWN: "Las fuentes no lo dicen",
  },
  de: {
    PUBLIC: "Öffentliche Stelle",
    NONPROFIT: "Gemeinnützige Organisation",
    PRIVATE: "Privates Unternehmen",
    MIXED: "Öffentlich und privat gemeinsam",
    UNKNOWN: "Die Quellen sagen es nicht",
  },
  fr: {
    PUBLIC: "Organisme public",
    NONPROFIT: "Organisme à but non lucratif",
    PRIVATE: "Entreprise privée",
    MIXED: "Public et privé ensemble",
    UNKNOWN: "Les sources ne le disent pas",
  },
});

export const costLabel = vocabulary<NonNullable<Resource["accessCostType"]>>({
  en: {
    FREE: "Free",
    FEE_REQUIRED: "There is a charge",
    NOT_APPLICABLE: "There is nothing to apply for",
    UNKNOWN: "The sources do not say",
  },
  es: {
    FREE: "Gratuito",
    FEE_REQUIRED: "Tiene coste",
    NOT_APPLICABLE: "No hay nada que solicitar",
    UNKNOWN: "Las fuentes no lo dicen",
  },
  de: {
    FREE: "Kostenlos",
    FEE_REQUIRED: "Es fallen Kosten an",
    NOT_APPLICABLE: "Es gibt nichts zu beantragen",
    UNKNOWN: "Die Quellen sagen es nicht",
  },
  fr: {
    FREE: "Gratuit",
    FEE_REQUIRED: "Payant",
    NOT_APPLICABLE: "Il n’y a rien à demander",
    UNKNOWN: "Les sources ne le disent pas",
  },
});

export const instrumentLabel = vocabulary<NonNullable<Resource["instrumentType"]>>({
  en: {
    GRANT: "Grant",
    LOAN: "Loan",
    GUARANTEE: "Guarantee for a loan",
    INTEREST_SUBSIDY: "Help with the interest on a loan",
    OTHER: "Another kind of support",
  },
  es: {
    GRANT: "Subvención",
    LOAN: "Préstamo",
    GUARANTEE: "Aval para un préstamo",
    INTEREST_SUBSIDY: "Ayuda para los intereses de un préstamo",
    OTHER: "Otro tipo de apoyo",
  },
  de: {
    GRANT: "Zuschuss",
    LOAN: "Darlehen",
    GUARANTEE: "Bürgschaft für ein Darlehen",
    INTEREST_SUBSIDY: "Hilfe bei den Zinsen eines Darlehens",
    OTHER: "Andere Art von Unterstützung",
  },
  fr: {
    GRANT: "Subvention",
    LOAN: "Prêt",
    GUARANTEE: "Garantie pour un prêt",
    INTEREST_SUBSIDY: "Aide sur les intérêts d’un prêt",
    OTHER: "Un autre type de soutien",
  },
});

export const purposeLabel = vocabulary<NonNullable<Resource["purposes"]>[number]>({
  en: {
    FIRST_ESTABLISHMENT: "setting up for the first time",
    INVESTMENT: "investing in the holding",
    LAND_ACQUISITION: "getting hold of land",
    TRANSFER: "passing the holding on",
    RETIREMENT_SUCCESSION: "retiring and leaving a successor",
    OTHER: "something else",
  },
  es: {
    FIRST_ESTABLISHMENT: "instalarse por primera vez",
    INVESTMENT: "invertir en la explotación",
    LAND_ACQUISITION: "conseguir tierra",
    TRANSFER: "traspasar la explotación",
    RETIREMENT_SUCCESSION: "jubilarse y dejar el relevo",
    OTHER: "otra cosa",
  },
  de: {
    FIRST_ESTABLISHMENT: "sich erstmals niederlassen",
    INVESTMENT: "in den Betrieb investieren",
    LAND_ACQUISITION: "an Flächen kommen",
    TRANSFER: "den Betrieb übergeben",
    RETIREMENT_SUCCESSION: "in den Ruhestand gehen und die Nachfolge regeln",
    OTHER: "etwas anderes",
  },
  fr: {
    FIRST_ESTABLISHMENT: "s’installer pour la première fois",
    INVESTMENT: "investir dans l’exploitation",
    LAND_ACQUISITION: "obtenir des terres",
    TRANSFER: "transmettre l’exploitation",
    RETIREMENT_SUCCESSION: "partir à la retraite en laissant un repreneur",
    OTHER: "autre chose",
  },
});

export const assetLabel = vocabulary<NonNullable<Resource["assetTypes"]>[number]>({
  en: { PLOTS: "plots of land", WHOLE_HOLDINGS: "whole holdings" },
  es: { PLOTS: "parcelas", WHOLE_HOLDINGS: "explotaciones completas" },
  de: { PLOTS: "Flurstücke", WHOLE_HOLDINGS: "ganze Betriebe" },
  fr: { PLOTS: "parcelles", WHOLE_HOLDINGS: "exploitations entières" },
});

export const sectorLabel = vocabulary<NonNullable<Resource["sectors"]>[number]>({
  en: { AGRICULTURE: "crops", LIVESTOCK: "livestock", FORESTRY: "forestry" },
  es: { AGRICULTURE: "agricultura", LIVESTOCK: "ganadería", FORESTRY: "forestal" },
  de: { AGRICULTURE: "Ackerbau", LIVESTOCK: "Tierhaltung", FORESTRY: "Forstwirtschaft" },
  fr: { AGRICULTURE: "cultures", LIVESTOCK: "élevage", FORESTRY: "forêt" },
});

export const formatLabel = vocabulary<NonNullable<Resource["trainingFormats"]>[number]>({
  en: { IN_PERSON: "in person", ONLINE: "online", HYBRID: "part in person, part online", OTHER: "another format" },
  es: { IN_PERSON: "presencial", ONLINE: "en línea", HYBRID: "mixto, presencial y en línea", OTHER: "otro formato" },
  de: { IN_PERSON: "in Präsenz", ONLINE: "online", HYBRID: "teils in Präsenz, teils online", OTHER: "anderes Format" },
  fr: { IN_PERSON: "en présentiel", ONLINE: "en ligne", HYBRID: "en partie en présentiel, en partie en ligne", OTHER: "un autre format" },
});

/** Who it is for, in the words somebody would use about themselves rather than about a beneficiary class. */
export const profileLabel = vocabulary<NonNullable<Resource["targetProfiles"]>[number]>({
  en: {
    YOUNG_FARMER: "young farmers",
    NEW_ENTRANT: "people starting out in farming",
    SUCCESSOR: "whoever takes a holding on",
    TRANSFEROR: "whoever is handing a holding over",
    LANDOWNER: "people who own land",
    LAND_SEEKER: "people looking for land",
    GENERAL: "anyone",
  },
  es: {
    YOUNG_FARMER: "jóvenes agricultores",
    NEW_ENTRANT: "personas que empiezan en el campo",
    SUCCESSOR: "quien se hace cargo de una explotación",
    TRANSFEROR: "quien deja una explotación",
    LANDOWNER: "personas propietarias de tierra",
    LAND_SEEKER: "quien busca tierra",
    GENERAL: "cualquier persona",
  },
  de: {
    YOUNG_FARMER: "Junglandwirtinnen und Junglandwirte",
    NEW_ENTRANT: "Menschen, die in die Landwirtschaft einsteigen",
    SUCCESSOR: "wer einen Betrieb übernimmt",
    TRANSFEROR: "wer einen Betrieb übergibt",
    LANDOWNER: "Menschen, die Land besitzen",
    LAND_SEEKER: "wer Flächen sucht",
    GENERAL: "alle",
  },
  fr: {
    YOUNG_FARMER: "jeunes agriculteurs",
    NEW_ENTRANT: "personnes qui s’installent en agriculture",
    SUCCESSOR: "qui reprend une exploitation",
    TRANSFEROR: "qui transmet une exploitation",
    LANDOWNER: "propriétaires de terres",
    LAND_SEEKER: "qui cherche des terres",
    GENERAL: "tout le monde",
  },
});

/** What "anyone" becomes once the source has also named somebody: an addition, not the whole answer. */
const anyoneElse = vocabulary<"else">({
  en: { else: "anyone else" },
  es: { else: "cualquier otra persona" },
  de: { else: "alle anderen" },
  fr: { else: "toute autre personne" },
});

/**
 * Who a record is for, read out as one answer.
 *
 * A source can perfectly well open something to anyone and still say who it has in mind — courses open to
 * everybody over 18, with a note about who needs the certificate — and the data records both. Printed as a
 * flat list that ends in "anyone", that reads as a contradiction; printed as the named profiles and then
 * "anyone else", it reads as what the page actually said. Never narrower than the source is the rule the
 * data follows, and this is the sentence that keeps it true out loud.
 */
export function audience(profiles: readonly NonNullable<Resource["targetProfiles"]>[number][], language: string): string {
  const named = profiles.filter((profile) => profile !== "GENERAL").map((profile) => profileLabel(profile, language));
  if (named.length === 0) return profileLabel("GENERAL", language);
  return listIn(profiles.includes("GENERAL") ? [...named, anyoneElse("else", language)] : named, language);
}

/**
 * The state of an application period, which the data judges against the date its source was read and never
 * against today. The words say so: "was open", not "is open". A yearly edition cannot promise a reader
 * anything about this afternoon, and pretending otherwise is the one failure this project exists to avoid.
 */
export const callStateLabel = vocabulary<Call["state"]>({
  en: {
    UPCOMING: "had not opened yet",
    OPEN: "was open",
    CLOSED: "had closed",
    NOT_PUBLISHED: "no period published",
  },
  es: {
    UPCOMING: "todavía sin abrir",
    OPEN: "abierto",
    CLOSED: "ya cerrado",
    NOT_PUBLISHED: "sin plazo publicado",
  },
  de: {
    UPCOMING: "noch nicht geöffnet",
    OPEN: "offen",
    CLOSED: "bereits geschlossen",
    NOT_PUBLISHED: "kein Zeitraum veröffentlicht",
  },
  fr: {
    UPCOMING: "pas encore ouvert",
    OPEN: "ouvert",
    CLOSED: "déjà clos",
    NOT_PUBLISHED: "aucune période publiée",
  },
});

export const channelLabel = vocabulary<ContactPoint["channel"]>({
  en: { EMAIL: "Email", PHONE: "Telephone", FORM: "Form", OFFICE: "Office" },
  es: { EMAIL: "Correo electrónico", PHONE: "Teléfono", FORM: "Formulario", OFFICE: "Oficina" },
  de: { EMAIL: "E-Mail", PHONE: "Telefon", FORM: "Formular", OFFICE: "Dienststelle" },
  fr: { EMAIL: "Courriel", PHONE: "Téléphone", FORM: "Formulaire", OFFICE: "Bureau" },
});

/** What happened, as a thing that happened rather than as an event class. */
export const newsTypeLabel = vocabulary<NewsItem["type"]>({
  en: {
    ANNOUNCEMENT: "Announced",
    LAUNCH: "Started operating",
    CALL_OPENED: "A period opened",
    CALL_CLOSED: "A period closed",
    LAW_OR_REGULATION: "Rule published",
    CHANGE: "Changed",
    DISCONTINUATION: "Ended",
    FIGURE: "Figure published",
    OTHER: "Happened",
  },
  es: {
    ANNOUNCEMENT: "Anunciado",
    LAUNCH: "Empezó a funcionar",
    CALL_OPENED: "Se abrió un plazo",
    CALL_CLOSED: "Se cerró un plazo",
    LAW_OR_REGULATION: "Norma publicada",
    CHANGE: "Cambió",
    DISCONTINUATION: "Terminó",
    FIGURE: "Cifra publicada",
    OTHER: "Ocurrió",
  },
  de: {
    ANNOUNCEMENT: "Angekündigt",
    LAUNCH: "Betrieb aufgenommen",
    CALL_OPENED: "Ein Zeitraum wurde geöffnet",
    CALL_CLOSED: "Ein Zeitraum wurde geschlossen",
    LAW_OR_REGULATION: "Rechtsvorschrift veröffentlicht",
    CHANGE: "Geändert",
    DISCONTINUATION: "Beendet",
    FIGURE: "Zahl veröffentlicht",
    OTHER: "Geschehen",
  },
  fr: {
    ANNOUNCEMENT: "Annoncé",
    LAUNCH: "Entré en service",
    CALL_OPENED: "Une période s’est ouverte",
    CALL_CLOSED: "Une période s’est close",
    LAW_OR_REGULATION: "Texte publié",
    CHANGE: "Modifié",
    DISCONTINUATION: "Terminé",
    FIGURE: "Chiffre publié",
    OTHER: "Survenu",
  },
});

const UNITS = countedVocabulary<Metric["unit"]>({
  en: {
    EUR: ["euro", "euros"],
    HECTARES: ["hectare", "hectares"],
    PARCELS: ["plot", "plots"],
    OFFERS: ["offer", "offers"],
    PROPERTIES: ["property", "properties"],
    HOLDINGS: ["holding", "holdings"],
    PEOPLE: ["person", "people"],
    HOURS: ["hour", "hours"],
  },
  es: {
    EUR: ["euro", "euros"],
    HECTARES: ["hectárea", "hectáreas"],
    PARCELS: ["parcela", "parcelas"],
    OFFERS: ["oferta", "ofertas"],
    PROPERTIES: ["propiedad", "propiedades"],
    HOLDINGS: ["explotación", "explotaciones"],
    PEOPLE: ["persona", "personas"],
    HOURS: ["hora", "horas"],
  },
  de: {
    EUR: ["Euro", "Euro"],
    HECTARES: ["Hektar", "Hektar"],
    PARCELS: ["Flurstück", "Flurstücke"],
    OFFERS: ["Angebot", "Angebote"],
    PROPERTIES: ["Grundstück", "Grundstücke"],
    HOLDINGS: ["Betrieb", "Betriebe"],
    PEOPLE: ["Person", "Personen"],
    HOURS: ["Stunde", "Stunden"],
  },
  fr: {
    EUR: ["euro", "euros"],
    HECTARES: ["hectare", "hectares"],
    PARCELS: ["parcelle", "parcelles"],
    OFFERS: ["offre", "offres"],
    PROPERTIES: ["bien", "biens"],
    HOLDINGS: ["exploitation", "exploitations"],
    PEOPLE: ["personne", "personnes"],
    HOURS: ["heure", "heures"],
  },
});

/** A published figure with its unit, written the way the language writes both. */
export const quantity = (value: number, unit: Metric["unit"], language: string): string =>
  unit === "EUR" ? moneyIn(value, language) : `${numberIn(value, language)} ${UNITS(unit, value, language)}`;

/**
 * The languages a resource is available in, named rather than coded. ISO 639-1 is an open list and this
 * table is not: it holds the languages of the territories this corpus covers, and throws for anything else
 * so that adding a country is a deliberate act rather than a page that prints "br" at somebody.
 */
const LANGUAGE_NAMES = {
  en: {
    ca: "Catalan",
    de: "German",
    en: "English",
    es: "Spanish",
    eu: "Basque",
    fr: "French",
    gl: "Galician",
    it: "Italian",
    pt: "Portuguese",
  },
  es: {
    ca: "catalán",
    de: "alemán",
    en: "inglés",
    es: "español",
    eu: "euskera",
    fr: "francés",
    gl: "gallego",
    it: "italiano",
    pt: "portugués",
  },
  de: {
    ca: "Katalanisch",
    de: "Deutsch",
    en: "Englisch",
    es: "Spanisch",
    eu: "Baskisch",
    fr: "Französisch",
    gl: "Galicisch",
    it: "Italienisch",
    pt: "Portugiesisch",
  },
  fr: {
    ca: "catalan",
    de: "allemand",
    en: "anglais",
    es: "espagnol",
    eu: "basque",
    fr: "français",
    gl: "galicien",
    it: "italien",
    pt: "portugais",
  },
} as const satisfies Record<Language, Record<string, string>>;

export function languageName(code: string, language: string): string {
  const names: Record<string, string> = LANGUAGE_NAMES[asLanguage(language)];
  const name = names[code];
  if (name === undefined) {
    throw new Error(
      `no name for the language "${code}" in ${language}: add it to vocabulary.ts before publishing a resource offered in it`,
    );
  }
  return name;
}
