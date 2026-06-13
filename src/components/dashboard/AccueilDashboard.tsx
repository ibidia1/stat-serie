"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Flame,
  Home,
  ListChecks,
  MapPin,
  Menu,
  Moon,
  Play,
  Quote,
  Search,
  Sparkles,
  Stethoscope,
  Sun,
  Target,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

// ─────────────────────────────────────────────────────────
// Dark-mode helper
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
// Mock data
// ─────────────────────────────────────────────────────────
const USER = {
  email: "imenyousfi44@gmail.com",
  name: "Imen",
  initial: "I",
};

type Task = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  place?: string;
  accent: "primary" | "accent" | "success";
};

const TODAY_TASKS: Task[] = [
  {
    id: "t1",
    icon: "📘",
    title: "Révision Cardiologie",
    subtitle: "SCA — Syndrome Coronarien Aigu",
    time: "09:00",
    duration: "2h",
    accent: "primary",
  },
  {
    id: "t2",
    icon: "🫁",
    title: "QCM Pneumologie",
    subtitle: "Série 2024 — Sousse",
    time: "14:30",
    duration: "1h30",
    place: "Sousse",
    accent: "accent",
  },
  {
    id: "t3",
    icon: "🧠",
    title: "Flashcards Neurologie",
    subtitle: "Révision espacée — 42 cartes",
    time: "18:00",
    duration: "45min",
    accent: "success",
  },
];

const WEEKLY_ACTIVITY = [
  { day: "Lun", qcm: 42 },
  { day: "Mar", qcm: 68 },
  { day: "Mer", qcm: 55 },
  { day: "Jeu", qcm: 90 },
  { day: "Ven", qcm: 74 },
  { day: "Sam", qcm: 110 },
  { day: "Dim", qcm: 63 },
];

const SUBJECTS = [
  { name: "Cardiologie", value: 88, color: "var(--primary)" },
  { name: "Pneumologie", value: 72, color: "var(--success)" },
  { name: "Neurologie", value: 64, color: "var(--accent)" },
  { name: "Néphrologie", value: 51, color: "#a855f7" },
];

const NAV_ITEMS = [
  { icon: Home, label: "Accueil", active: true },
  { icon: BookOpen, label: "Cours" },
  { icon: Calendar, label: "Planning" },
  { icon: Filter, label: "QCM à la carte" },
  { icon: Trophy, label: "Classement" },
  { icon: BarChart3, label: "Statistiques" },
  { icon: FileText, label: "Documents" },
];

// ─────────────────────────────────────────────────────────
// Small building blocks
// ─────────────────────────────────────────────────────────
const ACCENT_RING: Record<Task["accent"], string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  accent: "bg-accent/10 text-accent ring-accent/20",
  success: "bg-success/10 text-success ring-success/20",
};

function ProgressRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="11"
          className="stroke-muted"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{value}%</span>
        <span className="text-[11px] font-medium text-muted-foreground">
          objectif
        </span>
      </div>
    </div>
  );
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-1.5 shadow-md">
      <p className="text-xs font-semibold text-foreground">
        {payload[0]?.value} QCM
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────────────────
export default function AccueilDashboard() {
  const isDark = useIsDark();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const first = setTimeout(update, 0);
    const id = setInterval(update, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const toggleDark = () => document.documentElement.classList.toggle("dark");
  const toggleTask = (id: string) =>
    setDone((d) => ({ ...d, [id]: !d[id] }));

  const completedCount = Object.values(done).filter(Boolean).length;
  const taskProgress = Math.round((completedCount / TODAY_TASKS.length) * 100);

  const dateLabel = useMemo(() => {
    if (!now) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now);
  }, [now]);

  const timeLabel = useMemo(() => {
    if (!now) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
  }, [now]);

  const greeting = useMemo(() => {
    const h = now?.getHours() ?? 9;
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  }, [now]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-[76px] flex-col items-center gap-2 border-r border-border bg-card py-6 md:flex">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#7aa0ff] text-lg font-black text-primary-foreground shadow-lg shadow-primary/30">
          QE
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1.5">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              title={label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-[19px] w-[19px]" />
              <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </button>
          ))}
        </nav>
        <button
          title="Profil"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffc164] text-sm font-bold text-accent-foreground shadow-md"
        >
          {USER.initial}
        </button>
      </aside>

      {/* ── Main column ─────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-8">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 md:hidden">
            <span className="text-lg font-black text-foreground">QE</span>
            <span className="text-lg font-black text-primary">.tn</span>
          </div>

          <div className="relative ml-auto hidden max-w-md flex-1 md:ml-0 md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher des cours, QCM, séries…"
              className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleDark}
              aria-label="Basculer le thème"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {isDark ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffc164] text-sm font-bold text-accent-foreground shadow-sm">
              {USER.initial}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 md:px-8 md:py-8">
          {/* Hero greeting */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#5b84ff] to-[#7aa0ff] p-6 text-primary-foreground shadow-xl shadow-primary/20 md:p-8"
          >
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 right-24 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
            <Activity className="absolute right-6 top-6 hidden h-28 w-28 text-white/10 sm:block" />
            <div className="relative">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
                <Calendar className="h-4 w-4" />
                <span className="capitalize">{dateLabel || "Chargement…"}</span>
                {timeLabel && (
                  <>
                    <span className="opacity-50">•</span>
                    <Clock className="h-4 w-4" />
                    <span>{timeLabel}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                {greeting}, {USER.name} 👋
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-white/85 md:text-base">
                Prêt(e) pour votre session d&apos;étude&nbsp;? Vous avez{" "}
                {TODAY_TASKS.length - completedCount} activité
                {TODAY_TASKS.length - completedCount > 1 ? "s" : ""} au programme
                aujourd&apos;hui.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-md transition-transform hover:-translate-y-0.5">
                  <Play className="h-4 w-4 fill-current" />
                  Reprendre ma session
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm transition-colors hover:bg-white/25">
                  <Sparkles className="h-4 w-4" />
                  Suggestion du jour
                </button>
              </div>
            </div>
          </motion.section>

          {/* KPI stats */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                icon: Flame,
                label: "Jours de série",
                value: "7",
                hint: "Record : 14",
                tint: "text-accent",
                bg: "bg-accent/10",
              },
              {
                icon: ListChecks,
                label: "QCM résolus",
                value: "1 247",
                hint: "+86 cette semaine",
                tint: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Award,
                label: "Cours terminés",
                value: "12",
                hint: "sur 18 prévus",
                tint: "text-success",
                bg: "bg-success/10",
              },
              {
                icon: Target,
                label: "Taux de réussite",
                value: "85%",
                hint: "+4% vs. mois dernier",
                tint: "text-[#a855f7]",
                bg: "bg-[#a855f7]/10",
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i }}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div
                      className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}
                    >
                      <s.icon className={`h-[18px] w-[18px] ${s.tint}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">
                      {s.hint}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </section>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column (2/3) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Today's program */}
              <Card>
                <CardContent className="p-5 md:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-[18px] w-[18px] text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-foreground">
                          Votre programme aujourd&apos;hui
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {completedCount}/{TODAY_TASKS.length} terminé
                          {completedCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-success"
                          animate={{ width: `${taskProgress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {taskProgress}%
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {TODAY_TASKS.map((task) => {
                      const isDone = !!done[task.id];
                      return (
                        <li key={task.id}>
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                              isDone
                                ? "border-success/30 bg-success/5"
                                : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                isDone
                                  ? "border-success bg-success text-success-foreground"
                                  : "border-border"
                              }`}
                            >
                              {isDone && <CheckCircle2 className="h-4 w-4" />}
                            </span>
                            <span
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg ring-1 ${ACCENT_RING[task.accent]}`}
                            >
                              {task.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm font-semibold ${
                                  isDone
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }`}
                              >
                                {task.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {task.subtitle}
                              </p>
                            </div>
                            <div className="hidden flex-shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
                              {task.place && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {task.place}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {task.time}
                              </span>
                              <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
                                {task.duration}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#6b93ff] p-6 text-left text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <BookOpen className="mb-8 h-7 w-7" />
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold">QCM Séries</p>
                      <p className="text-sm text-white/80">
                        Travaillez par série complète
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-[#ffb74d] p-6 text-left text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:-translate-y-1">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <Filter className="mb-8 h-7 w-7" />
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold">QCM à la carte</p>
                      <p className="text-sm text-white/85">
                        Composez votre propre session
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </div>

              {/* Weekly activity */}
              <Card>
                <CardContent className="p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                        <Activity className="h-[18px] w-[18px] text-success" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-foreground">
                          Activité de la semaine
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          502 QCM résolus · 7 jours d&apos;affilée
                        </p>
                      </div>
                    </div>
                    <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success sm:flex">
                      <TrendingUpIcon /> +18%
                    </span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={WEEKLY_ACTIVITY}
                        margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="qcmGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="var(--primary)"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--primary)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: isDark ? "#94a3b8" : "#64748b",
                            fontSize: 12,
                          }}
                          dy={6}
                        />
                        <Tooltip
                          content={<ChartTooltip />}
                          cursor={{
                            stroke: "var(--primary)",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="qcm"
                          stroke="var(--primary)"
                          strokeWidth={2.5}
                          fill="url(#qcmGradient)"
                          dot={{ r: 0 }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column (1/3) */}
            <div className="space-y-6">
              {/* Continue learning */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 to-transparent p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Continuer
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                      ❤️
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">
                        Cardio — Chapitre 3
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Insuffisance cardiaque
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Progression</span>
                      <span className="font-semibold text-foreground">78%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[#7aa0ff]"
                        initial={{ width: 0 }}
                        animate={{ width: "78%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    Reprendre
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>

              {/* Objective ring */}
              <Card>
                <CardContent className="flex flex-col items-center p-5">
                  <h2 className="mb-1 self-start text-base font-bold text-foreground">
                    Objectif hebdomadaire
                  </h2>
                  <p className="mb-3 self-start text-xs text-muted-foreground">
                    17 h sur 20 h d&apos;étude
                  </p>
                  <ProgressRing value={85} />
                  <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-success/10 py-2 text-xs font-semibold text-success">
                    <Trophy className="h-4 w-4" />
                    Plus que 3 h pour atteindre votre but
                  </div>
                </CardContent>
              </Card>

              {/* Performance by subject */}
              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Stethoscope className="h-[18px] w-[18px] text-primary" />
                    </div>
                    <h2 className="text-base font-bold text-foreground">
                      Performance par matière
                    </h2>
                  </div>
                  <ul className="space-y-3.5">
                    {SUBJECTS.map((s, i) => (
                      <li key={s.name}>
                        <div className="mb-1 flex justify-between text-xs font-medium">
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-muted-foreground">
                            {s.value}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: s.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${s.value}%` }}
                            transition={{
                              duration: 0.9,
                              delay: 0.1 * i,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Quote of the day */}
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                    <Brain className="h-4 w-4" />
                    Citation du jour
                  </div>
                  <Quote className="mb-2 h-6 w-6 text-primary/60" />
                  <p className="text-sm font-medium italic leading-relaxed text-white/90">
                    Le succès est la somme de petits efforts répétés jour après
                    jour.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-white/50">
                    — Robert Collier
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
