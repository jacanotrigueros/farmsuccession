/** The same founder-approved facts in each supported language; locale variants use their primary language. */
import type { Language } from "./language.ts";

type FounderStory = {
  link: string;
  personalTitle: string;
  title: string;
  originTitle: string;
  freeTitle: string;
  personal: readonly string[];
  paragraphs: readonly string[];
  origin: readonly string[];
  free: readonly string[];
};

export const founderStory = {
  en: {
    link: "Why FarmSuccession exists",
    personalTitle: "The person behind the project",
    title: "Why farm succession matters",
    originTitle: "How the idea changed",
    freeTitle: "Why access is free",
    personal: [
      "I am José Antonio Cano Trigueros, a software developer. My professional work is in technology, including an environment that connects farmers’ products with consumers. FarmSuccession is a personal project, independent of my employer.",
      "Outside work, I tend fruit trees on a small plot and try to encourage biodiversity, for example with insect shelters. I am not a professional farmer: this experience brings me closer to some aspects of the countryside, but it is very different from running a farm.",
    ],
    paragraphs: [
      "I care about whether new generations have a realistic opportunity to produce food and continue farming. Access to land is part of that path, alongside finance, training and advice. When a farm has no successor, its future and the knowledge built up around it concern me.",
      "I want farming to be a viable choice that also allows people to care for their surroundings and improve their practices. That concern led me to investigate farm succession and gave this project its name. A directory cannot resolve those difficulties, but it can make existing support easier to find.",
    ],
    origin: [
      "The initial idea was commercial: I explored a platform or land bank connecting farm owners with people interested in taking over. Research revealed specialist intermediaries already working in this field, and human, legal and economic difficulties that are not resolved simply by introducing two people.",
      "It also revealed useful resources scattered across European administrations, associations and other organisations. Rather than reproduce their work, I chose to organise descriptions and links so people could find those providers. That became FarmSuccession, an independent documentary directory. It does not broker transfers, process applications or replace official sources or specialist advice.",
    ],
    free: [
      "Building and maintaining the directory also has professional value for me. It is a real public portfolio where I can apply and demonstrate software skills, experiment, learn and show initiative. In my own career, I have found that a willingness to learn and take initiative is valued. This project gives that effort a practical purpose.",
      "Free access does not mean there are no costs. Keeping the site published requires infrastructure, distinct from the tools used to develop it and research its sources, and from my unpaid personal time. I use some paid tools, including AI, to make better use of my spare time. Some subscriptions are optional or shared with other projects; I do not intend to keep all of them indefinitely. The published static site can keep working without those development subscriptions. I use software and AI tools to assist research and maintenance. Their output is not evidence by itself and does not replace original sources, human review or specialist judgement.",
      "For now, the personal and professional value I get from the project allows me to offer the directory free of charge. That explains the present choice; it is not a promise of free access forever or a guarantee of future maintenance.",
    ],
  },
  es: {
    link: "Por qué existe FarmSuccession",
    personalTitle: "Quién está detrás",
    title: "Por qué importa el relevo generacional",
    originTitle: "Cómo cambió la idea",
    freeTitle: "Por qué el acceso es gratuito",
    personal: [
      "Soy José Antonio Cano Trigueros, informático y desarrollador de software. Trabajo profesionalmente en tecnología, también en un entorno que conecta los productos de los agricultores con los consumidores. FarmSuccession es un proyecto personal, independiente de mi empleador.",
      "Fuera del trabajo cuido árboles frutales en una pequeña parcela e intento favorecer la biodiversidad, por ejemplo con refugios para insectos. No soy agricultor profesional: esta experiencia me acerca a algunos aspectos del campo, pero es muy distinta de gestionar una explotación.",
    ],
    paragraphs: [
      "Me preocupa que las nuevas generaciones tengan oportunidades reales para producir alimentos y continuar la actividad agraria. Acceder a la tierra es parte de ese camino, junto con la financiación, la formación y el asesoramiento. Cuando una explotación no encuentra relevo, me preocupan su futuro y los conocimientos acumulados a su alrededor.",
      "Quiero que dedicarse al campo sea una opción viable que también permita cuidar el entorno y mejorar las prácticas. Esa inquietud me llevó a investigar el relevo generacional y dio nombre al proyecto. Un directorio no puede resolver esas dificultades, pero sí facilitar que se encuentren los apoyos existentes.",
    ],
    origin: [
      "La idea inicial era comercial: exploré una plataforma o banco de tierras que conectara a titulares de explotaciones con personas interesadas en continuarlas. La investigación mostró intermediarios especializados que ya trabajaban en este ámbito y dificultades humanas, jurídicas y económicas que no se resuelven simplemente poniendo en contacto a dos personas.",
      "También encontré recursos útiles dispersos entre administraciones, asociaciones y otras organizaciones europeas. En lugar de reproducir su trabajo, decidí organizar descripciones y enlaces para facilitar que se encontrara a quienes prestan esos servicios. Así nació FarmSuccession, un directorio documental independiente. No intermedia en transmisiones, no tramita solicitudes ni sustituye a las fuentes oficiales o al asesoramiento especializado.",
    ],
    free: [
      "Crear y mantener el directorio también tiene valor profesional para mí. Es un portfolio público y real donde puedo aplicar y demostrar conocimientos de software, experimentar, aprender y mostrar iniciativa. A lo largo de mi carrera he comprobado personalmente que las ganas de aprender y la iniciativa se valoran. Este proyecto da una utilidad concreta a ese esfuerzo.",
      "La gratuidad no significa ausencia de costes. Mantener la web publicada requiere infraestructura, distinta de las herramientas de desarrollo e investigación y de las horas de trabajo personal no remunerado. Utilizo algunas herramientas de pago, incluida inteligencia artificial, para aprovechar mejor mi tiempo libre. Algunas suscripciones son opcionales o compartidas con otros proyectos; no pretendo mantenerlas todas indefinidamente. La web estática publicada puede seguir funcionando sin esas suscripciones de desarrollo. Utilizo software e inteligencia artificial para apoyar la investigación y el mantenimiento. Sus resultados no son evidencia por sí solos ni sustituyen a las fuentes originales, la revisión humana o el criterio especializado.",
      "Por ahora, el valor personal y profesional que obtengo del proyecto me permite ofrecer gratuitamente el directorio. Es la explicación de una decisión actual, no una promesa de gratuidad perpetua ni una garantía de mantenimiento futuro.",
    ],
  },
  fr: {
    link: "Pourquoi FarmSuccession existe",
    personalTitle: "Qui porte ce projet",
    title: "Pourquoi la transmission compte",
    originTitle: "Comment l’idée a évolué",
    freeTitle: "Pourquoi l’accès est gratuit",
    personal: [
      "Je m’appelle José Antonio Cano Trigueros et je suis développeur logiciel. Je travaille dans la technologie, notamment dans un environnement qui rapproche les produits des agriculteurs des consommateurs. FarmSuccession est un projet personnel, indépendant de mon employeur.",
      "En dehors du travail, je m’occupe d’arbres fruitiers sur une petite parcelle et j’essaie d’y favoriser la biodiversité, par exemple avec des abris pour insectes. Je ne suis pas agriculteur professionnel. Cette expérience me rapproche de certains aspects de la vie rurale, mais elle est très différente de la gestion d’une exploitation.",
    ],
    paragraphs: [
      "Je souhaite que les nouvelles générations aient de réelles possibilités de produire notre alimentation et de poursuivre l’activité agricole. L’accès au foncier fait partie de ce parcours, tout comme le financement, la formation et le conseil. Lorsqu’une exploitation ne trouve pas de repreneur, son avenir et les savoirs qui s’y sont construits me préoccupent.",
      "Je souhaite que l’agriculture soit un choix viable, permettant aussi de prendre soin de l’environnement et d’améliorer les pratiques. Cette préoccupation m’a conduit à étudier la transmission et a donné son nom au projet. Un annuaire ne peut pas résoudre ces difficultés, mais il peut faciliter la découverte des soutiens existants.",
    ],
    origin: [
      "L’idée de départ était commerciale. J’ai exploré une plateforme ou une banque de terres qui mettrait en relation des propriétaires d’exploitations et des personnes souhaitant reprendre l’activité. J’ai découvert des intermédiaires spécialisés déjà présents, ainsi que des difficultés humaines, juridiques et économiques qu’une simple mise en relation ne résout pas.",
      "J’ai également trouvé des ressources utiles dispersées entre administrations, associations et autres organismes européens. Plutôt que de reproduire leur travail, j’ai choisi d’organiser des descriptions et des liens pour aider à trouver ces prestataires. C’est ainsi qu’est né FarmSuccession, un annuaire documentaire indépendant. Il n’intervient pas dans les transmissions, ne traite pas de demandes et ne remplace ni les sources officielles ni les conseils spécialisés.",
    ],
    free: [
      "Créer et maintenir cet annuaire a aussi une valeur professionnelle pour moi. C’est un portfolio public et concret où je peux appliquer et montrer mes compétences en développement, expérimenter, apprendre et faire preuve d’initiative. Dans mon parcours, j’ai personnellement constaté que l’envie d’apprendre et l’initiative étaient appréciées. Ce projet donne une utilité concrète à cet effort.",
      "La gratuité ne signifie pas l’absence de coûts. Publier le site nécessite une infrastructure, distincte des outils de développement et de recherche et du temps personnel non rémunéré que j’y consacre. J’utilise certains outils payants, dont l’IA, pour mieux employer mon temps libre. Certains abonnements sont facultatifs ou partagés avec d’autres projets et je ne compte pas tous les conserver indéfiniment. Le site statique publié peut continuer à fonctionner sans ces abonnements de développement. J’utilise des logiciels et l’IA pour soutenir la recherche et la maintenance. Leurs résultats ne constituent pas des preuves à eux seuls et ne remplacent ni les sources originales, ni la relecture humaine, ni le jugement spécialisé.",
      "Pour le moment, la valeur personnelle et professionnelle que j’en retire me permet de proposer l’annuaire gratuitement. Cela explique un choix actuel, sans promettre une gratuité perpétuelle ni garantir une maintenance future.",
    ],
  },
  de: {
    link: "Warum es FarmSuccession gibt",
    personalTitle: "Wer hinter dem Projekt steht",
    title: "Warum Hofnachfolge wichtig ist",
    originTitle: "Wie sich die Idee verändert hat",
    freeTitle: "Warum der Zugang kostenlos ist",
    personal: [
      "Ich bin José Antonio Cano Trigueros und arbeite als Softwareentwickler. Beruflich bin ich in der Technologie tätig, auch in einem Umfeld, das landwirtschaftliche Erzeugnisse mit Verbrauchern zusammenbringt. FarmSuccession ist mein persönliches Projekt, unabhängig von meinem Arbeitgeber.",
      "Privat pflege ich Obstbäume auf einem kleinen Grundstück und versuche, die Artenvielfalt zu fördern, etwa mit Insektenunterkünften. Ich bin kein professioneller Landwirt. Diese Erfahrung bringt mir einige Aspekte des Landlebens näher, ist aber etwas ganz anderes als die Bewirtschaftung eines Hofes.",
    ],
    paragraphs: [
      "Mir ist wichtig, dass neue Generationen eine realistische Chance haben, Lebensmittel zu erzeugen und landwirtschaftliche Betriebe weiterzuführen. Dazu gehören der Zugang zu Land ebenso wie Finanzierung, Ausbildung und Beratung. Wenn ein Hof keine Nachfolge findet, beschäftigen mich seine Zukunft und das dort gewachsene Wissen.",
      "Landwirtschaft soll eine wirtschaftlich tragfähige Perspektive bieten, die auch Raum lässt, die Umwelt zu schützen und Arbeitsweisen zu verbessern. Dieses Anliegen führte mich zur Recherche über Hofnachfolge und gab dem Projekt seinen Namen. Ein Verzeichnis kann diese Schwierigkeiten nicht lösen, aber vorhandene Unterstützung leichter auffindbar machen.",
    ],
    origin: [
      "Die ursprüngliche Idee war kommerziell. Ich untersuchte eine Plattform oder Bodenbörse, die Hofeigentümer mit Menschen zusammenbringen sollte, die den Betrieb weiterführen möchten. Dabei fand ich bereits tätige Fachvermittler und erkannte menschliche, rechtliche und wirtschaftliche Schwierigkeiten, die ein bloßer Kontakt zwischen zwei Personen nicht löst.",
      "Zugleich fand ich hilfreiche Angebote verstreut bei europäischen Behörden, Verbänden und anderen Organisationen. Statt deren Arbeit nachzubilden, entschied ich mich, Beschreibungen und Links zu ordnen, damit Menschen diese Anbieter finden. Daraus entstand FarmSuccession als unabhängiges dokumentarisches Verzeichnis. Es vermittelt keine Hofübergaben, bearbeitet keine Anträge und ersetzt weder amtliche Quellen noch Fachberatung.",
    ],
    free: [
      "Das Verzeichnis aufzubauen und zu pflegen hat für mich auch beruflichen Wert. Es ist ein reales, öffentliches Portfolio, an dem ich Softwarekenntnisse anwenden und zeigen, Neues ausprobieren, lernen und Eigeninitiative beweisen kann. In meinem Berufsleben habe ich persönlich erlebt, dass Lernbereitschaft und Initiative geschätzt werden. Dieses Projekt gibt dem Aufwand einen praktischen Nutzen.",
      "Kostenloser Zugang bedeutet nicht, dass keine Kosten entstehen. Für die veröffentlichte Website ist Infrastruktur nötig. Davon zu unterscheiden sind Entwicklungs- und Recherchewerkzeuge sowie meine unbezahlte persönliche Arbeitszeit. Ich nutze auch kostenpflichtige Werkzeuge, darunter KI, um meine Freizeit besser einzusetzen. Manche Abonnements sind optional oder werden für mehrere Projekte genutzt; ich möchte sie nicht alle dauerhaft behalten. Die veröffentlichte statische Website kann ohne diese Entwicklungsabonnements weiterlaufen. Ich nutze Software und KI zur Unterstützung von Recherche und Pflege. Ihre Ergebnisse sind für sich genommen keine Belege und ersetzen weder Originalquellen noch menschliche Durchsicht oder fachliches Urteil.",
      "Der persönliche und berufliche Wert erlaubt es mir derzeit, das Verzeichnis kostenlos anzubieten. Das erklärt die heutige Entscheidung, ist aber weder ein Versprechen dauerhaft kostenlosen Zugangs noch eine Garantie künftiger Pflege.",
    ],
  },
  it: {
    link: "Perché esiste FarmSuccession",
    personalTitle: "Chi c’è dietro al progetto",
    title: "Perché conta il ricambio generazionale",
    originTitle: "Come è cambiata l’idea",
    freeTitle: "Perché l’accesso è gratuito",
    personal: [
      "Sono José Antonio Cano Trigueros, sviluppatore software. Lavoro professionalmente nella tecnologia, anche in un contesto che avvicina i prodotti degli agricoltori ai consumatori. FarmSuccession è un progetto personale, indipendente dal mio datore di lavoro.",
      "Nel tempo libero curo alberi da frutto su un piccolo terreno e cerco di favorire la biodiversità, per esempio con rifugi per insetti. Non sono un agricoltore professionista. Questa esperienza mi avvicina ad alcuni aspetti della campagna, ma è molto diversa dalla gestione di un’azienda agricola.",
    ],
    paragraphs: [
      "Mi sta a cuore che le nuove generazioni abbiano opportunità concrete di produrre alimenti e continuare l’attività agricola. L’accesso alla terra fa parte di questo percorso, insieme a finanziamenti, formazione e consulenza. Quando un’azienda non trova un successore, mi preoccupano il suo futuro e le conoscenze che vi si sono accumulate.",
      "Vorrei che l’agricoltura fosse una scelta economicamente sostenibile, che permetta anche di prendersi cura dell’ambiente e migliorare le pratiche. Questo interesse mi ha portato a studiare il ricambio generazionale e ha dato il nome al progetto. Un repertorio non può risolvere queste difficoltà, ma può rendere più facile trovare il sostegno già disponibile.",
    ],
    origin: [
      "L’idea iniziale era commerciale. Ho esplorato una piattaforma o banca della terra che mettesse in contatto titolari di aziende e persone interessate a proseguirne l’attività. Ho trovato intermediari specializzati già attivi e difficoltà umane, giuridiche ed economiche che non si risolvono semplicemente presentando due persone.",
      "Ho anche trovato risorse utili sparse tra amministrazioni, associazioni e altre organizzazioni europee. Anziché riprodurre il loro lavoro, ho scelto di organizzare descrizioni e collegamenti per aiutare a trovare chi offre quei servizi. È nato così FarmSuccession, un repertorio documentale indipendente. Non media trasferimenti, non gestisce domande e non sostituisce le fonti ufficiali o la consulenza specialistica.",
    ],
    free: [
      "Creare e mantenere il repertorio ha anche un valore professionale per me. È un portfolio pubblico e concreto in cui posso applicare e dimostrare competenze software, sperimentare, imparare e mostrare iniziativa. Nella mia carriera ho constatato personalmente che la voglia di imparare e l’iniziativa sono apprezzate. Questo progetto dà uno scopo pratico a quell’impegno.",
      "La gratuità non significa assenza di costi. Mantenere il sito pubblicato richiede un’infrastruttura, distinta dagli strumenti di sviluppo e ricerca e dalle ore di lavoro personale non retribuito. Uso anche strumenti a pagamento, compresa l’IA, per impiegare meglio il tempo libero. Alcuni abbonamenti sono facoltativi o condivisi con altri progetti; non intendo mantenerli tutti indefinitamente. Il sito statico pubblicato può continuare a funzionare senza quegli abbonamenti di sviluppo. Uso software e IA per supportare la ricerca e la manutenzione. I loro risultati non costituiscono prove da soli e non sostituiscono fonti originali, revisione umana o giudizio specialistico.",
      "Per ora, il valore personale e professionale che ricavo dal progetto mi permette di offrire gratuitamente il repertorio. È la spiegazione di una scelta attuale, non una promessa di gratuità perpetua o una garanzia di manutenzione futura.",
    ],
  },
  pt: {
    link: "Porque existe o FarmSuccession",
    personalTitle: "Quem está por detrás do projeto",
    title: "Porque importa a renovação geracional",
    originTitle: "Como a ideia evoluiu",
    freeTitle: "Porque o acesso é gratuito",
    personal: [
      "Sou José Antonio Cano Trigueros, programador de software. Trabalho profissionalmente em tecnologia, também num contexto que aproxima os produtos dos agricultores dos consumidores. O FarmSuccession é um projeto pessoal, independente da minha entidade empregadora.",
      "Fora do trabalho cuido de árvores de fruto num pequeno terreno e procuro favorecer a biodiversidade, por exemplo com abrigos para insetos. Não sou agricultor profissional. Esta experiência aproxima-me de alguns aspetos do campo, mas é muito diferente de gerir uma exploração agrícola.",
    ],
    paragraphs: [
      "Preocupa-me que as novas gerações tenham oportunidades reais de produzir alimentos e dar continuidade à atividade agrícola. O acesso à terra faz parte desse percurso, juntamente com o financiamento, a formação e o aconselhamento. Quando uma exploração não encontra sucessor, preocupam-me o seu futuro e os conhecimentos acumulados à sua volta.",
      "Quero que a agricultura seja uma opção viável, que também permita cuidar do ambiente e melhorar as práticas. Essa preocupação levou-me a investigar a renovação geracional e deu nome ao projeto. Um diretório não resolve estas dificuldades, mas pode facilitar a descoberta dos apoios existentes.",
    ],
    origin: [
      "A ideia inicial era comercial. Explorei uma plataforma ou banco de terras que aproximasse titulares de explorações e pessoas interessadas em continuar a atividade. Encontrei intermediários especializados já ativos e dificuldades humanas, jurídicas e económicas que não se resolvem simplesmente pondo duas pessoas em contacto.",
      "Também encontrei recursos úteis dispersos entre administrações, associações e outras organizações europeias. Em vez de reproduzir o trabalho dessas entidades, decidi organizar descrições e ligações para ajudar a encontrá-las. Assim nasceu o FarmSuccession, um diretório documental independente. Não faz intermediação de transmissões, não trata candidaturas e não substitui fontes oficiais ou aconselhamento especializado.",
    ],
    free: [
      "Criar e manter o diretório também tem valor profissional para mim. É um portefólio público e real onde posso aplicar e demonstrar conhecimentos de software, experimentar, aprender e mostrar iniciativa. Ao longo da minha carreira constatei pessoalmente que a vontade de aprender e a iniciativa são valorizadas. Este projeto dá uma utilidade concreta a esse esforço.",
      "A gratuitidade não significa ausência de custos. Manter o site publicado exige infraestrutura, distinta das ferramentas de desenvolvimento e pesquisa e das horas de trabalho pessoal não remunerado. Utilizo algumas ferramentas pagas, incluindo IA, para aproveitar melhor o tempo livre. Algumas subscrições são opcionais ou partilhadas com outros projetos; não pretendo mantê-las todas indefinidamente. O site estático publicado pode continuar a funcionar sem essas subscrições de desenvolvimento. Utilizo software e IA para apoiar a pesquisa e a manutenção. Os seus resultados não são provas por si só e não substituem fontes originais, revisão humana ou avaliação especializada.",
      "Por agora, o valor pessoal e profissional que retiro do projeto permite-me oferecer gratuitamente o diretório. É a explicação de uma escolha atual, não uma promessa de gratuitidade perpétua nem uma garantia de manutenção futura.",
    ],
  },
  nl: {
    link: "Waarom FarmSuccession bestaat",
    personalTitle: "Wie achter het project staat",
    title: "Waarom bedrijfsopvolging belangrijk is",
    originTitle: "Hoe het idee veranderde",
    freeTitle: "Waarom de toegang gratis is",
    personal: [
      "Ik ben José Antonio Cano Trigueros, softwareontwikkelaar. Ik werk beroepsmatig in de technologie, ook in een omgeving die landbouwproducten dichter bij consumenten brengt. FarmSuccession is een persoonlijk project, onafhankelijk van mijn werkgever.",
      "Buiten mijn werk verzorg ik fruitbomen op een klein stuk grond en probeer ik de biodiversiteit te bevorderen, bijvoorbeeld met insectenverblijven. Ik ben geen professionele boer. Deze ervaring brengt mij dichter bij sommige aspecten van het buitenleven, maar is heel anders dan het runnen van een landbouwbedrijf.",
    ],
    paragraphs: [
      "Ik vind het belangrijk dat nieuwe generaties een reële kans krijgen om voedsel te produceren en landbouwbedrijven voort te zetten. Toegang tot grond hoort daarbij, naast financiering, opleiding en advies. Wanneer een bedrijf geen opvolger vindt, houden de toekomst ervan en de opgebouwde kennis mij bezig.",
      "Ik wil dat landbouw een haalbare keuze is die ook ruimte biedt om voor de omgeving te zorgen en werkwijzen te verbeteren. Die betrokkenheid bracht mij ertoe bedrijfsopvolging te onderzoeken en gaf het project zijn naam. Een gids kan deze moeilijkheden niet oplossen, maar wel helpen om bestaande ondersteuning te vinden.",
    ],
    origin: [
      "Het oorspronkelijke idee was commercieel. Ik onderzocht een platform of grondbank om eigenaren van landbouwbedrijven in contact te brengen met mensen die het bedrijf wilden voortzetten. Daarbij vond ik gespecialiseerde bemiddelaars die al actief waren, en menselijke, juridische en economische moeilijkheden die een kennismaking tussen twee mensen niet oplost.",
      "Ik vond ook nuttige informatie, verspreid over Europese overheden, verenigingen en andere organisaties. In plaats van hun werk over te doen, koos ik ervoor beschrijvingen en links te ordenen, zodat mensen deze aanbieders kunnen vinden. Zo ontstond FarmSuccession, een onafhankelijke documentatiegids. De gids bemiddelt niet bij overdrachten, behandelt geen aanvragen en vervangt geen officiële bronnen of deskundig advies.",
    ],
    free: [
      "De gids bouwen en onderhouden heeft voor mij ook professionele waarde. Het is een echt, openbaar portfolio waarin ik softwarekennis kan toepassen en laten zien, kan experimenteren, leren en initiatief tonen. In mijn loopbaan heb ik zelf ervaren dat leergierigheid en initiatief worden gewaardeerd. Dit project geeft die inspanning een praktisch doel.",
      "Gratis toegang betekent niet dat er geen kosten zijn. Om de website online te houden is infrastructuur nodig, naast hulpmiddelen voor ontwikkeling en onderzoek en mijn onbetaalde eigen tijd. Ik gebruik ook betaalde hulpmiddelen, waaronder AI, om mijn vrije tijd beter te benutten. Sommige abonnementen zijn optioneel of worden voor meerdere projecten gebruikt; ik wil ze niet allemaal onbeperkt aanhouden. De gepubliceerde statische website kan zonder die ontwikkelabonnementen blijven werken. Ik gebruik software en AI om onderzoek en onderhoud te ondersteunen. De resultaten zijn op zichzelf geen bewijs en vervangen geen oorspronkelijke bronnen, menselijke beoordeling of deskundig oordeel.",
      "Voorlopig stelt de persoonlijke en professionele waarde van het project mij in staat de gids gratis aan te bieden. Dat verklaart de huidige keuze; het is geen belofte van eeuwig gratis toegang of een garantie voor toekomstig onderhoud.",
    ],
  },
} as const satisfies Record<Language, FounderStory>;
