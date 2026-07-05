import { MOCK_USER_STATS } from "../data/userStats";

export function estimateDuration(numberOfQcm: number): number | null {
  const kpi = MOCK_USER_STATS.avgTimePerQcmSimple;
  if (kpi === null || numberOfQcm === 0) return null;
  const seconds = numberOfQcm * kpi;
  const minutes = Math.ceil(seconds / 60);
  return Math.ceil(minutes / 5) * 5;
}

export function useEstimation() {
  return { estimateDuration };
}
