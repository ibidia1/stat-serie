"use client";

import { useRef, useState } from "react";
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
import { EventActionPopover, type ActionAnchor } from "./calendar/EventActionPopover";
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
import { minutesToDisplay, timeToMinutes, minutesToHHMM, formatShortDate, todayISO, addDays, toDate, fromDate } from "./lib/dateUtils";
import { findFreeSlot, findConflict, findBlocked, blockedSpansForDay } from "./lib/conflicts";
import { COURSES } from "./data/courses";
import { BlockedRangesDialog } from "./modals/BlockedRangesDialog";
import { AnimatePresence } from "motion/react";
import { AlertTriangle, CalendarOff, CheckCircle2 } from "lucide-react";
import type { BacklogItem } from "./data/types";

type View = "month" | "week" | "day";

interface Toast {
  msg: string;
  kind: "warn" | "success";
  action?: { label: string; fn: () => void };
}

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
  const [blockedOpen,      setBlockedOpen]      = useState(false);
  const [actionAnchor,     setActionAnchor]     = useState<ActionAnchor | null>(null);
  const [toast,            setToast]            = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, opts: Partial<Omit<Toast, "msg">> = {}) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind: opts.kind ?? "warn", action: opts.action });
    toastTimer.current = setTimeout(() => setToast(null), opts.action ? 6000 : 3200);
  }
  const flashToast = (msg: string) => showToast(msg, { kind: "warn" });

  const blockedFor = (date: string) => blockedSpansForDay(state.blockedRanges, date);

  // ── Side-effects ──────────────────────────────────────────
  useSpacedRepetition(
    state.events,
    state.autoMode,
    state.blockedRanges,
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
    const slot = findFreeSlot(state.events, ev.startDate, timeToMinutes(ev.startTime), ev.durationMinutes, {
      blocked: blockedFor(ev.startDate),
    });
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
      const slot = findFreeSlot(working, r.startDate, timeToMinutes(r.startTime), r.durationMinutes, {
        blocked: blockedFor(r.startDate),
      });
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

  // Shifts every upcoming revision of a chain by `dayDelta` days (conflict-aware).
  function shiftChainRevisions(children: CalendarEvent[], dayDelta: number) {
    const shiftDate = (iso: string, delta: number) => {
      const d = new Date(iso + "T00:00:00");
      d.setDate(d.getDate() + delta);
      return d.toISOString().slice(0, 10);
    };
    const working = [...state.events];
    let moved = 0;
    for (const child of children) {
      let target = shiftDate(child.startDate, dayDelta);
      if (target < todayISO()) target = todayISO();
      const slot = findFreeSlot(working, target, timeToMinutes(child.startTime), child.durationMinutes, {
        ignoreId: child.id,
        blocked: blockedFor(target),
      });
      if (slot === null) continue;
      const startTime = minutesToHHMM(slot);
      actions.updateEvent(child.id, { startDate: target, startTime });
      const idx = working.findIndex((e) => e.id === child.id);
      if (idx >= 0) working[idx] = { ...working[idx], startDate: target, startTime };
      moved++;
    }
    showToast(
      moved === children.length
        ? `${moved} révision${moved > 1 ? "s" : ""} décalée${moved > 1 ? "s" : ""} de ${dayDelta > 0 ? "+" : ""}${dayDelta} j.`
        : `${moved}/${children.length} révisions décalées (créneaux indisponibles pour les autres).`,
      { kind: "success" },
    );
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
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;

    const prev: Partial<CalendarEvent> = {
      startDate: ev.startDate,
      startTime: ev.startTime,
      status: ev.status,
    };
    const patch: Partial<CalendarEvent> = { startDate: newDate, startTime: newTime };
    if (ev.status === "rescheduled") patch.status = "upcoming";
    actions.updateEvent(id, patch);

    // Source d'un plan de répétition déplacée → proposer de décaler la chaîne.
    const dayDelta = Math.round(
      (new Date(newDate + "T00:00:00").getTime() - new Date(ev.startDate + "T00:00:00").getTime()) / 86400000,
    );
    const children = state.events.filter(
      (c) => c.isRevision && c.parentEventId === id && c.status !== "done" && c.status !== "skipped",
    );

    if (!ev.isRevision && children.length > 0 && dayDelta !== 0) {
      showToast(
        `Séance déplacée au ${formatShortDate(newDate)} ${newTime}. Décaler aussi les ${children.length} révisions liées ?`,
        {
          kind: "success",
          action: {
            label: `Décaler (${dayDelta > 0 ? "+" : ""}${dayDelta} j)`,
            fn: () => shiftChainRevisions(children, dayDelta),
          },
        },
      );
    } else {
      showToast(`Séance déplacée au ${formatShortDate(newDate)} à ${newTime}.`, {
        kind: "success",
        action: { label: "Annuler", fn: () => actions.updateEvent(id, prev) },
      });
    }
  }

  // Drop d'un élément du backlog sur le calendrier → planification directe.
  function handleBacklogDrop(item: BacklogItem, date: string, startMin: number | null) {
    const course = COURSES.find((c) => c.id === item.courseId);
    const series = item.seriesId
      ? getSeriesForCourse(item.courseId).find((s) => s.id === item.seriesId)
      : undefined;
    const duration =
      (series ? estimateDuration(series.numberOfQuestions) : null) ??
      (item.type === "qcm" ? 30 : 45);
    const shortName = course?.shortTitle ?? course?.title ?? `Cours #${item.courseId}`;
    const title = item.type === "qcm" ? `✍️ QCM ${shortName}` : `📖 Lecture ${shortName}`;

    const desired = startMin ?? timeToMinutes(state.autoMode.preferredHour);
    const slot = findFreeSlot(state.events, date, desired, duration, { blocked: blockedFor(date) });
    if (slot === null) {
      flashToast(`Aucun créneau libre le ${formatShortDate(date)}.`);
      return;
    }

    const created = actions.addEvent({
      type: item.type,
      courseId: item.courseId,
      seriesId: item.seriesId,
      title,
      startDate: date,
      startTime: minutesToHHMM(slot),
      durationMinutes: duration,
      estimatedFromKpi: series != null,
      notes: item.notes,
      isRevision: false,
      status: "upcoming",
    });
    actions.removeFromBacklog(item.id);

    showToast(`${shortName} planifié le ${formatShortDate(date)} à ${minutesToHHMM(slot)}.`, {
      kind: "success",
      action: {
        label: "Annuler",
        fn: () => {
          actions.deleteEvent(created.id);
          actions.addToBacklog({ type: item.type, courseId: item.courseId, seriesId: item.seriesId, notes: item.notes });
        },
      },
    });
  }

  // Suppression avec possibilité d'annuler.
  function handleDeleteEvent(id: string) {
    const ev = state.events.find((e) => e.id === id);
    actions.deleteEvent(id);
    if (ev) {
      showToast(`« ${ev.title.replace(/^[^\s]+ /, "")} » supprimé.`, {
        kind: "success",
        action: { label: "Annuler", fn: () => actions.addManyEvents([ev]) },
      });
    }
  }

  // Redimensionnement d'une séance (durée) — refuse chevauchements et plages bloquées.
  function handleResizeEvent(id: string, newDurationMinutes: number) {
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;
    const start = timeToMinutes(ev.startTime);

    const blocked = findBlocked(blockedFor(ev.startDate), start, newDurationMinutes);
    if (blocked) {
      flashToast(`Impossible d'étendre dans la plage bloquée « ${blocked.label} ».`);
      return;
    }
    const conflict = findConflict(state.events, ev.startDate, start, newDurationMinutes, id);
    if (conflict) {
      flashToast(`Chevauchement avec « ${conflict.title.replace(/^[^\s]+ /, "")} ».`);
      return;
    }
    actions.updateEvent(id, { durationMinutes: newDurationMinutes });
  }

  function handleExecuteRevision(ev: CalendarEvent) {
    setExecuteEvent(ev);
  }

  // Crée une révision liée à un cours, `days` jours après, sans chevauchement.
  function handleCreateRevision(parent: CalendarEvent, days: number) {
    const course = COURSES.find((c) => c.id === parent.courseId);
    const shortName = course?.shortTitle ?? course?.title ?? `Cours #${parent.courseId}`;
    const revDate = fromDate(addDays(toDate(parent.startDate), days));
    const created = placeAndAddEvent({
      type: "revision_slot",
      courseId: parent.courseId,
      seriesId: parent.seriesId,
      title: `🔁 Révision J${days} – ${shortName}`,
      startDate: revDate,
      startTime: state.autoMode.preferredHour,
      durationMinutes: parent.durationMinutes,
      estimatedFromKpi: parent.estimatedFromKpi,
      isRevision: true,
      revisionInterval: `J${days}`,
      parentEventId: parent.id,
      status: "upcoming",
    });
    if (created) {
      showToast(`Révision J${days} de « ${shortName} » créée le ${formatShortDate(revDate)}.`, {
        kind: "success",
        action: { label: "Annuler", fn: () => actions.deleteEvent(created.id) },
      });
    }
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
        <button
          onClick={() => setBlockedOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <CalendarOff className="h-3.5 w-3.5" />
          Plages bloquées
          {state.blockedRanges.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
              {state.blockedRanges.length}
            </span>
          )}
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
        <div className="relative">
          <CalendarView
            view={view}
            events={state.events}
            examDate={state.examDate}
            blockedRanges={state.blockedRanges}
            onDeleteEvent={handleDeleteEvent}
            onMarkDone={handleMarkDone}
            onMoveEvent={handleMoveEvent}
            onExecuteRevision={handleExecuteRevision}
            onResizeEvent={handleResizeEvent}
            onBacklogDrop={handleBacklogDrop}
            onOpenActions={(event, rect) => setActionAnchor({ event, rect })}
            onReject={flashToast}
          />
          {/* Bouton + : ajouter un cours */}
          <button
            onClick={() => setAddTaskOpen(true)}
            title="Ajouter un cours (N)"
            aria-label="Ajouter un cours"
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
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

      {/* Menu d'actions d'un cours (créer une révision liée) */}
      {actionAnchor && (
        <EventActionPopover
          anchor={actionAnchor}
          onClose={() => setActionAnchor(null)}
          onCreateRevision={handleCreateRevision}
        />
      )}

      {/* Plages bloquées */}
      <BlockedRangesDialog
        open={blockedOpen}
        onClose={() => setBlockedOpen(false)}
        ranges={state.blockedRanges}
        onAdd={actions.addBlockedRange}
        onRemove={actions.removeBlockedRange}
      />

      {/* Conflict / scheduling toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-xl ${
              toast.kind === "success" ? "border-success/30" : "border-accent/30"
            }`}
            role="status"
          >
            {toast.kind === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
            )}
            <span>{toast.msg}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.fn();
                  if (toastTimer.current) clearTimeout(toastTimer.current);
                  setToast(null);
                }}
                className="ml-1 shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/20"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
