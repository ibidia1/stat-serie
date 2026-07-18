"use client";

import { useRef, useState } from "react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { DragDropContext } from "./DragDropContext";
import {
  getMondayOfWeek, todayISO, currentYearMonth,
  addDays, fromDate, nextYearMonth, prevYearMonth,
} from "../lib/dateUtils";
import { blockedSpansForDay } from "../lib/conflicts";
import type { BacklogItem, BlockedRange, CalendarEvent } from "../data/types";

type View = "month" | "week" | "day";

/** Distance de glissement horizontal (px) pour avancer d'une unité de temps. */
const PAN_STEP_PX = 150;

interface Props {
  view: View;
  events: CalendarEvent[];
  examDate: string;
  blockedRanges: BlockedRange[];
  onDeleteEvent: (id: string) => void;
  onMarkDone: (id: string) => void;
  onMoveEvent: (id: string, newDate: string, newTime: string) => void;
  onExecuteRevision: (ev: CalendarEvent) => void;
  onResizeEvent: (id: string, newDurationMinutes: number) => void;
  onBacklogDrop: (item: BacklogItem, date: string, startMin: number | null) => void;
  onOpenActions: (event: CalendarEvent, rect: DOMRect) => void;
  onReject?: (message: string) => void;
}

export function CalendarView({
  view, events, examDate, blockedRanges,
  onDeleteEvent, onMarkDone, onMoveEvent, onExecuteRevision,
  onResizeEvent, onBacklogDrop, onOpenActions, onReject,
}: Props) {
  const [weekStart,  setWeekStart]  = useState(getMondayOfWeek(todayISO()));
  const [dayDate,    setDayDate]    = useState(todayISO());
  const [yearMonth,  setYearMonth]  = useState(currentYearMonth());
  const [panning,    setPanning]    = useState(false);

  function handleDayClick(iso: string) {
    setDayDate(iso);
  }

  // Navigation temporelle, selon la vue active.
  function stepTime(delta: number) {
    if (delta === 0) return;
    if (view === "week") {
      // Fenêtre glissante : on décale de `delta` semaines en gardant le jour de début.
      setWeekStart((w) => fromDate(addDays(w, delta * 7)));
    } else if (view === "month") {
      setYearMonth((ym) => {
        let out = ym;
        for (let i = 0; i < Math.abs(delta); i++) out = delta > 0 ? nextYearMonth(out) : prevYearMonth(out);
        return out;
      });
    } else {
      setDayDate((d) => fromDate(addDays(d, delta)));
    }
  }

  // ── Glisser horizontalement le corps du calendrier pour naviguer ──
  const pan = useRef<
    { x: number; y: number; steps: number; axis: "x" | "y" | null; id: number; el: HTMLElement } | null
  >(null);

  function onPanDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-event-id],button,input,a,select,[data-no-pan]")) return;
    pan.current = { x: e.clientX, y: e.clientY, steps: 0, axis: null, id: e.pointerId, el: e.currentTarget };
  }
  function onPanMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = pan.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.axis) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      s.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (s.axis === "x") {
        s.el.setPointerCapture?.(e.pointerId);
        setPanning(true);
      } else {
        pan.current = null; // glissement vertical → laisser défiler
        return;
      }
    }
    // Glisser vers la gauche = avancer dans le temps (on « tire » le calendrier).
    const steps = Math.round(-dx / PAN_STEP_PX);
    if (steps !== s.steps) {
      stepTime(steps - s.steps);
      s.steps = steps;
    }
  }
  function onPanUp(e: React.PointerEvent<HTMLDivElement>) {
    const s = pan.current;
    if (s?.axis === "x" && s.el.hasPointerCapture?.(e.pointerId)) s.el.releasePointerCapture(e.pointerId);
    pan.current = null;
    setPanning(false);
  }

  return (
    <DragDropContext
      events={events}
      blockedForDay={(d) => blockedSpansForDay(blockedRanges, d)}
      onMoveEvent={onMoveEvent}
      onBacklogDrop={onBacklogDrop}
      onReject={onReject}
    >
      <div
        className={`touch-pan-y select-none ${panning ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPanDown}
        onPointerMove={onPanMove}
        onPointerUp={onPanUp}
        onPointerCancel={onPanUp}
      >
        {view === "month" && (
          <MonthView
            yearMonth={yearMonth}
            onYearMonthChange={setYearMonth}
            events={events}
            onDayClick={handleDayClick}
            onOpenActions={onOpenActions}
          />
        )}
        {view === "week" && (
          <WeekView
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            events={events}
            examDate={examDate}
            blockedRanges={blockedRanges}
            onDeleteEvent={onDeleteEvent}
            onMarkDone={onMarkDone}
            onExecuteRevision={onExecuteRevision}
            onResizeEvent={onResizeEvent}
            onOpenActions={onOpenActions}
          />
        )}
        {view === "day" && (
          <DayView
            date={dayDate}
            onDateChange={setDayDate}
            events={events}
            onMarkDone={onMarkDone}
            onDeleteEvent={onDeleteEvent}
            onExecuteRevision={onExecuteRevision}
          />
        )}
      </div>
    </DragDropContext>
  );
}
