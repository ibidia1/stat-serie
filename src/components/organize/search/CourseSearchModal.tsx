"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCourseSearch } from "../hooks/useCourseSearch";
import { getSeriesForCourse } from "../data/series";
import type { Course } from "../data/types";

const STATUS_DOT: Record<Course["status"], string> = {
  completed:   "text-success",
  in_progress: "text-accent",
  not_started: "text-muted-foreground",
};
const STATUS_LABEL: Record<Course["status"], string> = {
  completed:   "✅",
  in_progress: "🟡",
  not_started: "⚪",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (course: Course) => void;
}

export function CourseSearchModal({ open, onClose, onSelect }: Props) {
  const { query, setQuery, results } = useCourseSearch(12);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, setQuery]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIdx]) { onSelect(results[activeIdx]); onClose(); }
    if (e.key === "Escape") onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onKeyDown={handleKey}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un cours par nom ou numéro…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[440px] overflow-y-auto">
              {results.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Aucun cours trouvé</p>
              ) : (
                results.map((course, i) => {
                  const seriesList = getSeriesForCourse(course.id);
                  const done   = seriesList.filter((s) => s.userStatus === "done").length;
                  const total  = seriesList.length;
                  return (
                    <button
                      key={course.id}
                      onClick={() => { onSelect(course); onClose(); }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                        i === activeIdx ? "bg-muted" : ""
                      }`}
                    >
                      <span className="w-8 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        #{course.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{course.title}</span>
                          {course.shortTitle && (
                            <span className="text-[10px] text-muted-foreground">({course.shortTitle})</span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{course.specialty}</span>
                          <span>·</span>
                          <span>{course.day}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-xs ${STATUS_DOT[course.status]}`}>{STATUS_LABEL[course.status]}</span>
                        <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">{done}/{total} séries</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-border px-4 py-2">
              <p className="text-[10px] text-muted-foreground">
                <kbd className="rounded border border-border px-1">↑↓</kbd> naviguer ·{" "}
                <kbd className="rounded border border-border px-1">↵</kbd> sélectionner ·{" "}
                <kbd className="rounded border border-border px-1">Esc</kbd> fermer
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
