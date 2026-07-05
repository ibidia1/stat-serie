"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { CalendarEvent } from "../data/types";
import { computeStreak, computeBestStreak } from "../lib/spacedRepetitionAlgo";
import { formatShortDate } from "../lib/dateUtils";
import { Card, CardContent } from "@/components/ui/card";
import { parseISO, eachDayOfInterval, subDays, format } from "date-fns";
import { fr } from "date-fns/locale";

function countLevels(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2)  return 1;
  if (count <= 5)  return 2;
  if (count <= 9)  return 3;
  return 4;
}

const LEVEL_BG = [
  "bg-muted dark:bg-muted/50",
  "bg-success/20",
  "bg-success/40",
  "bg-success/70",
  "bg-success",
];

interface Props {
  events: CalendarEvent[];
}

export function RevisionHeatmap({ events }: Props) {
  const [tooltip, setTooltip] = useState<{ iso: string; count: number } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = subDays(today, 364);

  const allDays = eachDayOfInterval({ start: startDate, end: today });

  const countByDay = new Map<string, number>();
  for (const ev of events) {
    if (ev.status === "done") {
      const iso = (ev.completedAt ?? ev.startDate).slice(0, 10);
      countByDay.set(iso, (countByDay.get(iso) ?? 0) + 1);
    }
  }

  // Build weeks (52-53 columns of 7)
  const startDow = (startDate.getDay() + 6) % 7; // Mon-first
  const paddedDays: (string | null)[] = Array(startDow).fill(null).concat(allDays.map((d) => format(d, "yyyy-MM-dd")));
  while (paddedDays.length % 7 !== 0) paddedDays.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const streak     = computeStreak(events);
  const bestStreak = computeBestStreak(events);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ma régularité</p>
              <p className="mt-1 text-sm font-bold tracking-tight">Historique des révisions</p>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-[11px] text-muted-foreground">Streak actuel</p>
                <p className="text-lg font-bold tabular-nums text-foreground">{streak} j{streak > 1 ? "" : ""} {streak >= 3 ? "🔥" : ""}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Meilleur streak</p>
                <p className="text-lg font-bold tabular-nums text-foreground">{bestStreak} j</p>
              </div>
            </div>
          </div>

          {/* Month labels */}
          <div className="mb-1 flex overflow-x-auto">
            <div className="flex gap-[2px]">
              {weeks.map((week, wi) => {
                const first = week.find((d) => d !== null);
                const showLabel = first && parseISO(first).getDate() <= 7;
                return (
                  <div key={wi} className="w-[11px] shrink-0 text-[8px] text-muted-foreground/60">
                    {showLabel ? format(parseISO(first!), "MMM", { locale: fr }).slice(0, 3) : ""}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="flex gap-[2px] overflow-x-auto pb-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((iso, di) => {
                  if (!iso) return <div key={di} className="h-[11px] w-[11px]" />;
                  const count = countByDay.get(iso) ?? 0;
                  const level = countLevels(count);
                  return (
                    <div
                      key={iso}
                      className={`h-[11px] w-[11px] rounded-[2px] cursor-default ${LEVEL_BG[level]}`}
                      onMouseEnter={() => setTooltip({ iso, count })}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatShortDate(tooltip.iso)} —{" "}
              {tooltip.count === 0
                ? "aucune révision"
                : `${tooltip.count} révision${tooltip.count > 1 ? "s" : ""}`}
            </p>
          )}

          {/* Legend */}
          <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Moins</span>
            {LEVEL_BG.map((bg, i) => (
              <div key={i} className={`h-[10px] w-[10px] rounded-[2px] ${bg}`} />
            ))}
            <span>Plus</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
