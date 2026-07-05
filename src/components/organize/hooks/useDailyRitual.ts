"use client";

import { useEffect, useState } from "react";
import { todayISO } from "../lib/dateUtils";

export function useDailyRitual(
  lastMorning: string | null,
  lastEvening: string | null,
) {
  const [showMorning, setShowMorning] = useState(false);
  const [showEvening, setShowEvening] = useState(false);

  useEffect(() => {
    const today = todayISO();
    const hour  = new Date().getHours();

    if (lastMorning !== today) {
      // Small delay so the page renders first
      const t = setTimeout(() => setShowMorning(true), 800);
      return () => clearTimeout(t);
    }
    if (lastEvening !== today && hour >= 18) {
      setShowEvening(true);
    }
  }, [lastMorning, lastEvening]);

  return {
    showMorning, setShowMorning,
    showEvening, setShowEvening,
  };
}
