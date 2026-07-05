import type { CalendarEvent } from "../data/types";
import { timeToMinutes } from "./dateUtils";
import { DAY_START_MIN, DAY_END_MIN, SNAP_MINUTES } from "../calendar/gridConstants";

export interface Range {
  start: number; // minutes from midnight
  end: number;
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
  const dayStart = opts.dayStart ?? DAY_START_MIN;
  const dayEnd = opts.dayEnd ?? DAY_END_MIN;
  const step = opts.step ?? SNAP_MINUTES;

  const fits = (s: number) =>
    s >= dayStart &&
    s + durationMin <= dayEnd &&
    !findConflict(events, day, s, durationMin, opts.ignoreId);

  const aligned = Math.max(dayStart, Math.round(desiredStartMin / step) * step);
  for (let s = aligned; s + durationMin <= dayEnd; s += step) {
    if (fits(s)) return s;
  }
  for (let s = dayStart; s < aligned; s += step) {
    if (fits(s)) return s;
  }
  return null;
}

export function clampStart(startMin: number, durationMin: number): number {
  const max = DAY_END_MIN - durationMin;
  if (startMin < DAY_START_MIN) return DAY_START_MIN;
  if (startMin > max) return Math.max(DAY_START_MIN, max);
  return startMin;
}

export function snap(min: number, step: number = SNAP_MINUTES): number {
  return Math.round(min / step) * step;
}
