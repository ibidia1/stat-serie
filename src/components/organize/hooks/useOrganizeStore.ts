"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OrganizeState, CalendarEvent, BacklogItem, AutoModeConfig, AppNotification } from "../data/types";
import { MOCK_EVENTS } from "../data/mockEvents";
import { DEFAULT_EXAM_DATE } from "../data/examDate";
import { todayISO } from "../lib/dateUtils";

const STORE_KEY = "qe.organize.v1";

const DEFAULT_STATE: OrganizeState = {
  events: MOCK_EVENTS,
  backlog: [
    { id: "bl-1", type: "qcm",     courseId: 19, createdAt: new Date().toISOString() },
    { id: "bl-2", type: "lecture",  courseId: 20, createdAt: new Date().toISOString() },
    { id: "bl-3", type: "qcm",     courseId: 31, createdAt: new Date().toISOString() },
    { id: "bl-4", type: "lecture",  courseId: 44, createdAt: new Date().toISOString() },
  ],
  autoMode: { enabled: false, intervals: [2, 7, 10, 30], customMode: false, preferredHour: "09:00" },
  notifications: [],
  examDate: DEFAULT_EXAM_DATE,
  preferences: { lastView: "week", lastDailyRitualMorning: null, lastDailyRitualEvening: null },
};

function load(): OrganizeState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<OrganizeState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      autoMode: { ...DEFAULT_STATE.autoMode, ...(parsed.autoMode ?? {}) },
      preferences: { ...DEFAULT_STATE.preferences, ...(parsed.preferences ?? {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state: OrganizeState): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function uuid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useOrganizeStore() {
  const [state, setState] = useState<OrganizeState>(DEFAULT_STATE);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated  = useRef(false);

  useEffect(() => {
    setState(load());
    hydrated.current = true;
  }, []);

  const persist = useCallback((next: OrganizeState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next), 200);
  }, []);

  const update = useCallback((fn: (prev: OrganizeState) => OrganizeState) => {
    setState((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, [persist]);

  // ── Events ─────────────────────────────────────────────────
  const addEvent = useCallback((ev: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const full: CalendarEvent = { ...ev, id: `ev-${uuid()}`, createdAt: now, updatedAt: now };
    update((s) => ({ ...s, events: [...s.events, full] }));
    return full;
  }, [update]);

  const updateEvent = useCallback((id: string, patch: Partial<CalendarEvent>) => {
    update((s) => ({
      ...s,
      events: s.events.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
      ),
    }));
  }, [update]);

  const deleteEvent = useCallback((id: string) => {
    update((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
  }, [update]);

  const markDone = useCallback((id: string) => {
    update((s) => ({
      ...s,
      events: s.events.map((e) =>
        e.id === id
          ? { ...e, status: "done", completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : e
      ),
    }));
  }, [update]);

  const addManyEvents = useCallback((evs: CalendarEvent[]) => {
    update((s) => ({ ...s, events: [...s.events, ...evs] }));
  }, [update]);

  // ── Backlog ─────────────────────────────────────────────────
  // TODO_SUPABASE: replace with API call to POST /api/organize/backlog
  const addToBacklog = useCallback((item: Omit<BacklogItem, "id" | "createdAt">) => {
    update((s) => ({
      ...s,
      backlog: [...s.backlog, { ...item, id: `bl-${uuid()}`, createdAt: new Date().toISOString() }],
    }));
  }, [update]);

  const removeFromBacklog = useCallback((id: string) => {
    update((s) => ({ ...s, backlog: s.backlog.filter((b) => b.id !== id) }));
  }, [update]);

  // ── AutoMode ────────────────────────────────────────────────
  const setAutoMode = useCallback((patch: Partial<AutoModeConfig>) => {
    update((s) => ({ ...s, autoMode: { ...s.autoMode, ...patch } }));
  }, [update]);

  // ── Notifications ───────────────────────────────────────────
  // TODO_SUPABASE: replace with API call to GET /api/organize/notifications
  const addNotification = useCallback((n: Omit<AppNotification, "id" | "createdAt">) => {
    update((s) => ({
      ...s,
      notifications: [
        { ...n, id: `notif-${uuid()}`, createdAt: new Date().toISOString() },
        ...s.notifications,
      ].slice(0, 50),
    }));
  }, [update]);

  const markNotifRead = useCallback((id: string) => {
    update((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      ),
    }));
  }, [update]);

  const markAllNotifsRead = useCallback(() => {
    update((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.readAt ? n : { ...n, readAt: new Date().toISOString() }
      ),
    }));
  }, [update]);

  // ── Preferences ─────────────────────────────────────────────
  const setPreference = useCallback(<K extends keyof OrganizeState["preferences"]>(
    key: K,
    value: OrganizeState["preferences"][K]
  ) => {
    update((s) => ({ ...s, preferences: { ...s.preferences, [key]: value } }));
  }, [update]);

  const setExamDate = useCallback((iso: string) => {
    update((s) => ({ ...s, examDate: iso }));
  }, [update]);

  // ── Daily ritual helpers ─────────────────────────────────────
  const markMorningRitual = useCallback(() => {
    update((s) => ({
      ...s,
      preferences: { ...s.preferences, lastDailyRitualMorning: todayISO() },
    }));
  }, [update]);

  const markEveningRitual = useCallback(() => {
    update((s) => ({
      ...s,
      preferences: { ...s.preferences, lastDailyRitualEvening: todayISO() },
    }));
  }, [update]);

  return {
    state,
    actions: {
      addEvent, updateEvent, deleteEvent, markDone, addManyEvents,
      addToBacklog, removeFromBacklog,
      setAutoMode,
      addNotification, markNotifRead, markAllNotifsRead,
      setPreference, setExamDate,
      markMorningRitual, markEveningRitual,
    },
  };
}

export type OrganizeActions = ReturnType<typeof useOrganizeStore>["actions"];
