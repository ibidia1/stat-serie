import type { CalendarEvent, BlockedRange } from "../data/types";
import { timeToMinutes } from "./dateUtils";
import { DEFAULT_DAY_START_MIN, DAY_END_MIN, SNAP_MINUTES } from "../calendar/gridConstants";

export interface Range {
  start: number; // minutes from midnight
  end: number;
}

export interface BlockedSpan extends Range {
  label: string;
}

/** Index de jour lundi-first (0 = lundi … 6 = dimanche). */
export function dayIndexOf(dateISO: string): number {
  return (new Date(dateISO + "T00:00:00").getDay() + 6) % 7;
}

/** Plages bloquées applicables à une date donnée, en minutes depuis minuit. */
export function blockedSpansForDay(ranges: BlockedRange[], dateISO: string): BlockedSpan[] {
  const dow = dayIndexOf(dateISO);
  return ranges
    .filter((r) => r.days.includes(dow))
    .map((r) => ({
      start: timeToMinutes(r.startTime),
      end: timeToMinutes(r.endTime),
      label: r.label,
    }));
}

/** Première plage bloquée chevauchant [startMin, startMin + durationMin). */
export function findBlocked(
  spans: BlockedSpan[],
  startMin: number,
  durationMin: number,
): BlockedSpan | null {
  const candidate: Range = { start: startMin, end: startMin + durationMin };
  for (const s of spans) {
    if (rangesOverlap(candidate, s)) return s;
  }
  return null;
}

export function eventRange(e: CalendarEvent): Range {
  const start = timeToMinutes(e.startTime);
  return { start, end: start + e.durationMinutes };
}

export function rangesOverlap(a: Range, b: Range): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Returns the first event on `day` whose time range overlaps
 * [startMin, startMin + durationMin). Skipped events never block.
 */
export function findConflict(
  events: CalendarEvent[],
  day: string,
  startMin: number,
  durationMin: number,
  ignoreId?: string,
): CalendarEvent | null {
  const candidate: Range = { start: startMin, end: startMin + durationMin };
  for (const e of events) {
    if (e.id === ignoreId) continue;
    if (e.startDate !== day) continue;
    if (e.status === "skipped") continue;
    if (rangesOverlap(candidate, eventRange(e))) return e;
  }
  return null;
}

export function hasConflict(
  events: CalendarEvent[],
  day: string,
  startMin: number,
  durationMin: number,
  ignoreId?: string,
): boolean {
  return findConflict(events, day, startMin, durationMin, ignoreId) !== null;
}

interface FreeSlotOptions {
  dayStart?: number;
  dayEnd?: number;
  step?: number;
  ignoreId?: string;
  /** Plages non planifiables du jour (voir blockedSpansForDay). */
  blocked?: BlockedSpan[];
}

/**
 * Earliest free start (in minutes) that fits a `durationMin` block on `day`
 * without overlapping anything. Scans forward from `desiredStartMin` first,
 * then wraps around to the start of the day. Returns null if the day is full.
 */
export function findFreeSlot(
  events: CalendarEvent[],
  day: string,
  desiredStartMin: number,
  durationMin: number,
  opts: FreeSlotOptions = {},
): number | null {
  const dayStart = opts.dayStart ?? DEFAULT_DAY_START_MIN;
  const dayEnd = opts.dayEnd ?? DAY_END_MIN;
  const step = opts.step ?? SNAP_MINUTES;

  const fits = (s: number) =>
    s >= dayStart &&
    s + durationMin <= dayEnd &&
    !findConflict(events, day, s, durationMin, opts.ignoreId) &&
    !(opts.blocked && findBlocked(opts.blocked, s, durationMin));

  const aligned = Math.max(dayStart, Math.round(desiredStartMin / step) * step);
  for (let s = aligned; s + durationMin <= dayEnd; s += step) {
    if (fits(s)) return s;
  }
  for (let s = dayStart; s < aligned; s += step) {
    if (fits(s)) return s;
  }
  return null;
}

/**
 * Intervalles libres d'une journée (ni séance, ni plage bloquée) pouvant
 * accueillir un bloc de `durationMin`. Sert aux indices visuels pendant
 * un glisser-déposer.
 */
export function freeIntervals(
  events: CalendarEvent[],
  blocked: BlockedSpan[],
  day: string,
  durationMin: number,
  ignoreId?: string,
  dayStart: number = DEFAULT_DAY_START_MIN,
  dayEnd: number = DAY_END_MIN,
): Range[] {
  const occupied: Range[] = [
    ...events
      .filter((e) => e.startDate === day && e.status !== "skipped" && e.id !== ignoreId)
      .map(eventRange),
    ...blocked,
  ].sort((a, b) => a.start - b.start);

  const free: Range[] = [];
  let cursor = dayStart;
  for (const r of occupied) {
    if (r.start > cursor) free.push({ start: cursor, end: Math.min(r.start, dayEnd) });
    cursor = Math.max(cursor, r.end);
  }
  if (cursor < dayEnd) free.push({ start: cursor, end: dayEnd });

  return free.filter((f) => f.end - f.start >= durationMin);
}

export function clampStart(
  startMin: number,
  durationMin: number,
  dayStart: number = DEFAULT_DAY_START_MIN,
  dayEnd: number = DAY_END_MIN,
): number {
  const max = dayEnd - durationMin;
  if (startMin < dayStart) return dayStart;
  if (startMin > max) return Math.max(dayStart, max);
  return startMin;
}

export function snap(min: number, step: number = SNAP_MINUTES): number {
  return Math.round(min / step) * step;
}
