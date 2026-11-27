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
import type { Call, ContactPoint, EditionSnapshot, Metric, NewsItem, Resource, Scope } from "../../../src/types/edition.ts";
import type { Forms } from "./words.ts";
import { asLanguage, listIn, moneyIn, type Language } from "./language.ts";
import { counted } from "../../public/locale.js";

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
  <Key extends string>(tables: Record<Language, Record<Key, Forms>>) =>
  (key: Key, howMany: number, language: string): string =>
    counted(howMany, tables[asLanguage(language)][key], language);

/**
 * What each kind is, in one line: the label alone says "Rules 3", which tells nobody what a rule is doing
 * in a list of things to apply for. Shown where kinds are listed rather than beside every record, because
 * a reader who has opened a record is past needing the category explained.
 */
export const kindBlurb = vocabulary<Resource["kind"]>({
  en: {
    FINANCIAL_SUPPORT: "Grants, premiums and loans to set up, invest or take over a holding.",
    LAND_BANK: "Land banks and exchanges that match available land with people looking for it.",
    SUCCESSION_SERVICE: "Services that pair someone handing over a holding with someone who wants to continue it.",
    TRAINING: "Courses and schools for the qualifications many aid schemes require.",
    ADVICE: "Support to plan a handover, a start in farming or its management.",
    NETWORK: "Networks and territorial agreements that connect the people involved in succession.",
    POLICY: "Public rules and strategies that frame generational renewal.",
    OFFICIAL_PORTAL: "Official portals that gather information and procedures.",
    OTHER: "Other resources related to farm succession.",
  },
  es: {
    FINANCIAL_SUPPORT: "Ayudas, primas y préstamos para instalarse, invertir o hacerse cargo de una explotación.",
    LAND_BANK: "Bancos y bolsas que ponen en contacto tierras disponibles con quien busca dónde cultivar.",
    SUCCESSION_SERVICE: "Servicios que emparejan a quien cede una explotación con quien quiere continuarla.",
    TRAINING: "Cursos y escuelas para obtener la capacitación que exigen muchas ayudas.",
    ADVICE: "Acompañamiento para planificar el traspaso, la instalación o la gestión.",
    NETWORK: "Redes y pactos territoriales que conectan a quienes intervienen en el relevo.",
    POLICY: "Normas y estrategias públicas que enmarcan el relevo generacional.",
    OFFICIAL_PORTAL: "Portales oficiales que reúnen información y trámites.",
    OTHER: "Otros recursos relacionados con el relevo agrario.",
  },
  de: {
    FINANCIAL_SUPPORT: "Zuschüsse, Prämien und Darlehen für Gründung, Investition oder Übernahme eines Betriebs.",
    LAND_BANK: "Flächenbörsen, die verfügbare Flächen und Suchende zusammenbringen.",
    SUCCESSION_SERVICE: "Dienste, die Abgebende und Übernehmende von Höfen zusammenbringen.",
    TRAINING: "Kurse und Schulen für die Qualifikation, die viele Förderungen verlangen.",
    ADVICE: "Begleitung bei der Planung von Übergabe, Gründung oder Betriebsführung.",
    NETWORK: "Netzwerke und regionale Bündnisse, die die Beteiligten der Hofnachfolge verbinden.",
    POLICY: "Öffentliche Regeln und Strategien für den Generationswechsel.",
    OFFICIAL_PORTAL: "Offizielle Portale mit Informationen und Verfahren.",
    OTHER: "Weitere Angebote rund um die Hofnachfolge.",
  },
  fr: {
    FINANCIAL_SUPPORT: "Aides, primes et prêts pour s’installer, investir ou reprendre une exploitation.",
    LAND_BANK: "Banques et bourses qui mettent en relation des terres disponibles et ceux qui en cherchent.",
    SUCCESSION_SERVICE: "Services qui mettent en relation cédants et repreneurs d’exploitations.",
    TRAINING: "Cours et écoles pour obtenir la capacité exigée par de nombreuses aides.",
    ADVICE: "Accompagnement pour préparer la transmission, l’installation ou la gestion.",
    NETWORK: "Réseaux et pactes territoriaux qui relient les acteurs de la transmission.",
    POLICY: "Règles et stratégies publiques qui encadrent le renouvellement des générations.",
    OFFICIAL_PORTAL: "Portails officiels qui rassemblent informations et démarches.",
    OTHER: "Autres ressources liées à la transmission agricole.",
  },
  it: {
    FINANCIAL_SUPPORT: "Aiuti, premi e prestiti per insediarsi, investire o rilevare un’azienda.",
    LAND_BANK: "Banche e borse che mettono in contatto terreni disponibili con chi li cerca.",
    SUCCESSION_SERVICE: "Servizi che mettono in contatto chi cede un’azienda con chi vuole continuarla.",
    TRAINING: "Corsi e scuole per ottenere la qualifica richiesta da molti aiuti.",
    ADVICE: "Accompagnamento per pianificare la cessione, l’insediamento o la gestione.",
    NETWORK: "Reti e patti territoriali che collegano i protagonisti del ricambio.",
    POLICY: "Norme e strategie pubbliche che inquadrano il ricambio generazionale.",
    OFFICIAL_PORTAL: "Portali ufficiali che raccolgono informazioni e procedure.",
    OTHER: "Altre risorse legate al ricambio generazionale agricolo.",
  },
  pt: {
    FINANCIAL_SUPPORT: "Apoios, prémios e empréstimos para se instalar, investir ou assumir uma exploração.",
    LAND_BANK: "Bolsas que põem em contacto terras disponíveis com quem procura onde cultivar.",
    SUCCESSION_SERVICE: "Serviços que juntam quem cede uma exploração a quem a quer continuar.",
    TRAINING: "Cursos e escolas para obter a formação exigida por muitos apoios.",
    ADVICE: "Acompanhamento para planear a transmissão, a instalação ou a gestão.",
    NETWORK: "Redes e pactos territoriais que ligam os intervenientes na sucessão.",
    POLICY: "Normas e estratégias públicas que enquadram a renovação geracional.",
    OFFICIAL_PORTAL: "Portais oficiais que reúnem informação e procedimentos.",
    OTHER: "Outros recursos relacionados com a sucessão agrícola.",
  },
  nl: {
    FINANCIAL_SUPPORT: "Subsidies, premies en leningen om een bedrijf te starten of over te nemen, of om te investeren.",
    LAND_BANK: "Grondbanken en grondbeurzen die mensen helpen grond te vinden.",
    SUCCESSION_SERVICE: "Diensten die iemand die een bedrijf overdraagt in contact brengen met iemand die het wil voortzetten.",
    TRAINING: "Cursussen en opleidingen om te voldoen aan de opleidingseisen van veel subsidieregelingen.",
    ADVICE: "Steun bij het plannen van een overdracht, een start in de landbouw of de bedrijfsvoering.",
    NETWORK: "Netwerken en regionale afspraken die mensen rond bedrijfsopvolging met elkaar verbinden.",
    POLICY: "Regels en plannen van de overheid voor een nieuwe generatie boeren.",
    OFFICIAL_PORTAL: "Officiële websites met informatie en uitleg over procedures.",
    OTHER: "Andere informatie en hulp rond bedrijfsopvolging in de landbouw.",
  },
  ro: {
    FINANCIAL_SUPPORT: "Granturi, prime și credite pentru instalare, investiții sau preluarea unei ferme.",
    LAND_BANK: "Bănci și burse de terenuri care pun în legătură proprietarii cu cei care caută teren.",
    SUCCESSION_SERVICE: "Servicii care îi pun în legătură pe cei care transmit o fermă cu cei care vor să o preia.",
    TRAINING: "Cursuri și școli pentru calificările cerute de unele scheme de sprijin.",
    ADVICE: "Consiliere pentru transmitere, instalare sau administrarea fermei.",
    NETWORK: "Rețele și parteneriate care îi pun în legătură pe cei implicați în preluarea fermelor.",
    POLICY: "Reguli și strategii publice privind reînnoirea generațiilor.",
    OFFICIAL_PORTAL: "Portaluri oficiale cu informații și proceduri.",
    OTHER: "Alte resurse privind preluarea și transmiterea fermelor.",
  },
  pl: {
    FINANCIAL_SUPPORT: "Dotacje, premie i kredyty na rozpoczęcie działalności rolniczej, inwestycje lub przejęcie gospodarstwa.",
    LAND_BANK: "Banki ziemi i giełdy gruntów, które pomagają właścicielom dotrzeć do osób szukających ziemi.",
    SUCCESSION_SERVICE: "Usługi, które pomagają osobom przekazującym gospodarstwo znaleźć kogoś, kto chce je przejąć.",
    TRAINING: "Kursy i szkoły, w których można zdobyć kwalifikacje wymagane w niektórych programach wsparcia.",
    ADVICE: "Doradztwo przy przekazywaniu, zakładaniu lub prowadzeniu gospodarstwa.",
    NETWORK: "Sieci i partnerstwa łączące osoby i organizacje zaangażowane w przejmowanie gospodarstw.",
    POLICY: "Przepisy i strategie publiczne dotyczące wymiany pokoleń w rolnictwie.",
    OFFICIAL_PORTAL: "Oficjalne portale z informacjami i opisami procedur.",
    OTHER: "Inne zasoby dotyczące przejmowania i przekazywania gospodarstw.",
  },
  el: {
    FINANCIAL_SUPPORT: "Επιχορηγήσεις, ενισχύσεις και δάνεια για πρώτη εγκατάσταση, επενδύσεις ή ανάληψη αγροτικής εκμετάλλευσης.",
    LAND_BANK: "Τράπεζες γης και πλατφόρμες αγροτεμαχίων που φέρνουν σε επαφή ιδιοκτήτες με όσους αναζητούν γη.",
    SUCCESSION_SERVICE: "Υπηρεσίες που φέρνουν σε επαφή όσους μεταβιβάζουν μια αγροτική εκμετάλλευση με όσους θέλουν να την αναλάβουν.",
    TRAINING: "Μαθήματα και σχολές για την απόκτηση προσόντων που απαιτούν ορισμένα προγράμματα ενίσχυσης.",
    ADVICE: "Συμβουλευτική για τη μεταβίβαση, την πρώτη εγκατάσταση ή τη διαχείριση μιας αγροτικής εκμετάλλευσης.",
    NETWORK: "Δίκτυα και συνεργασίες που φέρνουν σε επαφή όσους ασχολούνται με την ανάληψη αγροτικών εκμεταλλεύσεων.",
    POLICY: "Κανόνες και δημόσιες στρατηγικές για την ανανέωση των γενεών στη γεωργία.",
    OFFICIAL_PORTAL: "Επίσημοι ιστότοποι με πληροφορίες και διαδικασίες.",
    OTHER: "Άλλες καταχωρίσεις για την ανάληψη και τη μεταβίβαση αγροτικών εκμεταλλεύσεων.",
  },
});

export const kindLabel = vocabulary<Resource["kind"]>({
  en: {
    LAND_BANK: "Land bank",
    SUCCESSION_SERVICE: "Succession service",
    FINANCIAL_SUPPORT: "Financial support",
    TRAINING: "Training",
    ADVICE: "Advice",
    OFFICIAL_PORTAL: "Official portal",
    POLICY: "Policy framework",
    NETWORK: "Network",
    OTHER: "Other",
  },
  es: {
    LAND_BANK: "Banco de tierras",
    SUCCESSION_SERVICE: "Servicio de relevo",
    FINANCIAL_SUPPORT: "Ayuda o financiación",
    TRAINING: "Formación",
    ADVICE: "Asesoramiento",
    OFFICIAL_PORTAL: "Portal oficial",
    POLICY: "Normas y estrategias",
    NETWORK: "Red",
    OTHER: "Otro",
  },
  de: {
    LAND_BANK: "Flächenbörse",
    SUCCESSION_SERVICE: "Hofbörse oder Nachfolgeberatung",
    FINANCIAL_SUPPORT: "Förderung oder Finanzierung",
    TRAINING: "Ausbildung",
    ADVICE: "Beratung",
    OFFICIAL_PORTAL: "Amtliches Portal",
    POLICY: "Regeln und Strategien",
    NETWORK: "Netzwerk",
    OTHER: "Sonstiges",
  },
  fr: {
    LAND_BANK: "Banque de terres",
    SUCCESSION_SERVICE: "Service de transmission",
    FINANCIAL_SUPPORT: "Aide ou financement",
    TRAINING: "Formation",
    ADVICE: "Conseil",
    OFFICIAL_PORTAL: "Portail officiel",
    POLICY: "Règles et stratégies",
    NETWORK: "Réseau",
    OTHER: "Autre",
  },
  it: {
    LAND_BANK: "Banca della terra",
    SUCCESSION_SERVICE: "Servizio di subentro",
    FINANCIAL_SUPPORT: "Aiuto o finanziamento",
    TRAINING: "Formazione",
    ADVICE: "Consulenza",
    OFFICIAL_PORTAL: "Portale ufficiale",
    POLICY: "Norme e strategie",
    NETWORK: "Rete",
    OTHER: "Altro",
  },
  pt: {
    LAND_BANK: "Bolsa de terras",
    SUCCESSION_SERVICE: "Serviço de sucessão",
    FINANCIAL_SUPPORT: "Apoio ou financiamento",
    TRAINING: "Formação",
    ADVICE: "Aconselhamento",
    OFFICIAL_PORTAL: "Portal oficial",
    POLICY: "Normas e estratégias",
    NETWORK: "Rede",
    OTHER: "Outro",
  },
  nl: {
    LAND_BANK: "Grondbank",
    SUCCESSION_SERVICE: "Hulp bij bedrijfsopvolging",
    FINANCIAL_SUPPORT: "Financiële steun",
    TRAINING: "Opleiding",
    ADVICE: "Advies",
    OFFICIAL_PORTAL: "Officiële website",
    POLICY: "Beleidskader",
    NETWORK: "Netwerk",
    OTHER: "Overig",
  },
  ro: {
    LAND_BANK: "Bancă sau bursă de terenuri",
    SUCCESSION_SERVICE: "Serviciu de preluare sau transmitere",
    FINANCIAL_SUPPORT: "Sprijin financiar",
    TRAINING: "Formare",
    ADVICE: "Consiliere",
    OFFICIAL_PORTAL: "Portal oficial",
    POLICY: "Politici și reglementări",
    NETWORK: "Rețea",
    OTHER: "Altele",
  },
  pl: {
    LAND_BANK: "Bank ziemi lub giełda gruntów",
    SUCCESSION_SERVICE: "Pomoc w przejęciu lub przekazaniu gospodarstwa",
    FINANCIAL_SUPPORT: "Wsparcie finansowe",
    TRAINING: "Szkolenia",
    ADVICE: "Doradztwo",
    OFFICIAL_PORTAL: "Oficjalny portal",
    POLICY: "Polityka i przepisy",
    NETWORK: "Sieć współpracy",
    OTHER: "Inne",
  },
  el: {
    LAND_BANK: "Τράπεζα γης ή πλατφόρμα αγροτεμαχίων",
    SUCCESSION_SERVICE: "Υπηρεσία ανάληψης ή μεταβίβασης",
    FINANCIAL_SUPPORT: "Οικονομική στήριξη",
    TRAINING: "Κατάρτιση",
    ADVICE: "Συμβουλευτική",
    OFFICIAL_PORTAL: "Επίσημος ιστότοπος",
    POLICY: "Πολιτικές και κανονισμοί",
    NETWORK: "Δίκτυο",
    OTHER: "Άλλα",
  },
});

/**
 * Existence is not availability, and this is the table where that rule meets a reader: `ACTIVE` says the
 * page shows current operation, never that a call is open today.
 */
export const stateLabel = vocabulary<Resource["status"]>({
  en: {
    ACTIVE: "Active resource",
    ANNOUNCED_NOT_OPERATING: "Announced resource, not yet operating",
    HISTORICAL: "Historical resource",
    DISCONTINUED: "Discontinued resource",
    UNKNOWN: "Status not confirmed",
  },
  es: {
    ACTIVE: "Recurso activo",
    ANNOUNCED_NOT_OPERATING: "Recurso anunciado, todavía no operativo",
    HISTORICAL: "Recurso histórico",
    DISCONTINUED: "Recurso suprimido",
    UNKNOWN: "Estado no confirmado",
  },
  de: {
    ACTIVE: "Aktives Angebot",
    ANNOUNCED_NOT_OPERATING: "Angekündigtes Angebot, noch nicht in Betrieb",
    HISTORICAL: "Historisches Angebot",
    DISCONTINUED: "Eingestelltes Angebot",
    UNKNOWN: "Stand nicht bestätigt",
  },
  fr: {
    ACTIVE: "Ressource active",
    ANNOUNCED_NOT_OPERATING: "Ressource annoncée, pas encore opérationnelle",
    HISTORICAL: "Ressource historique",
    DISCONTINUED: "Ressource supprimée",
    UNKNOWN: "Situation non confirmée",
  },
  it: {
    ACTIVE: "Risorsa attiva",
    ANNOUNCED_NOT_OPERATING: "Risorsa annunciata, non ancora operativa",
    HISTORICAL: "Risorsa storica",
    DISCONTINUED: "Risorsa soppressa",
    UNKNOWN: "Stato non confermato",
  },
  pt: {
    ACTIVE: "Recurso ativo",
    ANNOUNCED_NOT_OPERATING: "Recurso anunciado, ainda não operacional",
    HISTORICAL: "Recurso histórico",
    DISCONTINUED: "Recurso extinto",
    UNKNOWN: "Situação não confirmada",
  },
  nl: {
    ACTIVE: "In werking",
    ANNOUNCED_NOT_OPERATING: "Aangekondigd, nog niet in werking",
    HISTORICAL: "Uit het verleden",
    DISCONTINUED: "Beëindigd",
    UNKNOWN: "Status niet bevestigd",
  },
  ro: {
    ACTIVE: "Resursă activă",
    ANNOUNCED_NOT_OPERATING: "Anunțată, încă nefuncțională",
    HISTORICAL: "Resursă istorică",
    DISCONTINUED: "Resursă întreruptă",
    UNKNOWN: "Stare neconfirmată",
  },
  pl: {
    ACTIVE: "Aktywny zasób",
    ANNOUNCED_NOT_OPERATING: "Zapowiedziany, jeszcze nieuruchomiony",
    HISTORICAL: "Zasób archiwalny",
    DISCONTINUED: "Działanie zakończone",
    UNKNOWN: "Status niepotwierdzony",
  },
  el: {
    ACTIVE: "Σε ισχύ",
    ANNOUNCED_NOT_OPERATING: "Έχει ανακοινωθεί, χωρίς να λειτουργεί ακόμη",
    HISTORICAL: "Ιστορική καταχώριση",
    DISCONTINUED: "Έχει διακοπεί",
    UNKNOWN: "Ανεπιβεβαίωτη κατάσταση",
  },
});

/** How far a resource reaches. Said as an extent a reader can place themselves in, not as a tier name. */
export const reachLabel = vocabulary<Scope["level"]>({
  en: {
    EU: "European Union",
    NATIONAL: "National",
    REGIONAL: "Regional",
    SUBREGIONAL: "Subregional",
    LOCAL: "Local",
  },
  es: {
    EU: "Unión Europea",
    NATIONAL: "Estatal",
    REGIONAL: "Regional",
    SUBREGIONAL: "Subregional",
    LOCAL: "Local",
  },
  de: {
    EU: "Europäische Union",
    NATIONAL: "Bundesweit",
    REGIONAL: "Landesweit",
    SUBREGIONAL: "Teilregional",
    LOCAL: "Örtlich",
  },
  fr: {
    EU: "Union européenne",
    NATIONAL: "National",
    REGIONAL: "Régional",
    SUBREGIONAL: "Infrarégional",
    LOCAL: "Local",
  },
  it: {
    EU: "Unione europea",
    NATIONAL: "Nazionale",
    REGIONAL: "Regionale",
    SUBREGIONAL: "Subregionale",
    LOCAL: "Locale",
  },
  pt: {
    EU: "União Europeia",
    NATIONAL: "Nacional",
    REGIONAL: "Regional",
    SUBREGIONAL: "Sub-regional",
    LOCAL: "Local",
  },
  nl: {
    EU: "Europese Unie",
    NATIONAL: "Landelijk",
    REGIONAL: "Regionaal",
    SUBREGIONAL: "Subregionaal",
    LOCAL: "Lokaal",
  },
  ro: { EU: "Uniunea Europeană", NATIONAL: "Națională", REGIONAL: "Regională", SUBREGIONAL: "Subregională", LOCAL: "Locală" },
  pl: { EU: "Unia Europejska", NATIONAL: "Krajowy", REGIONAL: "Regionalny", SUBREGIONAL: "Subregionalny", LOCAL: "Lokalny" },
  el: { EU: "Ευρωπαϊκή Ένωση", NATIONAL: "Εθνικό", REGIONAL: "Περιφερειακό", SUBREGIONAL: "Υποπεριφερειακό", LOCAL: "Τοπικό" },
});

/** How far the research of a territory went, which the note under it then qualifies. */
export const coverageLabel = vocabulary<EditionSnapshot["coverage"]["status"]>({
  en: {
    NOT_STARTED: "Not researched yet",
    PARTIAL: "Not every source checked yet",
    SEARCHED: "Documented search completed",
  },
  es: {
    NOT_STARTED: "Aún sin investigar",
    PARTIAL: "Aún quedan fuentes por revisar",
    SEARCHED: "Búsqueda documentada completada",
  },
  de: {
    NOT_STARTED: "Noch nicht recherchiert",
    PARTIAL: "Noch nicht alle Quellen geprüft",
    SEARCHED: "Dokumentierte Recherche abgeschlossen",
  },
  fr: {
    NOT_STARTED: "Recherche pas encore commencée",
    PARTIAL: "Toutes les sources ne sont pas encore vérifiées",
    SEARCHED: "Recherche documentée terminée",
  },
  it: {
    NOT_STARTED: "Ricerca non ancora iniziata",
    PARTIAL: "Non tutte le fonti sono ancora verificate",
    SEARCHED: "Ricerca documentata completata",
  },
  pt: {
    NOT_STARTED: "Pesquisa ainda não iniciada",
    PARTIAL: "Ainda há fontes por verificar",
    SEARCHED: "Pesquisa documentada concluída",
  },
  nl: {
    NOT_STARTED: "Nog niet onderzocht",
    PARTIAL: "Nog niet alle bronnen gecontroleerd",
    SEARCHED: "Onderzoek afgerond en vastgelegd",
  },
  ro: { NOT_STARTED: "Cercetare neîncepută", PARTIAL: "Cercetare parțială", SEARCHED: "Cercetare efectuată" },
  pl: { NOT_STARTED: "Nie rozpoczęto sprawdzania źródeł", PARTIAL: "Sprawdzono część źródeł", SEARCHED: "Sprawdzono źródła" },
  el: { NOT_STARTED: "Η έρευνα δεν έχει ξεκινήσει", PARTIAL: "Μερική έρευνα", SEARCHED: "Η έρευνα έχει γίνει" },
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
  it: {
    PUBLIC: "Ente pubblico",
    NONPROFIT: "Organizzazione senza scopo di lucro",
    PRIVATE: "Impresa privata",
    MIXED: "Pubblico e privato insieme",
    UNKNOWN: "Le fonti non lo dicono",
  },
  pt: {
    PUBLIC: "Entidade pública",
    NONPROFIT: "Organização sem fins lucrativos",
    PRIVATE: "Empresa privada",
    MIXED: "Pública e privada em conjunto",
    UNKNOWN: "As fontes não o dizem",
  },
  nl: {
    PUBLIC: "Overheidsinstantie",
    NONPROFIT: "Organisatie zonder winstoogmerk",
    PRIVATE: "Particulier bedrijf",
    MIXED: "Overheid en private partijen samen",
    UNKNOWN: "De bronnen vermelden het niet",
  },
  ro: {
    PUBLIC: "Instituție publică",
    NONPROFIT: "Organizație fără scop lucrativ",
    PRIVATE: "Operator privat",
    MIXED: "Organizație mixtă",
    UNKNOWN: "Necunoscut",
  },
  pl: {
    PUBLIC: "Instytucja publiczna",
    NONPROFIT: "Organizacja non profit",
    PRIVATE: "Podmiot prywatny",
    MIXED: "Organizacja o mieszanym charakterze",
    UNKNOWN: "Nie ustalono",
  },
  el: {
    PUBLIC: "Δημόσιος φορέας",
    NONPROFIT: "Μη κερδοσκοπικός φορέας",
    PRIVATE: "Ιδιωτικός φορέας",
    MIXED: "Μικτός φορέας",
    UNKNOWN: "Άγνωστος",
  },
});

export const costLabel = vocabulary<NonNullable<Resource["accessCostType"]>>({
  en: {
    FREE: "Free",
    FEE_REQUIRED: "Fee required",
    NOT_APPLICABLE: "Not applicable",
    UNKNOWN: "Not documented",
  },
  es: {
    FREE: "Gratuito",
    FEE_REQUIRED: "De pago",
    NOT_APPLICABLE: "No procede",
    UNKNOWN: "No documentado",
  },
  de: {
    FREE: "Kostenlos",
    FEE_REQUIRED: "Kostenpflichtig",
    NOT_APPLICABLE: "Nicht zutreffend",
    UNKNOWN: "Nicht dokumentiert",
  },
  fr: {
    FREE: "Gratuit",
    FEE_REQUIRED: "Payant",
    NOT_APPLICABLE: "Sans objet",
    UNKNOWN: "Non documenté",
  },
  it: {
    FREE: "Gratuito",
    FEE_REQUIRED: "A pagamento",
    NOT_APPLICABLE: "Non applicabile",
    UNKNOWN: "Non documentato",
  },
  pt: {
    FREE: "Gratuito",
    FEE_REQUIRED: "Pago",
    NOT_APPLICABLE: "Não aplicável",
    UNKNOWN: "Não documentado",
  },
  nl: {
    FREE: "Gratis",
    FEE_REQUIRED: "Tegen betaling",
    NOT_APPLICABLE: "Niet van toepassing",
    UNKNOWN: "Niet gedocumenteerd",
  },
  ro: { FREE: "Gratuit", FEE_REQUIRED: "Cu plată", NOT_APPLICABLE: "Nu se aplică", UNKNOWN: "Nedocumentat" },
  pl: { FREE: "Bezpłatny", FEE_REQUIRED: "Płatny", NOT_APPLICABLE: "Nie dotyczy", UNKNOWN: "Brak informacji" },
  el: { FREE: "Δωρεάν", FEE_REQUIRED: "Με χρέωση", NOT_APPLICABLE: "Δεν ισχύει", UNKNOWN: "Δεν έχει τεκμηριωθεί" },
});

export const instrumentLabel = vocabulary<NonNullable<Resource["instrumentType"]>>({
  en: {
    GRANT: "Grant",
    LOAN: "Loan",
    GUARANTEE: "Guarantee",
    INTEREST_SUBSIDY: "Interest subsidy",
    OTHER: "Other",
  },
  es: {
    GRANT: "Subvención",
    LOAN: "Préstamo",
    GUARANTEE: "Aval",
    INTEREST_SUBSIDY: "Bonificación de intereses",
    OTHER: "Otro",
  },
  de: {
    GRANT: "Zuschuss",
    LOAN: "Darlehen",
    GUARANTEE: "Bürgschaft",
    INTEREST_SUBSIDY: "Zinszuschuss",
    OTHER: "Sonstiges",
  },
  fr: {
    GRANT: "Subvention",
    LOAN: "Prêt",
    GUARANTEE: "Garantie",
    INTEREST_SUBSIDY: "Bonification d’intérêts",
    OTHER: "Autre",
  },
  it: {
    GRANT: "Contributo",
    LOAN: "Prestito",
    GUARANTEE: "Garanzia",
    INTEREST_SUBSIDY: "Agevolazione sugli interessi",
    OTHER: "Altro",
  },
  pt: {
    GRANT: "Subsídio",
    LOAN: "Empréstimo",
    GUARANTEE: "Garantia",
    INTEREST_SUBSIDY: "Bonificação de juros",
    OTHER: "Outro",
  },
  nl: {
    GRANT: "Subsidie",
    LOAN: "Lening",
    GUARANTEE: "Garantie",
    INTEREST_SUBSIDY: "Rentesubsidie",
    OTHER: "Overig",
  },
  ro: { GRANT: "Grant", LOAN: "Credit", GUARANTEE: "Garanție", INTEREST_SUBSIDY: "Subvenționarea dobânzii", OTHER: "Alt sprijin" },
  pl: {
    GRANT: "Dotacja",
    LOAN: "Kredyt",
    GUARANTEE: "Gwarancja",
    INTEREST_SUBSIDY: "Dopłata do oprocentowania",
    OTHER: "Inna forma wsparcia",
  },
  el: { GRANT: "Επιχορήγηση", LOAN: "Δάνειο", GUARANTEE: "Εγγύηση", INTEREST_SUBSIDY: "Επιδότηση επιτοκίου", OTHER: "Άλλη στήριξη" },
});

export const purposeLabel = vocabulary<NonNullable<Resource["purposes"]>[number]>({
  en: {
    FIRST_ESTABLISHMENT: "First establishment",
    INVESTMENT: "Investment",
    LAND_ACQUISITION: "Land acquisition",
    TRANSFER: "Transfer",
    RETIREMENT_SUCCESSION: "Retirement and succession",
    OTHER: "Other",
  },
  es: {
    FIRST_ESTABLISHMENT: "Primera instalación",
    INVESTMENT: "Inversión",
    LAND_ACQUISITION: "Compra de tierras",
    TRANSFER: "Traspaso",
    RETIREMENT_SUCCESSION: "Jubilación y relevo",
    OTHER: "Otro",
  },
  de: {
    FIRST_ESTABLISHMENT: "Erstniederlassung",
    INVESTMENT: "Investition",
    LAND_ACQUISITION: "Flächenerwerb",
    TRANSFER: "Übergabe",
    RETIREMENT_SUCCESSION: "Ruhestand und Nachfolge",
    OTHER: "Sonstiges",
  },
  fr: {
    FIRST_ESTABLISHMENT: "Première installation",
    INVESTMENT: "Investissement",
    LAND_ACQUISITION: "Acquisition foncière",
    TRANSFER: "Transmission",
    RETIREMENT_SUCCESSION: "Retraite et transmission",
    OTHER: "Autre",
  },
  it: {
    FIRST_ESTABLISHMENT: "Primo insediamento",
    INVESTMENT: "Investimento",
    LAND_ACQUISITION: "Acquisto di terreni",
    TRANSFER: "Trasferimento",
    RETIREMENT_SUCCESSION: "Pensionamento e ricambio",
    OTHER: "Altro",
  },
  pt: {
    FIRST_ESTABLISHMENT: "Primeira instalação",
    INVESTMENT: "Investimento",
    LAND_ACQUISITION: "Aquisição de terras",
    TRANSFER: "Transmissão",
    RETIREMENT_SUCCESSION: "Reforma e sucessão",
    OTHER: "Outro",
  },
  nl: {
    FIRST_ESTABLISHMENT: "Een eerste landbouwbedrijf starten",
    INVESTMENT: "Investering",
    LAND_ACQUISITION: "Aankoop van grond",
    TRANSFER: "Overdracht",
    RETIREMENT_SUCCESSION: "Pensioen en opvolging",
    OTHER: "Overig",
  },
  ro: {
    FIRST_ESTABLISHMENT: "Prima instalare",
    INVESTMENT: "Investiții",
    LAND_ACQUISITION: "Achiziția de teren",
    TRANSFER: "Preluarea sau transmiterea fermei",
    RETIREMENT_SUCCESSION: "Pensionare și succesiune",
    OTHER: "Alt scop",
  },
  pl: {
    FIRST_ESTABLISHMENT: "Rozpoczęcie działalności rolniczej po raz pierwszy",
    INVESTMENT: "Inwestycje",
    LAND_ACQUISITION: "Zakup ziemi rolnej",
    TRANSFER: "Przejęcie lub przekazanie gospodarstwa",
    RETIREMENT_SUCCESSION: "Emerytura i przekazanie gospodarstwa następcy",
    OTHER: "Inny cel",
  },
  el: {
    FIRST_ESTABLISHMENT: "Πρώτη εγκατάσταση",
    INVESTMENT: "Επενδύσεις",
    LAND_ACQUISITION: "Απόκτηση αγροτικής γης",
    TRANSFER: "Ανάληψη ή μεταβίβαση εκμετάλλευσης",
    RETIREMENT_SUCCESSION: "Συνταξιοδότηση και διαδοχή",
    OTHER: "Άλλος σκοπός",
  },
});

export const assetLabel = vocabulary<NonNullable<Resource["assetTypes"]>[number]>({
  en: {
    PLOTS: "Plots",
    WHOLE_HOLDINGS: "Whole holdings",
  },
  es: {
    PLOTS: "Parcelas",
    WHOLE_HOLDINGS: "Explotaciones completas",
  },
  de: {
    PLOTS: "Flurstücke",
    WHOLE_HOLDINGS: "Ganze Betriebe",
  },
  fr: {
    PLOTS: "Parcelles",
    WHOLE_HOLDINGS: "Exploitations entières",
  },
  it: {
    PLOTS: "Appezzamenti",
    WHOLE_HOLDINGS: "Aziende intere",
  },
  pt: {
    PLOTS: "Parcelas",
    WHOLE_HOLDINGS: "Explorações completas",
  },
  nl: {
    PLOTS: "Percelen",
    WHOLE_HOLDINGS: "Hele bedrijven",
  },
  ro: { PLOTS: "Parcele", WHOLE_HOLDINGS: "Exploatații întregi" },
  pl: { PLOTS: "Działki rolne", WHOLE_HOLDINGS: "Całe gospodarstwa rolne" },
  el: { PLOTS: "Αγροτεμάχια", WHOLE_HOLDINGS: "Ολόκληρες αγροτικές εκμεταλλεύσεις" },
});

export const sectorLabel = vocabulary<NonNullable<Resource["sectors"]>[number]>({
  en: {
    AGRICULTURE: "Agriculture",
    LIVESTOCK: "Livestock",
    FORESTRY: "Forestry",
  },
  es: {
    AGRICULTURE: "Agricultura",
    LIVESTOCK: "Ganadería",
    FORESTRY: "Forestal",
  },
  de: {
    AGRICULTURE: "Landwirtschaft",
    LIVESTOCK: "Tierhaltung",
    FORESTRY: "Forstwirtschaft",
  },
  fr: {
    AGRICULTURE: "Agriculture",
    LIVESTOCK: "Élevage",
    FORESTRY: "Sylviculture",
  },
  it: {
    AGRICULTURE: "Agricoltura",
    LIVESTOCK: "Allevamento",
    FORESTRY: "Silvicoltura",
  },
  pt: {
    AGRICULTURE: "Agricultura",
    LIVESTOCK: "Pecuária",
    FORESTRY: "Silvicultura",
  },
  nl: {
    AGRICULTURE: "Landbouw",
    LIVESTOCK: "Veehouderij",
    FORESTRY: "Bosbouw",
  },
  ro: { AGRICULTURE: "Agricultură", LIVESTOCK: "Creșterea animalelor", FORESTRY: "Silvicultură" },
  pl: { AGRICULTURE: "Rolnictwo", LIVESTOCK: "Chów i hodowla zwierząt", FORESTRY: "Leśnictwo" },
  el: { AGRICULTURE: "Γεωργία", LIVESTOCK: "Κτηνοτροφία", FORESTRY: "Δασοπονία" },
});

export const formatLabel = vocabulary<NonNullable<Resource["trainingFormats"]>[number]>({
  en: {
    IN_PERSON: "In person",
    ONLINE: "Online",
    HYBRID: "Hybrid",
    OTHER: "Other",
  },
  es: {
    IN_PERSON: "Presencial",
    ONLINE: "En línea",
    HYBRID: "Mixta",
    OTHER: "Otro",
  },
  de: {
    IN_PERSON: "Präsenz",
    ONLINE: "Online",
    HYBRID: "Hybrid",
    OTHER: "Sonstiges",
  },
  fr: {
    IN_PERSON: "Présentiel",
    ONLINE: "En ligne",
    HYBRID: "Hybride",
    OTHER: "Autre",
  },
  it: {
    IN_PERSON: "In presenza",
    ONLINE: "Online",
    HYBRID: "Mista",
    OTHER: "Altro",
  },
  pt: {
    IN_PERSON: "Presencial",
    ONLINE: "Online",
    HYBRID: "Mista",
    OTHER: "Outro",
  },
  nl: {
    IN_PERSON: "Op locatie",
    ONLINE: "Online",
    HYBRID: "Hybride",
    OTHER: "Overig",
  },
  ro: { IN_PERSON: "Cu prezență fizică", ONLINE: "Online", HYBRID: "Hibrid", OTHER: "Alt format" },
  pl: { IN_PERSON: "Stacjonarnie", ONLINE: "Online", HYBRID: "Hybrydowo", OTHER: "Inna forma" },
  el: { IN_PERSON: "Διά ζώσης", ONLINE: "Διαδικτυακή", HYBRID: "Μικτή", OTHER: "Άλλη μορφή" },
});

/** Who it is for, in the words somebody would use about themselves rather than about a beneficiary class. */
/**
 * A label that stands on its own — an option in a list of filters, a value in a table — starting with a
 * capital, as every language here writes the first word of a line. The words themselves stay as they
 * are: several of them are written to be read inside a sentence ("dirigido a jóvenes agricultores"),
 * where a capital in the middle would be the mistake instead.
 */
export const standing = (text: string, language: string): string => text.charAt(0).toLocaleUpperCase(language) + text.slice(1);

export const profileLabel = vocabulary<NonNullable<Resource["targetProfiles"]>[number]>({
  en: {
    YOUNG_FARMER: "Young farmer",
    NEW_ENTRANT: "New or prospective farmer",
    SUCCESSOR: "Successor",
    TRANSFEROR: "Transferor",
    LANDOWNER: "Landowner",
    LAND_SEEKER: "Looking for land",
    GENERAL: "Anyone",
  },
  es: {
    YOUNG_FARMER: "Joven agricultor/a",
    NEW_ENTRANT: "Nuevo/a o futuro/a agricultor/a",
    SUCCESSOR: "Persona sucesora",
    TRANSFEROR: "Persona cedente",
    LANDOWNER: "Propietario/a de tierras",
    LAND_SEEKER: "Busca tierras",
    GENERAL: "Cualquier persona",
  },
  de: {
    YOUNG_FARMER: "Junglandwirt/in",
    NEW_ENTRANT: "Neue/r oder künftige/r Landwirt/in",
    SUCCESSOR: "Hofnachfolger/in",
    TRANSFEROR: "Übergebende Person",
    LANDOWNER: "Grundeigentümer/in",
    LAND_SEEKER: "Auf Flächensuche",
    GENERAL: "Alle",
  },
  fr: {
    YOUNG_FARMER: "Jeune agriculteur·rice",
    NEW_ENTRANT: "Nouvel·le ou futur·e agriculteur·rice",
    SUCCESSOR: "Repreneur·euse",
    TRANSFEROR: "Cédant·e",
    LANDOWNER: "Propriétaire foncier·ère",
    LAND_SEEKER: "À la recherche de terres",
    GENERAL: "Tout public",
  },
  it: {
    YOUNG_FARMER: "Giovane agricoltore/trice",
    NEW_ENTRANT: "Nuovo/a o futuro/a agricoltore/trice",
    SUCCESSOR: "Subentrante",
    TRANSFEROR: "Cedente",
    LANDOWNER: "Proprietario/a di terreni",
    LAND_SEEKER: "In cerca di terreni",
    GENERAL: "Chiunque",
  },
  pt: {
    YOUNG_FARMER: "Jovem agricultor/a",
    NEW_ENTRANT: "Novo/a ou futuro/a agricultor/a",
    SUCCESSOR: "Pessoa sucessora",
    TRANSFEROR: "Pessoa cedente",
    LANDOWNER: "Proprietário/a de terras",
    LAND_SEEKER: "À procura de terras",
    GENERAL: "Qualquer pessoa",
  },
  nl: {
    YOUNG_FARMER: "Jonge boer",
    NEW_ENTRANT: "Nieuwe of toekomstige boer",
    SUCCESSOR: "Opvolger",
    TRANSFEROR: "Wie een bedrijf overdraagt",
    LANDOWNER: "Grondeigenaar",
    LAND_SEEKER: "Op zoek naar grond",
    GENERAL: "Iedereen",
  },
  ro: {
    YOUNG_FARMER: "tânăr fermier",
    NEW_ENTRANT: "persoană care intră în agricultură",
    SUCCESSOR: "persoană care preia o fermă",
    TRANSFEROR: "persoană care transmite o fermă",
    LANDOWNER: "proprietar de teren",
    LAND_SEEKER: "persoană care caută teren",
    GENERAL: "orice persoană",
  },
  pl: {
    YOUNG_FARMER: "młody rolnik",
    NEW_ENTRANT: "osoba rozpoczynająca działalność rolniczą",
    SUCCESSOR: "osoba przejmująca gospodarstwo",
    TRANSFEROR: "osoba przekazująca gospodarstwo",
    LANDOWNER: "właściciel gruntu",
    LAND_SEEKER: "osoba szukająca ziemi rolnej",
    GENERAL: "każdy",
  },
  el: {
    YOUNG_FARMER: "νέος αγρότης",
    NEW_ENTRANT: "άτομο που ξεκινά αγροτική δραστηριότητα",
    SUCCESSOR: "άτομο που αναλαμβάνει αγροτική εκμετάλλευση",
    TRANSFEROR: "άτομο που μεταβιβάζει αγροτική εκμετάλλευση",
    LANDOWNER: "ιδιοκτήτης γης",
    LAND_SEEKER: "άτομο που αναζητά γη",
    GENERAL: "οποιοσδήποτε",
  },
});

/** What "anyone" becomes once the source has also named somebody: an addition, not the whole answer. */
const anyoneElse = vocabulary<"else">({
  en: { else: "anyone else" },
  es: { else: "cualquier otra persona" },
  de: { else: "alle anderen" },
  fr: { else: "toute autre personne" },
  it: { else: "chiunque altro" },
  pt: { else: "qualquer outra pessoa" },
  nl: { else: "alle anderen" },
  ro: { else: "orice altă persoană" },
  pl: { else: "każda inna osoba" },
  el: { else: "οποιοσδήποτε άλλος" },
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
    UPCOMING: "Upcoming",
    OPEN: "Open",
    CLOSED: "Closed",
    NOT_PUBLISHED: "Not published",
  },
  es: {
    UPCOMING: "Próxima",
    OPEN: "Abierta",
    CLOSED: "Cerrada",
    NOT_PUBLISHED: "No publicada",
  },
  de: {
    UPCOMING: "Demnächst",
    OPEN: "Offen",
    CLOSED: "Geschlossen",
    NOT_PUBLISHED: "Nicht veröffentlicht",
  },
  fr: {
    UPCOMING: "À venir",
    OPEN: "Ouvert",
    CLOSED: "Clos",
    NOT_PUBLISHED: "Non publié",
  },
  it: {
    UPCOMING: "In arrivo",
    OPEN: "Aperto",
    CLOSED: "Chiuso",
    NOT_PUBLISHED: "Non pubblicato",
  },
  pt: {
    UPCOMING: "Próximo",
    OPEN: "Aberto",
    CLOSED: "Fechado",
    NOT_PUBLISHED: "Não publicado",
  },
  nl: {
    UPCOMING: "Nog niet begonnen",
    OPEN: "Open",
    CLOSED: "Gesloten",
    NOT_PUBLISHED: "Niet gepubliceerd",
  },
  ro: { UPCOMING: "Urmează să se deschidă", OPEN: "Deschisă", CLOSED: "Închisă", NOT_PUBLISHED: "Nepublicată" },
  pl: {
    UPCOMING: "Nabór jeszcze się nie rozpoczął",
    OPEN: "Nabór otwarty",
    CLOSED: "Nabór zakończony",
    NOT_PUBLISHED: "Brak ogłoszenia o naborze",
  },
  el: { UPCOMING: "Θα ανοίξει σύντομα", OPEN: "Ανοιχτή", CLOSED: "Κλειστή", NOT_PUBLISHED: "Δεν έχει δημοσιευτεί" },
});

export const channelLabel = vocabulary<ContactPoint["channel"]>({
  en: { EMAIL: "Email", PHONE: "Phone", FORM: "Form", OFFICE: "Office" },
  es: { EMAIL: "Correo", PHONE: "Teléfono", FORM: "Formulario", OFFICE: "Oficina" },
  de: { EMAIL: "E-Mail", PHONE: "Telefon", FORM: "Formular", OFFICE: "Dienststelle" },
  fr: { EMAIL: "Courriel", PHONE: "Téléphone", FORM: "Formulaire", OFFICE: "Bureau" },
  it: { EMAIL: "Email", PHONE: "Telefono", FORM: "Modulo", OFFICE: "Ufficio" },
  pt: { EMAIL: "Email", PHONE: "Telefone", FORM: "Formulário", OFFICE: "Balcão" },
  nl: { EMAIL: "E-mail", PHONE: "Telefoon", FORM: "Formulier", OFFICE: "Loket" },
  ro: { EMAIL: "E-mail", PHONE: "Telefon", FORM: "Formular", OFFICE: "Birou" },
  pl: { EMAIL: "E-mail", PHONE: "Telefon", FORM: "Formularz", OFFICE: "Biuro" },
  el: { EMAIL: "Email", PHONE: "Τηλέφωνο", FORM: "Φόρμα", OFFICE: "Γραφείο" },
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
  it: {
    ANNOUNCEMENT: "Annunciato",
    LAUNCH: "Entrato in funzione",
    CALL_OPENED: "Si è aperto un periodo",
    CALL_CLOSED: "Si è chiuso un periodo",
    LAW_OR_REGULATION: "Norma pubblicata",
    CHANGE: "Modificato",
    DISCONTINUATION: "Concluso",
    FIGURE: "Cifra pubblicata",
    OTHER: "Accaduto",
  },
  pt: {
    ANNOUNCEMENT: "Anunciado",
    LAUNCH: "Entrou em funcionamento",
    CALL_OPENED: "Abriu um prazo",
    CALL_CLOSED: "Fechou um prazo",
    LAW_OR_REGULATION: "Legislação publicada",
    CHANGE: "Alterado",
    DISCONTINUATION: "Terminou",
    FIGURE: "Número publicado",
    OTHER: "Aconteceu",
  },
  nl: {
    ANNOUNCEMENT: "Aangekondigd",
    LAUNCH: "Van start gegaan",
    CALL_OPENED: "Een aanvraagperiode is begonnen",
    CALL_CLOSED: "Een aanvraagperiode is gesloten",
    LAW_OR_REGULATION: "Regelgeving gepubliceerd",
    CHANGE: "Gewijzigd",
    DISCONTINUATION: "Beëindigd",
    FIGURE: "Cijfer gepubliceerd",
    OTHER: "Gebeurd",
  },
  ro: {
    ANNOUNCEMENT: "Anunț",
    LAUNCH: "Lansare",
    CALL_OPENED: "S-a deschis o sesiune",
    CALL_CLOSED: "S-a închis o sesiune",
    LAW_OR_REGULATION: "Act publicat",
    CHANGE: "Modificare",
    DISCONTINUATION: "Încheiere",
    FIGURE: "Cifră publicată",
    OTHER: "Alt eveniment",
  },
  pl: {
    ANNOUNCEMENT: "Ogłoszenie",
    LAUNCH: "Uruchomienie",
    CALL_OPENED: "Rozpoczęcie naboru",
    CALL_CLOSED: "Zakończenie naboru",
    LAW_OR_REGULATION: "Publikacja aktu prawnego",
    CHANGE: "Zmiana",
    DISCONTINUATION: "Zakończenie działania",
    FIGURE: "Publikacja danych liczbowych",
    OTHER: "Inne wydarzenie",
  },
  el: {
    ANNOUNCEMENT: "Ανακοίνωση",
    LAUNCH: "Έναρξη λειτουργίας",
    CALL_OPENED: "Άνοιξε η περίοδος αιτήσεων",
    CALL_CLOSED: "Έληξε η περίοδος αιτήσεων",
    LAW_OR_REGULATION: "Δημοσίευση νομικής πράξης",
    CHANGE: "Αλλαγή",
    DISCONTINUATION: "Διακοπή",
    FIGURE: "Δημοσίευση αριθμητικού στοιχείου",
    OTHER: "Άλλο γεγονός",
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
  it: {
    EUR: ["euro", "euro"],
    HECTARES: ["ettaro", "ettari"],
    PARCELS: ["particella", "particelle"],
    OFFERS: ["offerta", "offerte"],
    PROPERTIES: ["immobile", "immobili"],
    HOLDINGS: ["azienda", "aziende"],
    PEOPLE: ["persona", "persone"],
    HOURS: ["ora", "ore"],
  },
  pt: {
    EUR: ["euro", "euros"],
    HECTARES: ["hectare", "hectares"],
    PARCELS: ["parcela", "parcelas"],
    OFFERS: ["oferta", "ofertas"],
    PROPERTIES: ["prédio", "prédios"],
    HOLDINGS: ["exploração", "explorações"],
    PEOPLE: ["pessoa", "pessoas"],
    HOURS: ["hora", "horas"],
  },
  nl: {
    EUR: ["euro", "euro"],
    HECTARES: ["hectare", "hectare"],
    PARCELS: ["perceel", "percelen"],
    OFFERS: ["aanbieding", "aanbiedingen"],
    PROPERTIES: ["object", "objecten"],
    HOLDINGS: ["bedrijf", "bedrijven"],
    PEOPLE: ["persoon", "personen"],
    HOURS: ["uur", "uur"],
  },
  ro: {
    EUR: ["euro", "euro"],
    HECTARES: ["hectar", "hectare"],
    PARCELS: ["parcelă", "parcele"],
    OFFERS: ["ofertă", "oferte"],
    PROPERTIES: ["proprietate", "proprietăți"],
    HOLDINGS: ["exploatație", "exploatații"],
    PEOPLE: ["persoană", "persoane"],
    HOURS: ["oră", "ore"],
  },
  pl: {
    EUR: ["euro", "euro", "euro"],
    HECTARES: ["hektar", "hektary", "hektarów"],
    PARCELS: ["działka", "działki", "działek"],
    OFFERS: ["oferta", "oferty", "ofert"],
    PROPERTIES: ["nieruchomość", "nieruchomości", "nieruchomości"],
    HOLDINGS: ["gospodarstwo", "gospodarstwa", "gospodarstw"],
    PEOPLE: ["osoba", "osoby", "osób"],
    HOURS: ["godzina", "godziny", "godzin"],
  },
  el: {
    EUR: ["ευρώ", "ευρώ"],
    HECTARES: ["εκτάριο", "εκτάρια"],
    PARCELS: ["αγροτεμάχιο", "αγροτεμάχια"],
    OFFERS: ["προσφορά", "προσφορές"],
    PROPERTIES: ["ακίνητο", "ακίνητα"],
    HOLDINGS: ["εκμετάλλευση", "εκμεταλλεύσεις"],
    PEOPLE: ["άτομο", "άτομα"],
    HOURS: ["ώρα", "ώρες"],
  },
});

/** A published figure with its unit, written the way the language writes both. */
export const quantity = (value: number, unit: Metric["unit"], language: string): string =>
  unit === "EUR" ? moneyIn(value, language) : UNITS(unit, value, language);

/**
 * The languages a resource is available in, named rather than coded. ISO 639-1 is an open list and this
 * table is not: it holds the languages of the territories this corpus covers, and throws for anything else
 * so that adding a country is a deliberate act rather than a page that prints "br" at somebody.
 */
const LANGUAGE_NAMES = {
  en: {
    ro: "Romanian",
    hu: "Hungarian",
    ca: "Catalan",
    de: "German",
    en: "English",
    es: "Spanish",
    eu: "Basque",
    fr: "French",
    gl: "Galician",
    it: "Italian",
    nl: "Dutch",
    pt: "Portuguese",
    el: "Greek",
    pl: "Polish",
  },
  es: {
    ro: "rumano",
    hu: "húngaro",
    ca: "catalán",
    de: "alemán",
    en: "inglés",
    es: "español",
    eu: "euskera",
    fr: "francés",
    gl: "gallego",
    it: "italiano",
    nl: "neerlandés",
    pt: "portugués",
    el: "griego",
    pl: "polaco",
  },
  de: {
    ro: "Rumänisch",
    hu: "Ungarisch",
    ca: "Katalanisch",
    de: "Deutsch",
    en: "Englisch",
    es: "Spanisch",
    eu: "Baskisch",
    fr: "Französisch",
    gl: "Galicisch",
    it: "Italienisch",
    nl: "Niederländisch",
    pt: "Portugiesisch",
    el: "Griechisch",
    pl: "Polnisch",
  },
  fr: {
    ro: "roumain",
    hu: "hongrois",
    ca: "catalan",
    de: "allemand",
    en: "anglais",
    es: "espagnol",
    eu: "basque",
    fr: "français",
    gl: "galicien",
    it: "italien",
    nl: "néerlandais",
    pt: "portugais",
    el: "grec",
    pl: "polonais",
  },
  it: {
    ro: "rumeno",
    hu: "ungherese",
    ca: "catalano",
    de: "tedesco",
    en: "inglese",
    es: "spagnolo",
    eu: "basco",
    fr: "francese",
    gl: "galiziano",
    it: "italiano",
    nl: "olandese",
    pt: "portoghese",
    el: "greco",
    pl: "polacco",
  },
  pt: {
    ro: "romeno",
    hu: "húngaro",
    ca: "catalão",
    de: "alemão",
    en: "inglês",
    es: "espanhol",
    eu: "basco",
    fr: "francês",
    gl: "galego",
    it: "italiano",
    nl: "neerlandês",
    pt: "português",
    el: "grego",
    pl: "polaco",
  },
  nl: {
    ro: "Roemeens",
    hu: "Hongaars",
    ca: "Catalaans",
    de: "Duits",
    en: "Engels",
    es: "Spaans",
    eu: "Baskisch",
    fr: "Frans",
    gl: "Galicisch",
    it: "Italiaans",
    nl: "Nederlands",
    pt: "Portugees",
    el: "Grieks",
    pl: "Pools",
  },
  ro: {
    ca: "catalană",
    de: "germană",
    en: "engleză",
    es: "spaniolă",
    eu: "bască",
    fr: "franceză",
    gl: "galiciană",
    it: "italiană",
    nl: "neerlandeză",
    pt: "portugheză",
    ro: "română",
    hu: "maghiară",
    el: "greacă",
    pl: "poloneză",
  },
  pl: {
    ca: "kataloński",
    de: "niemiecki",
    en: "angielski",
    es: "hiszpański",
    eu: "baskijski",
    fr: "francuski",
    gl: "galicyjski",
    it: "włoski",
    nl: "niderlandzki",
    pt: "portugalski",
    pl: "polski",
    hu: "węgierski",
    el: "grecki",
  },
  el: {
    ca: "καταλανικά",
    de: "γερμανικά",
    en: "αγγλικά",
    es: "ισπανικά",
    eu: "βασκικά",
    fr: "γαλλικά",
    gl: "γαλικιανά",
    it: "ιταλικά",
    nl: "ολλανδικά",
    pt: "πορτογαλικά",
    ro: "ρουμανικά",
    hu: "ουγγρικά",
    el: "ελληνικά",
    pl: "πολωνικά",
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
