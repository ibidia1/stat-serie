"use client";

import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EVENT_COLORS } from "../lib/colors";
import { minutesToDisplay, todayISO, formatFullDate } from "../lib/dateUtils";
import type { CalendarEvent } from "../data/types";
import { COURSES } from "../data/courses";

interface Props {
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export function DailyRitualMorningDialog({ open, onClose, events }: Props) {
  const today     = todayISO();
  const todayEvs  = events.filter((e) => e.startDate === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const totalMins = todayEvs.filter((e) => e.status === "upcoming").reduce((s, e) => s + e.durationMinutes, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-md">
      <DialogHeader onClose={onClose}>👋 Bonjour !</DialogHeader>
      <DialogBody className="space-y-3">
        <p className="text-xs text-muted-foreground capitalize">{formatFullDate(today)}</p>
        <p className="text-sm font-semibold tracking-tight">Voici ton plan pour aujourd'hui :</p>

        {todayEvs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aucune tâche planifiée — profite ou ajoute quelque chose 😊</p>
        ) : (
          <div className="space-y-1.5">
            {todayEvs.map((ev) => {
              const colors = EVENT_COLORS[ev.type];
              const course = COURSES.find((c) => c.id === ev.courseId);
              return (
                <div key={ev.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${colors.bg}`}>
                  <span className="text-sm">{colors.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-semibold ${colors.text}`}>
                      {course?.shortTitle ?? course?.title}
                      {ev.revisionInterval && <span className="ml-1 text-[10px] opacity-70">{ev.revisionInterval}</span>}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {ev.startTime} · {minutesToDisplay(ev.durationMinutes)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {totalMins > 0 && (
          <p className="text-xs font-semibold text-muted-foreground tabular-nums">
            Total : <span className="text-foreground">{minutesToDisplay(totalMins)}</span> planifiés.
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} className="text-xs">
          C'est parti 🚀
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
