export const DEFAULT_EXAM_DATE = "2026-09-15";
export const EXAM_DATE_KEY = "qe.organize.examDate";

export function getExamDate(): string {
  if (typeof window === "undefined") return DEFAULT_EXAM_DATE;
  return localStorage.getItem(EXAM_DATE_KEY) ?? DEFAULT_EXAM_DATE;
}

export function setExamDate(iso: string): void {
  localStorage.setItem(EXAM_DATE_KEY, iso);
}
