/**
 * How a European record is presented on a page written in another language.
 *
 * A European record is written once, in English, on Europe's page, and every country page lists it among
 * what applies there. A Spanish reader on `/es/` met six cards in English in a page in Spanish, which reads
 * as a page that stopped half way (founder, 17 Nov 2026). These are translations of the card — a name a
 * reader of that language would search for, and what the record offers — and nothing else: the record
 * page, its quotes and its official name stay as the source wrote them, and the card still names the
 * original under the translation.
 *
 * Each entry pins the English text it translates. When the record's English changes, the translation no
 * longer matches what it claims to translate and a test fails until somebody translates it again; a stale
 * translation is a second, unsourced version of the record, which is the one thing this project must not
 * publish.
 */
import type { Language } from "./language.ts";

type Card = { name: string; offers: string };
type Presentation = { translates: string } & Partial<Record<Exclude<Language, "en">, Card>>;

export const EU_PRESENTATION: Readonly<Record<string, Presentation>> = {
  "eu-generational-renewal-strategy": {
    translates:
      "EU policy framework to make farming more accessible: support for starting, fairer and more transparent land markets, earlier farm succession and pension security, training and rural services. It proposes a Starter Pack for Young Farmers as a single national entry point to funding, training and advice, and aims to double the share of young and new farmers by 2040.",
    es: {
      name: "Estrategia de la UE para el relevo generacional en la agricultura",
      offers:
        "Marco político de la UE para hacer más accesible la agricultura: apoyo para empezar, mercados de tierras más justos y transparentes, sucesión de explotaciones más temprana y seguridad en la jubilación, formación y servicios rurales. Propone un «Starter Pack» para jóvenes agricultores como punto de entrada nacional único a financiación, formación y asesoramiento, y aspira a duplicar la proporción de jóvenes y nuevos agricultores de aquí a 2040.",
    },
    de: {
      name: "EU-Strategie für den Generationswechsel in der Landwirtschaft",
      offers:
        "Politischer Rahmen der EU, der den Einstieg in die Landwirtschaft erleichtern soll: Unterstützung beim Start, fairere und transparentere Bodenmärkte, frühere Hofübergabe und Absicherung im Alter, Weiterbildung und ländliche Dienstleistungen. Sie schlägt ein „Starter Pack“ für Junglandwirte als einheitliche nationale Anlaufstelle für Finanzierung, Weiterbildung und Beratung vor und will den Anteil junger und neuer Landwirte bis 2040 verdoppeln.",
    },
    fr: {
      name: "Stratégie de l’UE pour le renouvellement des générations en agriculture",
      offers:
        "Cadre politique de l’UE pour rendre l’agriculture plus accessible : soutien à l’installation, marchés fonciers plus équitables et transparents, transmission des exploitations plus précoce et sécurité de la retraite, formation et services en milieu rural. Elle propose un « Starter Pack » pour les jeunes agriculteurs, guichet national unique vers le financement, la formation et le conseil, et vise à doubler la part des jeunes et nouveaux agriculteurs d’ici 2040.",
    },
    it: {
      name: "Strategia dell’UE per il ricambio generazionale in agricoltura",
      offers:
        "Quadro politico dell’UE per rendere l’agricoltura più accessibile: sostegno all’avvio, mercati fondiari più equi e trasparenti, passaggio dell’azienda anticipato e sicurezza previdenziale, formazione e servizi rurali. Propone uno «Starter Pack» per i giovani agricoltori come punto di accesso nazionale unico a finanziamenti, formazione e consulenza, e punta a raddoppiare la quota di giovani e nuovi agricoltori entro il 2040.",
    },
    pt: {
      name: "Estratégia da UE para a renovação geracional na agricultura",
      offers:
        "Quadro político da UE para tornar a agricultura mais acessível: apoio ao arranque, mercados fundiários mais justos e transparentes, sucessão das explorações mais cedo e segurança na reforma, formação e serviços rurais. Propõe um «Starter Pack» para jovens agricultores como ponto de entrada nacional único para financiamento, formação e aconselhamento, e pretende duplicar a proporção de jovens e novos agricultores até 2040.",
    },
    nl: {
      name: "EU-strategie voor generatievernieuwing in de landbouw",
      offers:
        "Beleidskader van de EU om de landbouw toegankelijker te maken: steun bij de start, eerlijkere en transparantere grondmarkten, eerdere bedrijfsopvolging en pensioenzekerheid, opleiding en voorzieningen op het platteland. Het stelt een ‘Starter Pack’ voor jonge boeren voor als één nationaal loket voor financiering, opleiding en advies, en wil het aandeel jonge en nieuwe boeren tegen 2040 verdubbelen.",
    },
    ro: {
      name: "Strategia UE pentru reînnoirea generațiilor în agricultură",
      offers:
        "Cadrul de politici al UE pentru acces mai ușor la agricultură: sprijin la instalare, piețe funciare mai transparente și echitabile, transmiterea fermelor mai devreme, siguranță la pensie, formare și servicii rurale. Propune un punct național unic de acces la finanțare, formare și consiliere pentru tinerii fermieri și urmărește dublarea ponderii tinerilor și noilor fermieri până în 2040.",
    },
    pl: {
      name: "Strategia UE na rzecz wymiany pokoleń w rolnictwie",
      offers:
        "Strategia UE ma ułatwić rozpoczęcie działalności rolniczej. Obejmuje wsparcie na start, większą przejrzystość i sprawiedliwsze zasady na rynku ziemi, wcześniejsze przekazywanie gospodarstw, zabezpieczenie emerytalne, szkolenia i usługi na obszarach wiejskich. Zakłada utworzenie w każdym kraju jednego punktu dostępu do finansowania, szkoleń i doradztwa dla młodych rolników. Jej celem jest podwojenie udziału młodych rolników i osób rozpoczynających działalność rolniczą do 2040 r.",
    },
    el: {
      name: "Στρατηγική της ΕΕ για την ανανέωση των γενεών στη γεωργία",
      offers:
        "Το πλαίσιο πολιτικής της ΕΕ για να γίνει ευκολότερη η είσοδος στη γεωργία. Καλύπτει τη στήριξη της πρώτης εγκατάστασης, τη διαφάνεια και τη δικαιοσύνη στην αγορά αγροτικής γης, την έγκαιρη μεταβίβαση εκμεταλλεύσεων, την ασφάλεια στη συνταξιοδότηση, την κατάρτιση και τις υπηρεσίες στην ύπαιθρο. Προτείνει ένα ενιαίο σημείο πρόσβασης σε κάθε χώρα, όπου οι νέοι αγρότες θα βρίσκουν χρηματοδότηση, κατάρτιση και συμβουλευτική. Στόχος είναι να διπλασιαστεί έως το 2040 το ποσοστό των νέων και των νεοεισερχόμενων αγροτών.",
    },
  },
  "eu-cap-young-farmers": {
    translates:
      "Explains the CAP 2023-27 support for young farmers that every country tailors in its CAP Strategic Plan: the Complementary Income Support for Young Farmers (CISYF), an annual payment per eligible hectare or lump sum for young farmers newly set up for the first time, plus installation aid, investment support and cooperation for farm succession.",
    es: {
      name: "Ayudas de la PAC 2023-2027 para jóvenes agricultores",
      offers:
        "Explica las ayudas de la PAC 2023-2027 para jóvenes agricultores que cada país adapta en su plan estratégico: la ayuda complementaria a la renta para jóvenes agricultores (CISYF), un pago anual por hectárea admisible o a tanto alzado para quienes se instalan por primera vez, además de ayudas a la instalación, a la inversión y a la cooperación para la sucesión de explotaciones.",
    },
    de: {
      name: "GAP-Förderung 2023–2027 für Junglandwirte",
      offers:
        "Erklärt die GAP-Förderung 2023–2027 für Junglandwirte, die jedes Land in seinem GAP-Strategieplan ausgestaltet: die ergänzende Einkommensstützung für Junglandwirte (CISYF), eine jährliche Zahlung je beihilfefähigem Hektar oder als Pauschale für Junglandwirte, die sich erstmals niedergelassen haben, dazu Niederlassungsbeihilfen, Investitionsförderung und Zusammenarbeit bei der Hofübergabe.",
    },
    fr: {
      name: "Aides de la PAC 2023-2027 aux jeunes agriculteurs",
      offers:
        "Présente les aides de la PAC 2023-2027 aux jeunes agriculteurs, que chaque pays adapte dans son plan stratégique : l’aide complémentaire au revenu pour les jeunes agriculteurs (CISYF), un paiement annuel par hectare admissible ou forfaitaire pour les jeunes installés pour la première fois, ainsi que des aides à l’installation, à l’investissement et à la coopération pour la transmission des exploitations.",
    },
    it: {
      name: "Sostegno della PAC 2023-2027 ai giovani agricoltori",
      offers:
        "Illustra il sostegno della PAC 2023-2027 ai giovani agricoltori che ogni paese adatta nel proprio piano strategico: il sostegno complementare al reddito per i giovani agricoltori (CISYF), un pagamento annuale per ettaro ammissibile o forfettario per chi si è insediato per la prima volta, oltre ad aiuti all’insediamento, agli investimenti e alla cooperazione per il passaggio dell’azienda.",
    },
    pt: {
      name: "Apoios da PAC 2023-2027 aos jovens agricultores",
      offers:
        "Explica os apoios da PAC 2023-2027 aos jovens agricultores que cada país adapta no seu plano estratégico: o apoio complementar ao rendimento dos jovens agricultores (CISYF), um pagamento anual por hectare elegível ou montante fixo para quem se instala pela primeira vez, além de apoios à instalação, ao investimento e à cooperação para a sucessão das explorações.",
    },
    nl: {
      name: "GLB-steun 2023-2027 voor jonge boeren",
      offers:
        "Legt de GLB-steun 2023-2027 voor jonge boeren uit die elk land in zijn strategisch GLB-plan invult: de aanvullende inkomenssteun voor jonge landbouwers (CISYF), een jaarlijkse betaling per subsidiabele hectare of een vast bedrag voor wie zich voor het eerst heeft gevestigd, plus vestigingssteun, investeringssteun en samenwerking bij bedrijfsopvolging.",
    },
    ro: {
      name: "Sprijinul PAC 2023–2027 pentru tinerii fermieri",
      offers:
        "Explică sprijinul pe care fiecare țară îl adaptează în planul său strategic PAC: plata complementară anuală pe hectar eligibil sau forfetară pentru tinerii fermieri instalați pentru prima dată, sprijinul pentru instalare și investiții și cooperarea pentru transmiterea fermelor.",
    },
    pl: {
      name: "Wsparcie dla młodych rolników w ramach WPR 2023–2027",
      offers:
        "Wyjaśnia, jakie formy wsparcia poszczególne kraje dostosowują w swoich planach strategicznych WPR. Są to coroczne płatności uzupełniające dla młodych rolników rozpoczynających działalność po raz pierwszy, naliczane za kwalifikujący się hektar lub wypłacane ryczałtowo, a także wsparcie na rozpoczęcie działalności, inwestycje i współpracę przy przekazywaniu gospodarstw.",
    },
    el: {
      name: "Στήριξη νέων αγροτών μέσω της ΚΑΠ 2023–2027",
      offers:
        "Εξηγεί πώς προσαρμόζει κάθε χώρα τη στήριξη στο Στρατηγικό Σχέδιο της ΚΑΠ: ετήσια συμπληρωματική ενίσχυση ανά επιλέξιμο εκτάριο ή κατ’ αποκοπή για νέους αγρότες που εγκαθίστανται για πρώτη φορά, στήριξη για εγκατάσταση και επενδύσεις, καθώς και συνεργασία για τη μεταβίβαση εκμεταλλεύσεων.",
    },
  },
  "eu-cap-strategic-plans": {
    translates:
      "The Commission's gateway to the CAP Strategic Plan of each EU country for 2023-2027: the interventions and CAP instruments each country uses, how its plan was approved and its annual performance reports.",
    es: {
      name: "Planes estratégicos de la PAC por país",
      offers:
        "Portal de la Comisión con el plan estratégico de la PAC 2023-2027 de cada país de la UE: las intervenciones e instrumentos de la PAC que aplica cada país, cómo se aprobó su plan y sus informes anuales de rendimiento.",
    },
    de: {
      name: "GAP-Strategiepläne nach Land",
      offers:
        "Portal der Kommission zum GAP-Strategieplan 2023–2027 jedes EU-Landes: die Interventionen und GAP-Instrumente, die jedes Land nutzt, wie sein Plan genehmigt wurde, und seine jährlichen Leistungsberichte.",
    },
    fr: {
      name: "Plans stratégiques de la PAC par pays",
      offers:
        "Portail de la Commission vers le plan stratégique PAC 2023-2027 de chaque pays de l’UE : les interventions et instruments de la PAC utilisés par chaque pays, la manière dont son plan a été approuvé et ses rapports annuels de performance.",
    },
    it: {
      name: "Piani strategici della PAC per paese",
      offers:
        "Portale della Commissione con il piano strategico della PAC 2023-2027 di ogni paese dell’UE: gli interventi e gli strumenti della PAC usati da ciascun paese, come è stato approvato il suo piano e le relazioni annuali di performance.",
    },
    pt: {
      name: "Planos estratégicos da PAC por país",
      offers:
        "Portal da Comissão com o plano estratégico da PAC 2023-2027 de cada país da UE: as intervenções e os instrumentos da PAC que cada país utiliza, como o seu plano foi aprovado e os relatórios anuais de desempenho.",
    },
    nl: {
      name: "Strategische GLB-plannen per land",
      offers:
        "Toegangspagina van de Commissie tot het strategisch GLB-plan 2023-2027 van elk EU-land: de interventies en GLB-instrumenten die elk land gebruikt, hoe het plan is goedgekeurd en de jaarlijkse prestatieverslagen.",
    },
    ro: {
      name: "Planurile strategice PAC pe țări",
      offers:
        "Portalul Comisiei către planul strategic PAC 2023–2027 al fiecărei țări din UE. Arată intervențiile și instrumentele folosite, cum a fost aprobat planul și rapoartele anuale de performanță.",
    },
    pl: {
      name: "Plany strategiczne WPR według krajów",
      offers:
        "Portal Komisji Europejskiej z planami strategicznymi WPR na lata 2023–2027 dla wszystkich państw UE. Pokazuje, jakie interwencje i instrumenty stosuje dany kraj, jak zatwierdzono jego plan, i udostępnia roczne sprawozdania z realizacji.",
    },
    el: {
      name: "Στρατηγικά Σχέδια της ΚΑΠ ανά χώρα",
      offers:
        "Η πύλη της Ευρωπαϊκής Επιτροπής για το Στρατηγικό Σχέδιο της ΚΑΠ 2023–2027 κάθε χώρας της ΕΕ. Παρουσιάζει τις παρεμβάσεις και τα εργαλεία που χρησιμοποιούνται, τη διαδικασία έγκρισης του σχεδίου και τις ετήσιες εκθέσεις επιδόσεων.",
    },
  },
  "eu-newbie-practice-abstracts": {
    translates:
      "Short case studies on business and entry models used by new farm entrants in European countries. The browser lets readers explore practical approaches to barriers to entry.",
    es: {
      name: "Buscador de fichas prácticas de NEWBIE",
      offers:
        "Casos breves sobre los modelos de negocio y de entrada que usan las personas que se incorporan a la agricultura en distintos países europeos. El buscador permite explorar soluciones prácticas a los obstáculos de entrada.",
    },
    de: {
      name: "NEWBIE-Datenbank mit Praxisbeispielen",
      offers:
        "Kurze Fallbeispiele zu Geschäfts- und Einstiegsmodellen von Neueinsteigerinnen und Neueinsteigern in die Landwirtschaft in europäischen Ländern. Die Datenbank zeigt praktische Wege über die Hürden beim Einstieg.",
    },
    fr: {
      name: "Moteur de fiches pratiques NEWBIE",
      offers:
        "Courtes études de cas sur les modèles économiques et d’entrée utilisés par les nouveaux installés agricoles dans des pays européens. Le moteur permet d’explorer des réponses pratiques aux obstacles à l’installation.",
    },
    it: {
      name: "Raccolta di schede pratiche NEWBIE",
      offers:
        "Brevi casi studio sui modelli di impresa e di ingresso adottati dai nuovi agricoltori in diversi paesi europei. La raccolta permette di esplorare soluzioni pratiche agli ostacoli all’ingresso.",
    },
    pt: {
      name: "Pesquisa de fichas práticas NEWBIE",
      offers:
        "Casos breves sobre os modelos de negócio e de entrada usados por novos agricultores em países europeus. A pesquisa permite explorar respostas práticas aos obstáculos à entrada na agricultura.",
    },
    nl: {
      name: "NEWBIE-zoeker voor praktijkvoorbeelden",
      offers:
        "Korte praktijkvoorbeelden van bedrijfs- en instapmodellen die nieuwe boeren in Europese landen gebruiken. Met de zoeker kunt u praktische oplossingen voor drempels bij de start verkennen.",
    },
    ro: {
      name: "NEWBIE: exemple practice pentru intrarea în agricultură",
      offers:
        "Studii de caz scurte despre modele de afaceri și de intrare în agricultură folosite în țări europene. Poți explora soluții practice la obstacolele întâlnite la început.",
    },
    pl: {
      name: "NEWBIE: praktyczne przykłady rozpoczęcia działalności rolniczej",
      offers:
        "Krótkie studia przypadków przedstawiają modele prowadzenia gospodarstw i sposoby wejścia do rolnictwa w krajach europejskich. Możesz poznać praktyczne rozwiązania trudności, które pojawiają się na początku.",
    },
    el: {
      name: "NEWBIE: παραδείγματα για όσους ξεκινούν αγροτική δραστηριότητα",
      offers:
        "Σύντομες μελέτες περιπτώσεων από ευρωπαϊκές χώρες για επιχειρηματικά μοντέλα και τρόπους εισόδου στη γεωργία. Μπορείς να δεις πρακτικές λύσεις για τις δυσκολίες που συναντά κανείς στο ξεκίνημα.",
    },
  },
  "eu-newbie-toolkits": {
    translates:
      "Online toolkits with practical guides, lessons and tips for entering farming and succession, based on network discussions and practical experiences.",
    es: {
      name: "Guías prácticas de NEWBIE",
      offers:
        "Guías en línea con pautas prácticas, lecciones y consejos para incorporarse a la agricultura y para el relevo, basados en debates entre redes y en experiencias reales.",
    },
    de: {
      name: "NEWBIE-Praxisleitfäden",
      offers:
        "Online-Leitfäden mit praktischen Anleitungen, Lektionen und Tipps für den Einstieg in die Landwirtschaft und die Hofnachfolge, entstanden aus Diskussionen in Netzwerken und praktischen Erfahrungen.",
    },
    fr: {
      name: "Boîtes à outils NEWBIE",
      offers:
        "Boîtes à outils en ligne avec des guides pratiques, des leçons et des conseils pour s’installer en agriculture et pour la transmission, issus d’échanges entre réseaux et d’expériences de terrain.",
    },
    it: {
      name: "Strumenti pratici NEWBIE",
      offers:
        "Strumenti online con guide pratiche, lezioni e consigli per entrare in agricoltura e per il ricambio generazionale, nati dal confronto tra reti e da esperienze concrete.",
    },
    pt: {
      name: "Guias práticos NEWBIE",
      offers:
        "Guias em linha com orientações práticas, lições e conselhos para entrar na agricultura e para a sucessão, baseados em debates entre redes e em experiências práticas.",
    },
    nl: {
      name: "NEWBIE-toolkits",
      offers:
        "Online toolkits met praktische handleidingen, lessen en tips om in de landbouw te starten en voor bedrijfsopvolging, gebaseerd op discussies in netwerken en praktijkervaringen.",
    },
    ro: {
      name: "NEWBIE: ghiduri practice pentru instalare și preluare",
      offers:
        "Ghiduri online, lecții și sfaturi pentru intrarea în agricultură și preluarea fermelor, bazate pe discuțiile rețelei și pe experiențe practice.",
    },
    pl: {
      name: "NEWBIE: poradniki o zakładaniu i przejmowaniu gospodarstw",
      offers:
        "Poradniki online, lekcje i wskazówki dotyczące rozpoczęcia działalności rolniczej i przejmowania gospodarstw, oparte na rozmowach w ramach sieci i na doświadczeniach z praktyki.",
    },
    el: {
      name: "NEWBIE: πρακτικοί οδηγοί για πρώτη εγκατάσταση και ανάληψη εκμετάλλευσης",
      offers:
        "Διαδικτυακοί οδηγοί, μαθήματα και συμβουλές για όσους ξεκινούν αγροτική δραστηριότητα ή αναλαμβάνουν εκμετάλλευση. Βασίζονται στις συζητήσεις του δικτύου και στην πρακτική εμπειρία.",
    },
  },
  "eu-fi-compass-young-farmer-business-plans": {
    translates:
      "Toolkit for young and new farmers preparing a business plan to apply for a bank loan or other external financing: what banks look for, the most common reasons for rejection and how to prepare a finance-ready plan, for example by considering good and bad years and possible delays in grants or payments.",
    es: {
      name: "Planes de empresa y solicitudes de préstamo de jóvenes agricultores en la UE",
      offers:
        "Material para jóvenes y nuevos agricultores que preparan un plan de empresa para pedir un préstamo bancario u otra financiación externa: qué buscan los bancos, los motivos de rechazo más habituales y cómo preparar un plan listo para financiarse, por ejemplo teniendo en cuenta años buenos y malos y posibles retrasos en ayudas o pagos.",
    },
    de: {
      name: "Businesspläne und Kreditanträge von Junglandwirten in der EU",
      offers:
        "Arbeitshilfe für junge und neue Landwirte, die einen Businessplan für einen Bankkredit oder eine andere externe Finanzierung vorbereiten: worauf Banken achten, die häufigsten Ablehnungsgründe und wie man einen finanzierungsreifen Plan erstellt, etwa mit guten und schlechten Jahren und möglichen Verzögerungen bei Beihilfen oder Zahlungen.",
    },
    fr: {
      name: "Plans d’entreprise et demandes de prêt des jeunes agriculteurs dans l’UE",
      offers:
        "Boîte à outils pour les jeunes et nouveaux agriculteurs qui préparent un plan d’entreprise afin de demander un prêt bancaire ou un autre financement externe : ce que recherchent les banques, les motifs de refus les plus fréquents et comment préparer un plan finançable, par exemple en prévoyant bonnes et mauvaises années et d’éventuels retards d’aides ou de paiements.",
    },
    it: {
      name: "Piani aziendali e domande di prestito dei giovani agricoltori nell’UE",
      offers:
        "Strumenti per giovani e nuovi agricoltori che preparano un piano aziendale per chiedere un prestito bancario o un altro finanziamento esterno: cosa cercano le banche, i motivi di rifiuto più comuni e come preparare un piano finanziabile, ad esempio considerando annate buone e cattive e possibili ritardi di aiuti o pagamenti.",
    },
    pt: {
      name: "Planos de negócio e pedidos de empréstimo de jovens agricultores na UE",
      offers:
        "Conjunto de ferramentas para jovens e novos agricultores que preparam um plano de negócio para pedir um empréstimo bancário ou outro financiamento externo: o que os bancos procuram, os motivos de recusa mais comuns e como preparar um plano pronto a financiar, por exemplo considerando anos bons e maus e possíveis atrasos em apoios ou pagamentos.",
    },
    nl: {
      name: "Bedrijfsplannen en leningaanvragen van jonge boeren in de EU",
      offers:
        "Hulpmiddelen voor jonge en nieuwe boeren die een bedrijfsplan opstellen om een banklening of andere externe financiering aan te vragen: waar banken op letten, de meest voorkomende redenen voor afwijzing en hoe je een financierbaar plan maakt, bijvoorbeeld door rekening te houden met goede en slechte jaren en mogelijke vertraging van steun of betalingen.",
    },
    ro: {
      name: "fi-compass: planuri de afaceri pentru tinerii fermieri",
      offers:
        "Ghid pentru tinerii și noii fermieri care pregătesc un plan de afaceri pentru un credit sau altă finanțare externă. Explică ce caută băncile, de ce resping unele cereri și cum să iei în calcul anii buni și slabi sau întârzierile la plăți.",
    },
    pl: {
      name: "fi-compass: biznesplany dla młodych rolników",
      offers:
        "Poradnik dla młodych rolników i osób rozpoczynających działalność rolniczą, które przygotowują biznesplan na potrzeby kredytu lub innego finansowania zewnętrznego. Wyjaśnia, na co zwracają uwagę banki, dlaczego odrzucają niektóre wnioski i jak uwzględnić lepsze i gorsze lata oraz opóźnienia w płatnościach.",
    },
    el: {
      name: "fi-compass: επιχειρηματικά σχέδια για νέους αγρότες",
      offers:
        "Οδηγός για νέους και νεοεισερχόμενους αγρότες που ετοιμάζουν επιχειρηματικό σχέδιο για δάνειο ή άλλη εξωτερική χρηματοδότηση. Εξηγεί τι εξετάζουν οι τράπεζες, γιατί απορρίπτουν ορισμένες αιτήσεις και πώς να υπολογίσεις τις καλές και τις δύσκολες χρονιές ή τυχόν καθυστερήσεις στις πληρωμές.",
    },
  },
  "eu-cap-network-generational-renewal": {
    translates:
      "EU CAP Network topic page on generational renewal: news, upcoming events, publications and good-practice projects from across the EU that support young farmers and new entrants in setting up a farm business.",
    es: {
      name: "Red de la PAC de la UE: relevo generacional",
      offers:
        "Página temática de la Red de la PAC de la UE sobre relevo generacional: noticias, próximos eventos, publicaciones y proyectos de buenas prácticas de toda la UE que ayudan a jóvenes y nuevos agricultores a poner en marcha una explotación.",
    },
    de: {
      name: "EU-GAP-Netzwerk: Generationswechsel",
      offers:
        "Themenseite des EU-GAP-Netzwerks zum Generationswechsel: Nachrichten, kommende Veranstaltungen, Veröffentlichungen und Praxisbeispiele aus der ganzen EU, die Junglandwirte und Neueinsteiger beim Aufbau eines landwirtschaftlichen Betriebs unterstützen.",
    },
    fr: {
      name: "Réseau PAC de l’UE : renouvellement des générations",
      offers:
        "Page thématique du réseau PAC de l’UE sur le renouvellement des générations : actualités, événements à venir, publications et projets de bonnes pratiques de toute l’UE qui aident les jeunes agriculteurs et les nouveaux entrants à créer une exploitation.",
    },
    it: {
      name: "Rete PAC dell’UE: ricambio generazionale",
      offers:
        "Pagina tematica della Rete PAC dell’UE sul ricambio generazionale: notizie, prossimi eventi, pubblicazioni e progetti di buone pratiche da tutta l’UE che sostengono giovani agricoltori e nuovi entranti nell’avvio di un’azienda agricola.",
    },
    pt: {
      name: "Rede PAC da UE: renovação geracional",
      offers:
        "Página temática da Rede PAC da UE sobre renovação geracional: notícias, próximos eventos, publicações e projetos de boas práticas de toda a UE que apoiam jovens e novos agricultores a criar uma exploração.",
    },
    nl: {
      name: "EU-GLB-netwerk: generatievernieuwing",
      offers:
        "Themapagina van het EU-GLB-netwerk over generatievernieuwing: nieuws, komende evenementen, publicaties en voorbeeldprojecten uit de hele EU die jonge boeren en nieuwkomers helpen een landbouwbedrijf op te zetten.",
    },
    ro: {
      name: "Rețeaua PAC a UE: reînnoirea generațiilor",
      offers:
        "Pagină a Rețelei PAC a UE cu știri, evenimente, publicații și proiecte de bune practici care îi sprijină pe tinerii și noii fermieri să înființeze o exploatație.",
    },
    pl: {
      name: "Europejska Sieć WPR: wymiana pokoleń",
      offers:
        "Strona Europejskiej Sieci WPR z aktualnościami, wydarzeniami, publikacjami i przykładami dobrych praktyk z projektów, które pomagają młodym rolnikom i osobom wchodzącym do rolnictwa założyć gospodarstwo.",
    },
    el: {
      name: "Ευρωπαϊκό Δίκτυο της ΚΑΠ: ανανέωση των γενεών",
      offers:
        "Σελίδα του Ευρωπαϊκού Δικτύου της ΚΑΠ με νέα, εκδηλώσεις, δημοσιεύσεις και παραδείγματα καλής πρακτικής από έργα που βοηθούν νέους και νεοεισερχόμενους αγρότες να ξεκινήσουν μια αγροτική εκμετάλλευση.",
    },
  },
  "eu-observatory-on-farmland": {
    translates:
      "Planned EU observatory to improve transparency on farmland markets and access to land. In 2026 the Commission launched a call for an Expert Group on Farmland that prepares it, alongside a pilot project.",
    es: {
      name: "Observatorio Europeo de Tierras Agrícolas",
      offers:
        "Observatorio de la UE previsto para mejorar la transparencia de los mercados de tierras agrícolas y del acceso a la tierra. En 2026 la Comisión abrió una convocatoria para un grupo de expertos sobre tierras agrícolas que lo prepara, junto con un proyecto piloto.",
    },
    de: {
      name: "Europäische Beobachtungsstelle für landwirtschaftliche Flächen",
      offers:
        "Geplante EU-Beobachtungsstelle für mehr Transparenz auf den Märkten für landwirtschaftliche Flächen und beim Zugang zu Land. 2026 hat die Kommission einen Aufruf für eine Expertengruppe zu landwirtschaftlichen Flächen gestartet, die sie vorbereitet, zusammen mit einem Pilotprojekt.",
    },
    fr: {
      name: "Observatoire européen des terres agricoles",
      offers:
        "Observatoire de l’UE prévu pour améliorer la transparence des marchés fonciers agricoles et de l’accès à la terre. En 2026, la Commission a lancé un appel pour un groupe d’experts sur les terres agricoles chargé de le préparer, aux côtés d’un projet pilote.",
    },
    it: {
      name: "Osservatorio europeo sui terreni agricoli",
      offers:
        "Osservatorio dell’UE previsto per migliorare la trasparenza dei mercati dei terreni agricoli e dell’accesso alla terra. Nel 2026 la Commissione ha aperto un invito per un gruppo di esperti sui terreni agricoli che lo prepara, insieme a un progetto pilota.",
    },
    pt: {
      name: "Observatório Europeu das Terras Agrícolas",
      offers:
        "Observatório da UE previsto para melhorar a transparência dos mercados de terras agrícolas e do acesso à terra. Em 2026 a Comissão abriu um convite para um grupo de peritos sobre terras agrícolas que o prepara, a par de um projeto-piloto.",
    },
    nl: {
      name: "Europees Observatorium voor landbouwgrond",
      offers:
        "Gepland EU-observatorium om de grondmarkt en de toegang tot landbouwgrond transparanter te maken. In 2026 opende de Commissie een oproep voor een deskundigengroep over landbouwgrond die het voorbereidt, naast een proefproject.",
    },
    ro: {
      name: "Observatorul UE pentru terenurile agricole",
      offers:
        "Observator planificat pentru a îmbunătăți transparența piețelor funciare și a accesului la teren. În 2026 Comisia a lansat un apel pentru grupul de experți care îl pregătește, alături de un proiect-pilot.",
    },
    pl: {
      name: "Unijne obserwatorium gruntów rolnych",
      offers:
        "Planowane obserwatorium ma zwiększyć przejrzystość rynku gruntów rolnych i zasad dostępu do ziemi. W 2026 r. Komisja ogłosiła nabór do grupy ekspertów przygotowującej obserwatorium oraz uruchomiła projekt pilotażowy.",
    },
    el: {
      name: "Παρατηρητήριο της ΕΕ για τη γεωργική γη",
      offers:
        "Σχεδιαζόμενο παρατηρητήριο για μεγαλύτερη διαφάνεια στην αγορά γεωργικής γης και στην πρόσβαση σε αυτή. Το 2026 η Ευρωπαϊκή Επιτροπή δημοσίευσε πρόσκληση για την ομάδα εμπειρογνωμόνων που θα το προετοιμάσει, παράλληλα με ένα πιλοτικό έργο.",
    },
  },
};

/**
 * The card of a European record in a page's language, or nothing when the page is in English or the
 * translation no longer matches the record's English (the build test says which).
 */
export const euCardIn = (id: string, whatItOffers: string, language: string): Card | undefined => {
  const entry = EU_PRESENTATION[id];
  if (entry === undefined || entry.translates !== whatItOffers || language === "en") return undefined;
  return entry[language as Exclude<Language, "en">];
};
