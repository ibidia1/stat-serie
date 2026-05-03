"use client";

import { useEffect } from "react";
import { rescheduleOverdueRevisions, generateRevisions } from "../lib/spacedRepetitionAlgo";
import type { CalendarEvent, AutoModeConfig } from "../data/types";

export function useSpacedRepetition(
  events: CalendarEvent[],
  autoMode: AutoModeConfig,
  onReschedule: (updated: CalendarEvent[]) => void,
  onAddRevisions: (revs: CalendarEvent[]) => void,
) {
  // Reschedule overdue revisions on mount and every 60s
  useEffect(() => {
    const run = () => {
      const updated = rescheduleOverdueRevisions(events, autoMode.preferredHour);
      const changed = updated.some((e, i) => e.status !== events[i].status || e.startDate !== events[i].startDate);
      if (changed) onReschedule(updated);
    };
    run();
    const t = setInterval(run, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function triggerRevisions(parent: CalendarEvent) {
    const revs = generateRevisions(parent, autoMode);
    if (revs.length > 0) onAddRevisions(revs);
  }

  return { triggerRevisions };
}
