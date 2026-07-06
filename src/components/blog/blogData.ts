// ─────────────────────────────────────────────────────────────
// Module Blog — données de démonstration
// TODO_API: remplacer par GET /api/blog/articles et /api/blog/annonces
// ─────────────────────────────────────────────────────────────

export type BlogCategory =
  | "Méthodologie"
  | "Actualités"
  | "Nouvelles fonctionnalités"
  | "Conseils";

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Méthodologie",
  "Actualités",
  "Nouvelles fonctionnalités",
  "Conseils",
];

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  /** Paragraphes du corps de l'article. */
  content: string[];
  category: BlogCategory;
  tags: string[];
  author: string;
  /** ISO YYYY-MM-DD */
  date: string;
  readMinutes: number;
  emoji: string;
  featured?: boolean;
}

export type AnnouncementKind = "feature" | "maintenance" | "content";

export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  title: string;
  text: string;
  date: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "an-1",
    kind: "feature",
    title: "Calendrier intelligent : glisser-déposer",
    text: "Réorganisez vos séances de révision directement dans le calendrier, avec détection automatique des chevauchements.",
    date: "2026-07-04",
  },
  {
    id: "an-2",
    kind: "content",
    title: "120 nouveaux QCM de Pneumologie",
    text: "Les séries 2025 des facultés de Tunis et Sousse sont disponibles, avec corrections détaillées.",
    date: "2026-07-01",
  },
  {
    id: "an-3",
    kind: "maintenance",
    title: "Maintenance planifiée",
    text: "Dimanche 12 juillet, 02h00 – 04h00 : la plateforme sera indisponible pendant la mise à niveau des serveurs.",
    date: "2026-06-28",
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "art-1",
    title: "La répétition espacée : réviser moins, retenir plus",
    excerpt:
      "Pourquoi revoir un cours à J+2, J+7, J+10 puis J+30 est la stratégie la plus rentable pour la mémoire à long terme — et comment l'appliquer sans se noyer dans la planification.",
    content: [
      "La courbe de l'oubli d'Ebbinghaus est sans appel : 24 heures après une première lecture, plus de la moitié de l'information s'est évaporée. La bonne nouvelle, c'est que chaque révision espacée aplatit cette courbe. En revoyant un cours juste avant le moment où vous l'auriez oublié, vous transformez un souvenir fragile en connaissance durable.",
      "Le protocole que nous recommandons — J+2, J+7, J+10, J+30 — est un compromis éprouvé entre efficacité mémorielle et charge de travail réaliste pour un étudiant en médecine. La première révision consolide l'encodage initial, les suivantes ancrent la connaissance dans la mémoire à long terme.",
      "Concrètement : après chaque nouveau cours, planifiez immédiatement les quatre créneaux de révision. C'est exactement ce que fait le mode automatique du calendrier intelligent QE.tn : il génère les séances, les relie visuellement à leur cours source, et les replanifie si vous prenez du retard.",
      "Un dernier conseil : une révision espacée n'est pas une relecture passive. Faites des QCM, récitez à voix haute, dessinez les schémas de mémoire. La récupération active multiplie l'effet de l'espacement.",
    ],
    category: "Méthodologie",
    tags: ["répétition espacée", "mémoire", "planification"],
    author: "Équipe QE.tn",
    date: "2026-07-02",
    readMinutes: 6,
    emoji: "🧠",
    featured: true,
  },
  {
    id: "art-2",
    title: "Organiser sa semaine de révision quand on est externe",
    excerpt:
      "Stage le matin, cours l'après-midi, fatigue le soir : comment construire un emploi du temps de révision réaliste qui survit au contact de la vraie vie hospitalière.",
    content: [
      "Le premier piège de l'externe est de planifier comme si chaque journée était vide. Or entre le stage, les topos et les trajets, il reste rarement plus de trois heures exploitables par jour. Planifiez pour la semaine réelle, pas pour la semaine idéale.",
      "Commencez par bloquer l'incompressible : horaires de stage, repas, sommeil. Ce qui reste est votre budget révision — en général 15 à 20 heures hebdomadaires. Les plages bloquées du calendrier QE.tn servent exactement à ça : le placement automatique ne planifiera jamais dessus.",
      "Répartissez ensuite en alternant les formats : une séance de lecture ne devrait jamais dépasser 90 minutes sans être suivie de QCM sur le même thème. Et gardez le dimanche soir pour le bilan : qu'est-ce qui a été fait, qu'est-ce qui glisse à la semaine suivante ?",
    ],
    category: "Méthodologie",
    tags: ["organisation", "externat", "emploi du temps"],
    author: "Dr Sarra M.",
    date: "2026-06-25",
    readMinutes: 5,
    emoji: "📅",
  },
  {
    id: "art-3",
    title: "Gérer le stress des derniers mois avant le concours",
    excerpt:
      "L'anxiété de performance touche la majorité des candidats au résidanat. Stratégies concrètes, validées par la recherche, pour garder le cap sans s'épuiser.",
    content: [
      "À l'approche du concours, le stress n'est pas un signe de faiblesse : c'est la réponse normale d'un cerveau qui accorde de l'importance à l'enjeu. Le problème n'est pas le stress lui-même, mais son excès chronique, qui dégrade le sommeil, la concentration et la mémoire.",
      "Trois leviers ont fait leurs preuves. Le premier est le sommeil : en dessous de sept heures, la consolidation mémorielle chute drastiquement — réviser une heure de plus en dormant une heure de moins est un marché perdant. Le deuxième est l'activité physique : trente minutes de marche rapide suffisent à faire baisser le cortisol. Le troisième est la respiration contrôlée (cohérence cardiaque, 5 minutes, trois fois par jour).",
      "Côté révisions, la meilleure arme anti-stress reste un plan visible et réaliste. L'incertitude nourrit l'anxiété ; un calendrier qui montre que tout tient — ou qui signale honnêtement que ça ne tient pas — la réduit. Suivez votre adhérence au plan plutôt que votre sentiment de retard.",
      "Enfin, si l'anxiété devient envahissante (insomnie persistante, crises de panique), parlez-en. Médecin du travail universitaire, cellules d'écoute, psychologue : demander de l'aide est une compétence professionnelle, pas un aveu d'échec.",
    ],
    category: "Conseils",
    tags: ["stress", "bien-être", "concours"],
    author: "Dr Ahmed B.",
    date: "2026-06-20",
    readMinutes: 7,
    emoji: "🧘",
  },
  {
    id: "art-4",
    title: "QCM : la méthode des trois passages",
    excerpt:
      "Répondre, corriger, comprendre : comment transformer chaque série de QCM en séance d'apprentissage actif plutôt qu'en simple test.",
    content: [
      "Faire des QCM sans méthode, c'est mesurer son niveau sans le faire progresser. La méthode des trois passages change la donne. Premier passage : conditions réelles, chronomètre activé, aucune documentation. C'est le seul passage qui mesure vraiment.",
      "Deuxième passage : correction active. Pour chaque question — y compris celles réussies — expliquez pourquoi chaque proposition est vraie ou fausse. Une bonne réponse par élimination chanceuse est une lacune déguisée.",
      "Troisième passage : consolidation. Notez les notions ratées dans une liste de reprise, puis replanifiez la même série à J+7. Une série n'est « acquise » qu'à partir de 80 % en conditions réelles, deux passages consécutifs.",
    ],
    category: "Méthodologie",
    tags: ["QCM", "entraînement", "correction"],
    author: "Équipe QE.tn",
    date: "2026-06-15",
    readMinutes: 4,
    emoji: "✍️",
  },
  {
    id: "art-5",
    title: "Nouveau : liens visuels entre vos séances de révision",
    excerpt:
      "Le calendrier relie désormais chaque cours à ses révisions espacées par une ligne colorée. Vue d'ensemble immédiate de vos plans de révision.",
    content: [
      "Quand on gère quinze plans de répétition espacée en parallèle, il devient difficile de voir quelle révision appartient à quel cours. C'est désormais réglé : chaque plan a sa couleur, et une ligne pointillée relie la séance source à toutes ses révisions, en vue Semaine comme en vue Mois.",
      "Un point plein marque la séance d'origine, des points creux marquent les révisions. Un bouton dans la barre du calendrier permet de masquer les liens si vous préférez une vue épurée.",
      "Et comme les liens sont recalculés en direct, ils suivent instantanément vos glisser-déposer : déplacez une révision, la ligne se redessine.",
    ],
    category: "Nouvelles fonctionnalités",
    tags: ["calendrier", "répétition espacée", "nouveauté"],
    author: "Équipe QE.tn",
    date: "2026-07-04",
    readMinutes: 3,
    emoji: "🔗",
  },
  {
    id: "art-6",
    title: "Anti-chevauchement : fini les doubles réservations",
    excerpt:
      "Le calendrier refuse désormais de planifier deux activités sur le même créneau, et trouve automatiquement le prochain créneau libre.",
    content: [
      "Un plan de révision n'est utile que s'il est physiquement réalisable. Jusqu'ici, il était possible de planifier — ou de laisser le mode automatique planifier — deux séances au même moment. C'est terminé.",
      "Désormais, toute tentative de superposition est bloquée : au glisser-déposer, un message vous indique quelle séance occupe déjà le créneau ; à la création automatique, la séance est décalée au prochain créneau libre par pas de 15 minutes.",
      "Les plages bloquées (cours à la faculté, repas, sport) sont également respectées par l'ensemble du système de planification. Configurez-les une fois, le calendrier s'occupe du reste.",
    ],
    category: "Nouvelles fonctionnalités",
    tags: ["calendrier", "planification", "nouveauté"],
    author: "Équipe QE.tn",
    date: "2026-07-05",
    readMinutes: 3,
    emoji: "🛡️",
  },
  {
    id: "art-7",
    title: "Résidanat 2026 : ce qui change cette année",
    excerpt:
      "Calendrier des épreuves, répartition des postes, modalités d'affectation : le point complet sur la session 2026 du concours de résidanat.",
    content: [
      "Le ministère a publié le calendrier officiel de la session 2026. Les épreuves écrites se tiendront en deux journées, selon le format habituel : épreuves de spécialités médicales le premier jour, spécialités chirurgicales et biologiques le second.",
      "La répartition des postes par spécialité sera annoncée dans les prochaines semaines. Comme chaque année, nous mettrons à jour nos statistiques de rangs d'affectation dès publication, pour vous aider à calibrer vos vœux.",
      "Notre conseil : ne construisez pas votre stratégie de révision sur des rumeurs de quotas. Les fondamentaux restent les mêmes — régularité, QCM en conditions réelles, et révision espacée jusqu'au bout.",
    ],
    category: "Actualités",
    tags: ["résidanat", "concours", "calendrier officiel"],
    author: "Équipe QE.tn",
    date: "2026-06-30",
    readMinutes: 4,
    emoji: "📰",
  },
  {
    id: "art-8",
    title: "Lire un cours vite et bien : la méthode SQ3R adaptée à la médecine",
    excerpt:
      "Survoler, questionner, lire, réciter, réviser : un protocole de lecture active qui divise par deux le temps de relecture.",
    content: [
      "Lire un polycopié de cinquante pages en surlignant un mot sur trois n'est pas de l'apprentissage, c'est de la décoration. La méthode SQ3R structure la lecture en cinq temps qui forcent le cerveau à traiter l'information au lieu de la survoler.",
      "Survey : parcourez titres, schémas et encadrés pour construire la carte mentale du cours. Question : transformez chaque titre en question (« Quels sont les critères de gravité ? »). Read : lisez pour répondre à ces questions, pas pour « finir le chapitre ». Recite : fermez le poly et récitez — c'est l'étape que tout le monde saute et c'est la plus rentable. Review : c'est ici que la répétition espacée prend le relais.",
      "Chronométrez-vous : la première lecture SQ3R d'un cours prend environ 20 % de temps en plus qu'une lecture passive, mais les relectures suivantes sont deux à trois fois plus rapides. Sur un semestre, le gain est massif.",
    ],
    category: "Méthodologie",
    tags: ["lecture active", "mémoire", "méthode"],
    author: "Dr Sarra M.",
    date: "2026-06-10",
    readMinutes: 5,
    emoji: "📖",
  },
  {
    id: "art-9",
    title: "Bien dormir en période de révision : le guide pratique",
    excerpt:
      "Le sommeil n'est pas du temps perdu sur vos révisions — c'est le moment où elles s'impriment. Protocole simple pour protéger vos nuits.",
    content: [
      "Pendant le sommeil profond, l'hippocampe rejoue les apprentissages de la journée et les transfère vers le cortex : c'est la consolidation mémorielle. Réviser jusqu'à 2 h du matin, c'est remplir un seau percé.",
      "Trois règles simples : horaires réguliers (à une heure près, week-end compris), écrans coupés 45 minutes avant le coucher, et dernière séance de la journée consacrée à de la révision légère plutôt qu'à du contenu nouveau.",
      "La sieste courte (20 minutes, avant 15 h) est votre alliée en période intensive : elle restaure la vigilance sans entamer la nuit suivante. Au-delà de 30 minutes, elle devient contre-productive.",
      "Si vous planifiez vos séances dans le calendrier QE.tn, bloquez une plage « Sommeil » : votre futur vous, à trois semaines du concours, vous remerciera de ne pas pouvoir planifier de QCM à minuit.",
    ],
    category: "Conseils",
    tags: ["sommeil", "bien-être", "mémoire"],
    author: "Dr Ahmed B.",
    date: "2026-05-28",
    readMinutes: 5,
    emoji: "😴",
  },
  {
    id: "art-10",
    title: "Construire ses fiches : moins, c'est mieux",
    excerpt:
      "Une bonne fiche n'est pas un résumé du cours, c'est un déclencheur de mémoire. Ce qu'il faut y mettre — et surtout ce qu'il faut en exclure.",
    content: [
      "La fiche parfaite tient sur une page et ne se comprend que si l'on connaît déjà le cours. C'est voulu : son rôle n'est pas d'enseigner mais de déclencher le rappel. Si votre fiche est lisible par quelqu'un qui n'a jamais vu le cours, elle est trop longue.",
      "À inclure : les chiffres-clés (seuils, posologies, scores), les pièges à QCM récurrents, les moyens mnémotechniques, et les deux ou trois schémas qui structurent le chapitre. À exclure : tout ce que vous savez déjà de façon fiable, et toute phrase complète.",
      "Le meilleur moment pour créer la fiche est la révision J+7 : assez tard pour savoir ce qui résiste à l'oubli, assez tôt pour qu'elle serve pendant des mois. Et relisez vos fiches en récitation active, jamais en lecture passive.",
    ],
    category: "Conseils",
    tags: ["fiches", "mémoire", "méthode"],
    author: "Équipe QE.tn",
    date: "2026-05-15",
    readMinutes: 4,
    emoji: "🗂️",
  },
];
