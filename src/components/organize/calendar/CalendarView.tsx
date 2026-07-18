"use client";

import { useState } from "react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { DragDropContext } from "./DragDropContext";
import { TimelineScrubber } from "./TimelineScrubber";
import {
  getMondayOfWeek, todayISO, currentYearMonth,
  addDays, fromDate, nextYearMonth, prevYearMonth,
} from "../lib/dateUtils";
import { blockedSpansForDay } from "../lib/conflicts";
import type { BacklogItem, BlockedRange, CalendarEvent } from "../data/types";

type View = "month" | "week" | "day";

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
  onReject?: (message: string) => void;
}

export function CalendarView({
  view, events, examDate, blockedRanges,
  onDeleteEvent, onMarkDone, onMoveEvent, onExecuteRevision,
  onResizeEvent, onBacklogDrop, onReject,
}: Props) {
  const [weekStart,  setWeekStart]  = useState(getMondayOfWeek(todayISO()));
  const [dayDate,    setDayDate]    = useState(todayISO());
  const [yearMonth,  setYearMonth]  = useState(currentYearMonth());

  function handleDayClick(iso: string) {
    setDayDate(iso);
  }

  // Navigation temporelle par le slider, selon la vue active.
  function stepTime(delta: number) {
    if (delta === 0) return;
    if (view === "week") {
      setWeekStart((w) => fromDate(addDays(getMondayOfWeek(w), delta * 7)));
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
  const unitLabel = view === "week" ? "semaine" : view === "month" ? "mois" : "jour";

  return (
    <DragDropContext
      events={events}
      blockedForDay={(d) => blockedSpansForDay(blockedRanges, d)}
      onMoveEvent={onMoveEvent}
      onBacklogDrop={onBacklogDrop}
      onReject={onReject}
    >
      <div className="mb-3">
        <TimelineScrubber onStep={stepTime} unitLabel={unitLabel} />
      </div>
      {view === "month" && (
        <MonthView
          yearMonth={yearMonth}
          onYearMonthChange={setYearMonth}
          events={events}
          onDayClick={handleDayClick}
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
    </DragDropContext>
  );
}
