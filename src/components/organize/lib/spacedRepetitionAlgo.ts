import type { CalendarEvent, AutoModeConfig } from "../data/types";
import { addDays, fromDate, todayISO, timeToMinutes, minutesToHHMM } from "./dateUtils";
import { findFreeSlot, type BlockedSpan } from "./conflicts";
import { parseISO } from "date-fns";

function uuid(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export function generateRevisions(
  parent: CalendarEvent,
  config: AutoModeConfig
): CalendarEvent[] {
  if (!config.enabled) return [];
  const base = parseISO(parent.startDate);
  const now  = new Date().toISOString();

  return config.intervals.map((days) => ({
    id: `rev-${uuid()}`,
    type: "revision_slot" as const,
    courseId: parent.courseId,
    seriesId: parent.seriesId,
    title: `🔁 Révision J${days} – Cours #${parent.courseId}`,
    startDate: fromDate(addDays(base, days)),
    startTime: config.preferredHour,
    durationMinutes: parent.durationMinutes,
    estimatedFromKpi: parent.estimatedFromKpi,
    isRevision: true,
    revisionInterval: `J${days}`,
    parentEventId: parent.id,
    status: "upcoming" as const,
    createdAt: now,
    updatedAt: now,
  }));
}

export function rescheduleOverdueRevisions(
  events: CalendarEvent[],
  preferredHour: string,
  blocked: BlockedSpan[] = [],
): CalendarEvent[] {
  const today = todayISO();
  const now   = new Date().toISOString();
  const isOverdueRev = (e: CalendarEvent) =>
    e.type === "revision_slot" && e.status === "upcoming" && e.startDate < today;

  // Slots already taken on `today` by events that won't be moved.
  const working = events.filter((e) => e.startDate === today && !isOverdueRev(e));
  const desired = timeToMinutes(preferredHour);

  return events.map((e) => {
    if (!isOverdueRev(e)) return e;
    const slot = findFreeSlot(working, today, desired, e.durationMinutes, { blocked });
    const startMin = slot ?? desired; // day full → fall back (rare)
    const moved: CalendarEvent = {
      ...e,
      startDate: today,
      startTime: minutesToHHMM(startMin),
      status: "rescheduled" as const,
      updatedAt: now,
    };
    working.push(moved);
    return moved;
  });
}

export function computeStreak(events: CalendarEvent[]): number {
  const doneDates = new Set(
    events.filter((e) => e.status === "done" && e.completedAt)
          .map((e) => e.completedAt!.slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!doneDates.has(iso)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface AdherenceStats {
  /** Révisions terminées. */
  doneCount: number;
  /** Révisions faites au plus tard le jour planifié. */
  onTimeCount: number;
  /** onTimeCount / doneCount, ou null si aucune révision faite. */
  onTimeRate: number | null;
  /** Retard moyen (en jours) des révisions faites en retard, ou null. */
  avgDelayDays: number | null;
  /** Révisions planifiées dans le passé et toujours non faites. */
  overdueCount: number;
}

/** Mesure l'adhérence au plan de répétition espacée. */
export function computeAdherence(events: CalendarEvent[]): AdherenceStats {
  const today = todayISO();
  const revs = events.filter((e) => e.type === "revision_slot");

  const done = revs.filter((e) => e.status === "done" && e.completedAt);
  let onTime = 0;
  const delays: number[] = [];
  for (const e of done) {
    const doneDay = e.completedAt!.slice(0, 10);
    if (doneDay <= e.startDate) {
      onTime++;
    } else {
      delays.push(
        Math.round(
          (parseISO(doneDay).getTime() - parseISO(e.startDate).getTime()) / 86400000,
        ),
      );
    }
  }

  const overdueCount = revs.filter(
    (e) => (e.status === "upcoming" || e.status === "rescheduled") && e.startDate < today,
  ).length;

  return {
    doneCount: done.length,
    onTimeCount: onTime,
    onTimeRate: done.length > 0 ? onTime / done.length : null,
    avgDelayDays:
      delays.length > 0
        ? Math.round((delays.reduce((s, d) => s + d, 0) / delays.length) * 10) / 10
        : null,
    overdueCount,
  };
}

export function computeBestStreak(events: CalendarEvent[]): number {
  const doneDates = Array.from(
    new Set(
      events.filter((e) => e.status === "done" && e.completedAt)
            .map((e) => e.completedAt!.slice(0, 10))
    )
  ).sort();

  if (doneDates.length === 0) return 0;
  let best = 1, current = 1;
  for (let i = 1; i < doneDates.length; i++) {
    const prev = parseISO(doneDates[i - 1]);
    const curr = parseISO(doneDates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) { current++; best = Math.max(best, current); }
    else current = 1;
  }
  return best;
}
