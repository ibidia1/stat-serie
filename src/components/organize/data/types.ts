export type Day = "J1" | "J2";

export type Specialty =
  | "Cardiologie-CCV"
  | "Gynécologie-Obstétrique"
  | "Psychiatrie"
  | "Chirurgie générale"
  | "Gastro-entérologie"
  | "Neurologie"
  | "Pneumologie-Allergologie"
  | "ORL"
  | "Ophtalmologie"
  | "Néphrologie"
  | "Urologie"
  | "Réanimation"
  | "Endocrinologie"
  | "Médecine interne"
  | "Infectiologie"
  | "Hématologie"
  | "Orthopédie-Rhumatologie"
  | "Pédiatrie";

export interface Course {
  id: number;
  number: number;
  title: string;
  shortTitle?: string;
  specialty: Specialty;
  day: Day;
  status: "not_started" | "in_progress" | "completed";
}

export type Faculty = "Tunis" | "Sfax" | "Sousse" | "Monastir";

export interface Series {
  id: string;
  courseId: number;
  year: number;
  faculty: Faculty;
  numberOfQuestions: number;
  rating: number;
  votes: number;
  userStatus: "not_done" | "partial" | "done";
  userScore?: number;
}

export interface UserStats {
  avgTimePerQcmSimple: number | null;
  avgTimePerQcmCase: number | null;
  avgReadingSpeedWpm: number | null;
  totalQcmDone: number;
  totalLecturesRead: number;
}

export type EventType = "qcm" | "lecture" | "revision_slot";

export type EventStatus = "upcoming" | "done" | "skipped" | "rescheduled";

export interface CalendarEvent {
  id: string;
  type: EventType;
  courseId: number;
  seriesId?: string;
  title: string;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  estimatedFromKpi: boolean;
  notes?: string;
  isRevision: boolean;
  revisionInterval?: "J2" | "J7" | "J10" | "J30" | string;
  parentEventId?: string;
  status: EventStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BacklogItem {
  id: string;
  type: EventType;
  courseId: number;
  seriesId?: string;
  notes?: string;
  createdAt: string;
}

export interface AutoModeConfig {
  enabled: boolean;
  intervals: number[];
  customMode: boolean;
  preferredHour: string;
}

export type NotificationKind =
  | "task_due_today"
  | "revision_overdue"
  | "daily_ritual_morning"
  | "daily_ritual_evening"
  | "auto_reschedule"
  | "milestone";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  eventId?: string;
  createdAt: string;
  readAt?: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  weeklyDistribution: {
    lectures: number;
    qcmSeries: number;
    revisions: number;
  };
}

export interface OrganizePreferences {
  lastView: "month" | "week" | "day";
  lastDailyRitualMorning: string | null;
  lastDailyRitualEvening: string | null;
}

export interface OrganizeState {
  events: CalendarEvent[];
  backlog: BacklogItem[];
  autoMode: AutoModeConfig;
  notifications: AppNotification[];
  examDate: string;
  preferences: OrganizePreferences;
}
