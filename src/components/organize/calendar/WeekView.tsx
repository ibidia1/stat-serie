"use client";

import { useContext, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Printer, Link2, Link2Off } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  getMondayOfWeek, weekDates, formatWeekLabel, formatDayHeader,
  todayISO, timeToMinutes, minutesToDisplay, addDays, fromDate
} from "../lib/dateUtils";
import { EventCard } from "./EventCard";
import { ChainConnectors } from "./ChainConnectors";
import { DragHintContext } from "./DragDropContext";
import { blockedSpansForDay, freeIntervals, type BlockedSpan } from "../lib/conflicts";
import type { CalendarEvent, BlockedRange } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";
import { printWeek } from "../lib/pdfExport";
import { countdownDays } from "../lib/dateUtils";
import { HOURS_START, HOURS_END, PX_PER_HOUR, GRID_HEIGHT, DAY_START_MIN } from "./gridConstants";

const minToPx = (min: number) => ((min - DAY_START_MIN) / 60) * PX_PER_HOUR;

interface DroppableCellProps {
  date: string;
  children: React.ReactNode;
  isPast: boolean;
  isToday: boolean;
  blocked: BlockedSpan[];
  dayEvents: CalendarEvent[];
}

function DroppableCell({ date, children, isPast, isToday, blocked, dayEvents }: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${date}`, data: { date, mode: "time" } });
  const hint = useContext(DragHintContext);
  const showHints = isOver && !isPast && hint !== null;

  return (
    <div
      ref={setNodeRef}
      data-day-cell={date}
      className={`relative border-l border-border/50 ${isToday ? "bg-primary/[0.018]" : ""} ${
        isOver && !isPast ? "bg-primary/10" : ""
      }`}
      style={{ height: `${GRID_HEIGHT}px` }}
    >
      {/* Plages bloquées (non planifiables) */}
      {blocked.map((b, i) => (
        <div
          key={`blk-${i}`}
          className="pointer-events-none absolute inset-x-0 z-[1] overflow-hidden bg-muted/60"
          style={{
            top: minToPx(b.start),
            height: Math.max(0, minToPx(b.end) - minToPx(b.start)),
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent 0 6px, var(--border) 6px 7px)",
          }}
        >
          {b.end - b.start >= 45 && (
            <span className="ml-1 mt-0.5 inline-block truncate text-[8px] font-semibold text-muted-foreground/80">
              🚫 {b.label}
            </span>
          )}
        </div>
      ))}

      {/* Créneaux libres suggérés pendant un drag */}
      {showHints &&
        freeIntervals(dayEvents, blocked, date, hint.durationMinutes, hint.ignoreId).map((f, i) => (
          <div
            key={`free-${i}`}
            className="pointer-events-none absolute inset-x-0.5 z-[1] rounded bg-success/10 ring-1 ring-inset ring-success/40"
            style={{ top: minToPx(f.start), height: minToPx(f.end) - minToPx(f.start) }}
          />
        ))}

      {children}
    </div>
  );
}

interface Props {
  weekStart: string;
  onWeekChange: (iso: string) => void;
  events: CalendarEvent[];
  examDate: string;
  blockedRanges: BlockedRange[];
  onDeleteEvent: (id: string) => void;
  onMarkDone: (id: string) => void;
  onExecuteRevision: (ev: CalendarEvent) => void;
  onResizeEvent: (id: string, newDurationMinutes: number) => void;
}

export function WeekView({ weekStart, onWeekChange, events, examDate, blockedRanges, onDeleteEvent, onMarkDone, onExecuteRevision, onResizeEvent }: Props) {
  const today   = todayISO();
  const monday  = getMondayOfWeek(weekStart);
  const dates   = weekDates(monday);
  const label   = formatWeekLabel(monday);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef   = useRef<HTMLDivElement>(null);
  const [showLinks, setShowLinks] = useState(true);

  function eventsForDay(date: string) {
    return events.filter((e) => e.startDate === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Card className="overflow-hidden" id="qe-week-calendar">
        <CardContent className="p-0">
          {/* Nav bar */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-0.5">
              <button onClick={() => onWeekChange(fromDate(addDays(monday, -7)))} className="rounded p-1 text-muted-foreground hover:bg-muted">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => onWeekChange(fromDate(addDays(monday, 7)))} className="rounded p-1 text-muted-foreground hover:bg-muted">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold tabular-nums capitalize">{label}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowLinks((v) => !v)}
                title={showLinks ? "Masquer les liens de révision" : "Afficher les liens de révision"}
                aria-label="Liens de révision espacée"
                aria-pressed={showLinks}
                className={`no-print rounded p-1 transition-colors hover:bg-muted ${
                  showLinks ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {showLinks ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => onWeekChange(getMondayOfWeek(todayISO()))}
                className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
              >
                Auj.
              </button>
              <button
                onClick={() => printWeek(label, countdownDays(examDate))}
                title="Exporter en PDF"
                className="no-print rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: "32px repeat(7, 1fr)" }}>
            <div />
            {dates.map((date) => {
              const { wd, day } = formatDayHeader(date);
              const isToday = date === today;
              return (
                <div key={date} className={`py-1.5 text-center ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  <div className="text-[9px] font-semibold uppercase tracking-wider">{wd}</div>
                  <div className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-bold tabular-nums ${
                    isToday ? "bg-primary text-primary-foreground" : ""
                  }`}>{day}</div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "460px" }}>
            <div ref={gridRef} className="relative grid" style={{ gridTemplateColumns: "32px repeat(7, 1fr)", height: `${GRID_HEIGHT}px` }}>
              {showLinks && (
                <ChainConnectors
                  scope={gridRef}
                  events={events.filter((e) => dates.includes(e.startDate))}
                  recomputeKey={`${monday}-${events.length}`}
                />
              )}
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
              {dates.map((date) => {
                const isToday   = date === today;
                const isPast    = date < today;
                const dayEvents = eventsForDay(date);
                const blocked   = blockedSpansForDay(blockedRanges, date);
                const nowTop    = (() => {
                  if (!isToday) return null;
                  const now = new Date();
                  const min = now.getHours() * 60 + now.getMinutes() - HOURS_START * 60;
                  const top = (min / 60) * PX_PER_HOUR;
                  return top >= 0 && top <= GRID_HEIGHT ? top : null;
                })();

                return (
                  <DroppableCell
                    key={date}
                    date={date}
                    isPast={isPast}
                    isToday={isToday}
                    blocked={blocked}
                    dayEvents={dayEvents}
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
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        <div className="h-px flex-1 bg-destructive/60" />
                      </div>
                    )}

                    {/* Events */}
                    {dayEvents.map((ev) => {
                      const startMin = timeToMinutes(ev.startTime) - HOURS_START * 60;
                      const top      = (startMin / 60) * PX_PER_HOUR;
                      const height   = Math.max(18, (ev.durationMinutes / 60) * PX_PER_HOUR - 2);
                      return (
                        <EventCard
                          key={ev.id}
                          event={ev}
                          draggable
                          style={{ position: "absolute", top, left: 2, right: 2, height }}
                          onDelete={onDeleteEvent}
                          onMarkDone={onMarkDone}
                          onExecuteRevision={onExecuteRevision}
                          onResizeCommit={onResizeEvent}
                        />
                      );
                    })}
                  </DroppableCell>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 border-t border-border px-3 py-1.5">
            {([["qcm", "✍️ QCM", "bg-primary"], ["lecture", "📖 Lecture", "bg-success"], ["revision_slot", "🔁 Révision", "bg-accent"]] as const).map(([, label, bar]) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-sm ${bar}`} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
            {showLinks && (
              <div className="flex items-center gap-1" title="Lignes reliant un cours à ses révisions J2/J7/J10/J30">
                <svg width="18" height="6" aria-hidden>
                  <path d="M1 3 H17" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" opacity="0.6" />
                </svg>
                <span className="text-[10px] text-muted-foreground">Plan de révision</span>
              </div>
            )}
            {blockedRanges.length > 0 && (
              <div className="flex items-center gap-1" title="Plages non planifiables">
                <div
                  className="h-2 w-2 rounded-sm bg-muted"
                  style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent 0 2px, var(--border) 2px 3px)" }}
                />
                <span className="text-[10px] text-muted-foreground">Plage bloquée</span>
              </div>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
              {minutesToDisplay(
                events
                  .filter((e) => dates.includes(e.startDate) && e.status !== "done")
                  .reduce((s, e) => s + e.durationMinutes, 0)
              )} planifiés cette semaine
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
