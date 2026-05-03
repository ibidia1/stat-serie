"use client";

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { CalendarEvent } from "../data/types";

interface Props {
  children: React.ReactNode;
  events: CalendarEvent[];
  onMoveEvent: (id: string, newDate: string) => void;
}

export function DragDropContext({ children, onMoveEvent }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const today = new Date().toISOString().slice(0, 10);
    const destDate = (over.data.current as { date?: string })?.date;
    if (!destDate) return;

    if (destDate < today) {
      // Could show a toast here — past drop rejected
      return;
    }

    const eventId = active.id as string;
    onMoveEvent(eventId, destDate);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
