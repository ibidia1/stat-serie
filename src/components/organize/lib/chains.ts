import type { CalendarEvent } from "../data/types";

/**
 * A "chain" is a spaced-repetition plan: one source session (a QCM or lecture)
 * plus every revision slot generated from it (J2 / J7 / J10 / J30 …).
 * Revisions are linked to their source through `parentEventId`.
 */
export interface Chain {
  key: string;
  colorIndex: number;
  members: CalendarEvent[]; // sorted chronologically
}

/** Stable palette for distinguishing one plan from another. */
export const CHAIN_COLORS = [
  "#4f7cff", // primary blue
  "#059669", // ECG green
  "#ff8f00", // QE orange
  "#a855f7", // violet
  "#ec4899", // pink
  "#0ea5e9", // sky
  "#f43f5e", // rose
  "#14b8a6", // teal
];

/** The id that groups an event with the rest of its spaced-repetition plan. */
export function chainKey(e: CalendarEvent): string {
  return e.isRevision && e.parentEventId ? e.parentEventId : e.id;
}

function chronoValue(e: CalendarEvent): string {
  return `${e.startDate}T${e.startTime}`;
}

/**
 * Group events into spaced-repetition chains. Only chains that contain at
 * least one revision slot are returned — a lone QCM is not a "plan".
 * Color assignment is stable: keys are sorted before indices are handed out.
 */
export function buildChains(events: CalendarEvent[]): Chain[] {
  const groups = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const k = chainKey(e);
    const bucket = groups.get(k);
    if (bucket) bucket.push(e);
    else groups.set(k, [e]);
  }

  const eligibleKeys = Array.from(groups.entries())
    .filter(([, members]) => members.some((m) => m.isRevision))
    .map(([key]) => key)
    .sort();

  return eligibleKeys.map((key, i) => {
    const members = [...groups.get(key)!].sort((a, b) =>
      chronoValue(a).localeCompare(chronoValue(b)),
    );
    return { key, colorIndex: i % CHAIN_COLORS.length, members };
  });
}
