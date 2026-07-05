import {
  format,
  addDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isPast,
  isFuture,
  parseISO,
  startOfMonth,
  endOfMonth,
  getDay,
  isValid,
} from "date-fns";
import { fr } from "date-fns/locale";

export {
  addDays,
  differenceInDays,
  isToday,
  isPast,
  isFuture,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  isValid,
};

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toDate(iso: string): Date {
  return parseISO(iso);
}

export function fromDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function getMondayOfWeek(iso: string): string {
  const d = parseISO(iso);
  return fromDate(startOfWeek(d, { weekStartsOn: 1 }));
}

export function getSundayOfWeek(iso: string): string {
  const d = parseISO(iso);
  return fromDate(endOfWeek(d, { weekStartsOn: 1 }));
}

export function weekDates(mondayIso: string): string[] {
  const mon = parseISO(mondayIso);
  const sun = endOfWeek(mon, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: mon, end: sun }).map(fromDate);
}

export function formatWeekLabel(mondayIso: string): string {
  const start = parseISO(mondayIso);
  const end   = endOfWeek(start, { weekStartsOn: 1 });
  const sm    = format(start, "d MMM", { locale: fr });
  const em    = format(end,   "d MMM", { locale: fr });
  return `${sm} – ${em}`;
}

export function formatDayHeader(iso: string): { wd: string; day: string } {
  const d = parseISO(iso);
  return {
    wd:  format(d, "EEE", { locale: fr }).replace(".", "").toUpperCase().slice(0, 3),
    day: format(d, "d"),
  };
}

export function formatFullDate(iso: string): string {
  return format(parseISO(iso), "EEEE d MMMM yyyy", { locale: fr });
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: fr });
}

export function formatRelative(isoDatetime: string): string {
  const diff = differenceInDays(new Date(), parseISO(isoDatetime));
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return "hier";
  if (diff < 7)  return `il y a ${diff} j`;
  return format(parseISO(isoDatetime), "d MMM", { locale: fr });
}

export function countdownDays(examIso: string): number {
  return differenceInDays(parseISO(examIso), new Date());
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function minutesToDisplay(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export function monthCalendarDays(yearMonth: string): Array<string | null> {
  // yearMonth = "2026-05"
  const first = parseISO(`${yearMonth}-01`);
  const last  = endOfMonth(first);
  const days: Array<string | null> = [];
  // Offset: Mon=0 … Sun=6
  const firstDow = (getDay(first) + 6) % 7; // Mon-first
  for (let i = 0; i < firstDow; i++) days.push(null);
  const allDays = eachDayOfInterval({ start: first, end: last });
  for (const d of allDays) days.push(fromDate(d));
  return days;
}

export function currentYearMonth(): string {
  return format(new Date(), "yyyy-MM");
}

export function nextYearMonth(ym: string): string {
  const d = parseISO(`${ym}-01`);
  d.setMonth(d.getMonth() + 1);
  return format(d, "yyyy-MM");
}

export function prevYearMonth(ym: string): string {
  const d = parseISO(`${ym}-01`);
  d.setMonth(d.getMonth() - 1);
  return format(d, "yyyy-MM");
}

export function yearMonthLabel(ym: string): string {
  return format(parseISO(`${ym}-01`), "MMMM yyyy", { locale: fr });
}
