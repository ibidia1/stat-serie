"use client";

import { useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogHeader, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { timeToMinutes } from "../lib/dateUtils";
import type { BlockedRange } from "../data/types";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

interface Props {
  open: boolean;
  onClose: () => void;
  ranges: BlockedRange[];
  onAdd: (r: Omit<BlockedRange, "id">) => void;
  onRemove: (id: string) => void;
}

export function BlockedRangesDialog({ open, onClose, ranges, onAdd, onRemove }: Props) {
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("12:00");

  const valid =
    label.trim().length > 0 &&
    days.length > 0 &&
    timeToMinutes(start) < timeToMinutes(end);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  function handleAdd() {
    if (!valid) return;
    onAdd({ label: label.trim(), days, startTime: start, endTime: end });
    setLabel("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-md">
      <DialogHeader onClose={onClose}>
        <span className="flex items-center gap-2">
          <CalendarOff className="h-4 w-4 text-muted-foreground" />
          Plages bloquées
        </span>
      </DialogHeader>
      <DialogBody className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Créneaux récurrents non planifiables (cours à la faculté, sport, repas…).
          Le calendrier et le placement automatique des révisions les respectent.
        </p>

        {/* Existing ranges */}
        <div className="space-y-1.5">
          {ranges.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
              Aucune plage bloquée
            </p>
          ) : (
            ranges.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">🚫 {r.label}</p>
                  <p className="text-[10px] tabular-nums text-muted-foreground">
                    {r.days.map((d) => DAY_LABELS[d]).join(" ")} · {r.startTime} – {r.endTime}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(r.id)}
                  title="Supprimer"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add form */}
        <div className="space-y-3 rounded-xl border border-border p-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value.slice(0, 40))}
            placeholder="Libellé (ex. Cours à la faculté)"
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-center gap-1.5">
            {DAY_LABELS.map((l, d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                aria-pressed={days.includes(d)}
                className={`h-7 w-7 rounded-lg border text-[11px] font-bold transition-colors ${
                  days.includes(d)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className="text-xs text-muted-foreground">→</span>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button onClick={handleAdd} disabled={!valid} className="ml-auto gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
