"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, X, Zap } from "lucide-react";
import type { AutoModeConfig as AutoModeConfigType } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Props {
  config: AutoModeConfigType;
  onChange: (patch: Partial<AutoModeConfigType>) => void;
  generatedThisWeek: number;
}

export function AutoModeConfig({ config, onChange, generatedThisWeek }: Props) {
  const [customMode, setCustomMode] = useState(config.customMode);
  const [newInterval, setNewInterval] = useState("");

  function removeInterval(day: number) {
    onChange({ intervals: config.intervals.filter((d) => d !== day), customMode: true });
  }

  function addInterval() {
    const n = parseInt(newInterval, 10);
    if (!n || n <= 0 || config.intervals.includes(n)) return;
    onChange({ intervals: [...config.intervals, n].sort((a, b) => a - b), customMode: true });
    setNewInterval("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <p className="text-sm font-bold tracking-tight">Mode automatique</p>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => onChange({ enabled: v })}
              className="ml-auto"
            />
          </div>

          <p className="mb-3 text-[11px] text-muted-foreground leading-relaxed">
            Quand tu complètes une tâche, des révisions sont automatiquement planifiées.
          </p>

          {/* Intervals visualization */}
          <div className="mb-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Intervalles de révision
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              {config.intervals.map((day, i) => (
                <div key={day} className="flex items-center gap-0.5">
                  {i > 0 && <div className="h-px w-4 bg-border" />}
                  <div className="flex items-center gap-0.5 rounded-full border border-accent/30 bg-accent/[0.08] px-2 py-0.5 text-[11px] font-bold text-accent">
                    J+{day}
                    {customMode && (
                      <button onClick={() => removeInterval(day)} className="ml-1 text-accent/60 hover:text-accent">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom intervals toggle */}
          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="custom-intervals"
              checked={customMode}
              onChange={(e) => { setCustomMode(e.target.checked); onChange({ customMode: e.target.checked }); }}
              className="accent-primary"
            />
            <label htmlFor="custom-intervals" className="text-[11px] text-muted-foreground cursor-pointer">
              Personnaliser les intervalles
            </label>
          </div>

          {customMode && (
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={newInterval}
                onChange={(e) => setNewInterval(e.target.value)}
                placeholder="J+"
                className="h-7 w-16 rounded border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                onKeyDown={(e) => e.key === "Enter" && addInterval()}
              />
              <button
                onClick={addInterval}
                className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-3 w-3" /> Ajouter
              </button>
            </div>
          )}

          {/* Preferred hour */}
          <div className="mb-3 flex items-center gap-3">
            <p className="text-[11px] text-muted-foreground">Heure préférée :</p>
            <input
              type="time"
              value={config.preferredHour}
              onChange={(e) => onChange({ preferredHour: e.target.value })}
              className="h-7 rounded border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <p className="text-[11px] text-muted-foreground tabular-nums">
            {generatedThisWeek} révision{generatedThisWeek !== 1 ? "s" : ""} générée{generatedThisWeek !== 1 ? "s" : ""} cette semaine.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
