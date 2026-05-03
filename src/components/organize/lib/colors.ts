import type { EventType, EventStatus } from "../data/types";

export interface EventColorSet {
  bg: string;
  text: string;
  borderLeft: string;
  badgeBg: string;
  bar: string;
  icon: string;
  borderDashed?: boolean;
}

export const EVENT_COLORS: Record<EventType, EventColorSet> = {
  qcm: {
    bg:          "bg-blue-50 dark:bg-blue-950/40",
    text:        "text-blue-700 dark:text-blue-300",
    borderLeft:  "border-l-4 border-l-blue-500",
    badgeBg:     "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-400",
    bar:         "bg-blue-500 dark:bg-blue-400",
    icon:        "✍️",
  },
  lecture: {
    bg:          "bg-emerald-50 dark:bg-emerald-950/40",
    text:        "text-emerald-700 dark:text-emerald-300",
    borderLeft:  "border-l-4 border-l-emerald-500",
    badgeBg:     "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400",
    bar:         "bg-emerald-500 dark:bg-emerald-400",
    icon:        "📖",
  },
  revision_slot: {
    bg:          "bg-amber-50 dark:bg-amber-950/40",
    text:        "text-amber-700 dark:text-amber-300",
    borderLeft:  "border-l-4 border-l-amber-400 border-dashed",
    badgeBg:     "border border-dashed border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-400",
    bar:         "bg-amber-500 dark:bg-amber-400",
    icon:        "🔁",
    borderDashed: true,
  },
};

export type Tier = "good" | "mid" | "bad";

export const TIER_STYLES: Record<Tier, { badge: string; pill: string; bar: string; row: string }> = {
  good: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400",
    pill:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    bar:   "bg-emerald-500 dark:bg-emerald-400",
    row:   "bg-emerald-50/40 dark:bg-emerald-950/10",
  },
  mid: {
    badge: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-400",
    pill:  "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    bar:   "bg-orange-500 dark:bg-orange-400",
    row:   "bg-orange-50/40 dark:bg-orange-950/10",
  },
  bad: {
    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400",
    pill:  "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    bar:   "bg-red-500 dark:bg-red-400",
    row:   "bg-red-50/40 dark:bg-red-950/10",
  },
};

export function eventStatusOverlay(status: EventStatus, startDate: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (status === "done")   return "opacity-60";
  if (status === "skipped") return "opacity-40 line-through";
  if (startDate < today && status === "upcoming") return "ring-1 ring-red-400";
  return "";
}
