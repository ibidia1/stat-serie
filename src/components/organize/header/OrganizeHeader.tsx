"use client";

import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { ExamCountdown } from "./ExamCountdown";
import { ModeToggle } from "./ModeToggle";
import { ViewSwitcher } from "./ViewSwitcher";
import { NotificationsBell } from "../panels/NotificationsBell";
import { CourseSearchBar } from "../search/CourseSearchBar";
import type { AppNotification, CalendarEvent } from "../data/types";
import type { OrganizeActions } from "../hooks/useOrganizeStore";

type View = "month" | "week" | "day";

interface Props {
  examDate: string;
  mode: "manual" | "auto";
  view: View;
  notifications: AppNotification[];
  onExamDateChange: (iso: string) => void;
  onModeChange: (mode: "manual" | "auto") => void;
  onViewChange: (v: View) => void;
  onOpenSearch: () => void;
  actions: OrganizeActions;
  events: CalendarEvent[];
}

export function OrganizeHeader({
  examDate, mode, view, notifications,
  onExamDateChange, onModeChange, onViewChange, onOpenSearch,
  actions, events,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-gradient-to-br from-card to-primary/[0.03] px-4 py-3 dark:to-primary/[0.06]">
        {/* Title */}
        <div className="flex items-center gap-2 mr-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-base font-bold tracking-tight text-foreground">Calendrier intelligent</span>
        </div>

        <ExamCountdown examDate={examDate} onDateChange={onExamDateChange} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <CourseSearchBar onOpenModal={onOpenSearch} />

        {/* Mode */}
        <ModeToggle mode={mode} onChange={onModeChange} />

        {/* View */}
        <ViewSwitcher view={view} onChange={onViewChange} />

        {/* Notifications */}
        <NotificationsBell
          notifications={notifications}
          onMarkRead={actions.markNotifRead}
          onMarkAllRead={actions.markAllNotifsRead}
        />
      </div>
    </motion.div>
  );
}
