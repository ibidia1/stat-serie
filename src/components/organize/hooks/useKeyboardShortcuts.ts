"use client";

import { useEffect } from "react";

interface Shortcuts {
  onCmdK?: () => void;
  onN?: () => void;
}

export function useKeyboardShortcuts({ onCmdK, onN }: Shortcuts) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onCmdK?.();
        return;
      }
      if (e.key === "n" && !inInput && !e.metaKey && !e.ctrlKey) {
        onN?.();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCmdK, onN]);
}
