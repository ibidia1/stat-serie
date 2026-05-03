"use client";

type View = "month" | "week" | "day";

interface Props {
  view: View;
  onChange: (v: View) => void;
}

const LABELS: Record<View, string> = { month: "Mois", week: "Semaine", day: "Jour" };

export function ViewSwitcher({ view, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-border bg-muted p-0.5 text-xs font-semibold">
      {(["month", "week", "day"] as View[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            view === v
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {LABELS[v]}
        </button>
      ))}
    </div>
  );
}
