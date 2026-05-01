"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, RotateCcw, Bookmark, Play, Trash2,
  BookOpen, FlaskConical, ChevronDown, ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

// ─────────────────────────────────────────────────────────
// Données réelles (issues des screenshots)
// ─────────────────────────────────────────────────────────
type Source = "series" | "exams";

// ─────────────────────────────────────────────────────────
// Spécialité → Jour (J1/J2)
// ─────────────────────────────────────────────────────────
const SPECIALITE_JOUR: Record<string, "J1" | "J2"> = {
  // Jour 1
  "Neurologie":                "J1",
  "Psychiatrie":               "J1",
  "Ophtalmologie":             "J1",
  "ORL":                       "J1",
  "Pneumologie – Allergologie": "J1",
  "Cardiologie – CCVT":        "J1",
  "Gastro-entérologie":        "J1",
  "Chirurgie générale":        "J1",
  "Gynécologie – Obstétrique": "J1",
  // Jour 2
  "Urologie":                  "J2",
  "Néphrologie":               "J2",
  "Réanimation":               "J2",
  "Endocrinologie":            "J2",
  "Médecine Interne":          "J2",
  "Infectiologie":             "J2",
  "Hématologie":               "J2",
  "Orthopédie – Rhumatologie": "J2",
  "Pédiatrie":                 "J2",
};

// ─────────────────────────────────────────────────────────
// Spécialité → Sujets
// ─────────────────────────────────────────────────────────
const SPECIALITE_SUJETS: Record<string, string[]> = {
  // J1
  "Neurologie":                ["AVC", "Céphalées", "Épilepsies"],
  "Psychiatrie":               ["États confusionnels", "Schizophrénie", "Troubles de l'humeur", "Troubles anxieux"],
  "Ophtalmologie":             ["Œil rouge"],
  "ORL":                       ["IVAS", "Cancer du cavum"],
  "Pneumologie – Allergologie": ["CBP", "Infections respiratoires basses", "Tuberculose pulmonaire", "Asthme", "BPCO"],
  "Cardiologie – CCVT":        ["SCA", "Douleur thoracique", "HTA", "Endocardite infectieuse", "Ischémie des membres", "MVTE"],
  "Gastro-entérologie":        ["Dysphagies", "Ictères", "Diarrhées chroniques", "Ulcère gastro-duodénal", "Hémorragies digestives"],
  "Chirurgie générale":        ["Péritonite aiguë", "Appendicite aiguë", "Cancer colorectal", "Occlusion intestinale aiguë"],
  "Gynécologie – Obstétrique": ["Cancer du col", "Cancer du sein", "Contraception", "Grossesse extra-utérine", "Prééclampsie – éclampsie", "Métrorragies"],
  // J2
  "Urologie":                  ["Tumeurs de la prostate", "Lithiase urinaire", "Hématuries", "Infections urinaires"],
  "Néphrologie":               ["Troubles acido-basiques", "Dyskaliémies", "Troubles de l'hydratation", "Œdèmes", "Insuffisance rénale aiguë"],
  "Réanimation":               ["Intoxication", "Polytraumatisme", "État de choc hémorragique", "État de choc cardiogénique", "États septiques graves", "Arrêt cardio-circulatoire", "Brûlures cutanées", "Traumatisme crânien", "Comas", "Prise en charge d'une douleur aiguë"],
  "Endocrinologie":            ["Insuffisance surrénalienne aiguë", "Hyperthyroïdie", "Hypothyroïdie", "Dyslipidémies", "Diabète sucré"],
  "Médecine Interne":          ["Hypercalcémies", "Purpura"],
  "Infectiologie":             ["Méningite", "IST", "Hépatites virales"],
  "Hématologie":               ["Splénomégalies", "Adénopathies superficielles", "Anémie", "Transfusion sanguine"],
  "Orthopédie – Rhumatologie": ["Arthrite septique", "Fractures ouvertes de la jambe", "Polyarthrite rhumatoïde"],
  "Pédiatrie":                 ["Bronchiolite", "Déshydratation aiguë de l'enfant", "Vaccinations"],
};

const SPECIALITES = Object.keys(SPECIALITE_JOUR).sort((a, b) => a.localeCompare(b, "fr"));
const SUJETS      = Object.values(SPECIALITE_SUJETS).flat().sort((a, b) => a.localeCompare(b, "fr"));
const SUJET_SPECIALITE: Record<string, string> = Object.fromEntries(
  Object.entries(SPECIALITE_SUJETS).flatMap(([spec, sujs]) => sujs.map((s) => [s, spec])),
);

const STATUTS = [
  { label: "Non fait",  color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",    active: "bg-slate-500 text-white" },
  { label: "Fait",      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",       active: "bg-blue-500 text-white" },
  { label: "Réussi",   color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400", active: "bg-emerald-500 text-white" },
  { label: "Incomplet", color: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400", active: "bg-orange-500 text-white" },
  { label: "Faux",      color: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",            active: "bg-red-500 text-white" },
];

const ANNEES   = ["2025", "2024"];
const FACULTES = ["FMM", "FMS", "FMSF"];
const EPREUVES = ["J1", "J2"];
const TAGS     = ["Biologie", "Clinique", "Physiologie", "faculty:FMS", "faculty:FMT", "year:2024", "year:2025"];
const TYPES    = ["Cas clinique", "QCM"];

type SavedSerie  = { id: string; name: string; questions: number; done: number; date: string; source: Source };
type SavedConfig = { id: string; name: string };

const MOCK_SERIES: SavedSerie[] = [
  { id: "1", name: "Transfusion sanguine",    questions: 2,  done: 2,  date: "27/04", source: "exams"  },
  { id: "2", name: "Neurologie, Réanimation", questions: 30, done: 15, date: "26/04", source: "series" },
  { id: "3", name: "Série personnalisée",     questions: 30, done: 0,  date: "25/04", source: "series" },
  { id: "4", name: "Cardiologie avancée",     questions: 25, done: 8,  date: "24/04", source: "exams"  },
];

const MOCK_CONFIGS: SavedConfig[] = [
  { id: "1", name: "fc" },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

// ─────────────────────────────────────────────────────────
// Pill toggle button
// ─────────────────────────────────────────────────────────
function FilterPill({
  label, selected, onClick, activeClass,
}: {
  label: string; selected: boolean; onClick: () => void; activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
        selected
          ? (activeClass ?? "bg-primary text-primary-foreground")
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Section filtre collapsible
// ─────────────────────────────────────────────────────────
function FilterSection({
  title, children, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border/60 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-2.5 flex w-full items-center justify-between"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Grille de pills avec "Voir plus"
// ─────────────────────────────────────────────────────────
function PillGrid({
  items, selected, onToggle, activeClass, limit = 12,
}: {
  items: string[]; selected: string[]; onToggle: (v: string) => void;
  activeClass?: string; limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, limit);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <FilterPill
            key={item} label={item}
            selected={selected.includes(item)}
            onClick={() => onToggle(item)}
            activeClass={activeClass}
          />
        ))}
      </div>
      {items.length > limit && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[11px] font-semibold text-primary hover:underline"
        >
          {expanded ? "Voir moins" : `+${items.length - limit} de plus`}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Ligne série sauvegardée
// ─────────────────────────────────────────────────────────
function SerieRow({ serie, index, onDelete }: { serie: SavedSerie; index: number; onDelete: (id: string) => void }) {
  const pct      = serie.questions > 0 ? (serie.done / serie.questions) * 100 : 0;
  const finished = serie.done >= serie.questions && serie.questions > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-semibold text-foreground">{serie.name}</p>
          {finished && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">✓</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {serie.source === "exams"
            ? <span className="text-[9px] font-semibold text-violet-500">Examen</span>
            : <span className="text-[9px] font-semibold text-primary">Série</span>}
          <span className="text-[10px] tabular-nums text-muted-foreground">{serie.done}/{serie.questions}q</span>
          <span className="text-[10px] text-muted-foreground">· {serie.date}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${finished ? "bg-emerald-500" : "bg-primary/60"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.05, ease: "easeOut" }}
          />
        </div>
      </div>
      <button className="shrink-0 rounded-lg p-1 text-primary opacity-0 transition-all hover:bg-primary/10 group-hover:opacity-100">
        <Play className="h-3 w-3 fill-current" />
      </button>
      <button
        onClick={() => onDelete(serie.id)}
        className="shrink-0 rounded-lg p-1 text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────
export default function QCMCartePage() {
  const [source,     setSource]     = useState<Source>("series");
  const [questions,  setQuestions]  = useState(20);
  const [statuts,    setStatuts]    = useState<string[]>([]);
  const [epreuves,   setEpreuves]   = useState<string[]>([]);
  const [specialites,setSpecialites]= useState<string[]>([]);
  const [sujets,     setSujets]     = useState<string[]>([]);
  const [annees,     setAnnees]     = useState<string[]>([]);
  const [facultes,   setFacultes]   = useState<string[]>([]);
  const [tags,       setTags]       = useState<string[]>([]);
  const [types,      setTypes]      = useState<string[]>([]);
  const [series,     setSeries]     = useState(MOCK_SERIES);
  const [configs,    setConfigs]    = useState<SavedConfig[]>(MOCK_CONFIGS);
  const [search,     setSearch]     = useState("");

  // Spécialités visibles selon les épreuves
  const visibleSpecialites = useMemo(() => {
    if (epreuves.length === 0) return SPECIALITES;
    return SPECIALITES.filter((s) => epreuves.includes(SPECIALITE_JOUR[s]));
  }, [epreuves]);

  // Sujets visibles selon épreuves + spécialités
  const visibleSujets = useMemo(() => {
    return SUJETS.filter((sujet) => {
      const spec = SUJET_SPECIALITE[sujet];
      if (!spec) return true;
      if (epreuves.length > 0 && !epreuves.includes(SPECIALITE_JOUR[spec])) return false;
      if (specialites.length > 0 && !specialites.includes(spec)) return false;
      return true;
    });
  }, [epreuves, specialites]);

  // Nettoyer les sélections devenues invalides
  useEffect(() => {
    setSpecialites((prev) => prev.filter((s) => visibleSpecialites.includes(s)));
  }, [visibleSpecialites]);

  useEffect(() => {
    setSujets((prev) => prev.filter((s) => visibleSujets.includes(s)));
  }, [visibleSujets]);

  const filteredSeries = series.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function reset() {
    setQuestions(20); setStatuts([]); setEpreuves([]);
    setSpecialites([]); setSujets([]); setAnnees([]);
    setFacultes([]); setTags([]); setTypes([]);
  }

  const activeCount =
    statuts.length + epreuves.length + specialites.length +
    sujets.length + annees.length + facultes.length + tags.length + types.length;

  const configLines = [
    { label: "Source",      value: source === "series" ? "Séries" : "Examens blancs" },
    { label: "Questions",   value: `${questions}` },
    { label: "Statut",      value: statuts.length   ? statuts.join(", ")    : "Tous" },
    { label: "Spécialité",  value: specialites.length ? `${specialites.length} sélectionnée(s)` : "Toutes" },
    { label: "Sujet",       value: sujets.length    ? `${sujets.length} sélectionné(s)` : "Tous" },
    { label: "Faculté",     value: facultes.length  ? facultes.join(", ")   : "Toutes" },
    { label: "Type",        value: types.length     ? types.join(", ")      : "Tous" },
  ];

  return (
    <div className="space-y-4">

      {/* ── En-tête ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-gradient-to-br from-card to-primary/[0.03] dark:to-primary/[0.06]">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Retour */}
              <button className="flex items-center gap-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Toggle source */}
              <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
                {(["series", "exams"] as Source[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                      source === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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

              <div className="h-5 w-px bg-border" />

              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Bookmark className="h-3.5 w-3.5" />
                Sauvegarder
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
                {activeCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </button>
              <Button className="gap-1.5 shadow-md shadow-primary/25">
                <Play className="h-3 w-3 fill-current" />
                Générer la série
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Corps : filtres (2/3) + résumé/séries (1/3) ─── */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 items-start">

        {/* ── Filtres ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
        >
          <Card>
            <CardContent className="p-5 space-y-4">

              {/* Nombre de questions */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">Nombre de questions</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary">
                    {questions}
                  </span>
                </div>
                <input
                  type="range" min={5} max={150} value={questions}
                  onChange={(e) => setQuestions(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>5</span><span>150+</span>
                </div>
              </div>

              {/* Statut */}
              <FilterSection title="Statut">
                <div className="flex flex-wrap gap-1.5">
                  {STATUTS.map(({ label, color, active }) => (
                    <button
                      key={label}
                      onClick={() => setStatuts((v) => toggle(v, label))}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                        statuts.includes(label) ? active : color
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Épreuve */}
              <FilterSection title="Épreuve">
                <div className="flex gap-1.5">
                  {EPREUVES.map((e) => (
                    <FilterPill key={e} label={e} selected={epreuves.includes(e)} onClick={() => setEpreuves((v) => toggle(v, e))} />
                  ))}
                </div>
              </FilterSection>

              {/* Spécialité */}
              <FilterSection title={`Spécialité${epreuves.length > 0 ? ` · ${visibleSpecialites.length}` : ""}`} defaultOpen={false}>
                {visibleSpecialites.length > 0 ? (
                  <PillGrid items={visibleSpecialites} selected={specialites} onToggle={(v) => setSpecialites((prev) => toggle(prev, v))} limit={12} />
                ) : (
                  <p className="text-xs text-muted-foreground">Aucune spécialité pour cette épreuve.</p>
                )}
              </FilterSection>

              {/* Sujet */}
              <FilterSection title={`Sujet · ${visibleSujets.length}`} defaultOpen={false}>
                {visibleSujets.length > 0 ? (
                  <PillGrid items={visibleSujets} selected={sujets} onToggle={(v) => setSujets((prev) => toggle(prev, v))} limit={16} />
                ) : (
                  <p className="text-xs text-muted-foreground">Aucun sujet pour la sélection actuelle.</p>
                )}
              </FilterSection>

              {/* Année */}
              <FilterSection title="Année">
                <div className="flex gap-1.5">
                  {ANNEES.map((a) => (
                    <FilterPill key={a} label={a} selected={annees.includes(a)} onClick={() => setAnnees((v) => toggle(v, a))} />
                  ))}
                </div>
              </FilterSection>

              {/* Faculté */}
              <FilterSection title="Faculté">
                <div className="flex gap-1.5">
                  {FACULTES.map((f) => (
                    <FilterPill key={f} label={f} selected={facultes.includes(f)} onClick={() => setFacultes((v) => toggle(v, f))} />
                  ))}
                </div>
              </FilterSection>

              {/* Tags */}
              <FilterSection title="Tags" defaultOpen={false}>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.map((t) => (
                    <FilterPill key={t} label={t} selected={tags.includes(t)} onClick={() => setTags((v) => toggle(v, t))} />
                  ))}
                </div>
              </FilterSection>

              {/* Type de question */}
              <FilterSection title="Type de question">
                <div className="flex gap-1.5">
                  {TYPES.map((t) => (
                    <FilterPill key={t} label={t} selected={types.includes(t)} onClick={() => setTypes((v) => toggle(v, t))} />
                  ))}
                </div>
              </FilterSection>

            </CardContent>
          </Card>
        </motion.div>

        {/* ── Résumé + séries ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Config actuelle */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          >
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-bold text-foreground">Configuration actuelle</p>
                <div className="space-y-2">
                  {configLines.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
                      <span className="truncate rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
                  {[
                    { label: "Disponibles", value: "1 000", color: "text-primary" },
                    { label: "Spécialités", value: "0",     color: "text-violet-500" },
                    { label: "Sujets",      value: "0",     color: "text-emerald-600" },
                    { label: "Facultés",    value: "0",     color: "text-orange-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl bg-muted/50 p-2.5 text-center">
                      <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
                      <div className="text-[10px] text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mes séries */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Mes séries personnalisées</p>
                  <span className="text-[11px] text-muted-foreground">
                    {filteredSeries.length} série{filteredSeries.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-muted-foreground">Séries que vous avez générées avec vos filtres</p>
                <div className="space-y-0.5">
                  <AnimatePresence>
                    {filteredSeries.length > 0 ? (
                      filteredSeries.map((s, i) => (
                        <SerieRow key={s.id} serie={s} index={i} onDelete={(id) => setSeries((p) => p.filter((x) => x.id !== id))} />
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        Aucune série personnalisée. Utilisez les filtres ci-dessus pour en créer une !
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mes configurations de filtres */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.24, ease: "easeOut" }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">Mes configurations de filtres</p>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {configs.length}
                    </span>
                  </div>
                  {configs.length > 0 && (
                    <button
                      onClick={() => setConfigs([])}
                      className="text-[11px] font-semibold text-muted-foreground transition-colors hover:text-red-500"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Configurations de filtres sauvegardées pour un accès rapide
                </p>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {configs.length > 0 ? (
                      configs.map((c, i) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-semibold text-foreground">{c.name}</span>
                          </div>
                          <button
                            onClick={() => setConfigs((p) => p.filter((x) => x.id !== c.id))}
                            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <p className="py-3 text-center text-xs text-muted-foreground">
                        Aucune configuration sauvegardée
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
