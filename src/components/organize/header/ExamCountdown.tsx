"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Calendar, X } from "lucide-react";
import { countdownDays } from "../lib/dateUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  examDate: string;
  onDateChange: (iso: string) => void;
}

export function ExamCountdown({ examDate, onDateChange }: Props) {
  const days = countdownDays(examDate);
  const urgent = days <= 7;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(examDate);

  return (
    <div className="relative">
      <button
        onClick={() => { setDraft(examDate); setEditing(true); }}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors ${
          urgent
            ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-400"
            : "border-primary/30 bg-primary/10 text-primary"
        }`}
      >
        {urgent ? <Flame className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
        J-{days}
      </button>

      <AnimatePresence>
        {editing && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setEditing(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold tracking-tight">Date du résidanat</p>
                <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <Input
                type="date"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="mb-3 text-xs"
              />
              <Button
                className="w-full text-xs"
                onClick={() => { onDateChange(draft); setEditing(false); }}
              >
                Enregistrer
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
