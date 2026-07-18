"use client";

import { useRef, useState } from "react";
import { Play, Edit2, Trash2, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EVENT_COLORS } from "../lib/colors";
import { minutesToDisplay, timeToMinutes } from "../lib/dateUtils";
import { snap } from "../lib/conflicts";
import { PX_PER_HOUR, DAY_END_MIN } from "./gridConstants";
import type { CalendarEvent } from "../data/types";
import { COURSES } from "../data/courses";

interface Props {
  event: CalendarEvent;
  compact?: boolean;
  draggable?: boolean;
  onDelete?: (id: string) => void;
  onMarkDone?: (id: string) => void;
  onEdit?: (event: CalendarEvent) => void;
  onExecuteRevision?: (event: CalendarEvent) => void;
  /** Redimensionnement de la durée par la poignée du bas (vue Semaine). */
  onResizeCommit?: (id: string, newDurationMinutes: number) => void;
  /** Sélection d'un cours pour afficher sa chaîne de révisions. */
  onSelect?: (event: CalendarEvent) => void;
  /** Appartient à la chaîne sélectionnée. */
  selected?: boolean;
  /** Une autre chaîne est sélectionnée : cette carte est estompée. */
  dimmed?: boolean;
  style?: React.CSSProperties;
}

export function EventCard({ event, compact, draggable, onDelete, onMarkDone, onEdit, onExecuteRevision, onResizeCommit, onSelect, selected, dimmed, style }: Props) {
  const [hovered, setHovered] = useState(false);
  const [previewDur, setPreviewDur] = useState<number | null>(null);
  const resizeStart = useRef<{ y: number; dur: number } | null>(null);
  const colors  = EVENT_COLORS[event.type];
  const today   = new Date().toISOString().slice(0, 10);
  const overdue = event.startDate < today && event.status === "upcoming";
  const done    = event.status === "done";
  const course  = COURSES.find((c) => c.id === event.courseId);

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: event.id,
    disabled: !draggable || done,
    data: {
      kind: "event",
      startTime: event.startTime,
      startDate: event.startDate,
      durationMinutes: event.durationMinutes,
    },
  });

  const dragStyle: React.CSSProperties = {
    ...(style ?? {}),
    ...(transform ? { transform: CSS.Translate.toString(transform) } : {}),
    ...(previewDur !== null
      ? { height: Math.max(30, (previewDur / 60) * PX_PER_HOUR - 2) }
      : {}),
  };

  // Prevent the action buttons from initiating a drag.
  const stopDrag = (e: React.PointerEvent) => e.stopPropagation();

  // ── Resize (durée) via la poignée du bas ────────────────
  const resizable = !!onResizeCommit && draggable && !done && !compact;

  function onResizePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    resizeStart.current = { y: e.clientY, dur: event.durationMinutes };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onResizePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!resizeStart.current) return;
    const deltaMin = ((e.clientY - resizeStart.current.y) / PX_PER_HOUR) * 60;
    const maxDur = DAY_END_MIN - timeToMinutes(event.startTime);
    const next = Math.min(maxDur, Math.max(15, snap(resizeStart.current.dur + deltaMin)));
    setPreviewDur(next);
  }
  function onResizePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!resizeStart.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const committed = previewDur;
    resizeStart.current = null;
    setPreviewDur(null);
    if (committed !== null && committed !== event.durationMinutes) {
      onResizeCommit?.(event.id, committed);
    }
  }

  if (compact) {
    return (
      <div
        style={style}
        data-event-id={event.id}
        className={`absolute inset-x-0.5 z-[3] overflow-hidden rounded px-1 py-0.5 text-[9px] leading-tight cursor-default select-none transition-shadow hover:shadow-md hover:z-10
          ${colors.bg} ${colors.borderLeft}
          ${done    ? "opacity-55" : ""}
          ${overdue ? "ring-1 ring-destructive" : ""}
        `}
        title={event.title}
      >
        <div className={`flex items-center gap-0.5 font-semibold truncate ${colors.text}`}>
          <span>{colors.icon}</span>
          <span className="ml-0.5 truncate">{course?.shortTitle ?? course?.title ?? `Cours #${event.courseId}`}</span>
        </div>
        {event.revisionInterval && (
          <span className={`mt-0.5 inline-block rounded px-0.5 text-[7px] font-bold ${colors.badgeBg}`}>
            {event.revisionInterval}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setDragRef}
      style={dragStyle}
      data-event-id={event.id}
      {...(draggable && !done ? listeners : {})}
      {...attributes}
      className={`group absolute inset-x-0.5 z-[3] overflow-hidden rounded-md px-2 py-1 text-xs leading-snug select-none transition-all hover:shadow-lg hover:z-10
        ${draggable && !done ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${isDragging ? "z-50 opacity-80 shadow-xl ring-2 ring-primary/40" : ""}
        ${colors.bg} ${colors.borderLeft}
        ${done    ? "opacity-55" : ""}
        ${dimmed && !isDragging ? "opacity-35" : ""}
        ${selected ? "z-10 shadow-lg ring-2 ring-primary/50" : ""}
        ${overdue ? "ring-1 ring-destructive" : ""}
      `}
      onClick={onSelect ? (e) => { e.stopPropagation(); onSelect(event); } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${event.title} — ${event.startTime} · ${minutesToDisplay(event.durationMinutes)}${draggable && !done ? " (glisser pour déplacer)" : ""}`}
    >
      <div className={`flex items-center gap-1 text-[13px] font-semibold truncate ${colors.text}`}>
        {draggable && !done && (
          <GripVertical className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" aria-hidden />
        )}
        <span className="shrink-0 text-sm leading-none">{colors.icon}</span>
        <span className="truncate">{course?.shortTitle ?? course?.title}</span>
        {event.revisionInterval && (
          <span className={`shrink-0 rounded px-1 text-[10px] font-bold ${colors.badgeBg}`}>
            {event.revisionInterval}
          </span>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="tabular-nums">{event.startTime}</span>
        <span>·</span>
        <span className={`tabular-nums ${previewDur !== null ? "font-bold text-primary" : ""}`}>
          {minutesToDisplay(previewDur ?? event.durationMinutes)}
        </span>
      </div>

      {hovered && (event.status !== "done") && (
        <div className="absolute right-1 top-1 flex gap-0.5">
          {event.type === "revision_slot" && onExecuteRevision && (
            <button
              onPointerDown={stopDrag}
              onClick={(e) => { e.stopPropagation(); onExecuteRevision(event); }}
              className="rounded bg-accent p-0.5 text-accent-foreground hover:bg-accent/80"
              title="Lancer"
            >
              <Play className="h-3 w-3 fill-current" />
            </button>
          )}
          {event.type !== "revision_slot" && onMarkDone && (
            <button
              onPointerDown={stopDrag}
              onClick={(e) => { e.stopPropagation(); onMarkDone(event.id); }}
              className="rounded bg-success p-0.5 text-success-foreground hover:bg-success/80"
              title="Marquer fait"
            >
              <Play className="h-3 w-3 fill-current" />
            </button>
          )}
          {onEdit && (
            <button
              onPointerDown={stopDrag}
              onClick={(e) => { e.stopPropagation(); onEdit(event); }}
              className="rounded bg-muted p-0.5 text-muted-foreground hover:bg-muted/80"
              title="Modifier"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              onPointerDown={stopDrag}
              onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
              className="rounded bg-destructive/[0.08] p-0.5 text-destructive hover:bg-destructive/[0.14]"
              title="Supprimer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {resizable && (
        <div
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          title="Glisser pour ajuster la durée"
          className={`absolute inset-x-0 bottom-0 flex h-2.5 cursor-ns-resize items-center justify-center transition-opacity ${
            previewDur !== null ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="h-[3px] w-7 rounded-full bg-current opacity-40" />
        </div>
      )}
    </div>
  );
}
