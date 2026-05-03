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
    bg:          "bg-primary/[0.08]",
    text:        "text-primary",
    borderLeft:  "border-l-4 border-l-primary",
    badgeBg:     "border border-primary/20 bg-primary/[0.08] text-primary",
    bar:         "bg-primary",
    icon:        "✍️",
  },
  lecture: {
    bg:          "bg-success/[0.08]",
    text:        "text-success",
    borderLeft:  "border-l-4 border-l-success",
    badgeBg:     "border border-success/20 bg-success/[0.08] text-success",
    bar:         "bg-success",
    icon:        "📖",
  },
  revision_slot: {
    bg:          "bg-accent/[0.08]",
    text:        "text-accent",
    borderLeft:  "border-l-4 border-l-accent border-dashed",
    badgeBg:     "border border-dashed border-accent/30 bg-accent/[0.08] text-accent",
    bar:         "bg-accent",
    icon:        "🔁",
    borderDashed: true,
  },
};

export type Tier = "good" | "mid" | "bad";

export const TIER_STYLES: Record<Tier, { badge: string; pill: string; bar: string; row: string }> = {
  good: {
    badge: "border-success/30 bg-success/[0.08] text-success",
    pill:  "bg-success/[0.08] text-success",
    bar:   "bg-success",
    row:   "bg-success/[0.04]",
  },
  mid: {
    badge: "border-accent/30 bg-accent/[0.08] text-accent",
    pill:  "bg-accent/[0.08] text-accent",
    bar:   "bg-accent",
    row:   "bg-accent/[0.04]",
  },
  bad: {
    badge: "border-destructive/30 bg-destructive/[0.08] text-destructive",
    pill:  "bg-destructive/[0.08] text-destructive",
    bar:   "bg-destructive",
    row:   "bg-destructive/[0.04]",
  },
};

export function eventStatusOverlay(status: EventStatus, startDate: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (status === "done")   return "opacity-60";
  if (status === "skipped") return "opacity-40 line-through";
  if (startDate < today && status === "upcoming") return "ring-1 ring-destructive";
  return "";
}
