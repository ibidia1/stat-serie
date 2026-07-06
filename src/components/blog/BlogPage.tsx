"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Fuse from "fuse.js";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
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
const CATEGORY_STYLES: Record<BlogCategory, { badge: string; cover: string; dot: string }> = {
  "Méthodologie": {
    badge: "border-primary/25 bg-primary/[0.08] text-primary",
    cover: "from-primary/15 to-primary/[0.03]",
    dot: "bg-primary",
  },
  "Conseils": {
    badge: "border-success/25 bg-success/[0.08] text-success",
    cover: "from-success/15 to-success/[0.03]",
    dot: "bg-success",
  },
  "Nouvelles fonctionnalités": {
    badge: "border-accent/30 bg-accent/[0.08] text-accent",
    cover: "from-accent/15 to-accent/[0.03]",
    dot: "bg-accent",
  },
  "Actualités": {
    badge: "border-[#a855f7]/25 bg-[#a855f7]/[0.08] text-[#a855f7]",
    cover: "from-[#a855f7]/15 to-[#a855f7]/[0.03]",
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

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso + "T00:00:00"),
  );
}

// ─────────────────────────────────────────────────────────
// Article card
// ─────────────────────────────────────────────────────────
function ArticleCard({ article, onOpen, index }: { article: BlogArticle; onOpen: (a: BlogArticle) => void; index: number }) {
  const s = CATEGORY_STYLES[article.category];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: 0.04 * index }}
    >
      <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <button
          onClick={() => onOpen(article)}
          className={`flex h-full flex-col text-left ${FOCUS_RING}`}
        >
          <div className={`flex h-28 items-center justify-center bg-gradient-to-br text-5xl ${s.cover}`}>
            <span className="transition-transform duration-300 group-hover:scale-110">{article.emoji}</span>
          </div>
          <CardContent className="flex flex-1 flex-col p-4">
            <span className={`mb-2 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.badge}`}>
              {article.category}
            </span>
            <h3 className="mb-1.5 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
            <div className="mt-auto flex items-center gap-2 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" aria-hidden />
              <span>{formatDate(article.date)}</span>
              <span aria-hidden>·</span>
              <Clock className="h-3 w-3" aria-hidden />
              <span className="tabular-nums">{article.readMinutes} min</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
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

  const results = useMemo(() => {
    const base = query.trim()
      ? fuse.search(query.trim()).map((r) => r.item)
      : [...BLOG_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
    return base.filter(
      (a) => (!category || a.category === category) && (!tag || a.tags.includes(tag)),
    );
  }, [query, category, tag, fuse]);

  const isFiltering = query.trim() !== "" || category !== null || tag !== null;
  const featured = !isFiltering ? results.find((a) => a.featured) : undefined;
  const gridArticles = featured ? results.filter((a) => a.id !== featured.id) : results;

  return (
    <div className="space-y-8">
      {/* ── Hero ─────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-xs font-bold text-primary">
          <Newspaper className="h-3.5 w-3.5" aria-hidden />
          Le blog QE.tn
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Apprendre à mieux apprendre
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Méthodologie, organisation, gestion du stress et actualités de la plateforme —
          des guides pratiques écrits pour les étudiants en médecine.
        </p>

        {/* Search */}
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article, un thème, un tag…"
            aria-label="Rechercher dans le blog"
            className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-10 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setCategory(null)}
            aria-pressed={category === null}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${FOCUS_RING} ${
              category === null
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
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
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${category === c ? "bg-primary-foreground" : CATEGORY_STYLES[c].dot}`} aria-hidden />
              {c}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
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
      </motion.header>

      {/* ── Annonces ─────────────────────────────── */}
      {!isFiltering && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
                <Card key={an.id} className="transition-shadow hover:shadow-md">
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

      {/* ── À la une ─────────────────────────────── */}
      {featured && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          aria-label="Article à la une"
        >
          <Card className="group overflow-hidden transition-shadow hover:shadow-xl">
            <button
              onClick={() => setReading(featured)}
              className={`grid w-full text-left md:grid-cols-[240px_1fr] ${FOCUS_RING}`}
            >
              <div className={`flex min-h-[140px] items-center justify-center bg-gradient-to-br text-7xl ${CATEGORY_STYLES[featured.category].cover}`}>
                <span className="transition-transform duration-300 group-hover:scale-110">{featured.emoji}</span>
              </div>
              <CardContent className="p-5 md:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                    ⭐ À la une
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${CATEGORY_STYLES[featured.category].badge}`}>
                    {featured.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary md:text-xl">
                  {featured.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{featured.author}</span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(featured.date)}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">{featured.readMinutes} min de lecture</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold text-primary">
                    Lire l’article
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </CardContent>
            </button>
          </Card>
        </motion.section>
      )}

      {/* ── Grille d’articles ─────────────────────── */}
      <section aria-label="Articles">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {isFiltering ? "Résultats" : "Derniers articles"}
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {results.length} article{results.length > 1 ? "s" : ""}
          </span>
        </div>

        {results.length === 0 ? (
          <Card>
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

      {/* ── Lecture d’un article ──────────────────── */}
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
