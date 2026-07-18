// Shared geometry for the week time-grid (used by WeekView and the drag logic).
export const HOURS_START = 7;
export const HOURS_END = 22;
export const PX_PER_HOUR = 68;
export const SNAP_MINUTES = 15;
export const GRID_HEIGHT = (HOURS_END - HOURS_START) * PX_PER_HOUR;

export const DAY_START_MIN = HOURS_START * 60;
export const DAY_END_MIN = HOURS_END * 60;
