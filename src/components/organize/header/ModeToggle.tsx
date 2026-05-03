"use client";

interface Props {
  mode: "manual" | "auto";
  onChange: (mode: "manual" | "auto") => void;
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex rounded-lg border border-border bg-muted p-0.5 text-xs font-semibold">
      {(["manual", "auto"] as const).map((m) => (
        <button
          key={m}
          title={m === "manual"
            ? "Tu planifies toi-même chaque tâche"
            : "Des révisions J2/J7/J10/J30 sont créées automatiquement"}
          onClick={() => onChange(m)}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            mode === m
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m === "manual" ? "Manuel" : "Auto"}
        </button>
      ))}
    </div>
  );
}
