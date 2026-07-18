"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";

interface Props {
  /** Called with a signed number of steps (weeks / months / days) to move. */
  onStep: (delta: number) => void;
  /** Libellé de l'unité, ex. « semaine ». */
  unitLabel: string;
}

const STEP_PX = 46; // distance de glissement pour un pas
const MAX_TRAVEL = 130;

/**
 * Curseur horizontal « jog » : on glisse la poignée à gauche/droite pour
 * reculer/avancer dans le temps. La poignée revient au centre au relâchement.
 */
export function TimelineScrubber({ onStep, unitLabel }: Props) {
  const [thumbX, setThumbX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(0);
  const startX = useRef(0);
  const lastSteps = useRef(0);

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    startX.current = e.clientX;
    lastSteps.current = 0;
    setDragging(true);
    setPreview(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    setThumbX(Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, dx)));
    const steps = Math.round(dx / STEP_PX);
    setPreview(steps);
    if (steps !== lastSteps.current) {
      onStep(steps - lastSteps.current);
      lastSteps.current = steps;
    }
  }
  function endDrag(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setThumbX(0);
    setPreview(0);
    lastSteps.current = 0;
  }

  const previewLabel =
    preview === 0
      ? `Glissez pour naviguer dans le temps`
      : `${preview > 0 ? "+" : ""}${preview} ${unitLabel}${Math.abs(preview) > 1 && !unitLabel.endsWith("s") ? "s" : ""}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label={`Reculer d'une ${unitLabel}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative h-9 flex-1 overflow-hidden rounded-full border border-border bg-muted/50">
        {/* Repères */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0 22px, var(--border) 22px 23px)",
          }}
        />
        {/* Repère central */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1 bottom-1 w-px -translate-x-1/2 bg-primary/40" />
        {/* Libellé */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-medium tabular-nums ${
            dragging ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {previewLabel}
        </div>
        {/* Poignée */}
        <button
          type="button"
          aria-label="Glisser pour naviguer dans le temps"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ transform: `translate(calc(-50% + ${thumbX}px), -50%)` }}
          className={`absolute left-1/2 top-1/2 grid h-7 w-12 cursor-ew-resize touch-none place-items-center rounded-full bg-card text-muted-foreground shadow-md ring-1 ring-border transition-colors hover:text-foreground ${
            dragging ? "ring-primary/50 text-primary" : ""
          }`}
        >
          <GripHorizontal className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label={`Avancer d'une ${unitLabel}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
