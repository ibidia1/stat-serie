"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Fuse from "fuse.js";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  Flame,
  Megaphone,
  Newspaper,
  Search,
  Sparkles,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogBody } from "@/components/ui/dialog";
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  ANNOUNCEMENTS,
  type AnnouncementKind,
  type BlogArticle,
  type BlogCategory,
} from "./blogData";

// ─────────────────────────────────────────────────────────
// Style maps
// ─────────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<
  BlogCategory,
  { badge: string; gradient: string; dot: string }
> = {
  "Méthodologie": {
    badge: "border-primary/25 bg-primary/[0.08] text-primary",
    gradient: "from-[#4f7cff] via-[#5b84ff] to-[#7aa0ff]",
    dot: "bg-primary",
  },
  "Conseils": {
    badge: "border-success/25 bg-success/[0.08] text-success",
    gradient: "from-[#047857] via-[#059669] to-[#34d399]",
    dot: "bg-success",
  },
  "Nouvelles fonctionnalités": {
    badge: "border-accent/30 bg-accent/[0.08] text-accent",
    gradient: "from-[#e07f00] via-[#ff8f00] to-[#ffb74d]",
    dot: "bg-accent",
  },
  "Actualités": {
    badge: "border-[#a855f7]/25 bg-[#a855f7]/[0.08] text-[#a855f7]",
    gradient: "from-[#7e22ce] via-[#a855f7] to-[#c084fc]",
    dot: "bg-[#a855f7]",
  },
};

const ANNOUNCEMENT_STYLES: Record<
  AnnouncementKind,
  { icon: typeof Sparkles; chip: string; label: string }
> = {
  feature: { icon: Sparkles, chip: "bg-primary/10 text-primary", label: "Nouveauté" },
  content: { icon: BookOpen, chip: "bg-success/10 text-success", label: "Contenu" },
  maintenance: { icon: Wrench, chip: "bg-accent/10 text-accent", label: "Maintenance" },
};

const FOCUS_RING = "outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const GLASS_PILL =
  "inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso + "T00:00:00"),
  );
}
function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso + "T00:00:00"),
  );
}

/** Ancienneté lisible : « Aujourd'hui », « 3 j », « 2 sem. ». */
function relativeAge(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const days = Math.max(0, Math.round((Date.now() - d.getTime()) / 86400000));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `${days} j`;
  if (days < 30) return `${Math.floor(days / 7)} sem.`;
  return `${Math.floor(days / 30)} mois`;
}

/** Grain photographique subtil (data-URI, aucune requête réseau). */
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
      style={{ backgroundImage: NOISE_URI }}
    />
  );
}

/** Motif ECG décoratif animé posé sur les couvertures. */
function EcgMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 h-14 w-full ${className}`}
    >
      <path
        d="M0 30 H90 l10 -14 12 28 12 -40 12 44 10 -18 h60 l10 -14 12 28 12 -40 12 44 10 -18 H400"
        fill="none"
        stroke="white"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeDasharray="7 6"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="qe-chain-flow"
      />
    </svg>
  );
}

/** Médaillon flèche « découpé » dans le coin de la carte. */
function ArrowMedallion() {
  return (
    <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1.5">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform duration-300 group-hover:rotate-45">
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Façade : carte visuelle pleine couverture
// ─────────────────────────────────────────────────────────
function CoverCard({
  article,
  index,
  onOpen,
  className = "",
}: {
  article: BlogArticle;
  /** Numéro éditorial (« 002 »). Omis = carte épurée. */
  index?: string;
  onOpen: (a: BlogArticle) => void;
  className?: string;
}) {
  const s = CATEGORY_STYLES[article.category];
  return (
    <button
      onClick={() => onOpen(article)}
      className={`group relative overflow-hidden rounded-3xl text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${FOCUS_RING} ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
      <div aria-hidden className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
      <div aria-hidden className="absolute -bottom-14 right-8 h-40 w-40 rounded-full bg-black/25 blur-3xl" />
      <EcgMotif className="top-[30%]" />
      {index && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 top-2 select-none font-mono text-[84px] font-black leading-none text-white/15"
        >
          {index.replace(/\s/g, "").slice(-1)}
        </span>
      )}
      <span
        aria-hidden
        className="absolute right-5 top-1/2 grid h-24 w-24 -translate-y-[60%] place-items-center rounded-full bg-white/15 text-6xl shadow-inner backdrop-blur-[2px] transition-transform duration-500 [filter:drop-shadow(0_10px_14px_rgba(0,0,0,0.3))] group-hover:-rotate-6 group-hover:scale-110"
      >
        {article.emoji}
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <Grain />

      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
        <span className={GLASS_PILL}>{article.category}</span>
        <span className={GLASS_PILL}>{formatShort(article.date)}</span>
      </div>

      <div className="absolute bottom-3 left-4 right-16">
        {index && (
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-white/70">{index}</p>
        )}
        <h3 className="mt-0.5 line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow-sm">
          {article.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-white/75">
          <Clock className="h-3 w-3" aria-hidden />
          {article.readMinutes} min de lecture
        </p>
      </div>

      <ArrowMedallion />
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Carte de grille
// ─────────────────────────────────────────────────────────
function ArticleCard({
  article,
  onOpen,
  index,
}: {
  article: BlogArticle;
  onOpen: (a: BlogArticle) => void;
  index: number;
}) {
  const s = CATEGORY_STYLES[article.category];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: 0.04 * index }}
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <button onClick={() => onOpen(article)} className={`flex h-full flex-col text-left ${FOCUS_RING}`}>
          <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${s.gradient}`}>
            <div aria-hidden className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
            <EcgMotif className="top-[60%]" />
            <span
              aria-hidden
              className="grid h-20 w-20 place-items-center rounded-full bg-white/15 text-5xl shadow-inner backdrop-blur-[2px] [filter:drop-shadow(0_8px_12px_rgba(0,0,0,0.3))] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
            >
              {article.emoji}
            </span>
            <span className={`absolute left-3 top-3 ${GLASS_PILL}`}>{article.category}</span>
            <span className={`absolute right-3 top-3 ${GLASS_PILL}`}>{formatShort(article.date)}</span>
            <Grain />
          </div>
          <CardContent className="flex flex-1 flex-col p-4">
            <h3 className="mb-1.5 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
            <div className="mt-auto flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/80">{article.author}</span>
              <span aria-hidden>·</span>
              <Clock className="h-3 w-3" aria-hidden />
              <span className="tabular-nums">{article.readMinutes} min</span>
              <span className="ml-auto grid h-7 w-7 place-items-center rounded-full border border-border text-primary opacity-0 transition-all duration-300 group-hover:rotate-45 group-hover:opacity-100">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </CardContent>
        </button>
      </Card>
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────
// Blog page
// ─────────────────────────────────────────────────────────
export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [reading, setReading] = useState<BlogArticle | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(BLOG_ARTICLES, {
        keys: [
          { name: "title", weight: 2 },
          { name: "excerpt", weight: 1.2 },
          { name: "content", weight: 1 },
          { name: "tags", weight: 1.5 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [],
  );

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of BLOG_ARTICLES) for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(([t]) => t);
  }, []);

  // Sélection éditoriale de la façade : l'article vedette + les 3 plus récents.
  const { featured, picks, rail } = useMemo(() => {
    const byDate = [...BLOG_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
    const feat = byDate.find((a) => a.featured) ?? byDate[0];
    const rest = byDate.filter((a) => a.id !== feat.id);
    return { featured: feat, picks: rest.slice(0, 1), rail: rest.slice(1, 5) };
  }, []);

  const results = useMemo(() => {
    const base = query.trim()
      ? fuse.search(query.trim()).map((r) => r.item)
      : [...BLOG_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
    return base.filter(
      (a) => (!category || a.category === category) && (!tag || a.tags.includes(tag)),
    );
  }, [query, category, tag, fuse]);

  const isFiltering = query.trim() !== "" || category !== null || tag !== null;
  const facadeIds = useMemo(
    () => new Set([featured.id, ...picks.map((p) => p.id), ...rail.map((r) => r.id)]),
    [featured, picks, rail],
  );
  const gridArticles = isFiltering ? results : results.filter((a) => !facadeIds.has(a.id));

  const fs = CATEGORY_STYLES[featured.category];

  return (
    <div className="relative space-y-8">
      {/* Halos d'ambiance */}
      <div aria-hidden className="pointer-events-none absolute -top-20 left-[15%] -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-[30%] -right-16 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      {/* ══ En-tête + recherche (au-dessus des articles) ══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-label="Recherche et filtres"
        className="space-y-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-xs font-bold text-primary">
              <Newspaper className="h-3.5 w-3.5" aria-hidden />
              Le blog QE.tn
            </span>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
              Apprendre à{" "}
              <span className="bg-gradient-to-r from-primary via-[#6b93ff] to-accent bg-clip-text text-transparent">
                mieux apprendre
              </span>
            </h1>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Méthodologie, organisation, gestion du stress et actualités de la
            plateforme — écrits pour les étudiants en médecine.
          </p>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un article, un thème, un tag…"
                  aria-label="Rechercher dans le blog"
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-9 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Effacer la recherche"
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setCategory(null)}
                  aria-pressed={category === null}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${FOCUS_RING} ${
                    category === null
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Tous
                </button>
                {BLOG_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(category === c ? null : c)}
                    aria-pressed={category === c}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${FOCUS_RING} ${
                      category === c
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_STYLES[c].dot}`} aria-hidden />
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3 w-3 text-muted-foreground/60" aria-hidden />
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? null : t)}
                  aria-pressed={tag === t}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${FOCUS_RING} ${
                    tag === t
                      ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ══ À la une — grille éditoriale ═════════════ */}
      {!isFiltering && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          aria-label="À la une"
          className="grid gap-4 lg:grid-cols-4 lg:grid-rows-1"
        >
          {/* Hero — 2 colonnes */}
          <button
            onClick={() => setReading(featured)}
            className={`group relative min-h-[300px] overflow-hidden rounded-2xl text-left shadow-md transition-shadow duration-300 hover:shadow-xl lg:col-span-2 lg:min-h-[420px] ${FOCUS_RING}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${fs.gradient}`} />
            <div aria-hidden className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
            <EcgMotif className="top-[26%]" />
            <span
              aria-hidden
              className="absolute right-8 top-8 grid h-28 w-28 place-items-center rounded-full bg-white/15 text-6xl shadow-inner backdrop-blur-[2px] transition-transform duration-500 [filter:drop-shadow(0_14px_18px_rgba(0,0,0,0.35))] group-hover:-rotate-6 group-hover:scale-110 md:h-32 md:w-32 md:text-7xl"
            >
              {featured.emoji}
            </span>
            <Grain />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            <span className={`absolute left-4 top-4 ${GLASS_PILL}`}>⭐ À la une</span>

            <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
              <span className={`${GLASS_PILL} mb-2`}>{featured.category}</span>
              <h2 className="text-xl font-bold leading-tight text-white drop-shadow-sm md:text-3xl">
                {featured.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/85 md:text-xs">
                <span className="font-bold text-white">{featured.author}</span>
                <span aria-hidden>·</span>
                <span>{relativeAge(featured.date)}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{featured.readMinutes} min de lecture</span>
                <span className="ml-auto hidden items-center gap-1 font-bold text-white transition-transform group-hover:translate-x-0.5 sm:inline-flex">
                  Lire l’article
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </div>
          </button>

          {/* Carte secondaire — 1 colonne */}
          <CoverCard
            article={picks[0]}
            onOpen={setReading}
            className="min-h-[240px] lg:min-h-[420px]"
          />

          {/* Rail « Dernières publications » — 1 colonne */}
          <Card className="flex flex-col rounded-2xl">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5">
                <Flame className="h-4 w-4 text-accent" aria-hidden />
                <h2 className="text-sm font-bold text-foreground">Dernières publications</h2>
              </div>
              <ul className="flex-1 divide-y divide-border/70">
                {rail.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => setReading(a)}
                      className={`group flex w-full items-start gap-2.5 py-2.5 text-left ${FOCUS_RING}`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br text-sm ${CATEGORY_STYLES[a.category].gradient}`}
                      >
                        {a.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_STYLES[a.category].dot}`} aria-hidden />
                          {a.category}
                          <span aria-hidden>·</span>
                          {relativeAge(a.date)}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {a.title}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`mt-2 flex items-center gap-1 self-start rounded-lg text-xs font-bold text-primary transition-colors hover:underline ${FOCUS_RING}`}
              >
                Afficher plus
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* ══ Annonces ════════════════════════════════ */}
      {!isFiltering && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          aria-label="Annonces"
        >
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Annonces</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {ANNOUNCEMENTS.map((an) => {
              const s = ANNOUNCEMENT_STYLES[an.kind];
              return (
                <Card key={an.id} className="rounded-2xl transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.chip}`}>
                        <s.icon className="h-3 w-3" aria-hidden />
                        {s.label}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {formatDate(an.date)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground">{an.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{an.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ══ Grille d’articles ═══════════════════════ */}
      <section aria-label="Articles">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {isFiltering ? "Résultats" : "Tous les articles"}
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {(isFiltering ? results : gridArticles).length} article
            {(isFiltering ? results : gridArticles).length > 1 ? "s" : ""}
          </span>
        </div>

        {gridArticles.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <span className="mb-3 text-4xl" aria-hidden>🔍</span>
              <p className="text-sm font-semibold text-foreground">Aucun article trouvé</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Essayez d’autres mots-clés, ou réinitialisez les filtres.
              </p>
              <button
                onClick={() => { setQuery(""); setCategory(null); setTag(null); }}
                className={`mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${FOCUS_RING}`}
              >
                Réinitialiser les filtres
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {gridArticles.map((a, i) => (
                <ArticleCard key={a.id} article={a} onOpen={setReading} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ══ Lecture d’un article ════════════════════ */}
      <Dialog open={!!reading} onClose={() => setReading(null)} maxWidth="max-w-2xl">
        {reading && (
          <>
            <DialogHeader onClose={() => setReading(null)}>
              <span className="flex items-center gap-2">
                <span className="text-base" aria-hidden>{reading.emoji}</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${CATEGORY_STYLES[reading.category].badge}`}>
                  {reading.category}
                </span>
              </span>
            </DialogHeader>
            <DialogBody className="max-h-[70vh] overflow-y-auto">
              <h2 className="text-xl font-bold leading-snug text-foreground">{reading.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{reading.author}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(reading.date)}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{reading.readMinutes} min de lecture</span>
              </div>
              <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-foreground/90">
                {reading.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-border pt-4">
                {reading.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setReading(null); setTag(t); setQuery(""); setCategory(null); }}
                    className={`rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground ${FOCUS_RING}`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </DialogBody>
          </>
        )}
      </Dialog>
    </div>
  );
}
