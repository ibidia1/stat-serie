"use client";

import { useEffect, useState, type RefObject } from "react";
import { buildChains, CHAIN_COLORS } from "../lib/chains";
import type { CalendarEvent } from "../data/types";

interface Segment {
  id: string;
  d: string;
  color: string;
}
interface Node {
  id: string;
  cx: number;
  cy: number;
  color: string;
  isSource: boolean;
}

interface Props {
  /** Container whose top-left is the coordinate origin (must be `position: relative`). */
  scope: RefObject<HTMLElement | null>;
  events: CalendarEvent[];
  /** Bump this whenever the layout changes (view switch, week/month navigation). */
  recomputeKey: string | number;
  /** Clé du plan sélectionné : seule sa chaîne est tracée. */
  selectedKey?: string | null;
  /** Tracer toutes les chaînes (mode « tout afficher »), ignore selectedKey. */
  showAll?: boolean;
}

/**
 * Draws curved connector lines between the sessions of the same
 * spaced-repetition plan. Positions are measured from the DOM
 * (`[data-event-id]` nodes) so the overlay stays accurate regardless of how
 * each view lays its events out.
 */
export function ChainConnectors({ scope, events, recomputeKey, selectedKey = null, showAll = false }: Props) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = scope.current;
    if (!el) return;

    const compute = () => {
      const base = el.getBoundingClientRect();
      const pos = new Map<string, { cx: number; cy: number }>();
      el.querySelectorAll<HTMLElement>("[data-event-id]").forEach((n) => {
        const id = n.dataset.eventId;
        if (!id) return;
        const r = n.getBoundingClientRect();
        pos.set(id, {
          cx: r.left - base.left + r.width / 2,
          cy: r.top - base.top + r.height / 2,
        });
      });

      const segs: Segment[] = [];
      const nds: Node[] = [];
      for (const chain of buildChains(events)) {
        // N'afficher que la chaîne sélectionnée, sauf en mode « tout afficher ».
        if (!showAll && chain.key !== selectedKey) continue;
        const color = CHAIN_COLORS[chain.colorIndex];
        const points = chain.members
          .map((m) => ({ m, p: pos.get(m.id) }))
          .filter((x): x is { m: CalendarEvent; p: { cx: number; cy: number } } => !!x.p);
        if (points.length < 2) continue;

        points.forEach(({ m, p }, i) => {
          nds.push({ id: m.id, cx: p.cx, cy: p.cy, color, isSource: !m.isRevision });
          if (i === 0) return;
          const a = points[i - 1].p;
          const b = p;
          const mx = (a.cx + b.cx) / 2;
          segs.push({
            id: `${chain.key}-${i}`,
            color,
            d: `M ${a.cx} ${a.cy} C ${mx} ${a.cy}, ${mx} ${b.cy}, ${b.cx} ${b.cy}`,
          });
        });
      }

      setSegments(segs);
      setNodes(nds);
      setSize({
        w: Math.max(el.scrollWidth, base.width),
        h: Math.max(el.scrollHeight, base.height),
      });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [scope, events, recomputeKey, selectedKey, showAll]);

  if (segments.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-[2]"
      width={size.w}
      height={size.h}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      {segments.map((s) => (
        <path
          key={s.id}
          d={s.d}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="5 4"
          opacity={0.55}
          className="qe-chain-flow"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={`${n.id}-${i}`}
          cx={n.cx}
          cy={n.cy}
          r={n.isSource ? 4 : 3}
          fill={n.isSource ? n.color : "var(--card)"}
          stroke={n.color}
          strokeWidth={2}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}
