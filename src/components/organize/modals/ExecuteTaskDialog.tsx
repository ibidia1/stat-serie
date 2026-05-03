"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSeriesForCourse } from "../data/series";
import { estimateDuration } from "../hooks/useEstimation";
import { minutesToDisplay } from "../lib/dateUtils";
import { Star } from "lucide-react";
import type { CalendarEvent, EventType } from "../data/types";
import { COURSES } from "../data/courses";

interface Props {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onLaunch: (eventId: string, type: EventType, seriesId?: string) => void;
}

export function ExecuteTaskDialog({ open, event, onClose, onLaunch }: Props) {
  const [type,     setType]     = useState<EventType>("qcm");
  const [seriesId, setSeriesId] = useState<string | undefined>(undefined);

  if (!event) return null;

  const course  = COURSES.find((c) => c.id === event.courseId);
  const series  = getSeriesForCourse(event.courseId);
  const selSer  = series.find((s) => s.id === seriesId);
  const dur     = selSer ? estimateDuration(selSer.numberOfQuestions) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-md">
      <DialogHeader onClose={onClose}>🔁 Exécuter la révision</DialogHeader>
      <DialogBody className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 dark:border-amber-700/40 dark:bg-amber-950/30">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{event.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {course?.specialty} · {event.revisionInterval}
          </p>
        </div>

        {/* Type */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Comment réviser ?</p>
          <div className="flex gap-2">
            {([["qcm", "✍️ QCM (active recall)"], ["lecture", "📖 Relecture"]] as [EventType, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Series (QCM only) */}
        {type === "qcm" && (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Série (recommandées par note)
            </p>
            <div className="max-h-[180px] overflow-y-auto space-y-1 rounded-lg border border-border">
              {series.map((s) => {
                const d = estimateDuration(s.numberOfQuestions);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSeriesId(s.id === seriesId ? undefined : s.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted ${
                      seriesId === s.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">{s.rating.toFixed(1)}</span>
                    <span className="flex-1 text-xs">{s.year} · FM{s.faculty.slice(0,1)} {s.faculty}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {s.numberOfQuestions} Q {d ? `· ~${minutesToDisplay(d)}` : ""}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {s.userStatus === "done" ? "✅" : s.userStatus === "partial" ? "🟡" : "⚪"}
                    </span>
                  </button>
                );
              })}
            </div>
            {dur && (
              <p className="mt-1.5 text-[11px] text-muted-foreground tabular-nums">
                Durée estimée : <span className="font-semibold text-foreground">{minutesToDisplay(dur)}</span>
              </p>
            )}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} className="bg-muted text-foreground hover:bg-muted/80 shadow-none text-xs">
          Annuler
        </Button>
        <Button
          onClick={() => { onLaunch(event.id, type, seriesId); onClose(); }}
          className="text-xs"
        >
          Lancer 🚀
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
