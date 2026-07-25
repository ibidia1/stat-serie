// Géométrie de la grille horaire (vue Semaine + logique de drag).

/** Fin de journée : minuit. La grille va toujours jusqu'à 24 h. */
export const HOURS_END = 24;

/** Début affiché par défaut (07 h) — journée d'étude « normale ». */
export const DEFAULT_HOURS_START = 7;

/** Début en mode journée complète (00 h), si l'étudiant étend la grille. */
export const FULL_HOURS_START = 0;

export const PX_PER_HOUR = 68;
export const SNAP_MINUTES = 15;

export const DAY_END_MIN = HOURS_END * 60;                    // 1440
export const DEFAULT_DAY_START_MIN = DEFAULT_HOURS_START * 60; // 420
export const FULL_DAY_START_MIN = FULL_HOURS_START * 60;       // 0

/** Heure de début affichée selon le mode choisi. */
export function hoursStartFor(fullDay: boolean): number {
  return fullDay ? FULL_HOURS_START : DEFAULT_HOURS_START;
}

/** Origine de la grille en minutes depuis minuit. */
export function dayStartMinFor(fullDay: boolean): number {
  return hoursStartFor(fullDay) * 60;
}

/** Hauteur totale de la grille pour le mode choisi. */
export function gridHeightFor(fullDay: boolean): number {
  return (HOURS_END - hoursStartFor(fullDay)) * PX_PER_HOUR;
}
