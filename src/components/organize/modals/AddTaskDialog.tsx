"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCourseSearch } from "../hooks/useCourseSearch";
import { getSeriesForCourse } from "../data/series";
import { estimateDuration } from "../hooks/useEstimation";
import { minutesToDisplay, todayISO } from "../lib/dateUtils";
import type { EventType, CalendarEvent } from "../data/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAddEvent: (ev: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) => void;
  onAddToBacklog: (type: EventType, courseId: number, seriesId?: string) => void;
}

export function AddTaskDialog({ open, onClose, onAddEvent, onAddToBacklog }: Props) {
  const [type,       setType]       = useState<EventType>("qcm");
  const [courseQ,    setCourseQ]    = useState("");
  const [courseId,   setCourseId]   = useState<number | null>(null);
  const [seriesId,   setSeriesId]   = useState<string | undefined>(undefined);
  const [date,       setDate]       = useState(todayISO());
  const [time,       setTime]       = useState("09:00");
  const [durMins,    setDurMins]    = useState<number | null>(null);
  const [notes,      setNotes]      = useState("");

  const { results: courseResults } = useCourseSearch(8);
  const filtered = courseQ ? courseResults.filter((c) =>
    c.title.toLowerCase().includes(courseQ.toLowerCase()) ||
    c.number.toString().includes(courseQ)
  ) : courseResults;

  const series = courseId ? getSeriesForCourse(courseId) : [];
  const selectedSeries = series.find((s) => s.id === seriesId);
  const estimatedDur   = selectedSeries ? estimateDuration(selectedSeries.numberOfQuestions) : null;
  const displayDur     = durMins ?? estimatedDur;

  function handleSchedule() {
    if (!courseId) return;
    const course = filtered.find((c) => c.id === courseId) ?? null;
    const title = type === "qcm"
      ? `✍️ QCM ${course?.shortTitle ?? course?.title ?? "Cours #" + courseId}`
      : `📖 Lecture ${course?.shortTitle ?? course?.title ?? "Cours #" + courseId}`;
    onAddEvent({
      type,
      courseId,
      seriesId,
      title,
      startDate: date,
      startTime: time,
      durationMinutes: displayDur ?? 30,
      estimatedFromKpi: durMins === null && estimatedDur !== null,
      notes: notes || undefined,
      isRevision: false,
      status: "upcoming",
    });
    onClose();
    reset();
  }

  function handleBacklog() {
    if (!courseId) return;
    onAddToBacklog(type, courseId, seriesId);
    onClose();
    reset();
  }

  function reset() {
    setCourseQ(""); setCourseId(null); setSeriesId(undefined);
    setDate(todayISO()); setTime("09:00"); setDurMins(null); setNotes("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-md">
      <DialogHeader onClose={onClose}>➕ Nouvelle tâche</DialogHeader>
      <DialogBody className="space-y-4">
        {/* Type */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</p>
          <div className="flex gap-2">
            {([["qcm", "✍️ QCM"], ["lecture", "📖 Lecture"]] as [EventType, string][]).map(([t, label]) => (
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

        {/* Cours */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cours</p>
          <input
            value={courseQ}
            onChange={(e) => { setCourseQ(e.target.value); setCourseId(null); setSeriesId(undefined); }}
            placeholder="Nom ou numéro du cours…"
            className="mb-1 h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {courseQ && !courseId && (
            <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-card">
              {filtered.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCourseId(c.id); setCourseQ(c.title); }}
                  className="flex w-full gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted"
                >
                  <span className="font-mono text-muted-foreground">#{c.number}</span>
                  <span>{c.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Série (QCM only) */}
        {type === "qcm" && courseId && series.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Série</p>
            <select
              value={seriesId ?? ""}
              onChange={(e) => setSeriesId(e.target.value || undefined)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">— Sélectionner —</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  ⭐{s.rating.toFixed(1)} · {s.year} {s.faculty} · {s.numberOfQuestions} Q
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date / Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Heure</p>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>

        {/* Durée */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Durée {estimatedDur && !durMins ? <span className="normal-case font-normal">(estimée depuis tes stats)</span> : ""}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="5"
              step="5"
              value={displayDur ?? ""}
              placeholder={estimatedDur ? String(estimatedDur) : "—"}
              onChange={(e) => setDurMins(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="h-9 w-24 rounded-lg border border-border bg-card px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className="text-xs text-muted-foreground">min</span>
            {displayDur && <span className="text-xs font-semibold text-foreground tabular-nums">= {minutesToDisplay(displayDur)}</span>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes (optionnel)</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 280))}
            placeholder="Remarques…"
            className="text-xs"
            rows={2}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <button onClick={handleBacklog} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
          Backlog
        </button>
        <Button onClick={onClose} className="bg-muted text-foreground hover:bg-muted/80 shadow-none text-xs">
          Annuler
        </Button>
        <Button onClick={handleSchedule} disabled={!courseId} className="text-xs">
          Planifier ➜
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
