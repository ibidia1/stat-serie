"use client";

import { useEffect, useRef } from "react";
import type { CalendarEvent, AppNotification } from "../data/types";
import { todayISO } from "../lib/dateUtils";
import { computeStreak } from "../lib/spacedRepetitionAlgo";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function useNotifications(
  events: CalendarEvent[],
  notifications: AppNotification[],
  addNotification: (n: Omit<AppNotification, "id" | "createdAt">) => void,
) {
  const lastCheck = useRef<string | null>(null);

  function check() {
    const today = todayISO();
    if (lastCheck.current === today) return; // already ran today
    lastCheck.current = today;

    const existingKinds = new Set(
      notifications.filter((n) => n.createdAt.slice(0, 10) === today).map((n) => `${n.kind}-${n.eventId ?? ""}`)
    );

    // task_due_today
    for (const e of events) {
      if (e.startDate === today && e.status === "upcoming") {
        const key = `task_due_today-${e.id}`;
        if (!existingKinds.has(key)) {
          addNotification({
            kind: "task_due_today",
            title: "Tâche prévue aujourd'hui",
            message: e.title,
            eventId: e.id,
          });
        }
      }
    }

    // revision_overdue
    for (const e of events) {
      if (e.type === "revision_slot" && e.status === "upcoming" && e.startDate < today) {
        const key = `revision_overdue-${e.id}`;
        if (!existingKinds.has(key)) {
          addNotification({
            kind: "revision_overdue",
            title: "Révision en retard",
            message: `${e.title} – reportée à aujourd'hui`,
            eventId: e.id,
          });
        }
      }
    }

    // Streak milestones
    const streak = computeStreak(events);
    for (const m of STREAK_MILESTONES) {
      if (streak === m) {
        const key = `milestone-streak-${m}`;
        const already = notifications.some((n) => n.kind === "milestone" && n.message.includes(`${m} jours`));
        if (!already) {
          addNotification({
            kind: "milestone",
            title: "Streak 🔥",
            message: `Tu révises depuis ${m} jours d'affilée !`,
          });
        }
      }
    }
  }

  useEffect(() => {
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
