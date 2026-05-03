"use client";

import { motion } from "motion/react";
import { COURSES } from "../data/courses";
import { countdownDays, todayISO, addDays, fromDate } from "../lib/dateUtils";
import type { CalendarEvent } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";
import { parseISO, format, startOfWeek, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_COLOR: Record<string, string> = {
  completed:   "bg-success",
  in_progress: "bg-accent",
  not_started: "bg-muted",
};

interface Props {
  examDate: string;
  events: CalendarEvent[];
}

export function MacroPlanView({ examDate, events }: Props) {
  const today      = todayISO();
  const daysLeft   = countdownDays(examDate);
  const weeksLeft  = Math.max(1, Math.ceil(daysLeft / 7));
  const pace       = (75 / weeksLeft).toFixed(1);
  const completed  = COURSES.filter((c) => c.status === "completed").length;
  const inProgress = COURSES.filter((c) => c.status === "in_progress").length;

  // Build week columns from now to exam
  const numWeeks = Math.min(weeksLeft, 52);
  const weeks = Array.from({ length: numWeeks }, (_, i) => {
    const monday = startOfWeek(addWeeks(parseISO(today), i), { weekStartsOn: 1 });
    const label  = format(monday, "d MMM", { locale: fr });
    const endIso = fromDate(addDays(monday.toISOString().slice(0, 10), 6));
    const weekEvents = events.filter((e) => e.startDate >= monday.toISOString().slice(0, 10) && e.startDate <= endIso);
    const courseIds  = [...new Set(weekEvents.map((e) => e.courseId))];
    const weekCourses = COURSES.filter((c) => courseIds.includes(c.id));
    return { label, courses: weekCourses };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
        <CardContent className="p-5">
          {/* Stats header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan macro</p>
              <p className="mt-1 text-sm font-bold tracking-tight">Vue d'ensemble du programme</p>
            </div>
            <div className="flex gap-4 text-right text-xs tabular-nums">
              <div>
                <p className="text-muted-foreground">Cours terminés</p>
                <p className="font-bold text-success">{completed} / 75</p>
              </div>
              <div>
                <p className="text-muted-foreground">En cours</p>
                <p className="font-bold text-accent">{inProgress}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Semaines restantes</p>
                <p className="font-bold text-primary">{weeksLeft}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rythme</p>
                <p className="font-bold">{pace} cours/sem.</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-success"
              initial={{ width: 0 }}
              animate={{ width: `${(completed / 75) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>

          {/* Weekly columns */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2" style={{ minWidth: `${Math.min(numWeeks, 20) * 80}px` }}>
              {weeks.slice(0, 20).map((week, i) => (
                <div key={i} className="flex w-20 shrink-0 flex-col gap-1">
                  <p className="text-[9px] font-semibold text-muted-foreground capitalize">{week.label}</p>
                  {week.courses.length === 0 ? (
                    <div className="h-6 rounded border border-dashed border-border" />
                  ) : (
                    week.courses.map((c) => (
                      <div
                        key={c.id}
                        title={c.title}
                        className={`rounded px-1 py-0.5 text-[8px] font-semibold truncate text-white ${STATUS_COLOR[c.status]}`}
                      >
                        {c.shortTitle ?? c.title.slice(0, 8)}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-[10px]">
            {([["completed", "bg-success", "Terminé"], ["in_progress", "bg-accent", "En cours"], ["not_started", "bg-muted", "Non commencé"]] as const).map(([, bg, label]) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`h-2.5 w-2.5 rounded ${bg}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
