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
import { minutesToDisplay, timeToMinutes, minutesToHHMM, formatShortDate } from "./lib/dateUtils";
import { findFreeSlot } from "./lib/conflicts";
import { AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

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
  const [toast,            setToast]            = useState<string | null>(null);

  function flashToast(msg: string) {
    setToast(msg);
    window.clearTimeout((flashToast as unknown as { _t?: number })._t);
    (flashToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 3200);
  }

  // ── Side-effects ──────────────────────────────────────────
  useSpacedRepetition(
    state.events,
    state.autoMode,
    (updated) => {
      for (const e of updated) {
        if (e.status === "rescheduled") {
          actions.updateEvent(e.id, { startDate: e.startDate, startTime: e.startTime, status: "rescheduled" });
        }
      }
    },
    (revs) => addEventsResolved(revs),
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

  // ── Conflict-free scheduling ──────────────────────────────
  // Adds an event, shifting it to the next free slot if the requested time is taken.
  function placeAndAddEvent(ev: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) {
    const slot = findFreeSlot(state.events, ev.startDate, timeToMinutes(ev.startTime), ev.durationMinutes);
    if (slot === null) {
      flashToast(`Aucun créneau libre le ${formatShortDate(ev.startDate)}.`);
      return null;
    }
    const time = minutesToHHMM(slot);
    if (time !== ev.startTime) {
      flashToast(`Créneau occupé — déplacé à ${time} pour éviter un chevauchement.`);
    }
    return actions.addEvent({ ...ev, startTime: time });
  }

  // Places a batch of events, each in a free slot (reserving as it goes) so none overlap.
  function addEventsResolved(batch: CalendarEvent[]) {
    const working = [...state.events];
    const placed: CalendarEvent[] = [];
    for (const r of batch) {
      const slot = findFreeSlot(working, r.startDate, timeToMinutes(r.startTime), r.durationMinutes);
      if (slot === null) continue;
      const ev = { ...r, startTime: minutesToHHMM(slot) };
      placed.push(ev);
      working.push(ev);
    }
    if (placed.length > 0) actions.addManyEvents(placed);
    if (placed.length < batch.length) {
      flashToast("Certaines séances n'ont pas pu être placées (journées complètes).");
    }
  }

  function handleScheduleFromPicker(type: EventType, seriesId: string | undefined, date: string, time: string) {
    if (!pickerCourse) return;
    const series    = seriesId ? getSeriesForCourse(pickerCourse.id).find((s) => s.id === seriesId) : undefined;
    const duration  = series ? estimateDuration(series.numberOfQuestions) : null;
    const title     = type === "qcm"
      ? `✍️ QCM ${pickerCourse.shortTitle ?? pickerCourse.title}${series ? ` – ${series.year} FM${series.faculty.slice(0,1)}` : ""}`
      : `📖 Lecture ${pickerCourse.shortTitle ?? pickerCourse.title}`;
    const ev = placeAndAddEvent({
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
    if (ev && mode === "auto" && state.autoMode.enabled) {
      const revs = generateRevisions(ev, state.autoMode);
      if (revs.length > 0) addEventsResolved(revs);
    }
  }

  function handleMarkDone(id: string) {
    actions.markDone(id);
    const ev = state.events.find((e) => e.id === id);
    if (ev && mode === "auto" && state.autoMode.enabled) {
      const revs = generateRevisions({ ...ev, status: "done" }, state.autoMode);
      if (revs.length > 0) addEventsResolved(revs);
    }
  }

  function handleMoveEvent(id: string, newDate: string, newTime: string) {
    const patch: Partial<CalendarEvent> = { startDate: newDate, startTime: newTime };
    const ev = state.events.find((e) => e.id === id);
    if (ev?.status === "rescheduled") patch.status = "upcoming";
    actions.updateEvent(id, patch);
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
    addEventsResolved(evs);
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
              onReject={flashToast}
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
        onAddEvent={placeAndAddEvent}
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

      {/* Conflict / scheduling toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-accent/30 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-xl"
            role="status"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
