"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, Clock, BookOpen, PenTool,
  RotateCcw, Plus, Calendar, ListTodo, CheckCircle2, Circle,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";

// ─── Types ─────────────────────────────────────────────────────────────────────
// TODO_API: mirrors organize_events table (Supabase) — see qe-tn/src/components/organize/README.md
type EventType   = "qcm" | "lecture" | "revision_slot";
type EventStatus = "upcoming" | "done" | "missed";
type RevisionInterval = "J2" | "J7" | "J10" | "J30";

interface CalEvent {
  id: string;
  type: EventType;
  courseLabel: string;
  seriesLabel?: string;
  date: string;             // YYYY-MM-DD
  startTime: string;        // HH:mm
  durationMinutes: number;
  status: EventStatus;
  revisionInterval?: RevisionInterval;
  estimatedFromKpi?: boolean;
}

interface BacklogItem {
  id: string;
  courseLabel: string;
  type: EventType;
  nQcm?: number;
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
interface EventStyle {
  bg: string; text: string; border: string; badgeBg: string; icon: ReactNode;
}
const EVENT_STYLES: Record<EventType, EventStyle> = {
  qcm: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-l-4 border-l-blue-500",
    badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    icon: <PenTool size={10} />,
  },
  lecture: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-l-4 border-l-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
    icon: <BookOpen size={10} />,
  },
  revision_slot: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-l-4 border-l-amber-500 border-dashed",
    badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
    icon: <RotateCcw size={10} />,
  },
};

// ─── Date helpers ──────────────────────────────────────────────────────────────
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function getMonday(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86400000
  );
}
function formatShortDay(iso: string): { wd: string; day: string } {
  const d = new Date(iso + "T00:00:00");
  return {
    wd:  d.toLocaleDateString("fr-TN", { weekday: "short" }).replace(".", "").slice(0, 3).toUpperCase(),
    day: String(d.getDate()),
  };
}
function formatDateLabel(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-TN", {
    weekday: "short", day: "numeric", month: "short",
  });
}
function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function minutesToDisplay(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────
// TODO_API: Replace with GET /api/organize/events?from=<weekStart>&to=<weekEnd>
function buildMockEvents(): CalEvent[] {
  const today = todayISO();
  const mon   = getMonday(today);
  const dOff  = daysBetween(mon, today); // 0=Lun … 6=Dim
  const d     = (offset: number) => addDays(mon, offset);

  return [
    { id:"e1",  type:"qcm",           courseLabel:"Cardiologie",    seriesLabel:"SCA – Serie A",          date:d(0),        startTime:"08:00", durationMinutes:45, status:"done"                         },
    { id:"e2",  type:"lecture",        courseLabel:"Neurologie",     seriesLabel:"AVC",                    date:d(0),        startTime:"10:00", durationMinutes:60, status:"done"                         },
    { id:"e3",  type:"revision_slot",  courseLabel:"Pédiatrie",      seriesLabel:"Bronchiolite",           date:d(1),        startTime:"09:00", durationMinutes:30, status:"done",    revisionInterval:"J7"  },
    { id:"e4",  type:"qcm",           courseLabel:"Hématologie",    seriesLabel:"Anémie – Serie B",       date:d(1),        startTime:"14:00", durationMinutes:50, status:"done"                         },
    { id:"e5",  type:"lecture",        courseLabel:"Réanimation",    seriesLabel:"État de choc",            date:today,       startTime:"08:30", durationMinutes:70, status:"done"                         },
    { id:"e6",  type:"qcm",           courseLabel:"Gynécologie",    seriesLabel:"Cancer col – Serie A",   date:today,       startTime:"11:00", durationMinutes:40, status:"upcoming", estimatedFromKpi:true  },
    { id:"e7",  type:"revision_slot",  courseLabel:"Cardiologie",    seriesLabel:"HTA",                    date:today,       startTime:"14:30", durationMinutes:25, status:"upcoming", revisionInterval:"J2"  },
    { id:"e8",  type:"qcm",           courseLabel:"Neurologie",     seriesLabel:"Céphalées – Serie A",    date:d(dOff+1),   startTime:"09:00", durationMinutes:35, status:"upcoming", estimatedFromKpi:true  },
    { id:"e9",  type:"lecture",        courseLabel:"Endocrinologie", seriesLabel:"Diabète",                date:d(dOff+1),   startTime:"13:00", durationMinutes:80, status:"upcoming"                      },
    { id:"e10", type:"revision_slot",  courseLabel:"Hématologie",    seriesLabel:"Transfusion",            date:d(dOff+2),   startTime:"10:00", durationMinutes:30, status:"upcoming", revisionInterval:"J7"  },
    { id:"e11", type:"qcm",           courseLabel:"Infectiologie",  seriesLabel:"Tuberculose – Serie B",  date:d(dOff+3),   startTime:"08:00", durationMinutes:55, status:"upcoming", estimatedFromKpi:true  },
    { id:"e12", type:"lecture",        courseLabel:"Pédiatrie",      seriesLabel:"Vaccinations",           date:d(dOff+4),   startTime:"15:00", durationMinutes:45, status:"upcoming"                      },
    { id:"e13", type:"revision_slot",  courseLabel:"Neurologie",     seriesLabel:"AVC",                    date:d(dOff+4),   startTime:"11:00", durationMinutes:25, status:"upcoming", revisionInterval:"J10" },
  ];
}

// TODO_API: GET /api/organize/backlog
const MOCK_BACKLOG: BacklogItem[] = [
  { id:"b1", courseLabel:"Orthopédie-Rhumatologie", type:"qcm",     nQcm:18 },
  { id:"b2", courseLabel:"Urologie",                type:"lecture"           },
  { id:"b3", courseLabel:"Médecine interne",        type:"qcm",     nQcm:22 },
  { id:"b4", courseLabel:"Ophtalmologie",           type:"lecture"           },
];

// ─── Grid constants ─────────────────────────────────────────────────────────────
const HOURS_START = 7;
const HOURS_END   = 21;
const PX_PER_HOUR = 54;
const GRID_HEIGHT = (HOURS_END - HOURS_START) * PX_PER_HOUR;

// ─── WeekEventCard ─────────────────────────────────────────────────────────────
function WeekEventCard({ event }: { event: CalEvent }) {
  const s      = EVENT_STYLES[event.type];
  const isDone = event.status === "done";
  return (
    <div
      className={`absolute inset-x-0.5 overflow-hidden rounded px-1 py-0.5 text-[9px] leading-tight shadow-sm cursor-default select-none transition-shadow hover:shadow-md hover:z-10 ${s.bg} ${s.border} ${isDone ? "opacity-55" : ""}`}
      title={`${event.courseLabel}${event.seriesLabel ? ` — ${event.seriesLabel}` : ""} (${minutesToDisplay(event.durationMinutes)})`}
    >
      <div className={`flex items-center gap-0.5 font-semibold truncate ${s.text}`}>
        {s.icon}
        <span className="ml-0.5 truncate">{event.courseLabel}</span>
      </div>
      {event.durationMinutes >= 35 && event.revisionInterval && (
        <span className={`mt-0.5 inline-block rounded px-0.5 text-[7px] font-bold ${s.badgeBg}`}>
          {event.revisionInterval}
        </span>
      )}
    </div>
  );
}

// ─── AgendaItem ────────────────────────────────────────────────────────────────
function AgendaItem({ event, showDate }: { event: CalEvent; showDate?: boolean }) {
  const s      = EVENT_STYLES[event.type];
  const isDone = event.status === "done";
  return (
    <div className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${s.bg} ${isDone ? "opacity-55" : ""}`}>
      <div className={`mt-0.5 shrink-0 ${s.text}`}>{s.icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[11px] font-semibold ${s.text}`}>{event.courseLabel}</p>
        {event.seriesLabel && (
          <p className="truncate text-[10px] text-muted-foreground">{event.seriesLabel}</p>
        )}
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {showDate && (
            <span className="text-[9px] text-muted-foreground">{formatDateLabel(event.date)}</span>
          )}
          <span className="text-[9px] tabular-nums text-muted-foreground">{event.startTime}</span>
          <span className="text-[9px] text-muted-foreground/50">·</span>
          <span className="text-[9px] tabular-nums text-muted-foreground">{minutesToDisplay(event.durationMinutes)}</span>
          {event.revisionInterval && (
            <span className={`rounded px-1 text-[8px] font-bold ${s.badgeBg}`}>{event.revisionInterval}</span>
          )}
        </div>
      </div>
      {isDone
        ? <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />
        : <Circle      size={12} className="mt-0.5 shrink-0 text-muted-foreground/30" />}
    </div>
  );
}

// ─── CalendrierIntelligent ─────────────────────────────────────────────────────
export default function CalendrierIntelligent() {
  const [weekStart, setWeekStart] = useState(() => getMonday(todayISO()));
  const today     = todayISO();
  const allEvents = buildMockEvents();

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekLabel = (() => {
    const end = addDays(weekStart, 6);
    const s   = new Date(weekStart + "T00:00:00");
    const e   = new Date(end       + "T00:00:00");
    const sm  = s.toLocaleDateString("fr-TN", { month: "short" });
    const em  = e.toLocaleDateString("fr-TN", { month: "short" });
    return sm === em
      ? `${s.getDate()} – ${e.getDate()} ${sm}`
      : `${s.getDate()} ${sm} – ${e.getDate()} ${em}`;
  })();

  const eventsForDay = (date: string) =>
    allEvents.filter((e) => e.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayEvents = eventsForDay(today);

  const upcomingEvents = allEvents
    .filter((e) => e.date > today && e.date <= addDays(today, 7) && e.status === "upcoming")
    .sort((a, b) => a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold tracking-tight text-foreground">Calendrier intelligent</p>
                <p className="text-xs text-muted-foreground">
                  Planification &amp; révisions espacées — référence d&apos;intégration front&#x2F;back
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(["qcm", "lecture", "revision_slot"] as EventType[]).map((t) => (
                  <div key={t} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-sm ${
                      t === "qcm" ? "bg-blue-500" : t === "lecture" ? "bg-emerald-500" : "bg-amber-400"
                    }`} />
                    <span className="text-[10px] text-muted-foreground">
                      {t === "revision_slot" ? "Révision" : t === "qcm" ? "QCM" : "Lecture"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar + Sidebar */}
      <div className="grid gap-4 lg:grid-cols-[1fr_256px]">

        {/* Week calendar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">

              {/* Navigation */}
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setWeekStart((w) => addDays(w, -7))}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Semaine précédente"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setWeekStart((w) => addDays(w, 7))}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Semaine suivante"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
                <p className="text-xs font-semibold tabular-nums text-foreground">{weekLabel}</p>
                <button
                  onClick={() => setWeekStart(getMonday(todayISO()))}
                  className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
                >
                  Auj.
                </button>
              </div>

              {/* Day headers */}
              <div className="grid border-b border-border" style={{ gridTemplateColumns: "32px repeat(7, 1fr)" }}>
                <div />
                {weekDates.map((date, i) => {
                  const { wd, day } = formatShortDay(date);
                  const isToday = date === today;
                  return (
                    <div key={i} className={`py-1.5 text-center ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      <div className="text-[9px] font-semibold uppercase tracking-wider">{wd}</div>
                      <div className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-bold tabular-nums ${
                        isToday ? "bg-primary text-primary-foreground" : ""
                      }`}>
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                <div className="grid relative" style={{ gridTemplateColumns: "32px repeat(7, 1fr)", height: `${GRID_HEIGHT}px` }}>

                  {/* Hour labels */}
                  <div className="relative">
                    {Array.from({ length: HOURS_END - HOURS_START }, (_, i) => (
                      <div
                        key={i}
                        className="absolute right-1 text-[8px] tabular-nums text-muted-foreground/60 leading-none"
                        style={{ top: `${i * PX_PER_HOUR - 4}px` }}
                      >
                        {String(HOURS_START + i).padStart(2, "0")}h
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDates.map((date, di) => {
                    const isToday   = date === today;
                    const dayEvents = eventsForDay(date);
                    const nowTop    = (() => {
                      if (!isToday) return null;
                      const now = new Date();
                      const min = now.getHours() * 60 + now.getMinutes() - HOURS_START * 60;
                      const top = (min / 60) * PX_PER_HOUR;
                      return top >= 0 && top <= GRID_HEIGHT ? top : null;
                    })();
                    return (
                      <div
                        key={di}
                        className={`relative border-l border-border/50 ${isToday ? "bg-primary/[0.018]" : ""}`}
                        style={{ height: `${GRID_HEIGHT}px` }}
                      >
                        {/* Hour lines */}
                        {Array.from({ length: HOURS_END - HOURS_START }, (_, i) => (
                          <div
                            key={i}
                            className="absolute inset-x-0 border-t border-border/30"
                            style={{ top: `${i * PX_PER_HOUR}px` }}
                          />
                        ))}
                        {/* Now indicator */}
                        {nowTop !== null && (
                          <div
                            className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                            style={{ top: `${nowTop}px` }}
                          >
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                            <div className="h-px flex-1 bg-red-400/60" />
                          </div>
                        )}
                        {/* Events */}
                        {dayEvents.map((event) => {
                          const startMin = timeToMinutes(event.startTime) - HOURS_START * 60;
                          const top    = (startMin / 60) * PX_PER_HOUR;
                          const height = Math.max(16, (event.durationMinutes / 60) * PX_PER_HOUR - 1);
                          return (
                            <div key={event.id} style={{ position: "absolute", top, left: 1, right: 1, height }}>
                              <WeekEventCard event={event} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Aujourd'hui */}
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <Calendar size={12} className="text-primary" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Aujourd&apos;hui</p>
                  <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums text-muted-foreground">
                    {todayEvents.length}
                  </span>
                </div>
                {/* TODO_API: GET /api/organize/events?date=<today> */}
                <div className="space-y-1">
                  {todayEvents.length === 0 ? (
                    <p className="py-3 text-center text-[11px] text-muted-foreground">Aucune tâche</p>
                  ) : (
                    todayEvents.map((e) => <AgendaItem key={e.id} event={e} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* À venir */}
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">À venir</p>
                </div>
                {/* TODO_API: GET /api/organize/events?from=<tomorrow>&to=<+7d>&status=upcoming */}
                <div className="space-y-1">
                  {upcomingEvents.length === 0 ? (
                    <p className="py-3 text-center text-[11px] text-muted-foreground">Aucun événement</p>
                  ) : (
                    upcomingEvents.map((e) => <AgendaItem key={e.id} event={e} showDate />)
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Backlog */}
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <ListTodo size={12} className="text-muted-foreground" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Backlog</p>
                  <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums text-muted-foreground">
                    {MOCK_BACKLOG.length}
                  </span>
                </div>
                {/* TODO_API: GET /api/organize/backlog */}
                {/* TODO_API: POST /api/organize/events  (bouton +) */}
                <div className="space-y-1">
                  {MOCK_BACKLOG.map((item) => {
                    const s = EVENT_STYLES[item.type];
                    return (
                      <div key={item.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${s.bg}`}>
                        <div className={`shrink-0 ${s.text}`}>{s.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-[11px] font-semibold ${s.text}`}>{item.courseLabel}</p>
                          {item.nQcm !== undefined && (
                            <p className="text-[9px] text-muted-foreground">{item.nQcm} QCM</p>
                          )}
                        </div>
                        <button
                          className="shrink-0 rounded border border-border bg-background p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Planifier"
                          aria-label="Planifier"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
