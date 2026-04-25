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
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// ─────────────────────────────────────────────────────────
// Hook : suit la classe .dark sur <html>
// ─────────────────────────────────────────────────────────
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

const tierStyles: Record<
  Tier,
  { badge: string; pill: string; bar: string; row: string }
> = {
  good: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    bar: "bg-emerald-500 dark:bg-emerald-400",
    row: "bg-emerald-50/40 dark:bg-emerald-950/10",
  },
  mid: {
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-400",
    pill: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    bar: "bg-orange-500 dark:bg-orange-400",
    row: "bg-orange-50/40 dark:bg-orange-950/10",
  },
  bad: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-400",
    pill: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    bar: "bg-red-500 dark:bg-red-400",
    row: "bg-red-50/40 dark:bg-red-950/10",
  },
};

// Renders each sector; expands the active one by 6px
function sectorShape(props: PieSectorShapeProps) {
  const { isActive, outerRadius, ...rest } = props;
  return <Sector {...rest} outerRadius={isActive ? outerRadius + 6 : outerRadius} />;
}

// ─────────────────────────────────────────────────────────
// Donut chart with hover tooltip in center
// ─────────────────────────────────────────────────────────
function HoverDonut({
  data,
  title,
  delay = 0,
  isDark,
}: {
  data: DonutDatum[];
  title: string;
  delay?: number;
  isDark: boolean;
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
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
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
// Cas cliniques vs QCM simples ratio
// ─────────────────────────────────────────────────────────
function InteractiveRatio({
  cas,
  simples,
  delay = 0,
}: {
  cas: number;
  simples: number;
  delay?: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = cas + simples;
  const items = [
    { name: "Cas cliniques", value: cas, isPrimary: true },
    { name: "QCM simples",   value: simples, isPrimary: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="mt-5 border-t border-border pt-5"
    >
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `${cas}fr ${simples}fr` }}
      >
        {items.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          const isActive = activeIndex === i;
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
                boxShadow: isActive
                  ? "0 12px 28px rgba(79,124,255,0.28)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="text-xs font-semibold leading-none opacity-90">
                {item.name}
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold leading-none tabular-nums">
                  {item.value}
                </span>
                <span className="text-xs font-medium opacity-75">questions</span>
              </div>
              <div className="absolute right-3 top-3 text-[11px] font-bold tabular-nums opacity-50">
                {pct}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Attempt history row
// ─────────────────────────────────────────────────────────
function HistoryRow({
  attempt,
  index,
  prevPct,
}: {
  attempt: Attempt;
  index: number;
  prevPct: number | null;
}) {
  const pct = (attempt.score / attempt.scoreMax) * 100;
  const styles = tierStyles[attempt.tier];
  const delta = prevPct !== null ? Math.round(pct - prevPct) : null;
  const TrendIcon =
    delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor =
    delta === null || delta === 0
      ? "text-muted-foreground"
      : delta > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.55 + index * 0.08, ease: "easeOut" }}
      className={`grid grid-cols-[44px_minmax(70px,1fr)_minmax(160px,2fr)_auto] items-center gap-3 rounded-xl px-2 py-2.5 transition-colors ${styles.row} hover:opacity-100`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums ${styles.badge}`}
      >
        #{attempt.num}
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          QCM faits
        </div>
        <div className="font-bold tabular-nums text-foreground">
          {attempt.done}/{attempt.total}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${styles.pill}`}
          >
            {attempt.score}/{attempt.scoreMax}
          </span>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {Math.round(pct)}%
          </span>
          {delta !== null && (
            <span
              className={`ml-auto inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${trendColor}`}
            >
              <TrendIcon className="h-3 w-3" />
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${styles.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              duration: 0.85,
              delay: 0.65 + index * 0.08,
              ease: "easeOut",
            }}
          />
        </div>
      </div>

      <div className="text-right text-xs font-medium tabular-nums text-muted-foreground">
        {attempt.date}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────
export default function SerieIVASPage() {
  const isDark = useIsDark();
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
          <h2 className="m-0 text-lg font-bold tracking-tight text-foreground">
            IVAS
          </h2>
        </Card>
      </motion.div>

      {/* Série card */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      >
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="flex items-center justify-between px-4 py-4 [&:last-child]:pb-4">
            <div>
              <p className="text-sm font-bold text-foreground">Série 1 — IVAS</p>
              <p className="mt-1 text-sm text-muted-foreground">27 questions</p>
            </div>
            <Button className="gap-1.5 rounded-lg shadow-md shadow-primary/30">
              <Play className="h-3 w-3 fill-current" />
              Commencer
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2 px-1 pt-3"
      >
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="m-0 text-sm font-bold tracking-tight text-foreground">
          Insights
        </h3>
      </motion.div>

      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <HoverDonut
              data={tagData}
              title="QCM répartis par Tag"
              delay={0.15}
              isDark={isDark}
            />
            <HoverDonut
              data={sousCoursData}
              title="Répartition par sous-cours"
              delay={0.25}
              isDark={isDark}
            />
          </div>
          <InteractiveRatio cas={ratioData.cas} simples={ratioData.simples} delay={0.35} />
        </CardContent>
      </Card>

      {/* Statistiques heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.45 }}
        className="flex items-center gap-2 px-1 pt-3"
      >
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="m-0 text-sm font-bold tracking-tight text-foreground">
          Statistiques
        </h3>
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

          <div className="space-y-1">
            {attempts.map((a, i) => {
              const next = attempts[i + 1];
              const prevPct = next ? pctOf(next) : null;
              return (
                <HistoryRow key={a.num} attempt={a} index={i} prevPct={prevPct} />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
