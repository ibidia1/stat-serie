"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthCalendarDays, yearMonthLabel, nextYearMonth, prevYearMonth, currentYearMonth, formatDayHeader, todayISO } from "../lib/dateUtils";
import { EVENT_COLORS } from "../lib/colors";
import type { CalendarEvent } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface Props {
  yearMonth: string;
  onYearMonthChange: (ym: string) => void;
  events: CalendarEvent[];
  onDayClick: (iso: string) => void;
}

export function MonthView({ yearMonth, onYearMonthChange, events, onDayClick }: Props) {
  const days  = monthCalendarDays(yearMonth);
  const today = todayISO();

  function eventsForDay(iso: string) {
    return events.filter((e) => e.startDate === iso).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Nav */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <button onClick={() => onYearMonthChange(prevYearMonth(yearMonth))} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold capitalize tabular-nums">{yearMonthLabel(yearMonth)}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onYearMonthChange(currentYearMonth())}
                className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
              >
                Auj.
              </button>
              <button onClick={() => onYearMonthChange(nextYearMonth(yearMonth))} className="rounded p-1 text-muted-foreground hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekdays header */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {w}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((iso, idx) => {
              if (!iso) return <div key={`empty-${idx}`} className="border-b border-r border-border/50 min-h-[80px]" />;
              const dayEvents = eventsForDay(iso);
              const isToday   = iso === today;
              const isPast    = iso < today;
              const { day }   = formatDayHeader(iso);
              const visible   = dayEvents.slice(0, 3);
              const extra     = dayEvents.length - 3;

              return (
                <div
                  key={iso}
                  onClick={() => onDayClick(iso)}
                  className={`min-h-[80px] cursor-pointer border-b border-r border-border/50 p-1 transition-colors hover:bg-muted/40 ${
                    isPast ? "opacity-60" : ""
                  }`}
                >
                  <div className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                    isToday
                      ? "bg-primary text-primary-foreground ring-2 ring-primary"
                      : "text-foreground"
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {visible.map((ev) => {
                      const c = EVENT_COLORS[ev.type];
                      return (
                        <div
                          key={ev.id}
                          className={`truncate rounded px-1 py-0.5 text-[9px] font-medium ${c.bg} ${c.text}`}
                        >
                          {c.icon} {ev.title.replace(/^[^\s]+ /, "").slice(0, 18)}
                        </div>
                      );
                    })}
                    {extra > 0 && (
                      <div className="text-[9px] text-muted-foreground">+{extra} de plus</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
