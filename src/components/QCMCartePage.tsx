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
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// ─────────────────────────────────────────────────────────
// Types & données
// ─────────────────────────────────────────────────────────
type Source = "series" | "exams";

type SavedSerie = {
  id: string;
  name: string;
  questions: number;
  done: number;
  date: string;
  source: Source;
};

const mockSeries: SavedSerie[] = [
  { id: "1", name: "Transfusion sanguine",     questions: 2,  done: 2,  date: "27/04/2026", source: "exams"  },
  { id: "2", name: "Neurologie, Réanimation",  questions: 30, done: 15, date: "26/04/2026", source: "series" },
  { id: "3", name: "Série personnalisée",      questions: 30, done: 0,  date: "25/04/2026", source: "series" },
  { id: "4", name: "Cardiologie avancée",      questions: 25, done: 8,  date: "24/04/2026", source: "exams"  },
];

const STATS = [
  { label: "Questions disponibles", value: 1000, color: "text-primary" },
  { label: "Spécialités",           value: 0,    color: "text-violet-500 dark:text-violet-400" },
  { label: "Sujets",                value: 0,    color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Facultés",              value: 0,    color: "text-orange-500 dark:text-orange-400" },
];

const CONFIG_FILTERS = [
  { label: "Spécialité", value: "Toutes" },
  { label: "Faculté",    value: "Toutes" },
  { label: "Année",      value: "Toutes" },
  { label: "Sujet",      value: "Tous"   },
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
// Ligne de série sauvegardée
// ─────────────────────────────────────────────────────────
function SerieRow({ serie, index, onDelete }: { serie: SavedSerie; index: number; onDelete: (id: string) => void }) {
  const pct = serie.questions > 0 ? (serie.done / serie.questions) * 100 : 0;
  const finished = serie.done >= serie.questions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: "easeOut" }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
    >
      {/* Infos + progression */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{serie.name}</p>
          {finished && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              Terminée
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <SourceBadge source={serie.source} />
          <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
            {serie.done}/{serie.questions} questions
          </span>
          <span className="text-[11px] text-muted-foreground">· {serie.date}</span>
        </div>
        {/* Barre de progression */}
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${finished ? "bg-emerald-500 dark:bg-emerald-400" : "bg-primary/60"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: 0.2 + index * 0.05, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Actions */}
      <button className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
        <Play className="h-3 w-3 fill-current" />
        {serie.done > 0 && !finished ? "Reprendre" : "Commencer"}
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
// Composant principal
// ─────────────────────────────────────────────────────────
export default function QCMCartePage() {
  const [source, setSource] = useState<Source>("series");
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState(mockSeries);

  const filtered = series.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function deleteSerie(id: string) {
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">

      {/* ── Barre d'actions ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="p-4">
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
                    {s === "series" ? <BookOpen className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
                    {s === "series" ? "Séries" : "Examens blancs"}
                  </button>
                ))}
              </div>

              {/* Recherche */}
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher des questions…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>

              {/* Filtres */}
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtres
              </button>

              <div className="h-5 w-px bg-border" />

              {/* Actions secondaires */}
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Bookmark className="h-3.5 w-3.5" />
                Sauvegarder
              </button>
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>

              <Button className="ml-auto gap-1.5 shadow-md shadow-primary/25">
                <Play className="h-3 w-3 fill-current" />
                Générer la série
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {STATS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.08 + i * 0.06, ease: "easeOut" }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-4 text-center">
                <span className={`text-3xl font-bold tabular-nums ${item.color}`}>
                  {item.value.toLocaleString()}
                </span>
                <span className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Deux colonnes : config + séries ─────────────── */}
      <div className="grid grid-cols-[1fr_2fr] gap-4">

        {/* Config actuelle */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.35, ease: "easeOut" }}
        >
          <Card className="h-full">
            <CardContent className="p-5">
              <p className="mb-4 text-sm font-bold text-foreground">Configuration actuelle</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {source === "series" ? "Séries" : "Examens blancs"}
                  </span>
                </div>
                {CONFIG_FILTERS.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">{value}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">À générer</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary">30 questions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mes séries */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.35, ease: "easeOut" }}
        >
          <Card className="h-full">
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

              <div className="space-y-0.5">
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

    </div>
  );
}
