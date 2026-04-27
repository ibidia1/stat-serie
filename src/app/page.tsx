"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import SerieIVASPage from "@/components/SerieIVASPage";
import QCMCartePage from "@/components/QCMCartePage";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((v) => !v);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-[720px] px-4">
        <div className="mb-6 flex justify-end">
          <button
            onClick={toggleDark}
            className="rounded-full border border-border bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <SerieIVASPage />
      </div>

      {/* Séparateur pleine largeur */}
      <div className="my-12 flex items-center gap-4 px-8">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          QCM à la carte
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <QCMCartePage />
      </div>
    </div>
  );
}
