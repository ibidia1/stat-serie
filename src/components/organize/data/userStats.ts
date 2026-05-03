import type { UserStats } from "./types";

// Set DEV_NO_KPI = true to test the "KPI absent" code paths
export const DEV_NO_KPI = false;

export const MOCK_USER_STATS: UserStats = DEV_NO_KPI
  ? {
      avgTimePerQcmSimple: null,
      avgTimePerQcmCase: null,
      avgReadingSpeedWpm: null,
      totalQcmDone: 0,
      totalLecturesRead: 0,
    }
  : {
      avgTimePerQcmSimple: 38,   // secondes
      avgTimePerQcmCase: 95,
      avgReadingSpeedWpm: null,
      totalQcmDone: 1247,
      totalLecturesRead: 23,
    };
