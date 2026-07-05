"use client";

import { motion } from "motion/react";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { EVENT_COLORS } from "../lib/colors";
import { minutesToDisplay, todayISO } from "../lib/dateUtils";
import type { CalendarEvent } from "../data/types";
import { COURSES } from "../data/courses";
import { Card, CardContent } from "@/components/ui/card";

function AgendaItem({ event, index }: { event: CalendarEvent; index: number }) {
  const colors = EVENT_COLORS[event.type];
  const done   = event.status === "done";
  const course = COURSES.find((c) => c.id === event.courseId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.05 * index }}
      className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${colors.bg} ${done ? "opacity-60" : ""}`}
    >
      <span className="mt-0.5 text-sm leading-none">{colors.icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[11px] font-semibold ${colors.text}`}>
          {course?.shortTitle ?? course?.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
          <span className="tabular-nums">{event.startTime}</span>
          <span>·</span>
          <span className="tabular-nums">{minutesToDisplay(event.durationMinutes)}</span>
          {event.revisionInterval && (
            <span className={`rounded px-1 text-[8px] font-bold ${colors.badgeBg}`}>{event.revisionInterval}</span>
          )}
        </div>
      </div>
      {done
        ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
        : <Circle       className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/30" />}
    </motion.div>
  );
}

interface Props {
  events: CalendarEvent[];
}

export function TodayAgendaPanel({ events }: Props) {
  const today      = todayISO();
  const todayEvs   = events.filter((e) => e.startDate === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const upcoming   = events
    .filter((e) => e.startDate > today && e.status === "upcoming")
    .sort((a, b) => a.startDate === b.startDate ? a.startTime.localeCompare(b.startTime) : a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  const doneCt  = todayEvs.filter((e) => e.status === "done").length;

  return (
    <div className="flex flex-col gap-3">
      {/* Today */}
      <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-primary" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Aujourd'hui</p>
              <span className="ml-auto text-[9px] tabular-nums text-muted-foreground">
                {doneCt}/{todayEvs.length}
              </span>
            </div>
            {todayEvs.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-muted-foreground">Aucune tâche</p>
            ) : (
              <div className="space-y-1">
                {todayEvs.map((e, i) => <AgendaItem key={e.id} event={e} index={i} />)}
              </div>
            )}
            {todayEvs.length > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${todayEvs.length > 0 ? (doneCt / todayEvs.length) * 100 : 0}%` }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card>
            <CardContent className="p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-[11px] font-bold uppercase tracking-wider">À venir</p>
              </div>
              <div className="space-y-1">
                {upcoming.map((e, i) => (
                  <AgendaItem key={e.id} event={e} index={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
