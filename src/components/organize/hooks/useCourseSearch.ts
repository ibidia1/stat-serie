"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { COURSES } from "../data/courses";
import type { Course } from "../data/types";

const fuse = new Fuse(COURSES, {
  keys: [
    { name: "number", weight: 2 },
    { name: "title",  weight: 1 },
    { name: "shortTitle", weight: 1.5 },
  ],
  threshold: 0.4,
  includeScore: true,
});

export function searchCourses(query: string, limit = 12): Course[] {
  if (!query.trim()) return COURSES.slice(0, limit);
  // Numeric query: exact number match first
  if (/^\d+$/.test(query.trim())) {
    const num = parseInt(query.trim(), 10);
    const exact = COURSES.find((c) => c.number === num);
    const rest  = fuse.search(query, { limit }).map((r) => r.item).filter((c) => c.number !== num);
    return exact ? [exact, ...rest].slice(0, limit) : rest.slice(0, limit);
  }
  return fuse.search(query, { limit }).map((r) => r.item);
}

export function useCourseSearch(limit = 12) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCourses(query, limit), [query, limit]);
  return { query, setQuery, results };
}
