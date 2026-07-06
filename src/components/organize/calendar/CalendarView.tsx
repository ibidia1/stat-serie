"use client";

import { useState } from "react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { DragDropContext } from "./DragDropContext";
import { getMondayOfWeek, todayISO, currentYearMonth } from "../lib/dateUtils";
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

  return (
    <DragDropContext
      events={events}
      blockedForDay={(d) => blockedSpansForDay(blockedRanges, d)}
      onMoveEvent={onMoveEvent}
      onBacklogDrop={onBacklogDrop}
      onReject={onReject}
    >
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
