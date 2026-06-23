/**
 * The identity pentagon (Phase 3.09) — a faithful React/SVG port of
 * `IqReport.identityPentagon()` from `docs/design-handovers/surfaces/report-kit.js`.
 *
 * It is an IDENTITY GRAPHIC, not a gauge: the SAME whole, five-coloured shape and
 * the SAME size for every child. It encodes NO magnitude — no spokes that grow, no
 * partial fills, no rings, no axis, no number. Only the five fixed index hues and
 * the short vertex labels convey "the five areas, one whole". This deliberately
 * REPLACES the 3.02 radar/spider pentagon (which encodes per-axis magnitude and is
 * forbidden on parent-facing surfaces — handover §1).
 *
 * Filter-free flat `<polygon>` + `<line>` only, so the same geometry drops 1:1 into
 * `@react-pdf/renderer` later (3.10). On-screen it fills with the `--ix-*` CSS vars
 * (no hardcoded hex). The `dim` prop lowers saturation of named wedges — used ONLY
 * for the gentle `not_representative` read (still whole, still the same size).
 */
import type {Locale} from '@/content/locale';
import type {IndexId} from '@/lib/scoring/v2';
import {INDEX_META, INDEX_ORDER} from './index-meta';

// viewBox + geometry constants — identical to the kit's identityPentagon().
const VBW = 410;
const VBH = 360;
const CX = 205;
const CY = 176;
const R = 110;

type Point = readonly [number, number];

const polar = (angleDeg: number, r: number): Point => [
  CX + r * Math.cos((angleDeg * Math.PI) / 180),
  CY + r * Math.sin((angleDeg * Math.PI) / 180)
];

const f = (n: number): string => n.toFixed(1);

export function IdentityPentagon({
  size = 300,
  locale,
  dim,
  labelled = true,
  className
}: {
  size?: number;
  locale: Locale;
  /** Index ids to render at low saturation (the gentle not_representative read). */
  dim?: readonly IndexId[];
  labelled?: boolean;
  className?: string;
}) {
  const dimmed = new Set(dim ?? []);

  const vertices: Point[] = INDEX_ORDER.map((id) => polar(INDEX_META[id].angle, R));
  const midpoints: Point[] = vertices.map((v, i) => {
    const n = vertices[(i + 1) % vertices.length];
    return [(v[0] + n[0]) / 2, (v[1] + n[1]) / 2];
  });

  const height = Math.round((size * VBH) / VBW);
  const ariaLabel =
    locale === 'en'
      ? 'The five-area thinking profile, shown as one whole five-coloured shape'
      : 'Профил на петте области, прикажан како една целосна петобојна форма';

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VBW} ${VBH}`}
      width={size}
      height={height}
      fill="none"
      role="img"
      aria-label={ariaLabel}
    >
      <g>
        {/* five kites — each owns one fixed index hue */}
        {INDEX_ORDER.map((id, i) => {
          const prevMid = midpoints[(i + INDEX_ORDER.length - 1) % INDEX_ORDER.length];
          const vertex = vertices[i];
          const nextMid = midpoints[i];
          const pts = [[CX, CY] as Point, prevMid, vertex, nextMid]
            .map((p) => `${f(p[0])},${f(p[1])}`)
            .join(' ');
          return (
            <polygon
              key={id}
              points={pts}
              fill={`var(--ix-${INDEX_META[id].hue})`}
              opacity={dimmed.has(id) ? 0.32 : 1}
            />
          );
        })}

        {/* white seams from the centre to each vertex (the assembled-facets read) */}
        <g stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
          {vertices.map((v, i) => (
            <line key={i} x1={CX} y1={CY} x2={f(v[0])} y2={f(v[1])} />
          ))}
        </g>

        {/* outer outline closes the whole shape */}
        <polygon
          points={vertices.map((v) => `${f(v[0])},${f(v[1])}`).join(' ')}
          fill="none"
          stroke="var(--ink-head)"
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      </g>

      {/* vertex labels — the short index name only (never a number, never a band) */}
      {labelled
        ? INDEX_ORDER.map((id) => {
            const [x, y] = polar(INDEX_META[id].angle, R + 22);
            const anchor =
              Math.abs(x - CX) < 14 ? 'middle' : x < CX ? 'end' : 'start';
            const dyTop = INDEX_META[id].angle === -90 ? -2 : 4;
            return (
              <text
                key={id}
                x={f(x)}
                y={f(y + dyTop)}
                textAnchor={anchor}
                fontFamily="var(--font-brand)"
                fontSize={15}
                fontWeight={700}
                fill="var(--ink-head)"
              >
                {INDEX_META[id].short[locale]}
              </text>
            );
          })
        : null}
    </svg>
  );
}
