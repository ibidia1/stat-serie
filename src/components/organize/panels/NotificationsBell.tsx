"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { AppNotification, NotificationKind } from "../data/types";
import { formatRelative } from "../lib/dateUtils";

const KIND_ICON: Record<NotificationKind, string> = {
  task_due_today:       "📅",
  revision_overdue:     "⚠️",
  daily_ritual_morning: "👋",
  daily_ritual_evening: "🌙",
  auto_reschedule:      "🔁",
  milestone:            "🔥",
};

interface Props {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationsBell({ notifications, onMarkRead, onMarkAllRead }: Props) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-[360px] rounded-xl border border-border bg-card shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-xs font-bold">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Tout marquer
                  </button>
                )}
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">Aucune notification</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                        !n.readAt ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <span className="mt-0.5 text-base leading-none">{KIND_ICON[n.kind]}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] font-semibold ${!n.readAt ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{n.message}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/60 tabular-nums">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                      {!n.readAt && (
                        <button
                          onClick={() => onMarkRead(n.id)}
                          className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Marquer comme lu"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
