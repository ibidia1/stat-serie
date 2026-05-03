"use client";

import { useState } from "react";
import { Play, Edit2, Trash2 } from "lucide-react";
import { EVENT_COLORS } from "../lib/colors";
import { minutesToDisplay } from "../lib/dateUtils";
import type { CalendarEvent } from "../data/types";
import { COURSES } from "../data/courses";

interface Props {
  event: CalendarEvent;
  compact?: boolean;
  onDelete?: (id: string) => void;
  onMarkDone?: (id: string) => void;
  onEdit?: (event: CalendarEvent) => void;
  onExecuteRevision?: (event: CalendarEvent) => void;
  style?: React.CSSProperties;
}

export function EventCard({ event, compact, onDelete, onMarkDone, onEdit, onExecuteRevision, style }: Props) {
  const [hovered, setHovered] = useState(false);
  const colors  = EVENT_COLORS[event.type];
  const today   = new Date().toISOString().slice(0, 10);
  const overdue = event.startDate < today && event.status === "upcoming";
  const done    = event.status === "done";
  const course  = COURSES.find((c) => c.id === event.courseId);

  if (compact) {
    return (
      <div
        style={style}
        className={`absolute inset-x-0.5 overflow-hidden rounded px-1 py-0.5 text-[9px] leading-tight cursor-default select-none transition-shadow hover:shadow-md hover:z-10
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
      style={style}
      className={`group absolute inset-x-0.5 overflow-hidden rounded-md px-2 py-1 text-[10px] leading-snug cursor-pointer select-none transition-shadow hover:shadow-lg hover:z-10
        ${colors.bg} ${colors.borderLeft}
        ${done    ? "opacity-55" : ""}
        ${overdue ? "ring-1 ring-destructive" : ""}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`flex items-center gap-1 font-semibold truncate ${colors.text}`}>
        <span className="shrink-0">{colors.icon}</span>
        <span className="truncate">{course?.shortTitle ?? course?.title}</span>
        {event.revisionInterval && (
          <span className={`shrink-0 rounded px-1 text-[8px] font-bold ${colors.badgeBg}`}>
            {event.revisionInterval}
          </span>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
        <span className="tabular-nums">{event.startTime}</span>
        <span>·</span>
        <span className="tabular-nums">{minutesToDisplay(event.durationMinutes)}</span>
      </div>

      {hovered && (event.status !== "done") && (
        <div className="absolute right-1 top-1 flex gap-0.5">
          {event.type === "revision_slot" && onExecuteRevision && (
            <button
              onClick={(e) => { e.stopPropagation(); onExecuteRevision(event); }}
              className="rounded bg-accent p-0.5 text-accent-foreground hover:bg-accent/80"
              title="Lancer"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
            </button>
          )}
          {event.type !== "revision_slot" && onMarkDone && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkDone(event.id); }}
              className="rounded bg-success p-0.5 text-success-foreground hover:bg-success/80"
              title="Marquer fait"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(event); }}
              className="rounded bg-muted p-0.5 text-muted-foreground hover:bg-muted/80"
              title="Modifier"
            >
              <Edit2 className="h-2.5 w-2.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
              className="rounded bg-destructive/[0.08] p-0.5 text-destructive hover:bg-destructive/[0.14]"
              title="Supprimer"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
