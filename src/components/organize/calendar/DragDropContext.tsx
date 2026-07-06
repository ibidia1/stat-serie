"use client";

import { createContext, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { BacklogItem, CalendarEvent } from "../data/types";
import { timeToMinutes, minutesToHHMM, todayISO } from "../lib/dateUtils";
import { findConflict, findBlocked, clampStart, snap, type BlockedSpan } from "../lib/conflicts";
import { PX_PER_HOUR, DAY_START_MIN } from "./gridConstants";

/** Infos sur le drag en cours, consommées par les cellules pour afficher les créneaux libres. */
export interface DragHint {
  durationMinutes: number;
  /** Id de l'événement déplacé (à ignorer dans le calcul des créneaux libres). */
  ignoreId?: string;
}
export const DragHintContext = createContext<DragHint | null>(null);

interface Props {
  children: React.ReactNode;
  events: CalendarEvent[];
  blockedForDay: (date: string) => BlockedSpan[];
  onMoveEvent: (id: string, newDate: string, newTime: string) => void;
  onBacklogDrop?: (item: BacklogItem, date: string, startMin: number | null) => void;
  onReject?: (message: string) => void;
}

/** Position temporelle du drop, mesurée sur les éléments réels à l'écran
 * (les rects de dnd-kit dérivent quand la grille auto-défile pendant le drag). */
function dropStartMin(
  draggedSelector: string,
  destDate: string,
  durationMin: number,
): number | null {
  const draggedEl = document.querySelector<HTMLElement>(draggedSelector);
  const cellEl = document.querySelector<HTMLElement>(`[data-day-cell="${destDate}"]`);
  if (!draggedEl || !cellEl) return null;
  const offsetPx = draggedEl.getBoundingClientRect().top - cellEl.getBoundingClientRect().top;
  return clampStart(snap(DAY_START_MIN + (offsetPx / PX_PER_HOUR) * 60), durationMin);
}

export function DragDropContext({ children, events, blockedForDay, onMoveEvent, onBacklogDrop, onReject }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [hint, setHint] = useState<DragHint | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | { kind?: string; durationMinutes?: number }
      | undefined;
    if (!data?.kind) return;
    setHint({
      durationMinutes: data.durationMinutes ?? 30,
      ignoreId: data.kind === "event" ? String(event.active.id) : undefined,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setHint(null);
    const { active, over, delta } = event;
    if (!over) return;

    const data = active.data.current as
      | {
          kind?: string;
          startTime?: string;
          startDate?: string;
          durationMinutes?: number;
          backlogItem?: BacklogItem;
        }
      | undefined;
    if (!data?.kind) return;

    const over2 = over.data.current as { date?: string; mode?: string } | undefined;

    // ── Backlog item dropped on the calendar → schedule it ──
    if (data.kind === "backlog" && data.backlogItem) {
      const destDate = over2?.date;
      if (!destDate || !onBacklogDrop) return;
      if (destDate < todayISO()) {
        onReject?.("Impossible de planifier dans le passé.");
        return;
      }
      const startMin =
        over2?.mode === "time"
          ? dropStartMin(
              `[data-backlog-id="${CSS.escape(data.backlogItem.id)}"]`,
              destDate,
              data.durationMinutes ?? 30,
            )
          : null;
      onBacklogDrop(data.backlogItem, destDate, startMin);
      return;
    }

    // ── Calendar event repositioned ──────────────────────────
    if (data.kind !== "event" || !data.startTime || data.durationMinutes == null) return;

    const destDate = over2?.date ?? data.startDate;
    if (!destDate) return;

    if (destDate < todayISO()) {
      onReject?.("Impossible de planifier dans le passé.");
      return;
    }

    const duration = data.durationMinutes;
    let startMin: number;

    if (over2?.mode === "time") {
      startMin =
        dropStartMin(`[data-event-id="${CSS.escape(String(active.id))}"]`, destDate, duration) ??
        clampStart(
          snap(timeToMinutes(data.startTime) + Math.round((delta.y / PX_PER_HOUR) * 60)),
          duration,
        );
    } else {
      // Month view: day-level move, time preserved.
      startMin = timeToMinutes(data.startTime);
    }

    const newTime = minutesToHHMM(startMin);
    if (destDate === data.startDate && newTime === data.startTime) return; // no-op

    const blocked = findBlocked(blockedForDay(destDate), startMin, duration);
    if (blocked) {
      onReject?.(`Créneau dans la plage bloquée « ${blocked.label} ».`);
      return;
    }

    const conflict = findConflict(events, destDate, startMin, duration, String(active.id));
    if (conflict) {
      onReject?.(`Créneau déjà occupé par « ${conflict.title.replace(/^[^\s]+ /, "")} ».`);
      return;
    }

    onMoveEvent(String(active.id), destDate, newTime);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setHint(null)}
    >
      <DragHintContext.Provider value={hint}>{children}</DragHintContext.Provider>
    </DndContext>
  );
}
