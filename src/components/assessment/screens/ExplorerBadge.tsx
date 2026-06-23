/**
 * The child reward — the "IQ UP! Explorer" badge (Explorer mood). Bespoke SVG, on
 * the brand palette, built around the signature puzzle-brain pentagon (the five
 * index pieces, all assembled). **No Bibi characters** — Bibi appears only on the
 * shareable certificate (3.11), never inside the assessment (test validity). A
 * rounded badge (badge radius, brand §6) with a celebratory but expert feel.
 */
'use client';

import {m} from 'framer-motion';
import {INDEX_REGIONS, REGION_HEX} from '../types';

const CX = 90;
const CY = 82;
const R = 52;

function vertex(k: number): [number, number] {
  const theta = (-90 + 72 * k) * (Math.PI / 180);
  return [CX + R * Math.cos(theta), CY + R * Math.sin(theta)];
}

function piecePath(i: number): string {
  const [x1, y1] = vertex(i);
  const [x2, y2] = vertex((i + 1) % 5);
  return `M ${CX} ${CY} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

export function ExplorerBadge({
  name,
  tagline,
  reducedMotion = false
}: {
  /** Localized badge name, e.g. "IQ UP! Explorer". */
  name: string;
  /** Localized one-line tagline under the badge. */
  tagline: string;
  reducedMotion?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <m.div
        // Scale-only entrance — never animate opacity from 0 on essential
        // content: if the animation engine is paused (reduced motion, a
        // background tab, throttled rAF) the badge must still be fully visible.
        initial={reducedMotion ? false : {scale: 0.9}}
        animate={{scale: 1}}
        transition={{type: 'spring', stiffness: 220, damping: 18}}
        className="flex flex-col items-center rounded-badge px-8 py-6 text-white shadow-lg"
        style={{background: 'linear-gradient(to bottom, #762d90, #ec008c)'}}
      >
        <svg width={150} height={150} viewBox="0 0 180 164" role="img" aria-label={name}>
          {/* Sun-ray halo behind the assembled pentagon. */}
          {!reducedMotion &&
            Array.from({length: 12}, (_, i) => {
              const a = (i * 30) * (Math.PI / 180);
              return (
                <line
                  key={i}
                  x1={CX + 60 * Math.cos(a)}
                  y1={CY + 60 * Math.sin(a)}
                  x2={CX + 70 * Math.cos(a)}
                  y2={CY + 70 * Math.sin(a)}
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            })}
          {INDEX_REGIONS.map((region, i) => (
            <path
              key={region}
              d={piecePath(i)}
              fill={REGION_HEX[region]}
              stroke="#fff"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          ))}
          {/* A small star badge accent at the apex. */}
          <polygon
            points="90,18 95,30 108,30 97,38 101,51 90,43 79,51 83,38 72,30 85,30"
            fill="#ffc20e"
            stroke="#fff"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-1 font-brand text-xl font-extrabold tracking-tight">{name}</p>
      </m.div>
      <p className="max-w-xs text-center text-ink-soft">{tagline}</p>
    </div>
  );
}
