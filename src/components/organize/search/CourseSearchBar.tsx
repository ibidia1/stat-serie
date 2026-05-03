"use client";

import { Search } from "lucide-react";

interface Props {
  onOpenModal: () => void;
}

export function CourseSearchBar({ onOpenModal }: Props) {
  return (
    <button
      onClick={onOpenModal}
      className="flex h-9 w-[280px] items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate text-xs">Rechercher un cours… (⌘K)</span>
    </button>
  );
}
