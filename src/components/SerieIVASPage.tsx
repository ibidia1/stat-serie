"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  type PieSectorShapeProps,
} from "recharts";
import {
  ChevronLeft,
  Play,
  Lightbulb,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
type DonutDatum = { name: string; light: string; dark: string; value: number };
type Tier = "good" | "mid" | "bad";
type Attempt = {
  num: number;
  done: number;
  total: number;
  score: number;
  scoreMax: number;
  date: string;
  tier: Tier;
};

// ─────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────
const tagData: DonutDatum[] = [
  { name: "Clinique",      value: 30, light: "#4f7cff", dark: "#60a5fa" },
  { name: "Pharmacologie", value: 20, light: "#ff8f00", dark: "#fb923c" },
  { name: "Physiologie",   value: 15, light: "#059669", dark: "#34d399" },
  { name: "Biologie",      value: 13, light: "#8b5cf6", dark: "#a78bfa" },
  { name: "Anatomie",      value: 12, light: "#dc2626", dark: "#f87171" },
  { name: "Épidémiologie", value: 10, light: "#94a3b8", dark: "#cbd5e1" },
];

const sousCoursData: DonutDatum[] = [
  { name: "Rhinosinusite", value: 26, light: "#ec4899", dark: "#f472b6" },
  { name: "Angine",        value: 24, light: "#ff8f00", dark: "#fb923c" },
  { name: "Otite",         value: 22, light: "#8b5cf6", dark: "#a78bfa" },
  { name: "Laryngite",     value: 15, light: "#059669", dark: "#34d399" },
  { name: "Ethmoïdite",    value: 13, light: "#94a3b8", dark: "#cbd5e1" },
];

const ratioData = { cas: 10, simples: 17 };

const attempts: Attempt[] = [
  { num: 3, done: 27, total: 27, score: 23, scoreMax: 27, date: "15/04/2026", tier: "good" },
  { num: 2, done: 27, total: 27, score: 18, scoreMax: 27, date: "02/04/2026", tier: "mid" },
  { num: 1, done: 24, total: 27, score: 13, scoreMax: 24, date: "21/03/2026", tier: "bad" },
];

const INITIAL_VOTES = 47;
const INITIAL_SUM   = Math.round(7.8 * INITIAL_VOTES);

const tierStyles: Record<
  Tier,
  { badge: string; pill: string; bar: string; row: string }
> = {
  good: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400",
    pill:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    bar:   "bg-emerald-500 dark:bg-emerald-400",
    row:   "bg-emerald-50/40 dark:bg-emerald-950/10",
  },
  mid: {
    badge: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-400",
    pill:  "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    bar:   "bg-orange-500 dark:bg-orange-400",
    row:   "bg-orange-50/40 dark:bg-orange-950/10",
  },
  bad: {
    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400",
    pill:  "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    bar:   "bg-red-500 dark:bg-red-400",
    row:   "bg-red-50/40 dark:bg-red-950/10",
  },
};

// ─────────────────────────────────────────────────────────
// Donut helpers
// ─────────────────────────────────────────────────────────
function sectorShape(props: PieSectorShapeProps) {
  const { isActive, outerRadius, ...rest } = props;
  return <Sector {...rest} outerRadius={isActive ? outerRadius + 6 : outerRadius} />;
}

function HoverDonut({
  data, title, delay = 0, isDark,
}: {
  data: DonutDatum[]; title: string; delay?: number; isDark: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? data[activeIndex] : null;
  const colorOf = (d: DonutDatum) => (isDark ? d.dark : d.light);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="relative h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={58} outerRadius={80}
              paddingAngle={2} dataKey="value"
              shape={sectorShape}
              onMouseEnter={(_: unknown, i: number) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              isAnimationActive={false}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={colorOf(entry)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.name}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="text-center"
              >
                <div
                  className="text-2xl font-bold leading-none tabular-nums"
                  style={{ color: colorOf(active) }}
                >
                  {active.value}%
                </div>
                <div className="mt-1 max-w-[120px] text-xs font-medium leading-tight text-muted-foreground">
                  {active.name}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Ratio clinique / simples
// ─────────────────────────────────────────────────────────
function InteractiveRatio({ cas, simples, delay = 0 }: { cas: number; simples: number; delay?: number }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = cas + simples;
  const items = [
    { name: "Cas cliniques", value: cas,     isPrimary: true },
    { name: "QCM simples",   value: simples, isPrimary: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="mt-5 border-t border-border pt-5"
    >
      <div className="grid gap-2" style={{ gridTemplateColumns: `${cas}fr ${simples}fr` }}>
        {items.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          const isActive   = activeIndex === i;
          const isInactive = activeIndex !== null && activeIndex !== i;
          return (
            <motion.div
              key={item.name}
              className={`relative cursor-pointer overflow-hidden rounded-xl px-4 py-3.5 ${
                item.isPrimary
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/15 text-primary dark:bg-primary/20"
              }`}
              style={{ minWidth: 110 }}
              animate={{
                opacity: isInactive ? 0.45 : 1,
                scale: isActive ? 1.025 : 1,
                boxShadow: isActive ? "0 12px 28px rgba(79,124,255,0.28)" : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="text-xs font-semibold leading-none opacity-90">{item.name}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold leading-none tabular-nums">{item.value}</span>
                <span className="text-xs font-medium opacity-75">questions</span>
              </div>
              <div className="absolute right-3 top-3 text-[11px] font-bold tabular-nums opacity-50">{pct}%</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Carte de tentative — layout horizontal compact
// ─────────────────────────────────────────────────────────
function AttemptCard({ attempt, index, prevPct }: { attempt: Attempt; index: number; prevPct: number | null }) {
  const pct    = (attempt.score / attempt.scoreMax) * 100;
  const styles = tierStyles[attempt.tier];
  const delta  = prevPct !== null ? Math.round(pct - prevPct) : null;
  const TrendIcon = delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor =
    delta === null || delta === 0 ? "text-muted-foreground"
    : delta > 0 ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.55 + index * 0.07, ease: "easeOut" }}
      className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${styles.row}`}
    >
      {/* Badge + date */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums ${styles.badge}`}>
          #{attempt.num}
        </div>
        <span className="w-[62px] text-[11px] font-medium tabular-nums text-muted-foreground">
          {attempt.date}
        </span>
      </div>

      {/* Score + % + tendance */}
      <div className="shrink-0 w-[100px]">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tabular-nums text-foreground">{attempt.score}</span>
          <span className="text-sm font-semibold text-muted-foreground">/{attempt.scoreMax}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${styles.pill}`}>
            {Math.round(pct)}%
          </span>
          {delta !== null && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${trendColor}`}>
              <TrendIcon className="h-2.5 w-2.5" />
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
      </div>

      {/* Barre de progression — occupe l'espace restant */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-2 overflow-hidden rounded-full bg-muted/70">
          <motion.div
            className={`h-full rounded-full ${styles.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.85, delay: 0.6 + index * 0.07, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Questions faites */}
      <div className="shrink-0 text-right text-[11px] font-medium tabular-nums text-muted-foreground">
        {attempt.done}/{attempt.total}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Étoiles d'affichage (read-only) — utilisées dans la carte série
// ─────────────────────────────────────────────────────────
function StarDisplay({ avg }: { avg: number }) {
  const filled = Math.round(avg);
  return (
    <div className="flex w-full items-center gap-2">
      <div className="flex flex-1 items-center justify-between">
        {Array.from({ length: 10 }, (_, i) => (
          <Star
            key={i}
            className={`h-6 w-6 transition-colors ${
              i < filled
                ? "text-amber-400 dark:text-amber-300"
                : "text-border dark:text-border"
            }`}
            fill={i < filled ? "currentColor" : "none"}
            strokeWidth={i < filled ? 0 : 1.5}
          />
        ))}
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums text-amber-500 dark:text-amber-400">
        {avg.toFixed(1)}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Widget de notation interactive (fin de série)
// ─────────────────────────────────────────────────────────
function StarRating({
  avg,
  totalVotes,
  selected,
  onSelect,
}: {
  avg: number;
  totalVotes: number;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const hasVoted     = selected !== null;
  const displayScore = hover ?? selected ?? avg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.75, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="p-5">
          {/* En-tête */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Note des étudiants
            </p>
            <span className="text-[11px] font-medium text-muted-foreground">
              {totalVotes} vote{totalVotes > 1 ? "s" : ""}
            </span>
          </div>

          {/* Score animé */}
          <div className="mb-4 flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={Math.round(displayScore * 10)}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="text-4xl font-bold tabular-nums text-foreground"
              >
                {displayScore.toFixed(1)}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm font-semibold text-muted-foreground">/10</span>
          </div>

          {/* Étoiles interactives */}
          <div className="flex gap-1" onMouseLeave={() => !hasVoted && setHover(null)}>
            {Array.from({ length: 10 }, (_, i) => {
              const star   = i + 1;
              const filled = star <= Math.round(hover ?? selected ?? avg);
              return (
                <motion.button
                  key={star}
                  disabled={hasVoted}
                  onClick={() => !hasVoted && onSelect(star)}
                  onMouseEnter={() => !hasVoted && setHover(star)}
                  whileTap={hasVoted ? {} : { scale: 1.3 }}
                  transition={{ duration: 0.12 }}
                  className={`rounded p-0.5 focus:outline-none ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
                  aria-label={`${star} sur 10`}
                >
                  <motion.div
                    animate={{ scale: hover === star && !hasVoted ? 1.25 : 1 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors duration-100 ${
                        filled ? "text-amber-400 dark:text-amber-300" : "text-muted"
                      }`}
                      fill={filled ? "currentColor" : "none"}
                      strokeWidth={filled ? 0 : 1.5}
                    />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {/* Confirmation */}
          <AnimatePresence>
            {hasVoted && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                Merci pour ta note — {selected}/10 enregistré !
              </motion.p>
            )}
          </AnimatePresence>


        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function SerieIVASPage() {
  const isDark = useIsDark();

  // État partagé de notation
  const [totalVotes,    setTotalVotes]    = useState(INITIAL_VOTES);
  const [totalSum,      setTotalSum]      = useState(INITIAL_SUM);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const avg = totalSum / totalVotes;

  function handleVote(star: number) {
    if (selectedRating !== null) return;
    setSelectedRating(star);
    setTotalSum((s) => s + star);
    setTotalVotes((v) => v + 1);
  }

  const pctOf = (a: Attempt) => (a.score / a.scoreMax) * 100;

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="flex flex-row items-center gap-2 px-4 py-3.5">
          <ChevronLeft className="h-5 w-5 cursor-pointer text-muted-foreground" />
          <h2 className="m-0 text-lg font-bold tracking-tight text-foreground">IVAS</h2>
        </Card>
      </motion.div>

      {/* Carte série — étoiles entre "27 questions" et "Commencer" */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      >
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="px-4 py-4 [&:last-child]:pb-4">
            <p className="mb-2.5 text-sm font-bold text-foreground">Série 1 — IVAS</p>
            <div className="flex items-center gap-3">
              {/* "27 questions" à gauche */}
              <p className="shrink-0 text-sm text-muted-foreground">27 questions</p>

              {/* Étoiles qui remplissent l'espace central */}
              <div className="flex flex-1 items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
                >
                  <StarDisplay avg={avg} />
                </motion.div>
              </div>

              {/* Bouton à droite */}
              <Button className="shrink-0 gap-1.5 rounded-lg shadow-md shadow-primary/30">
                <Play className="h-3 w-3 fill-current" />
                Commencer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2 px-1 pt-3"
      >
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="m-0 text-sm font-bold tracking-tight text-foreground">Insights</h3>
      </motion.div>

      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <HoverDonut data={tagData}       title="QCM répartis par Tag"       delay={0.15} isDark={isDark} />
            <HoverDonut data={sousCoursData} title="Répartition par sous-cours" delay={0.25} isDark={isDark} />
          </div>
          <InteractiveRatio cas={ratioData.cas} simples={ratioData.simples} delay={0.35} />
        </CardContent>
      </Card>

      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.45 }}
        className="flex items-center gap-2 px-1 pt-3"
      >
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="m-0 text-sm font-bold tracking-tight text-foreground">Statistiques</h3>
      </motion.div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Historique des tentatives
            </p>
            <span className="text-[11px] font-medium text-muted-foreground">
              {attempts.length} tentative{attempts.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {attempts.map((a, i) => {
              const next    = attempts[i + 1];
              const prevPct = next ? pctOf(next) : null;
              return <AttemptCard key={a.num} attempt={a} index={i} prevPct={prevPct} />;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notation — à intégrer à la fenêtre qui apparait en terminant la série */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="flex items-center gap-2 px-1 pt-3"
      >
        <Star className="h-4 w-4 fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300" />
        <h3 className="m-0 text-sm font-bold tracking-tight text-foreground">
          Notation{" "}
          <span className="font-normal text-muted-foreground">
            (à intégrer à la fenêtre qui apparaît en terminant la série)
          </span>
        </h3>
      </motion.div>

      <StarRating
        avg={avg}
        totalVotes={totalVotes}
        selected={selectedRating}
        onSelect={handleVote}
      />
    </div>
  );
}
