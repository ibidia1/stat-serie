"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  RotateCcw,
  Bookmark,
  Play,
  Trash2,
  BookOpen,
  FlaskConical,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// ─────────────────────────────────────────────────────────
// Types & data
// ─────────────────────────────────────────────────────────
type Source = "series" | "exams";

type SavedSerie = {
  id: string;
  name: string;
  questions: number;
  date: string;
  source: Source;
};

const mockSeries: SavedSerie[] = [
  { id: "1", name: "Transfusion sanguine",    questions: 2,  date: "27/04/2026", source: "exams"  },
  { id: "2", name: "Neurologie, Réanimation", questions: 30, date: "26/04/2026", source: "series" },
  { id: "3", name: "Série personnalisée",     questions: 30, date: "25/04/2026", source: "series" },
  { id: "4", name: "Série personnalisée",     questions: 30, date: "25/04/2026", source: "exams"  },
];

type StatItem = { label: string; value: number; color: string };

const statsBase: StatItem[] = [
  { label: "Questions disponibles", value: 1000, color: "text-primary" },
  { label: "Spécialités",           value: 0,    color: "text-violet-500 dark:text-violet-400" },
  { label: "Sujets",                value: 0,    color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Facultés",              value: 0,    color: "text-orange-500 dark:text-orange-400" },
];

// ─────────────────────────────────────────────────────────
// Source badge
// ─────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: Source }) {
  return source === "exams" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
      <FlaskConical className="h-2.5 w-2.5" />
      Examen blanc
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      <BookOpen className="h-2.5 w-2.5" />
      Série
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────
function StatCard({ item, index }: { item: StatItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.06, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-5 text-center">
          <span className={`text-3xl font-bold tabular-nums ${item.color}`}>
            {item.value.toLocaleString()}
          </span>
          <span className="mt-1 text-xs font-medium text-muted-foreground">
            {item.label}
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Saved serie row
// ─────────────────────────────────────────────────────────
function SerieRow({
  serie,
  index,
  onDelete,
}: {
  serie: SavedSerie;
  index: number;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
    >
      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{serie.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <SourceBadge source={serie.source} />
          <span className="text-[11px] text-muted-foreground">{serie.questions} questions</span>
          <span className="text-[11px] text-muted-foreground">· {serie.date}</span>
        </div>
      </div>

      {/* Actions */}
      <button className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
        <Play className="h-3 w-3 fill-current" />
        Reprendre
      </button>
      <button
        onClick={() => onDelete(serie.id)}
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────
export default function QCMCartePage() {
  const [source, setSource]       = useState<Source>("series");
  const [search, setSearch]       = useState("");
  const [series, setSeries]       = useState(mockSeries);
  const [showConfig, setShowConfig] = useState(true);

  const filtered = series.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  function deleteSerie(id: string) {
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4">

      {/* ── Barre d'actions ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="p-4">

            {/* Ligne 1 : source + recherche */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle source */}
              <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
                {(["series", "exams"] as Source[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      source === s
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "series" ? (
                      <BookOpen className="h-3 w-3" />
                    ) : (
                      <FlaskConical className="h-3 w-3" />
                    )}
                    {s === "series" ? "Séries" : "Examens blancs"}
                  </button>
                ))}
              </div>

              {/* Recherche */}
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher des questions…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>

              {/* Filtres avancés */}
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtres
              </button>
            </div>

            {/* Ligne 2 : actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Bookmark className="h-3.5 w-3.5" />
                Sauvegarder ces filtres
              </button>
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
              <div className="ml-auto">
                <Button className="gap-1.5 shadow-md shadow-primary/25">
                  <Play className="h-3 w-3 fill-current" />
                  Générer la série
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsBase.map((item, i) => (
          <StatCard key={item.label} item={item} index={i} />
        ))}
      </div>

      {/* ── Configuration actuelle ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setShowConfig((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <p className="text-sm font-bold text-foreground">Configuration actuelle</p>
                <p className="text-xs text-muted-foreground">30 questions à générer · 1 000 disponibles</p>
              </div>
              <motion.div
                animate={{ rotate: showConfig ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border px-5 pb-4 pt-3 sm:grid-cols-3">
                    {[
                      { label: "Source",     value: source === "series" ? "Séries" : "Examens blancs" },
                      { label: "Spécialité", value: "Toutes" },
                      { label: "Faculté",    value: "Toutes" },
                      { label: "Année",      value: "Toutes" },
                      { label: "Sujet",      value: "Tous"   },
                      { label: "Durée est.", value: "~45 min" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-baseline gap-2">
                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Mes séries ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Mes séries personnalisées</p>
                <p className="text-xs text-muted-foreground">Séries générées avec vos filtres</p>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {filtered.length} série{filtered.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {filtered.length > 0 ? (
                  filtered.map((s, i) => (
                    <SerieRow key={s.id} serie={s} index={i} onDelete={deleteSerie} />
                  ))
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Aucune série trouvée
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
