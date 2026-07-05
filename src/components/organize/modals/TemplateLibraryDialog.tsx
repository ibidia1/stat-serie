"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PlanTemplate, CalendarEvent } from "../data/types";
import { todayISO, addDays, fromDate } from "../lib/dateUtils";
import { COURSES } from "../data/courses";

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "marathon-3-mois",
    name: "Marathon — 3 mois avant résidanat",
    description: "Couvre les 75 cours en 12 semaines, rythme intensif",
    durationWeeks: 12,
    weeklyDistribution: { lectures: 6, qcmSeries: 8, revisions: 5 },
  },
  {
    id: "sprint-flash",
    name: "Sprint flash — 2 semaines",
    description: "Révisions ciblées sur les cours non maîtrisés",
    durationWeeks: 2,
    weeklyDistribution: { lectures: 0, qcmSeries: 12, revisions: 15 },
  },
  {
    id: "fond-6-mois",
    name: "Fond — 6 mois en douceur",
    description: "Apprentissage progressif, 1-2h par jour",
    durationWeeks: 24,
    weeklyDistribution: { lectures: 3, qcmSeries: 4, revisions: 3 },
  },
];

function generateTemplateEvents(template: PlanTemplate): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = todayISO();
  let dayOffset = 0;

  for (let week = 0; week < template.durationWeeks; week++) {
    const { lectures, qcmSeries, revisions } = template.weeklyDistribution;

    // Distribute across 5 working days
    const slots = [
      ...Array(lectures).fill("lecture"),
      ...Array(qcmSeries).fill("qcm"),
      ...Array(revisions).fill("revision_slot"),
    ];

    slots.forEach((type, i) => {
      const dayInWeek = i % 5; // Mon-Fri
      const dOffset   = week * 7 + dayInWeek;
      const courseIdx = (week * 10 + i) % COURSES.length;
      const course    = COURSES[courseIdx];
      const now       = new Date().toISOString();

      events.push({
        id: `tpl-${template.id}-${week}-${i}`,
        type: type as CalendarEvent["type"],
        courseId: course.id,
        title: type === "qcm"
          ? `✍️ QCM ${course.shortTitle ?? course.title}`
          : type === "lecture"
          ? `📖 Lecture ${course.shortTitle ?? course.title}`
          : `🔁 Révision ${course.shortTitle ?? course.title}`,
        startDate: fromDate(addDays(today, dOffset + dayOffset + 1)),
        startTime: ["08:30", "10:00", "14:00", "15:30", "17:00"][dayInWeek],
        durationMinutes: type === "qcm" ? 25 : type === "lecture" ? 50 : 20,
        estimatedFromKpi: false,
        isRevision: type === "revision_slot",
        status: "upcoming",
        createdAt: now,
        updatedAt: now,
      });
    });
  }
  return events;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (events: CalendarEvent[]) => void;
}

export function TemplateLibraryDialog({ open, onClose, onApply }: Props) {
  const [selected,   setSelected]   = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleApply() {
    if (!selected) return;
    const tpl = PLAN_TEMPLATES.find((t) => t.id === selected)!;
    onApply(generateTemplateEvents(tpl));
    onClose();
    setSelected(null);
    setConfirming(false);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-lg">
      <DialogHeader onClose={onClose}>📅 Templates de plan</DialogHeader>
      <DialogBody className="space-y-3">
        {!confirming ? (
          PLAN_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setSelected(tpl.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted ${
                selected === tpl.id ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="text-sm font-bold tracking-tight">{tpl.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{tpl.description}</p>
              <div className="mt-2 flex gap-3 text-[11px] tabular-nums text-muted-foreground">
                <span>📖 {tpl.weeklyDistribution.lectures}/sem</span>
                <span>✍️ {tpl.weeklyDistribution.qcmSeries}/sem</span>
                <span>🔁 {tpl.weeklyDistribution.revisions}/sem</span>
                <span className="ml-auto">{tpl.durationWeeks} sem.</span>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
            <p className="text-sm font-semibold text-accent">
              Confirmer l'application du template ?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Les nouveaux événements seront ajoutés à ton calendrier existant.
            </p>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose} className="bg-muted text-foreground hover:bg-muted/80 shadow-none text-xs">
          Annuler
        </Button>
        {!confirming ? (
          <Button
            disabled={!selected}
            onClick={() => setConfirming(true)}
            className="text-xs"
          >
            Appliquer ce plan
          </Button>
        ) : (
          <Button onClick={handleApply} className="text-xs bg-accent hover:bg-accent/80 text-accent-foreground">
            Confirmer ✓
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
