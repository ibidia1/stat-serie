"use client";

import { useState } from "react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { DragDropContext } from "./DragDropContext";
import { getMondayOfWeek, todayISO, currentYearMonth } from "../lib/dateUtils";
import type { CalendarEvent } from "../data/types";

type View = "month" | "week" | "day";

interface Props {
  view: View;
  events: CalendarEvent[];
  examDate: string;
  onDeleteEvent: (id: string) => void;
  onMarkDone: (id: string) => void;
  onMoveEvent: (id: string, newDate: string) => void;
  onExecuteRevision: (ev: CalendarEvent) => void;
}

export function CalendarView({ view, events, examDate, onDeleteEvent, onMarkDone, onMoveEvent, onExecuteRevision }: Props) {
  const [weekStart,  setWeekStart]  = useState(getMondayOfWeek(todayISO()));
  const [dayDate,    setDayDate]    = useState(todayISO());
  const [yearMonth,  setYearMonth]  = useState(currentYearMonth());

  function handleDayClick(iso: string) {
    setDayDate(iso);
  }

  return (
    <DragDropContext events={events} onMoveEvent={onMoveEvent}>
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
          onDeleteEvent={onDeleteEvent}
          onMarkDone={onMarkDone}
          onExecuteRevision={onExecuteRevision}
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
