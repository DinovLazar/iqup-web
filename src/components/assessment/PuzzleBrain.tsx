/**
 * The puzzle-brain progress motif (brand §6 / phase prompt). Five index-region
 * pieces assemble into the signature pentagon as the child completes sections:
 * a region paints with its brand-hue colour only when **all** of its contributing
 * task-domains are done (the `REGION_DOMAINS` mapping). The piece for the region
 * currently in progress gets a quiet pulse — never a number, never "N of M", no %
 * or score. Completion is conveyed by fill **and** a check tab (not colour alone),
 * and an off-screen live summary names which areas are assembled.
 *
 * Purpose-built SVG (no charting library). The assembled pentagon directly
 * previews the result pentagon (3.09) — progress = the brain filling in.
 */
'use client';

import {m} from 'framer-motion';
import type {Domain} from '@/lib/engine/types';
import {
  INDEX_REGIONS,
  REGION_HEX,
  REGION_DOMAINS,
  type IndexRegion
} from './types';

const CX = 100;
const CY = 104;
const R = 86;

/** Pentagon vertex k (top-first, clockwise). */
function vertex(k: number): [number, number] {
  const theta = (-90 + 72 * k) * (Math.PI / 180);
  return [CX + R * Math.cos(theta), CY + R * Math.sin(theta)];
}

/** Triangular piece i = (centre, vertex i, vertex i+1). */
function piecePath(i: number): string {
  const [x1, y1] = vertex(i);
  const [x2, y2] = vertex((i + 1) % 5);
  return `M ${CX} ${CY} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

/** Centroid of piece i — anchor for the completion check tab. */
function pieceCentroid(i: number): [number, number] {
  const [x1, y1] = vertex(i);
  const [x2, y2] = vertex((i + 1) % 5);
  return [(CX + x1 + x2) / 3, (CY + y1 + y2) / 3];
}

function isRegionComplete(region: IndexRegion, done: ReadonlySet<Domain>): boolean {
  return REGION_DOMAINS[region].every((d) => done.has(d));
}

export function PuzzleBrain({
  completedDomains,
  activeRegion = null,
  labels,
  title,
  doneWord,
  reducedMotion = false,
  size = 168
}: {
  completedDomains: ReadonlySet<Domain>;
  activeRegion?: IndexRegion | null;
  /** Localized region names (Logical, Spatial, …) for the off-screen summary. */
  labels: Record<IndexRegion, string>;
  /** Localized title for the whole motif (e.g. "Your puzzle is coming together"). */
  title: string;
  /** Localized word appended to a completed region in the SR summary (e.g. "ready"). */
  doneWord: string;
  reducedMotion?: boolean;
  size?: number;
}) {
  const completed = INDEX_REGIONS.filter((r) => isRegionComplete(r, completedDomains));
  const summary = completed.length
    ? completed.map((r) => `${labels[r]} ${doneWord}`).join(', ')
    : title;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 208"
        role="img"
        aria-label={`${title}. ${summary}`}
      >
        {INDEX_REGIONS.map((region, i) => {
          const done = isRegionComplete(region, completedDomains);
          const active = region === activeRegion;
          const [tx, ty] = pieceCentroid(i);
          return (
            <g key={region}>
              <m.path
                d={piecePath(i)}
                fill={done ? REGION_HEX[region] : 'var(--field)'}
                stroke="var(--ink)"
                strokeWidth={2.5}
                strokeLinejoin="round"
                initial={false}
                animate={
                  reducedMotion
                    ? {opacity: 1}
                    : {
                        opacity: done ? 1 : active ? [0.55, 0.85, 0.55] : 0.55,
                        scale: done ? 1 : 0.985
                      }
                }
                transition={
                  active && !done
                    ? {duration: 1.6, repeat: Infinity, ease: 'easeInOut'}
                    : {duration: 0.5, ease: 'easeOut'}
                }
                style={{transformOrigin: `${CX}px ${CY}px`}}
              />
              {done && (
                <circle
                  cx={tx}
                  cy={ty}
                  r={9}
                  fill="var(--card)"
                  stroke="var(--ink)"
                  strokeWidth={2}
                />
              )}
              {done && (
                <path
                  d={`M ${tx - 4} ${ty} l 3 3 l 5 -6`}
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
