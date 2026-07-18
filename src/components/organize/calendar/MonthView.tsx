"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Link2, Link2Off } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { monthCalendarDays, yearMonthLabel, nextYearMonth, prevYearMonth, currentYearMonth, formatDayHeader, todayISO } from "../lib/dateUtils";
import { EVENT_COLORS, type EventColorSet } from "../lib/colors";
import { ChainConnectors } from "./ChainConnectors";
import type { CalendarEvent } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function DroppableDay({
  iso, isPast, onClick, className, children,
}: {
  iso: string;
  isPast: boolean;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `mcell-${iso}`,
    data: { date: iso, mode: "day" },
    disabled: isPast,
  });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`${className} ${isOver && !isPast ? "bg-primary/5 ring-2 ring-inset ring-primary/40" : ""}`}
    >
      {children}
    </div>
  );
}

function DraggableChip({ ev, c }: { ev: CalendarEvent; c: EventColorSet }) {
  const done = ev.status === "done";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ev.id,
    disabled: done,
    data: {
      kind: "event",
      startTime: ev.startTime,
      startDate: ev.startDate,
      durationMinutes: ev.durationMinutes,
    },
  });
  return (
    <div
      ref={setNodeRef}
      data-event-id={ev.id}
      {...(done ? {} : listeners)}
      {...attributes}
      onClick={(e) => e.stopPropagation()}
      title={`${ev.title} — ${ev.startTime}${done ? "" : " (glisser pour déplacer)"}`}
      style={transform ? { transform: CSS.Translate.toString(transform) } : undefined}
      className={`relative z-[3] truncate rounded px-1.5 py-1 text-[11px] font-medium ${c.bg} ${c.text}
        ${done ? "" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "opacity-70 ring-1 ring-primary/40" : ""}`}
    >
      {c.icon} {ev.title.replace(/^[^\s]+ /, "").slice(0, 20)}
    </div>
  );
}

interface Props {
  yearMonth: string;
  onYearMonthChange: (ym: string) => void;
  events: CalendarEvent[];
  onDayClick: (iso: string) => void;
}

export function MonthView({ yearMonth, onYearMonthChange, events, onDayClick }: Props) {
  const days  = monthCalendarDays(yearMonth);
  const today = todayISO();
  const gridRef = useRef<HTMLDivElement>(null);
  const [showLinks, setShowLinks] = useState(true);

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
                type="button"
                onClick={() => setShowLinks((v) => !v)}
                title={showLinks ? "Masquer les liens de révision" : "Afficher les liens de révision"}
                aria-label="Liens de révision espacée"
                aria-pressed={showLinks}
                className={`rounded p-1 transition-colors hover:bg-muted ${
                  showLinks ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {showLinks ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
              </button>
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
          <div ref={gridRef} className="relative grid grid-cols-7">
            {showLinks && (
              <ChainConnectors
                scope={gridRef}
                events={events}
                recomputeKey={`${yearMonth}-${events.length}`}
              />
            )}
            {days.map((iso, idx) => {
              if (!iso) return <div key={`empty-${idx}`} className="border-b border-r border-border/50 min-h-[104px]" />;
              const dayEvents = eventsForDay(iso);
              const isToday   = iso === today;
              const isPast    = iso < today;
              const { day }   = formatDayHeader(iso);
              const visible   = dayEvents.slice(0, 3);
              const extra     = dayEvents.length - 3;

              return (
                <DroppableDay
                  key={iso}
                  iso={iso}
                  isPast={isPast}
                  onClick={() => onDayClick(iso)}
                  className={`min-h-[104px] cursor-pointer border-b border-r border-border/50 p-1.5 transition-colors hover:bg-muted/40 ${
                    isPast ? "opacity-60" : ""
                  }`}
                >
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                    isToday
                      ? "bg-primary text-primary-foreground ring-2 ring-primary"
                      : "text-foreground"
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {visible.map((ev) => (
                      <DraggableChip key={ev.id} ev={ev} c={EVENT_COLORS[ev.type]} />
                    ))}
                    {extra > 0 && (
                      <div className="text-[10px] font-medium text-muted-foreground">+{extra} de plus</div>
                    )}
                  </div>
                </DroppableDay>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
