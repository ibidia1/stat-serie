"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import SerieIVASPage from "@/components/SerieIVASPage";

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
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-[720px]">
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
    </div>
  );
}
