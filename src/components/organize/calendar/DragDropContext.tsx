"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { CalendarEvent } from "../data/types";
import { timeToMinutes, minutesToHHMM, todayISO } from "../lib/dateUtils";
import { findConflict, clampStart, snap } from "../lib/conflicts";
import { PX_PER_HOUR, DAY_START_MIN } from "./gridConstants";

interface Props {
  children: React.ReactNode;
  events: CalendarEvent[];
  onMoveEvent: (id: string, newDate: string, newTime: string) => void;
  onReject?: (message: string) => void;
}

export function DragDropContext({ children, events, onMoveEvent, onReject }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    if (!over) return;

    const data = active.data.current as
      | { kind?: string; startTime?: string; startDate?: string; durationMinutes?: number }
      | undefined;
    // Only calendar events are repositionable here (backlog drops handled elsewhere).
    if (!data || data.kind !== "event" || !data.startTime || data.durationMinutes == null) return;

    const over2 = over.data.current as { date?: string; mode?: string } | undefined;
    const destDate = over2?.date ?? data.startDate;
    if (!destDate) return;

    if (destDate < todayISO()) {
      onReject?.("Impossible de planifier dans le passé.");
      return;
    }

    const duration = data.durationMinutes;
    let startMin: number;

    if (over2?.mode === "time") {
      // Week view: derive the new start time from live on-screen positions of
      // the dragged card and the day column, measured at drop time. dnd-kit's
      // delta/translated rects drift when the grid auto-scrolls mid-drag;
      // getBoundingClientRect on both elements is immune to that.
      const cardEl = document.querySelector<HTMLElement>(
        `[data-event-id="${CSS.escape(String(active.id))}"]`,
      );
      const cellEl = document.querySelector<HTMLElement>(`[data-day-cell="${destDate}"]`);
      if (cardEl && cellEl) {
        const offsetPx = cardEl.getBoundingClientRect().top - cellEl.getBoundingClientRect().top;
        startMin = clampStart(
          snap(DAY_START_MIN + (offsetPx / PX_PER_HOUR) * 60),
          duration,
        );
      } else {
        const deltaMin = Math.round((delta.y / PX_PER_HOUR) * 60);
        startMin = clampStart(snap(timeToMinutes(data.startTime) + deltaMin), duration);
      }
    } else {
      // Month view: day-level move, time preserved.
      startMin = timeToMinutes(data.startTime);
    }

    const newTime = minutesToHHMM(startMin);
    if (destDate === data.startDate && newTime === data.startTime) return; // no-op

    const conflict = findConflict(events, destDate, startMin, duration, active.id as string);
    if (conflict) {
      onReject?.(`Créneau déjà occupé par « ${conflict.title.replace(/^[^\s]+ /, "")} ».`);
      return;
    }

    onMoveEvent(active.id as string, destDate, newTime);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
