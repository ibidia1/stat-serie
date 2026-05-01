"use client";

import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "./ui/card";

type SujetResult = { correct: number; partial: number; wrong: number };

const RESULTS: Record<string, Record<string, SujetResult>> = {
  "Cardiologie – CCVT": {
    "SCA":                     { correct: 8, partial: 2, wrong: 2 },
    "Douleur thoracique":      { correct: 5, partial: 1, wrong: 0 },
    "HTA":                     { correct: 4, partial: 0, wrong: 1 },
    "Endocardite infectieuse": { correct: 3, partial: 1, wrong: 1 },
    "MVTE":                    { correct: 2, partial: 1, wrong: 2 },
  },
  "Neurologie": {
    "AVC":         { correct: 6, partial: 2, wrong: 2 },
    "Céphalées":   { correct: 4, partial: 0, wrong: 1 },
    "Épilepsies":  { correct: 3, partial: 1, wrong: 1 },
  },
  "Réanimation": {
    "Intoxication":               { correct: 2, partial: 1, wrong: 3 },
    "Polytraumatisme":            { correct: 1, partial: 1, wrong: 3 },
    "État de choc cardiogénique": { correct: 1, partial: 0, wrong: 4 },
    "Comas":                      { correct: 2, partial: 0, wrong: 3 },
  },
  "Pédiatrie": {
    "Bronchiolite":                       { correct: 5, partial: 1, wrong: 0 },
    "Déshydratation aiguë de l'enfant":   { correct: 4, partial: 1, wrong: 0 },
    "Vaccinations":                       { correct: 6, partial: 0, wrong: 0 },
  },
  "Hématologie": {
    "Anémie":                  { correct: 4, partial: 1, wrong: 1 },
    "Transfusion sanguine":    { correct: 3, partial: 0, wrong: 1 },
    "Adénopathies superficielles": { correct: 2, partial: 1, wrong: 2 },
  },
  "Gynécologie – Obstétrique": {
    "Cancer du col":            { correct: 3, partial: 1, wrong: 1 },
    "Cancer du sein":           { correct: 4, partial: 0, wrong: 1 },
    "Grossesse extra-utérine":  { correct: 2, partial: 1, wrong: 2 },
    "Prééclampsie – éclampsie": { correct: 3, partial: 1, wrong: 1 },
  },
};

function computeSpecStats(sujets: Record<string, SujetResult>) {
  let correct = 0, partial = 0, wrong = 0;
  for (const s of Object.values(sujets)) {
    correct += s.correct;
    partial += s.partial;
    wrong += s.wrong;
  }
  const total = correct + partial + wrong;
  const note  = total > 0 ? ((correct + partial * 0.5) / total) * 20 : 0;
  return { correct, partial, wrong, total, note };
}

function computeSujetNote(s: SujetResult) {
  const total = s.correct + s.partial + s.wrong;
  return total > 0 ? ((s.correct + s.partial * 0.5) / total) * 20 : 0;
}

// ─────────────────────────────────────────────────────────
// KPI card (Meilleur / À améliorer)
// ─────────────────────────────────────────────────────────
function KpiCard({
  title, name, note, variant,
}: {
  title: string; name: string; note: number; variant: "up" | "down";
}) {
  const isUp = variant === "up";
  const cardClass = isUp
    ? "bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30"
    : "bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30";
  const accentText = isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
  return (
    <motion.div whileHover={{ scale: 1.005 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={`${cardClass} relative overflow-hidden`}>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
            {isUp
              ? <TrendingUp className={accentText} size={16} />
              : <TrendingDown className={accentText} size={16} />}
            <span className="text-xs text-muted-foreground sm:text-sm">{title}</span>
          </div>
          <p className="mb-0.5 truncate text-xs text-foreground sm:text-sm" title={name}>{name || "—"}</p>
          <p className={`text-lg font-semibold tabular-nums sm:text-xl ${accentText}`}>
            {note.toFixed(1)}/20
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Spécialité card with donut + sujets
// ─────────────────────────────────────────────────────────
function SpecialiteCard({
  specialite, stats, sujets, index,
}: {
  specialite: string;
  stats: { correct: number; partial: number; wrong: number; total: number; note: number };
  sujets: Record<string, SujetResult>;
  index: number;
}) {
  const donutData = [
    { name: "Correct", value: stats.correct, color: "#059669" },
    { name: "Partiel", value: stats.partial, color: "#ff8f00" },
    { name: "Faux",    value: stats.wrong,   color: "#dc2626" },
  ].filter((d) => d.value > 0);

  const noteColor =
    stats.note >= 14 ? "text-emerald-600 dark:text-emerald-400"
    : stats.note >= 10 ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.05, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-foreground" title={specialite}>{specialite}</p>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-foreground">
              {stats.total} qcm
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={34}
                    outerRadius={52}
                    paddingAngle={donutData.length > 1 ? 2 : 0}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive
                  >
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-bold tabular-nums leading-none ${noteColor}`}>
                  {stats.note.toFixed(1)}
                </span>
                <span className="mt-0.5 text-[10px] font-semibold text-muted-foreground">/20</span>
              </div>
            </div>

            {/* Sujets list */}
            <div className="min-w-0 flex-1 space-y-2">
              {Object.entries(sujets).map(([name, s]) => {
                const total = s.correct + s.partial + s.wrong;
                const pctC  = total > 0 ? (s.correct / total) * 100 : 0;
                const pctP  = total > 0 ? (s.partial / total) * 100 : 0;
                const pctW  = total > 0 ? (s.wrong   / total) * 100 : 0;
                return (
                  <div key={name}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-medium text-foreground" title={name}>{name}</span>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{total} qcm</span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div className="h-full bg-[#059669]" initial={{ width: 0 }} animate={{ width: `${pctC}%` }} transition={{ duration: 0.6, delay: 0.1 + index * 0.05, ease: "easeOut" }} />
                      <motion.div className="h-full bg-[#ff8f00]" initial={{ width: 0 }} animate={{ width: `${pctP}%` }} transition={{ duration: 0.6, delay: 0.15 + index * 0.05, ease: "easeOut" }} />
                      <motion.div className="h-full bg-[#dc2626]" initial={{ width: 0 }} animate={{ width: `${pctW}%` }} transition={{ duration: 0.6, delay: 0.20 + index * 0.05, ease: "easeOut" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────
export default function ResultatsExamenPage() {
  const specEntries = Object.entries(RESULTS).map(([spec, sujets]) => ({
    spec, sujets, ...computeSpecStats(sujets),
  }));

  const bestSpec  = specEntries.reduce((a, b) => (a.note >= b.note ? a : b));
  const worstSpec = specEntries.reduce((a, b) => (a.note <= b.note ? a : b));

  const allSujets = specEntries.flatMap(({ spec, sujets }) =>
    Object.entries(sujets).map(([name, s]) => ({
      spec, name, total: s.correct + s.partial + s.wrong, note: computeSujetNote(s),
    }))
  ).filter((s) => s.total > 0);

  const bestSujet  = allSujets.reduce((a, b) => (a.note >= b.note ? a : b));
  const worstSujet = allSujets.reduce((a, b) => (a.note <= b.note ? a : b));

  return (
    <div className="space-y-4">
      {/* ── En-tête ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="p-4">
            <p className="text-base font-bold tracking-tight text-foreground">Résultats détaillés examen</p>
            <p className="text-xs text-muted-foreground">Analyse complète par spécialité et par cours</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 4 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard title="Meilleure spécialité"   name={bestSpec.spec}   note={bestSpec.note}   variant="up" />
        <KpiCard title="Spécialité à améliorer" name={worstSpec.spec}  note={worstSpec.note}  variant="down" />
        <KpiCard title="Meilleur cours"          name={bestSujet.name}  note={bestSujet.note}  variant="up" />
        <KpiCard title="Cours à améliorer"       name={worstSujet.name} note={worstSujet.note} variant="down" />
      </div>

      {/* ── Cartes par spécialité ───────────────────────── */}
      <div className="columns-1 gap-4 lg:columns-2">
        {specEntries.map((entry, i) => (
          <div key={entry.spec} className="mb-4 break-inside-avoid">
            <SpecialiteCard
              specialite={entry.spec}
              stats={{ correct: entry.correct, partial: entry.partial, wrong: entry.wrong, total: entry.total, note: entry.note }}
              sujets={entry.sujets}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
