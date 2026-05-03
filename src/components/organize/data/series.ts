import type { Series, Faculty } from "./types";

const FACULTIES: Faculty[] = ["Tunis", "Sfax", "Sousse", "Monastir"];
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Pseudo-random seeded generator (deterministic)
function seeded(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function buildSeries(courseId: number): Series[] {
  const result: Series[] = [];
  let serial = 0;
  const count = 8 + (courseId % 5); // 8–12 series per course
  for (let i = 0; i < count; i++) {
    const seed = courseId * 100 + i;
    const year = YEARS[Math.floor(seeded(seed) * YEARS.length)];
    const faculty = FACULTIES[i % FACULTIES.length];
    const nq = 15 + Math.floor(seeded(seed + 1) * 16); // 15–30
    const rating = parseFloat((5.5 + seeded(seed + 2) * 3.7).toFixed(1)); // 5.5–9.2
    const votes = 12 + Math.floor(seeded(seed + 3) * 88);
    const r = seeded(seed + 4);
    const userStatus: Series["userStatus"] = r < 0.3 ? "done" : r < 0.4 ? "partial" : "not_done";
    const userScore = userStatus === "done" ? Math.round(60 + seeded(seed + 5) * 40) :
                      userStatus === "partial" ? Math.round(30 + seeded(seed + 5) * 30) : undefined;
    result.push({
      id: `${year}-${faculty.toLowerCase()}-c${courseId}-${serial++}`,
      courseId,
      year,
      faculty,
      numberOfQuestions: nq,
      rating,
      votes,
      userStatus,
      userScore,
    });
  }
  // Sort: not_done first, partial, then done; within same status by rating desc
  return result.sort((a, b) => {
    const order = { not_done: 0, partial: 1, done: 2 };
    if (order[a.userStatus] !== order[b.userStatus]) return order[a.userStatus] - order[b.userStatus];
    return b.rating - a.rating;
  });
}

const _cache = new Map<number, Series[]>();

export function getSeriesForCourse(courseId: number): Series[] {
  if (!_cache.has(courseId)) _cache.set(courseId, buildSeries(courseId));
  return _cache.get(courseId)!;
}

export function getSeriesById(id: string): Series | undefined {
  for (let cid = 1; cid <= 75; cid++) {
    const found = getSeriesForCourse(cid).find((s) => s.id === id);
    if (found) return found;
  }
  return undefined;
}

// Pre-build all series (used by search / backlog)
export const ALL_SERIES: Series[] = Array.from({ length: 75 }, (_, i) =>
  getSeriesForCourse(i + 1)
).flat();
