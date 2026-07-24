import type { Course } from "./types";

/**
 * Catalogue officiel des 75 items du concours de résidanat, réparti sur les
 * deux journées d'épreuves (J1 / J2).
 *
 * - `number` = numéro d'item officiel (celui affiché « Item N » et recherché
 *   par l'étudiant). Il n'est pas unique : deux items partagent le n° 37 et
 *   deux autres le n° 71 dans le programme fourni.
 * - `id`     = identifiant technique unique et stable (clé de liaison des
 *   événements du calendrier). C'est lui qui doit être utilisé en base.
 *
 * TODO_SUPABASE: remplacer par GET /api/courses
 */
export const COURSES: Course[] = [
  // ═══════════════════════ JOUR 1 ═══════════════════════

  // ── 🧠 Neurologie (3) ──
  { id: 1,  number: 1,  title: "AVC",                                   shortTitle: "AVC",             specialty: "Neurologie",               day: "J1", status: "not_started" },
  { id: 2,  number: 16, title: "Céphalées",                             shortTitle: "Céphalées",       specialty: "Neurologie",               day: "J1", status: "not_started" },
  { id: 3,  number: 26, title: "Épilepsies",                            shortTitle: "Épilepsies",      specialty: "Neurologie",               day: "J1", status: "not_started" },

  // ── 🧠 Psychiatrie (4) ──
  { id: 4,  number: 29, title: "États confusionnels",                   shortTitle: "Confusion",       specialty: "Psychiatrie",              day: "J1", status: "not_started" },
  { id: 5,  number: 63, title: "Schizophrénie",                         shortTitle: "Schizophrénie",   specialty: "Psychiatrie",              day: "J1", status: "not_started" },
  { id: 6,  number: 70, title: "Troubles de l'humeur",                  shortTitle: "Tr. humeur",      specialty: "Psychiatrie",              day: "J1", status: "not_started" },
  { id: 7,  number: 69, title: "Troubles anxieux",                      shortTitle: "Tr. anxieux",     specialty: "Psychiatrie",              day: "J1", status: "not_started" },

  // ── 👁️ Ophtalmologie (1) ──
  { id: 8,  number: 56, title: "Œil rouge",                             shortTitle: "Œil rouge",       specialty: "Ophtalmologie",            day: "J1", status: "not_started" },

  // ── 👂 ORL (2) ──
  { id: 9,  number: 42, title: "IVAS",                                  shortTitle: "IVAS",            specialty: "ORL",                      day: "J1", status: "not_started" },
  { id: 10, number: 12, title: "Cancer du cavum",                       shortTitle: "K. cavum",        specialty: "ORL",                      day: "J1", status: "not_started" },

  // ── 🫁 Pneumologie – Allergologie (5) ──
  { id: 11, number: 11, title: "CBP",                                   shortTitle: "CBP",             specialty: "Pneumologie-Allergologie", day: "J1", status: "not_started" },
  { id: 12, number: 43, title: "Infections respiratoires basses",       shortTitle: "IRB",             specialty: "Pneumologie-Allergologie", day: "J1", status: "not_started" },
  { id: 13, number: 72, title: "Tuberculose pulmonaire",                shortTitle: "Tuberculose",     specialty: "Pneumologie-Allergologie", day: "J1", status: "not_started" },
  { id: 14, number: 7,  title: "Asthme",                                shortTitle: "Asthme",          specialty: "Pneumologie-Allergologie", day: "J1", status: "not_started" },
  { id: 15, number: 9,  title: "BPCO",                                  shortTitle: "BPCO",            specialty: "Pneumologie-Allergologie", day: "J1", status: "not_started" },

  // ── ❤️ Cardiologie – CCVT (6) ──
  { id: 16, number: 65, title: "SCA",                                   shortTitle: "SCA",             specialty: "Cardiologie-CCVT",         day: "J1", status: "not_started" },
  { id: 17, number: 22, title: "Douleur thoracique",                    shortTitle: "Douleur thor.",   specialty: "Cardiologie-CCVT",         day: "J1", status: "not_started" },
  { id: 18, number: 38, title: "HTA",                                   shortTitle: "HTA",             specialty: "Cardiologie-CCVT",         day: "J1", status: "not_started" },
  { id: 19, number: 25, title: "Endocardite infectieuse",               shortTitle: "EI",              specialty: "Cardiologie-CCVT",         day: "J1", status: "not_started" },
  { id: 20, number: 49, title: "Ischémie des membres",                  shortTitle: "Ischémie MI",     specialty: "Cardiologie-CCVT",         day: "J1", status: "not_started" },
  { id: 21, number: 51, title: "MVTE",                                  shortTitle: "MVTE",            specialty: "Cardiologie-CCVT",         day: "J1", status: "not_started" },

  // ── 🍽️ Gastro-entérologie (5) ──
  { id: 22, number: 24, title: "Dysphagies",                            shortTitle: "Dysphagies",      specialty: "Gastro-entérologie",       day: "J1", status: "not_started" },
  { id: 23, number: 41, title: "Ictères",                               shortTitle: "Ictères",         specialty: "Gastro-entérologie",       day: "J1", status: "not_started" },
  { id: 24, number: 21, title: "Diarrhées chroniques",                  shortTitle: "Diarrhées chr.",  specialty: "Gastro-entérologie",       day: "J1", status: "not_started" },
  { id: 25, number: 74, title: "Ulcère gastro-duodénal",                shortTitle: "UGD",             specialty: "Gastro-entérologie",       day: "J1", status: "not_started" },
  { id: 26, number: 34, title: "Hémorragies digestives",                shortTitle: "Hémorr. dig.",    specialty: "Gastro-entérologie",       day: "J1", status: "not_started" },

  // ── 🔪 Chirurgie générale (4) ──
  { id: 27, number: 57, title: "Péritonite aiguë",                      shortTitle: "Péritonite",      specialty: "Chirurgie générale",       day: "J1", status: "not_started" },
  { id: 28, number: 4,  title: "Appendicite aiguë",                     shortTitle: "Appendicite",     specialty: "Chirurgie générale",       day: "J1", status: "not_started" },
  { id: 29, number: 15, title: "Cancer colorectal",                     shortTitle: "K. colorectal",   specialty: "Chirurgie générale",       day: "J1", status: "not_started" },
  { id: 30, number: 54, title: "Occlusion intestinale aiguë",           shortTitle: "Occlusion",       specialty: "Chirurgie générale",       day: "J1", status: "not_started" },

  // ── 👩‍⚕️ Gynécologie – Obstétrique (6) ──
  { id: 31, number: 13, title: "Cancer du col",                         shortTitle: "K. col",          specialty: "Gynécologie-Obstétrique",  day: "J1", status: "not_started" },
  { id: 32, number: 14, title: "Cancer du sein",                        shortTitle: "K. sein",         specialty: "Gynécologie-Obstétrique",  day: "J1", status: "not_started" },
  { id: 33, number: 18, title: "Contraception",                         shortTitle: "Contraception",   specialty: "Gynécologie-Obstétrique",  day: "J1", status: "not_started" },
  { id: 34, number: 32, title: "Grossesse extra-utérine",               shortTitle: "GEU",             specialty: "Gynécologie-Obstétrique",  day: "J1", status: "not_started" },
  { id: 35, number: 60, title: "Prééclampsie – éclampsie",              shortTitle: "Prééclampsie",    specialty: "Gynécologie-Obstétrique",  day: "J1", status: "not_started" },
  { id: 36, number: 53, title: "Métrorragies",                          shortTitle: "Métrorragies",    specialty: "Gynécologie-Obstétrique",  day: "J1", status: "not_started" },

  // ═══════════════════════ JOUR 2 ═══════════════════════

  // ── 🟢 Urologie (4) ──
  { id: 37, number: 73, title: "Tumeurs de la prostate",                shortTitle: "T. prostate",     specialty: "Urologie",                 day: "J2", status: "not_started" },
  { id: 38, number: 50, title: "Lithiase urinaire",                     shortTitle: "Lithiase",        specialty: "Urologie",                 day: "J2", status: "not_started" },
  { id: 39, number: 33, title: "Hématuries",                            shortTitle: "Hématuries",      specialty: "Urologie",                 day: "J2", status: "not_started" },
  { id: 40, number: 45, title: "Infections urinaires",                  shortTitle: "Inf. urinaires",  specialty: "Urologie",                 day: "J2", status: "not_started" },

  // ── 🟢 Néphrologie (5) ──
  { id: 41, number: 68, title: "Troubles acido-basiques",               shortTitle: "Tr. acido-bas.",  specialty: "Néphrologie",              day: "J2", status: "not_started" },
  { id: 42, number: 71, title: "Dyskaliémies",                          shortTitle: "Dyskaliémies",    specialty: "Néphrologie",              day: "J2", status: "not_started" },
  { id: 43, number: 71, title: "Troubles de l'hydratation",             shortTitle: "Tr. hydratation", specialty: "Néphrologie",              day: "J2", status: "not_started" },
  { id: 44, number: 55, title: "Œdèmes",                                shortTitle: "Œdèmes",          specialty: "Néphrologie",              day: "J2", status: "not_started" },
  { id: 45, number: 46, title: "Insuffisance rénale aiguë",             shortTitle: "IRA",             specialty: "Néphrologie",              day: "J2", status: "not_started" },

  // ── 🔥 Réanimation (10) ──
  { id: 46, number: 48, title: "Intoxications",                         shortTitle: "Intoxications",   specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 47, number: 59, title: "Polytraumatisme",                       shortTitle: "Polytrauma",      specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 48, number: 28, title: "État de choc hémorragique",             shortTitle: "Choc hémorr.",    specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 49, number: 27, title: "État de choc cardiogénique",            shortTitle: "Choc cardio.",    specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 50, number: 30, title: "États septiques graves",                shortTitle: "Sepsis grave",    specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 51, number: 5,  title: "Arrêt cardio-circulatoire",             shortTitle: "ACR",             specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 52, number: 10, title: "Brûlures cutanées",                     shortTitle: "Brûlures",        specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 53, number: 67, title: "Traumatisme crânien",                   shortTitle: "Trauma crânien",  specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 54, number: 17, title: "Comas",                                 shortTitle: "Comas",           specialty: "Réanimation",              day: "J2", status: "not_started" },
  { id: 55, number: 61, title: "Prise en charge d'une douleur aiguë",   shortTitle: "Douleur aiguë",   specialty: "Réanimation",              day: "J2", status: "not_started" },

  // ── 🧬 Endocrinologie (5) ──
  { id: 56, number: 47, title: "Insuffisance surrénalienne aiguë",      shortTitle: "ISA",             specialty: "Endocrinologie",           day: "J2", status: "not_started" },
  { id: 57, number: 39, title: "Hyperthyroïdie",                        shortTitle: "Hyperthyroïdie",  specialty: "Endocrinologie",           day: "J2", status: "not_started" },
  { id: 58, number: 40, title: "Hypothyroïdie",                         shortTitle: "Hypothyroïdie",   specialty: "Endocrinologie",           day: "J2", status: "not_started" },
  { id: 59, number: 23, title: "Dyslipidémies",                         shortTitle: "Dyslipidémies",   specialty: "Endocrinologie",           day: "J2", status: "not_started" },
  { id: 60, number: 20, title: "Diabète sucré",                         shortTitle: "Diabète",         specialty: "Endocrinologie",           day: "J2", status: "not_started" },

  // ── 🧬 Médecine interne (2) ──
  { id: 61, number: 37, title: "Hypercalcémies",                        shortTitle: "Hypercalcémie",   specialty: "Médecine interne",         day: "J2", status: "not_started" },
  { id: 62, number: 62, title: "Purpura",                               shortTitle: "Purpura",         specialty: "Médecine interne",         day: "J2", status: "not_started" },

  // ── 🦠 Infectiologie (3) ──
  { id: 63, number: 52, title: "Méningite",                             shortTitle: "Méningite",       specialty: "Infectiologie",            day: "J2", status: "not_started" },
  { id: 64, number: 44, title: "IST",                                   shortTitle: "IST",             specialty: "Infectiologie",            day: "J2", status: "not_started" },
  { id: 65, number: 35, title: "Hépatites virales",                     shortTitle: "Hépatites",       specialty: "Infectiologie",            day: "J2", status: "not_started" },

  // ── 🩸 Hématologie (4) ──
  { id: 66, number: 64, title: "Splénomégalies",                        shortTitle: "Splénomégalie",   specialty: "Hématologie",              day: "J2", status: "not_started" },
  { id: 67, number: 2,  title: "Adénopathies superficielles",           shortTitle: "Adénopathies",    specialty: "Hématologie",              day: "J2", status: "not_started" },
  { id: 68, number: 3,  title: "Anémie",                                shortTitle: "Anémie",          specialty: "Hématologie",              day: "J2", status: "not_started" },
  { id: 69, number: 66, title: "Transfusion sanguine",                  shortTitle: "Transfusion",     specialty: "Hématologie",              day: "J2", status: "not_started" },

  // ── 🦴 Orthopédie – Rhumatologie (3) ──
  { id: 70, number: 6,  title: "Arthrite septique",                     shortTitle: "Arthrite sept.",  specialty: "Orthopédie-Rhumatologie",  day: "J2", status: "not_started" },
  { id: 71, number: 31, title: "Fractures ouvertes de la jambe",        shortTitle: "Fract. ouverte",  specialty: "Orthopédie-Rhumatologie",  day: "J2", status: "not_started" },
  { id: 72, number: 58, title: "Polyarthrite rhumatoïde",               shortTitle: "PR",              specialty: "Orthopédie-Rhumatologie",  day: "J2", status: "not_started" },

  // ── 👶 Pédiatrie (3) ──
  { id: 73, number: 8,  title: "Bronchiolite",                          shortTitle: "Bronchiolite",    specialty: "Pédiatrie",                day: "J2", status: "not_started" },
  { id: 74, number: 37, title: "Déshydratation aiguë de l'enfant",      shortTitle: "Déshydratation",  specialty: "Pédiatrie",                day: "J2", status: "not_started" },
  { id: 75, number: 75, title: "Vaccinations",                          shortTitle: "Vaccinations",    specialty: "Pédiatrie",                day: "J2", status: "not_started" },
];
