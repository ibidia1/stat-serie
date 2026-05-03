"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  getMondayOfWeek, weekDates, formatWeekLabel, formatDayHeader,
  todayISO, timeToMinutes, minutesToDisplay, addDays, fromDate
} from "../lib/dateUtils";
import { EventCard } from "./EventCard";
import type { CalendarEvent } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";
import { printWeek } from "../lib/pdfExport";
import { countdownDays } from "../lib/dateUtils";

const HOURS_START = 7;
const HOURS_END   = 22;
const PX_PER_HOUR = 56;
const GRID_HEIGHT = (HOURS_END - HOURS_START) * PX_PER_HOUR;

interface DroppableCellProps {
  date: string;
  children: React.ReactNode;
  isPast: boolean;
  isToday: boolean;
}

function DroppableCell({ date, children, isPast, isToday }: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${date}`, data: { date } });
  return (
    <div
      ref={setNodeRef}
      className={`relative border-l border-border/50 ${isToday ? "bg-primary/[0.018]" : ""} ${
        isOver && !isPast ? "bg-primary/10" : ""
      }`}
      style={{ height: `${GRID_HEIGHT}px` }}
    >
      {children}
    </div>
  );
}

interface Props {
  weekStart: string;
  onWeekChange: (iso: string) => void;
  events: CalendarEvent[];
  examDate: string;
  onDeleteEvent: (id: string) => void;
  onMarkDone: (id: string) => void;
  onExecuteRevision: (ev: CalendarEvent) => void;
}

export function WeekView({ weekStart, onWeekChange, events, examDate, onDeleteEvent, onMarkDone, onExecuteRevision }: Props) {
  const today   = todayISO();
  const monday  = getMondayOfWeek(weekStart);
  const dates   = weekDates(monday);
  const label   = formatWeekLabel(monday);
  const scrollRef = useRef<HTMLDivElement>(null);

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
            <div className="grid" style={{ gridTemplateColumns: "32px repeat(7, 1fr)", height: `${GRID_HEIGHT}px` }}>
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
                const nowTop    = (() => {
                  if (!isToday) return null;
                  const now = new Date();
                  const min = now.getHours() * 60 + now.getMinutes() - HOURS_START * 60;
                  const top = (min / 60) * PX_PER_HOUR;
                  return top >= 0 && top <= GRID_HEIGHT ? top : null;
                })();

                return (
                  <DroppableCell key={date} date={date} isPast={isPast} isToday={isToday}>
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
                    {dayEvents.map((ev) => {
                      const startMin = timeToMinutes(ev.startTime) - HOURS_START * 60;
                      const top      = (startMin / 60) * PX_PER_HOUR;
                      const height   = Math.max(18, (ev.durationMinutes / 60) * PX_PER_HOUR - 2);
                      return (
                        <EventCard
                          key={ev.id}
                          event={ev}
                          style={{ position: "absolute", top, left: 2, right: 2, height }}
                          onDelete={onDeleteEvent}
                          onMarkDone={onMarkDone}
                          onExecuteRevision={onExecuteRevision}
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
            {([["qcm", "✍️ QCM", "bg-blue-500"], ["lecture", "📖 Lecture", "bg-emerald-500"], ["revision_slot", "🔁 Révision", "bg-amber-400"]] as const).map(([, label, bar]) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-sm ${bar}`} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
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
