"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, fromDate, formatFullDate, todayISO, minutesToDisplay } from "../lib/dateUtils";
import { EVENT_COLORS } from "../lib/colors";
import type { CalendarEvent } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";
import { COURSES } from "../data/courses";

interface Props {
  date: string;
  onDateChange: (iso: string) => void;
  events: CalendarEvent[];
  onMarkDone: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onExecuteRevision: (ev: CalendarEvent) => void;
}

export function DayView({ date, onDateChange, events, onMarkDone, onDeleteEvent, onExecuteRevision }: Props) {
  const today     = todayISO();
  const dayEvents = events.filter((e) => e.startDate === date).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Card>
        <CardContent className="p-0">
          {/* Nav */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <button onClick={() => onDateChange(fromDate(addDays(date, -1)))} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold capitalize">{formatFullDate(date)}</p>
            <div className="flex items-center gap-1">
              {date !== today && (
                <button onClick={() => onDateChange(today)} className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted">
                  Auj.
                </button>
              )}
              <button onClick={() => onDateChange(fromDate(addDays(date, 1)))} className="rounded p-1 text-muted-foreground hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Events */}
          <div className="divide-y divide-border">
            {dayEvents.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Aucune tâche ce jour</p>
            ) : (
              dayEvents.map((ev, i) => {
                const colors = EVENT_COLORS[ev.type];
                const course = COURSES.find((c) => c.id === ev.courseId);
                const done   = ev.status === "done";
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 * i }}
                    className={`flex items-start gap-3 px-4 py-3 ${done ? "opacity-60" : ""}`}
                  >
                    <div className={`mt-1 h-3 w-1 shrink-0 rounded-full ${colors.bar}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{ev.title}</span>
                        {ev.revisionInterval && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${colors.badgeBg}`}>
                            {ev.revisionInterval}
                          </span>
                        )}
                        {done && <span className="text-[10px] text-success">✅ Fait</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {course?.specialty} · {ev.startTime} · {minutesToDisplay(ev.durationMinutes)}
                        {ev.estimatedFromKpi && <span className="ml-1 text-[10px]">(estimé)</span>}
                      </p>
                      {ev.notes && <p className="mt-1 text-xs text-muted-foreground">{ev.notes}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!done && ev.type !== "revision_slot" && (
                        <button
                          onClick={() => onMarkDone(ev.id)}
                          className="rounded-lg border border-success/30 bg-success/[0.08] px-2 py-1 text-[11px] font-semibold text-success hover:bg-success/[0.14]"
                        >
                          Fait ✅
                        </button>
                      )}
                      {!done && ev.type === "revision_slot" && (
                        <button
                          onClick={() => onExecuteRevision(ev)}
                          className="rounded-lg border border-accent/30 bg-accent/[0.08] px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent/[0.14]"
                        >
                          Lancer 🔁
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
