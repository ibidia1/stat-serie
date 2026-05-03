"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star } from "lucide-react";
import { getSeriesForCourse } from "../data/series";
import { estimateDuration } from "../hooks/useEstimation";
import { minutesToDisplay, todayISO } from "../lib/dateUtils";
import type { Course, EventType, Series } from "../data/types";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<Series["userStatus"], string> = {
  not_done: "⚪ Non faite",
  partial:  "🟡 Partielle",
  done:     "✅ Faite",
};

interface Props {
  course: Course;
  onClose: () => void;
  onSchedule: (type: EventType, seriesId: string | undefined, date: string, time: string) => void;
  onBacklog: (type: EventType, seriesId: string | undefined) => void;
}

export function SeriesPickerPopover({ course, onClose, onSchedule, onBacklog }: Props) {
  const [type, setType] = useState<EventType>("qcm");
  const [selectedSeries, setSelectedSeries] = useState<string | undefined>(undefined);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("09:00");

  const series = getSeriesForCourse(course.id);

  const selectedS = series.find((s) => s.id === selectedSeries);
  const duration  = selectedS ? estimateDuration(selectedS.numberOfQuestions) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-[500px] rounded-xl border border-border bg-card shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-bold tracking-tight">Cours #{course.number} — {course.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {course.specialty} · {course.day} · {series.length} séries
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* Type toggle */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</p>
          <div className="flex gap-2">
            {([["qcm", "✍️ QCM"], ["lecture", "📖 Lecture"]] as [EventType, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  type === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Series list (QCM only) */}
        {type === "qcm" && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Série (triée par note, non faites en premier)
            </p>
            <div className="max-h-[200px] overflow-y-auto space-y-1 rounded-lg border border-border">
              {series.map((s) => {
                const dur = estimateDuration(s.numberOfQuestions);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeries(s.id === selectedSeries ? undefined : s.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted ${
                      selectedSeries === s.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">{s.rating.toFixed(1)}</span>
                      <span className="truncate text-xs text-foreground">
                        {s.year} · FM{s.faculty.slice(0, 1)} {s.faculty}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-muted-foreground tabular-nums">{s.numberOfQuestions} Q</p>
                      <p className="text-[10px] tabular-nums text-muted-foreground">
                        {dur ? `~${minutesToDisplay(dur)}` : "—"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{STATUS_LABEL[s.userStatus]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {type === "lecture" && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Lecture du cours #{course.number} — durée estimée : <span className="font-semibold">—</span>
            </p>
          </div>
        )}

        {/* Duration preview */}
        {type === "qcm" && selectedS && (
          <p className="text-[11px] text-muted-foreground">
            Durée estimée :{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {duration ? minutesToDisplay(duration) : "—"}
            </span>
            {duration && <span className="ml-1">(depuis tes stats)</span>}
          </p>
        )}

        {/* Date / time */}
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="w-28">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Heure</p>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
        <button
          onClick={() => onBacklog(type, selectedSeries)}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Ajouter au backlog
        </button>
        <Button
          className="text-xs"
          onClick={() => {
            onSchedule(type, selectedSeries, date, time);
            onClose();
          }}
        >
          Planifier ➜
        </Button>
      </div>
    </motion.div>
  );
}
