import type { CalendarEvent } from "./types";

function iso(offsetDays: number): string {
  const d = new Date("2026-05-03T00:00:00");
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const NOW = "2026-05-03T10:00:00.000Z";

export const MOCK_EVENTS: CalendarEvent[] = [
  // ── 5 faites cette semaine ──────────────────────────────
  {
    id: "ev-001", type: "qcm", courseId: 1, seriesId: "2024-tunis-c1-0",
    title: "✍️ QCM SCA – 2024 FMT Tunis",
    startDate: iso(-3), startTime: "08:30", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "done",
    completedAt: iso(-3) + "T09:00:00.000Z",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-002", type: "lecture", courseId: 2,
    title: "📖 Lecture Insuffisance Cardiaque",
    startDate: iso(-3), startTime: "10:00", durationMinutes: 45,
    estimatedFromKpi: false, isRevision: false, status: "done",
    completedAt: iso(-3) + "T11:00:00.000Z",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-003", type: "qcm", courseId: 29, seriesId: "2023-sfax-c29-0",
    title: "✍️ QCM AVC – 2023 FMS Sfax",
    startDate: iso(-2), startTime: "09:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "done",
    completedAt: iso(-2) + "T09:30:00.000Z",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-004", type: "revision_slot", courseId: 24,
    title: "🔁 Révision J7 – Cirrhose",
    startDate: iso(-1), startTime: "14:00", durationMinutes: 25,
    estimatedFromKpi: true, isRevision: true, revisionInterval: "J7", parentEventId: "ev-old-001",
    status: "done", completedAt: iso(-1) + "T14:30:00.000Z",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-005", type: "lecture", courseId: 33,
    title: "📖 Lecture BPCO",
    startDate: iso(-1), startTime: "16:00", durationMinutes: 50,
    estimatedFromKpi: false, isRevision: false, status: "done",
    completedAt: iso(-1) + "T17:00:00.000Z",
    createdAt: NOW, updatedAt: NOW,
  },

  // ── 5 à venir cette semaine ─────────────────────────────
  {
    id: "ev-006", type: "qcm", courseId: 4, seriesId: "2024-sousse-c4-0",
    title: "✍️ QCM HTA – 2024 FMS Sousse",
    startDate: iso(0), startTime: "11:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-007", type: "revision_slot", courseId: 1,
    title: "🔁 Révision J2 – SCA",
    startDate: iso(0), startTime: "14:30", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: true, revisionInterval: "J2", parentEventId: "ev-001",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-008", type: "lecture", courseId: 52,
    title: "📖 Lecture Diabète Type 2",
    startDate: iso(1), startTime: "09:00", durationMinutes: 55,
    estimatedFromKpi: false, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-009", type: "qcm", courseId: 61, seriesId: "2024-tunis-c61-0",
    title: "✍️ QCM Tuberculose – 2024 FMT Tunis",
    startDate: iso(2), startTime: "08:30", durationMinutes: 25,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-010", type: "qcm", courseId: 38, seriesId: "2023-monastir-c38-0",
    title: "✍️ QCM IRA – 2023 FMM Monastir",
    startDate: iso(3), startTime: "10:30", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },

  // ── 8 dans les 2 semaines suivantes ─────────────────────
  {
    id: "ev-011", type: "lecture", courseId: 9,
    title: "📖 Lecture Cancer du Col",
    startDate: iso(7), startTime: "09:30", durationMinutes: 45,
    estimatedFromKpi: false, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-012", type: "qcm", courseId: 25, seriesId: "2024-sfax-c25-0",
    title: "✍️ QCM Hépatites Virales – 2024 FMS Sfax",
    startDate: iso(8), startTime: "08:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-013", type: "revision_slot", courseId: 29,
    title: "🔁 Révision J7 – AVC",
    startDate: iso(5), startTime: "11:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: true, revisionInterval: "J7", parentEventId: "ev-003",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-014", type: "qcm", courseId: 66, seriesId: "2023-tunis-c66-0",
    title: "✍️ QCM Anémies – 2023 FMT Tunis",
    startDate: iso(9), startTime: "14:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-015", type: "lecture", courseId: 47,
    title: "📖 Lecture État de Choc",
    startDate: iso(10), startTime: "10:00", durationMinutes: 60,
    estimatedFromKpi: false, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-016", type: "qcm", courseId: 43, seriesId: "2022-sfax-c43-0",
    title: "✍️ QCM Lithiase Urinaire – 2022 FMS Sfax",
    startDate: iso(11), startTime: "09:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-017", type: "revision_slot", courseId: 33,
    title: "🔁 Révision J10 – BPCO",
    startDate: iso(9), startTime: "15:00", durationMinutes: 50,
    estimatedFromKpi: false, isRevision: true, revisionInterval: "J10", parentEventId: "ev-005",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-018", type: "lecture", courseId: 62,
    title: "📖 Lecture VIH – Infection et SIDA",
    startDate: iso(12), startTime: "13:30", durationMinutes: 55,
    estimatedFromKpi: false, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },

  // ── 5 en retard (date passée, status upcoming) ──────────
  {
    id: "ev-019", type: "qcm", courseId: 3, seriesId: "2023-tunis-c3-0",
    title: "✍️ QCM Endocardite – 2023 FMT Tunis",
    startDate: iso(-7), startTime: "09:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-020", type: "lecture", courseId: 5,
    title: "📖 Lecture Troubles du Rythme",
    startDate: iso(-5), startTime: "10:30", durationMinutes: 45,
    estimatedFromKpi: false, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-021", type: "revision_slot", courseId: 2,
    title: "🔁 Révision J2 – Insuffisance Cardiaque",
    startDate: iso(-1), startTime: "09:00", durationMinutes: 45,
    estimatedFromKpi: false, isRevision: true, revisionInterval: "J2", parentEventId: "ev-002",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-022", type: "qcm", courseId: 34, seriesId: "2022-monastir-c34-0",
    title: "✍️ QCM Asthme – 2022 FMM Monastir",
    startDate: iso(-4), startTime: "14:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: false, status: "upcoming",
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-023", type: "revision_slot", courseId: 25,
    title: "🔁 Révision J7 – Hépatites Virales",
    startDate: iso(-2), startTime: "11:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: true, revisionInterval: "J7", parentEventId: "ev-old-002",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },

  // ── 2 révisions auto futures ────────────────────────────
  {
    id: "ev-024", type: "revision_slot", courseId: 4,
    title: "🔁 Révision J10 – HTA",
    startDate: iso(10), startTime: "09:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: true, revisionInterval: "J10", parentEventId: "ev-006",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "ev-025", type: "revision_slot", courseId: 1,
    title: "🔁 Révision J30 – SCA",
    startDate: iso(27), startTime: "09:00", durationMinutes: 20,
    estimatedFromKpi: true, isRevision: true, revisionInterval: "J30", parentEventId: "ev-001",
    status: "upcoming", createdAt: NOW, updatedAt: NOW,
  },
];
