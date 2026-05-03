"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, LayoutTemplate } from "lucide-react";
import { generateRevisions } from "./lib/spacedRepetitionAlgo";

import { useOrganizeStore } from "./hooks/useOrganizeStore";
import { useSpacedRepetition } from "./hooks/useSpacedRepetition";
import { useNotifications } from "./hooks/useNotifications";
import { useDailyRitual } from "./hooks/useDailyRitual";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import { OrganizeHeader } from "./header/OrganizeHeader";
import { CalendarView } from "./calendar/CalendarView";
import { BacklogPanel } from "./panels/BacklogPanel";
import { TodayAgendaPanel } from "./panels/TodayAgendaPanel";
import { AutoModeConfig } from "./panels/AutoModeConfig";
import { CourseSearchModal } from "./search/CourseSearchModal";
import { SeriesPickerPopover } from "./search/SeriesPickerPopover";
import { AddTaskDialog } from "./modals/AddTaskDialog";
import { DailyRitualMorningDialog } from "./modals/DailyRitualMorningDialog";
import { DailyRitualEveningDialog } from "./modals/DailyRitualEveningDialog";
import { TemplateLibraryDialog } from "./modals/TemplateLibraryDialog";
import { ExecuteTaskDialog } from "./modals/ExecuteTaskDialog";
import { RevisionHeatmap } from "./views/RevisionHeatmap";
import { MacroPlanView } from "./views/MacroPlanView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import type { CalendarEvent, Course, EventType } from "./data/types";
import { getSeriesForCourse } from "./data/series";
import { estimateDuration } from "./hooks/useEstimation";
import { todayISO, minutesToDisplay } from "./lib/dateUtils";

type View = "month" | "week" | "day";

export function OrganizePage() {
  const { state, actions } = useOrganizeStore();

  // ── UI state ──────────────────────────────────────────────
  const [view,             setView]             = useState<View>(state.preferences.lastView);
  const [mode,             setMode]             = useState<"manual" | "auto">("manual");
  const [mainTab,          setMainTab]          = useState("calendar");
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [pickerCourse,     setPickerCourse]     = useState<Course | null>(null);
  const [addTaskOpen,      setAddTaskOpen]      = useState(false);
  const [templateOpen,     setTemplateOpen]     = useState(false);
  const [executeEvent,     setExecuteEvent]     = useState<CalendarEvent | null>(null);

  // ── Side-effects ──────────────────────────────────────────
  useSpacedRepetition(
    state.events,
    state.autoMode,
    (updated) => {
      for (const e of updated) {
        if (e.status === "rescheduled") {
          actions.updateEvent(e.id, { startDate: e.startDate, status: "rescheduled" });
        }
      }
    },
    (revs) => actions.addManyEvents(revs),
  );

  useNotifications(state.events, state.notifications, actions.addNotification);

  const { showMorning, setShowMorning, showEvening, setShowEvening } = useDailyRitual(
    state.preferences.lastDailyRitualMorning,
    state.preferences.lastDailyRitualEvening,
  );

  useKeyboardShortcuts({
    onCmdK: () => setSearchOpen(true),
    onN:    () => setAddTaskOpen(true),
  });

  // ── Handlers ─────────────────────────────────────────────
  function handleViewChange(v: View) {
    setView(v);
    actions.setPreference("lastView", v);
  }

  function handleModeChange(m: "manual" | "auto") {
    setMode(m);
    actions.setAutoMode({ enabled: m === "auto" });
  }

  function handleCourseSelected(course: Course) {
    setPickerCourse(course);
  }

  function handleScheduleFromPicker(type: EventType, seriesId: string | undefined, date: string, time: string) {
    if (!pickerCourse) return;
    const series    = seriesId ? getSeriesForCourse(pickerCourse.id).find((s) => s.id === seriesId) : undefined;
    const duration  = series ? estimateDuration(series.numberOfQuestions) : null;
    const title     = type === "qcm"
      ? `✍️ QCM ${pickerCourse.shortTitle ?? pickerCourse.title}${series ? ` – ${series.year} FM${series.faculty.slice(0,1)}` : ""}`
      : `📖 Lecture ${pickerCourse.shortTitle ?? pickerCourse.title}`;
    const ev = actions.addEvent({
      type,
      courseId: pickerCourse.id,
      seriesId,
      title,
      startDate: date,
      startTime: time,
      durationMinutes: duration ?? 30,
      estimatedFromKpi: duration !== null,
      isRevision: false,
      status: "upcoming",
    });
    if (mode === "auto" && state.autoMode.enabled) {
      const revs = generateRevisions(ev, state.autoMode);
      if (revs.length > 0) actions.addManyEvents(revs);
    }
  }

  function handleMarkDone(id: string) {
    actions.markDone(id);
    const ev = state.events.find((e) => e.id === id);
    if (ev && mode === "auto" && state.autoMode.enabled) {
      const revs = generateRevisions({ ...ev, status: "done" }, state.autoMode);
      if (revs.length > 0) actions.addManyEvents(revs);
    }
  }

  function handleMoveEvent(id: string, newDate: string) {
    actions.updateEvent(id, { startDate: newDate });
  }

  function handleExecuteRevision(ev: CalendarEvent) {
    setExecuteEvent(ev);
  }

  function handleLaunchRevision(eventId: string, type: EventType, seriesId?: string) {
    actions.markDone(eventId);
    const ev = state.events.find((e) => e.id === eventId);
    if (ev) {
      const series  = seriesId ? getSeriesForCourse(ev.courseId).find((s) => s.id === seriesId) : undefined;
      const dur     = series ? estimateDuration(series.numberOfQuestions) : null;
      // Navigate to S'entraîner / Apprendre — stub for now
      console.log("[QE] Launch revision:", { eventId, type, seriesId, dur: dur ? minutesToDisplay(dur) : "—" });
    }
  }

  function handleTemplateApply(evs: CalendarEvent[]) {
    actions.addManyEvents(evs);
  }

  // ── Derived counts ────────────────────────────────────────
  const thisWeekStart = (() => {
    const d = new Date();
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return d.toISOString().slice(0, 10);
  })();
  const thisWeekEnd = (() => {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();
  const generatedThisWeek = state.events.filter(
    (e) => e.isRevision && e.startDate >= thisWeekStart && e.startDate <= thisWeekEnd
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <OrganizeHeader
        examDate={state.examDate}
        mode={mode}
        view={view}
        notifications={state.notifications}
        onExamDateChange={actions.setExamDate}
        onModeChange={handleModeChange}
        onViewChange={handleViewChange}
        onOpenSearch={() => setSearchOpen(true)}
        actions={actions}
        events={state.events}
      />

      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex items-center gap-2"
      >
        <Button
          onClick={() => setAddTaskOpen(true)}
          className="flex items-center gap-1.5 text-xs shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter (N)
        </Button>
        <button
          onClick={() => setTemplateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LayoutTemplate className="h-3.5 w-3.5" />
          Templates
        </button>
        <div className="flex-1" />
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList>
            <TabsTrigger value="calendar">📅 Calendrier</TabsTrigger>
            <TabsTrigger value="macro">🗺️ Plan macro</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Auto mode config (visible only when mode = auto) */}
      {mode === "auto" && (
        <AutoModeConfig
          config={state.autoMode}
          onChange={actions.setAutoMode}
          generatedThisWeek={generatedThisWeek}
        />
      )}

      {/* Main content */}
      {mainTab === "calendar" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Calendar */}
          <div>
            <CalendarView
              view={view}
              events={state.events}
              examDate={state.examDate}
              onDeleteEvent={actions.deleteEvent}
              onMarkDone={handleMarkDone}
              onMoveEvent={handleMoveEvent}
              onExecuteRevision={handleExecuteRevision}
            />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3">
            <TodayAgendaPanel events={state.events} />
            <BacklogPanel
              items={state.backlog}
              onRemove={actions.removeFromBacklog}
              onAddClick={() => setAddTaskOpen(true)}
            />
          </div>
        </div>
      )}

      {mainTab === "macro" && (
        <MacroPlanView examDate={state.examDate} events={state.events} />
      )}

      {/* Heatmap — always visible */}
      <RevisionHeatmap events={state.events} />

      {/* ── Modals & Overlays ─────────────────────────────── */}

      {/* Course search modal */}
      <CourseSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleCourseSelected}
      />

      {/* Series picker: shown after course selected from search */}
      {pickerCourse && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPickerCourse(null)} />
          <div className="relative z-10 w-full max-w-[500px]">
            <SeriesPickerPopover
              course={pickerCourse}
              onClose={() => setPickerCourse(null)}
              onSchedule={handleScheduleFromPicker}
              onBacklog={(type, seriesId) => {
                actions.addToBacklog({ type, courseId: pickerCourse.id, seriesId });
                setPickerCourse(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Add task dialog */}
      <AddTaskDialog
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onAddEvent={actions.addEvent}
        onAddToBacklog={(type, courseId, seriesId) =>
          actions.addToBacklog({ type, courseId, seriesId })
        }
      />

      {/* Execute revision dialog */}
      <ExecuteTaskDialog
        open={!!executeEvent}
        event={executeEvent}
        onClose={() => setExecuteEvent(null)}
        onLaunch={handleLaunchRevision}
      />

      {/* Templates */}
      <TemplateLibraryDialog
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onApply={handleTemplateApply}
      />

      {/* Daily ritual morning */}
      <DailyRitualMorningDialog
        open={showMorning}
        onClose={() => { setShowMorning(false); actions.markMorningRitual(); }}
        events={state.events}
      />

      {/* Daily ritual evening */}
      <DailyRitualEveningDialog
        open={showEvening}
        onClose={() => { setShowEvening(false); actions.markEveningRitual(); }}
        events={state.events}
        onMarkSkipped={actions.deleteEvent}
      />
    </div>
  );
}
