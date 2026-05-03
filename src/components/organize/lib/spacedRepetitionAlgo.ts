import type { CalendarEvent, AutoModeConfig } from "../data/types";
import { addDays, fromDate, todayISO } from "./dateUtils";
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

export function rescheduleOverdueRevisions(events: CalendarEvent[], preferredHour: string): CalendarEvent[] {
  const today = todayISO();
  const now   = new Date().toISOString();
  return events.map((e) => {
    if (e.type === "revision_slot" && e.status === "upcoming" && e.startDate < today) {
      return { ...e, startDate: today, startTime: preferredHour, status: "rescheduled" as const, updatedAt: now };
    }
    return e;
  });
}

export function computeStreak(events: CalendarEvent[]): number {
  const doneDates = new Set(
    events.filter((e) => e.status === "done" && e.completedAt)
          .map((e) => e.completedAt!.slice(0, 10))
  );

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!doneDates.has(iso)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
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
