import type { Course } from "./types";

export const COURSES: Course[] = [
  // ── Cardiologie-CCV (8) ── J1
  { id: 1,  number: 1,  title: "Syndrome Coronarien Aigu",               shortTitle: "SCA",      specialty: "Cardiologie-CCV",           day: "J1", status: "completed"   },
  { id: 2,  number: 2,  title: "Insuffisance Cardiaque",                  shortTitle: "IC",       specialty: "Cardiologie-CCV",           day: "J1", status: "completed"   },
  { id: 3,  number: 3,  title: "Endocardite Infectieuse",                 shortTitle: "EI",       specialty: "Cardiologie-CCV",           day: "J1", status: "completed"   },
  { id: 4,  number: 4,  title: "Hypertension Artérielle",                 shortTitle: "HTA",      specialty: "Cardiologie-CCV",           day: "J1", status: "completed"   },
  { id: 5,  number: 5,  title: "Troubles du Rythme et de la Conduction",  shortTitle: "TRC",      specialty: "Cardiologie-CCV",           day: "J1", status: "completed"   },
  { id: 6,  number: 6,  title: "Péricardite Aiguë",                                               specialty: "Cardiologie-CCV",           day: "J1", status: "in_progress" },
  { id: 7,  number: 7,  title: "Cardiopathies Congénitales",                                      specialty: "Cardiologie-CCV",           day: "J1", status: "in_progress" },
  { id: 8,  number: 8,  title: "Chirurgie Cardiaque – Indications",                               specialty: "Cardiologie-CCV",           day: "J1", status: "not_started" },

  // ── Gynécologie-Obstétrique (6) ── J1
  { id: 9,  number: 9,  title: "Cancer du Col de l'Utérus",                                       specialty: "Gynécologie-Obstétrique",   day: "J1", status: "completed"   },
  { id: 10, number: 10, title: "Cancer du Sein",                                                  specialty: "Gynécologie-Obstétrique",   day: "J1", status: "completed"   },
  { id: 11, number: 11, title: "Grossesse Extra-Utérine",                 shortTitle: "GEU",      specialty: "Gynécologie-Obstétrique",   day: "J1", status: "in_progress" },
  { id: 12, number: 12, title: "Hémorragies du Post-Partum",                                      specialty: "Gynécologie-Obstétrique",   day: "J1", status: "not_started" },
  { id: 13, number: 13, title: "Pré-éclampsie et Éclampsie",                                      specialty: "Gynécologie-Obstétrique",   day: "J1", status: "not_started" },
  { id: 14, number: 14, title: "Infections Génitales",                                            specialty: "Gynécologie-Obstétrique",   day: "J1", status: "not_started" },

  // ── Psychiatrie (3) ── J1
  { id: 15, number: 15, title: "Schizophrénie",                                                   specialty: "Psychiatrie",               day: "J1", status: "in_progress" },
  { id: 16, number: 16, title: "Troubles Bipolaires",                                             specialty: "Psychiatrie",               day: "J1", status: "not_started" },
  { id: 17, number: 17, title: "Dépression et Troubles Anxieux",                                  specialty: "Psychiatrie",               day: "J1", status: "not_started" },

  // ── Chirurgie générale (6) ── J1
  { id: 18, number: 18, title: "Appendicite Aiguë",                                               specialty: "Chirurgie générale",        day: "J1", status: "in_progress" },
  { id: 19, number: 19, title: "Occlusion Intestinale",                                           specialty: "Chirurgie générale",        day: "J1", status: "not_started" },
  { id: 20, number: 20, title: "Hernie Inguinale",                                                specialty: "Chirurgie générale",        day: "J1", status: "not_started" },
  { id: 21, number: 21, title: "Traumatismes de l'Abdomen",                                       specialty: "Chirurgie générale",        day: "J1", status: "not_started" },
  { id: 22, number: 22, title: "Cancer Colorectal",                                               specialty: "Chirurgie générale",        day: "J1", status: "not_started" },
  { id: 23, number: 23, title: "Péritonite Aiguë",                                                specialty: "Chirurgie générale",        day: "J1", status: "not_started" },

  // ── Gastro-entérologie (5) ── J1
  { id: 24, number: 24, title: "Cirrhose et Complications",               shortTitle: "Cirrhose", specialty: "Gastro-entérologie",        day: "J1", status: "completed"   },
  { id: 25, number: 25, title: "Hépatites Virales",                                               specialty: "Gastro-entérologie",        day: "J1", status: "completed"   },
  { id: 26, number: 26, title: "Maladies Inflammatoires Chroniques Intestinales", shortTitle: "MICI", specialty: "Gastro-entérologie",   day: "J1", status: "in_progress" },
  { id: 27, number: 27, title: "Cancer Gastrique",                                                specialty: "Gastro-entérologie",        day: "J1", status: "not_started" },
  { id: 28, number: 28, title: "Ulcère Gastroduodénal",                                           specialty: "Gastro-entérologie",        day: "J1", status: "not_started" },

  // ── Neurologie (4) ── J1
  { id: 29, number: 29, title: "Accident Vasculaire Cérébral",            shortTitle: "AVC",      specialty: "Neurologie",                day: "J1", status: "completed"   },
  { id: 30, number: 30, title: "Épilepsie",                                                       specialty: "Neurologie",                day: "J1", status: "in_progress" },
  { id: 31, number: 31, title: "Méningite et Encéphalite",                                        specialty: "Neurologie",                day: "J1", status: "not_started" },
  { id: 32, number: 32, title: "Sclérose en Plaques",                     shortTitle: "SEP",      specialty: "Neurologie",                day: "J1", status: "not_started" },

  // ── Pneumologie-Allergologie (3) ── J1
  { id: 33, number: 33, title: "Bronchopneumopathie Chronique Obstructive", shortTitle: "BPCO",   specialty: "Pneumologie-Allergologie",  day: "J1", status: "completed"   },
  { id: 34, number: 34, title: "Asthme",                                                          specialty: "Pneumologie-Allergologie",  day: "J1", status: "completed"   },
  { id: 35, number: 35, title: "Pneumonie Aiguë Communautaire",           shortTitle: "PAC",      specialty: "Pneumologie-Allergologie",  day: "J1", status: "not_started" },

  // ── ORL (1) ── J1
  { id: 36, number: 36, title: "Infections des Voies Aériennes Supérieures", shortTitle: "IVAS", specialty: "ORL",                       day: "J1", status: "in_progress" },

  // ── Ophtalmologie (1) ── J1
  { id: 37, number: 37, title: "Glaucome Aigu et Uvéites",                                        specialty: "Ophtalmologie",             day: "J1", status: "not_started" },

  // ── Néphrologie (5) ── J2
  { id: 38, number: 38, title: "Insuffisance Rénale Aiguë",               shortTitle: "IRA",      specialty: "Néphrologie",               day: "J2", status: "completed"   },
  { id: 39, number: 39, title: "Insuffisance Rénale Chronique",           shortTitle: "IRC",      specialty: "Néphrologie",               day: "J2", status: "in_progress" },
  { id: 40, number: 40, title: "Syndrome Néphrotique",                                            specialty: "Néphrologie",               day: "J2", status: "not_started" },
  { id: 41, number: 41, title: "Glomérulonéphrites",                                              specialty: "Néphrologie",               day: "J2", status: "not_started" },
  { id: 42, number: 42, title: "Hypertension et Rein",                                            specialty: "Néphrologie",               day: "J2", status: "not_started" },

  // ── Urologie (4) ── J2
  { id: 43, number: 43, title: "Lithiase Urinaire",                                               specialty: "Urologie",                  day: "J2", status: "completed"   },
  { id: 44, number: 44, title: "Cancer de la Prostate",                                           specialty: "Urologie",                  day: "J2", status: "in_progress" },
  { id: 45, number: 45, title: "Cancer de la Vessie",                                             specialty: "Urologie",                  day: "J2", status: "not_started" },
  { id: 46, number: 46, title: "Infections Urinaires",                                            specialty: "Urologie",                  day: "J2", status: "not_started" },

  // ── Réanimation (4) ── J2
  { id: 47, number: 47, title: "État de Choc – Généralités",                                      specialty: "Réanimation",               day: "J2", status: "completed"   },
  { id: 48, number: 48, title: "Choc Septique",                                                   specialty: "Réanimation",               day: "J2", status: "in_progress" },
  { id: 49, number: 49, title: "Insuffisance Respiratoire Aiguë",         shortTitle: "IRA Resp", specialty: "Réanimation",               day: "J2", status: "not_started" },
  { id: 50, number: 50, title: "Coma",                                                            specialty: "Réanimation",               day: "J2", status: "not_started" },

  // ── Endocrinologie (5) ── J2
  { id: 51, number: 51, title: "Diabète Type 1",                          shortTitle: "DT1",      specialty: "Endocrinologie",            day: "J2", status: "completed"   },
  { id: 52, number: 52, title: "Diabète Type 2",                          shortTitle: "DT2",      specialty: "Endocrinologie",            day: "J2", status: "completed"   },
  { id: 53, number: 53, title: "Dysthyroïdies",                                                   specialty: "Endocrinologie",            day: "J2", status: "in_progress" },
  { id: 54, number: 54, title: "Insuffisance Surrénale",                                          specialty: "Endocrinologie",            day: "J2", status: "not_started" },
  { id: 55, number: 55, title: "Syndrome de Cushing",                                             specialty: "Endocrinologie",            day: "J2", status: "not_started" },

  // ── Médecine interne (5) ── J2
  { id: 56, number: 56, title: "Lupus Érythémateux Systémique",           shortTitle: "LES",      specialty: "Médecine interne",          day: "J2", status: "not_started" },
  { id: 57, number: 57, title: "Polyarthrite Rhumatoïde",                 shortTitle: "PR",       specialty: "Médecine interne",          day: "J2", status: "in_progress" },
  { id: 58, number: 58, title: "Sarcoïdose",                                                      specialty: "Médecine interne",          day: "J2", status: "not_started" },
  { id: 59, number: 59, title: "Amylose",                                                         specialty: "Médecine interne",          day: "J2", status: "not_started" },
  { id: 60, number: 60, title: "Vascularites",                                                    specialty: "Médecine interne",          day: "J2", status: "not_started" },

  // ── Infectiologie (5) ── J2
  { id: 61, number: 61, title: "Tuberculose",                             shortTitle: "TB",       specialty: "Infectiologie",             day: "J2", status: "completed"   },
  { id: 62, number: 62, title: "VIH – Infection et SIDA",                 shortTitle: "VIH",      specialty: "Infectiologie",             day: "J2", status: "completed"   },
  { id: 63, number: 63, title: "Paludisme",                                                       specialty: "Infectiologie",             day: "J2", status: "in_progress" },
  { id: 64, number: 64, title: "Salmonelloses",                                                   specialty: "Infectiologie",             day: "J2", status: "not_started" },
  { id: 65, number: 65, title: "Fièvres Hémorragiques Virales",           shortTitle: "FHV",      specialty: "Infectiologie",             day: "J2", status: "not_started" },

  // ── Hématologie (3) ── J2
  { id: 66, number: 66, title: "Anémies",                                                         specialty: "Hématologie",               day: "J2", status: "completed"   },
  { id: 67, number: 67, title: "Leucémies Aiguës",                                                specialty: "Hématologie",               day: "J2", status: "not_started" },
  { id: 68, number: 68, title: "Lymphomes",                                                       specialty: "Hématologie",               day: "J2", status: "not_started" },

  // ── Orthopédie-Rhumatologie (4) ── J2
  { id: 69, number: 69, title: "Fractures de l'Extrémité Supérieure du Fémur", shortTitle: "FESF", specialty: "Orthopédie-Rhumatologie",  day: "J2", status: "completed"   },
  { id: 70, number: 70, title: "Spondylarthrite Ankylosante",             shortTitle: "SPA",      specialty: "Orthopédie-Rhumatologie",   day: "J2", status: "in_progress" },
  { id: 71, number: 71, title: "Traumatismes du Rachis",                                          specialty: "Orthopédie-Rhumatologie",   day: "J2", status: "not_started" },
  { id: 72, number: 72, title: "Arthrose",                                                        specialty: "Orthopédie-Rhumatologie",   day: "J2", status: "not_started" },

  // ── Pédiatrie (3) ── J2
  { id: 73, number: 73, title: "Bronchiolite et Asthme du Nourrisson",                            specialty: "Pédiatrie",                 day: "J2", status: "completed"   },
  { id: 74, number: 74, title: "Méningite Bactérienne de l'Enfant",                               specialty: "Pédiatrie",                 day: "J2", status: "completed"   },
  { id: 75, number: 75, title: "Déshydratation Aiguë du Nourrisson",                              specialty: "Pédiatrie",                 day: "J2", status: "completed"   },
];
