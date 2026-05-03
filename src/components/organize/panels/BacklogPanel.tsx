"use client";

import { motion } from "motion/react";
import { Inbox, Plus, X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { COURSES } from "../data/courses";
import { EVENT_COLORS } from "../lib/colors";
import type { BacklogItem } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";

function DraggableBacklogItem({ item, onRemove }: { item: BacklogItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `backlog-${item.id}`,
    data: { backlogItem: item },
  });
  const colors = EVENT_COLORS[item.type];
  const course = COURSES.find((c) => c.id === item.courseId);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-lg px-2 py-1.5 ${colors.bg} ${isDragging ? "opacity-40" : ""}`}
    >
      <span className="shrink-0 text-xs">{colors.icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[11px] font-semibold ${colors.text}`}>
          {course?.shortTitle ?? course?.title ?? `Cours #${item.courseId}`}
        </p>
        <p className="text-[9px] text-muted-foreground">{item.type === "qcm" ? "QCM" : "Lecture"}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

interface Props {
  items: BacklogItem[];
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

export function BacklogPanel({ items, onRemove, onAddClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardContent className="p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">📥 À planifier</p>
            <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums text-muted-foreground">
              {items.length}
            </span>
            <button
              onClick={onAddClick}
              className="rounded border border-border p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Ajouter au backlog"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <p className="mb-2 text-[9px] text-muted-foreground">Glisse vers le calendrier pour planifier</p>

          <div className="space-y-1">
            {items.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-muted-foreground">Backlog vide 🎉</p>
            ) : (
              items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * i }}
                >
                  <DraggableBacklogItem item={item} onRemove={onRemove} />
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
