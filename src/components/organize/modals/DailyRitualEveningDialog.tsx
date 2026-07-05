"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EVENT_COLORS } from "../lib/colors";
import { minutesToDisplay, todayISO } from "../lib/dateUtils";
import { Star } from "lucide-react";
import type { CalendarEvent } from "../data/types";
import { COURSES } from "../data/courses";

interface Props {
  open: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  onMarkSkipped: (id: string) => void;
}

export function DailyRitualEveningDialog({ open, onClose, events, onMarkSkipped }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [hover,  setHover]  = useState<number | null>(null);

  const today    = todayISO();
  const todayEvs = events.filter((e) => e.startDate === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const done     = todayEvs.filter((e) => e.status === "done");
  const upcoming = todayEvs.filter((e) => e.status === "upcoming");
  const pct      = todayEvs.length > 0 ? Math.round((done.length / todayEvs.length) * 100) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-md">
      <DialogHeader onClose={onClose}>🌙 Bilan de ta journée</DialogHeader>
      <DialogBody className="space-y-4">
        <p className="text-sm font-semibold">
          Tu as accompli {done.length} / {todayEvs.length} tâches aujourd'hui.
        </p>

        {/* Progress bar */}
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-[11px] tabular-nums text-muted-foreground">{pct}%</p>

        {/* Done events */}
        <div className="space-y-1">
          {done.map((ev) => {
            const colors = EVENT_COLORS[ev.type];
            const course = COURSES.find((c) => c.id === ev.courseId);
            return (
              <div key={ev.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${colors.bg}`}>
                <span>✅</span>
                <span className={`truncate text-xs font-semibold ${colors.text}`}>
                  {course?.shortTitle ?? course?.title} · {minutesToDisplay(ev.durationMinutes)}
                </span>
              </div>
            );
          })}
          {upcoming.map((ev) => {
            const colors = EVENT_COLORS[ev.type];
            const course = COURSES.find((c) => c.id === ev.courseId);
            return (
              <div key={ev.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${colors.bg} opacity-70`}>
                <span>⏭️</span>
                <span className={`flex-1 truncate text-xs ${colors.text}`}>
                  {course?.shortTitle ?? course?.title}
                </span>
                <button
                  onClick={() => onMarkSkipped(ev.id)}
                  className="shrink-0 text-[10px] text-muted-foreground underline hover:text-foreground"
                >
                  Reporter
                </button>
              </div>
            );
          })}
        </div>

        {/* Day rating */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Note ta journée :</p>
          <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
            {Array.from({ length: 5 }, (_, i) => {
              const n = i + 1;
              const filled = n <= (hover ?? rating ?? 0);
              return (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  className="rounded p-0.5 focus:outline-none"
                >
                  <Star className={`h-5 w-5 ${filled ? "fill-accent text-accent" : "text-border"}`} />
                </button>
              );
            })}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} className="text-xs">
          Terminer la journée ➜
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
