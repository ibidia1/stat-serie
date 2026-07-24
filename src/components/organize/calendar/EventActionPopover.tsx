"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { RotateCcw, Sparkles, X } from "lucide-react";
import type { CalendarEvent } from "../data/types";
import { COURSES } from "../data/courses";

export interface ActionAnchor {
  event: CalendarEvent;
  rect: DOMRect;
}

interface Props {
  anchor: ActionAnchor;
  onClose: () => void;
  /** Crée une révision liée à `event`, `days` jours après le cours. */
  onCreateRevision: (event: CalendarEvent, days: number) => void;
}

const PRESETS = [2, 7, 10, 30];
const POP_W = 264;

export function EventActionPopover({ anchor, onClose, onCreateRevision }: Props) {
  const { event, rect } = anchor;
  const [custom, setCustom] = useState("");
  const course = COURSES.find((c) => c.id === event.courseId);
  const shortName = course?.shortTitle ?? course?.title ?? `Cours #${event.courseId}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Positionnement sous la carte, borné à la fenêtre.
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - POP_W - 8);
  const below = rect.bottom + 8;
  const top = below + 190 > window.innerHeight ? Math.max(8, rect.top - 190) : below;

  function create(days: number) {
    if (!Number.isFinite(days) || days <= 0) return;
    onCreateRevision(event, days);
    onClose();
  }

  return (
    <>
      {/* Backdrop de fermeture */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} onPointerDown={(e) => e.stopPropagation()} />
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        style={{ position: "fixed", left, top, width: POP_W }}
        className="z-[91] rounded-xl border border-border bg-card p-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">{shortName}</p>
            <p className="text-[10px] text-muted-foreground">
              {event.startDate} · {event.startTime}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-accent">
          <RotateCcw className="h-3.5 w-3.5" />
          Créer une révision liée
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => create(d)}
              className="rounded-lg border border-accent/30 bg-accent/[0.08] py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent/[0.16]"
            >
              J{d}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Perso.</span>
          <div className="flex items-center rounded-lg border border-border">
            <span className="pl-2 text-[11px] font-semibold text-muted-foreground">J+</span>
            <input
              type="number"
              min={1}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") create(parseInt(custom, 10)); }}
              placeholder="14"
              className="h-7 w-12 bg-transparent px-1 text-xs text-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={() => create(parseInt(custom, 10))}
            disabled={!custom}
            className="ml-auto rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Créer
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Placée sans chevauchement, reliée à ce cours.
        </div>
      </motion.div>
    </>
  );
}
