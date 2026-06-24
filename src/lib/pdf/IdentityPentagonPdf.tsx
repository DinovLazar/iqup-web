/**
 * The identity pentagon for the PDF — a 1:1 react-pdf port of the on-screen
 * `IdentityPentagon` (3.09), which is itself the `report-kit.js` pentagon. SAME
 * geometry (viewBox 410×360, centre 205/176, R 110, the five `index-meta` angles,
 * five kites + white seams + ink outline) so the printed shape matches the screen
 * exactly. It is an IDENTITY graphic — the same whole, five-coloured shape and the
 * same size for every child; it encodes NO magnitude.
 *
 * react-pdf has its own SVG primitives (Svg/Polygon/Line/Text), so the on-screen
 * React component cannot be reused directly; only the geometry + the hues
 * (`index-meta` + the literal `--ix-*` mirror in `tokens.ts`) are shared.
 */
import {Svg, Polygon, Line, Text} from '@react-pdf/renderer';
import type {Locale} from '@/content/locale';
import {INDEX_META, INDEX_ORDER} from '@/components/report/index-meta';
import {BRAND_FONT} from './fonts';
import {HUE, TOKENS} from './tokens';

// Geometry constants — identical to `IdentityPentagon.tsx` / the kit.
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

export function IdentityPentagonPdf({
  size = 300,
  locale
}: {
  size?: number;
  locale: Locale;
}) {
  const vertices: Point[] = INDEX_ORDER.map((id) => polar(INDEX_META[id].angle, R));
  const midpoints: Point[] = vertices.map((v, i) => {
    const n = vertices[(i + 1) % vertices.length];
    return [(v[0] + n[0]) / 2, (v[1] + n[1]) / 2];
  });

  const height = Math.round((size * VBH) / VBW);

  return (
    <Svg viewBox={`0 0 ${VBW} ${VBH}`} width={size} height={height}>
      {/* five kites — each owns one fixed index hue */}
      {INDEX_ORDER.map((id, i) => {
        const prevMid = midpoints[(i + INDEX_ORDER.length - 1) % INDEX_ORDER.length];
        const vertex = vertices[i];
        const nextMid = midpoints[i];
        const pts = [[CX, CY] as Point, prevMid, vertex, nextMid]
          .map((p) => `${f(p[0])},${f(p[1])}`)
          .join(' ');
        return <Polygon key={id} points={pts} fill={HUE[INDEX_META[id].hue].solid} />;
      })}

      {/* white seams from the centre to each vertex (the assembled-facets read) */}
      {vertices.map((v, i) => (
        <Line
          key={`seam-${i}`}
          x1={CX}
          y1={CY}
          x2={Number(f(v[0]))}
          y2={Number(f(v[1]))}
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
        />
      ))}

      {/* outer outline closes the whole shape */}
      <Polygon
        points={vertices.map((v) => `${f(v[0])},${f(v[1])}`).join(' ')}
        fill="none"
        stroke={TOKENS.inkHead}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />

      {/* vertex labels — the short index name only (never a number, never a band) */}
      {INDEX_ORDER.map((id) => {
        const [x, y] = polar(INDEX_META[id].angle, R + 22);
        const anchor: 'start' | 'middle' | 'end' =
          Math.abs(x - CX) < 14 ? 'middle' : x < CX ? 'end' : 'start';
        const dyTop = INDEX_META[id].angle === -90 ? -2 : 4;
        return (
          <Text
            key={`lbl-${id}`}
            x={Number(f(x))}
            y={Number(f(y + dyTop))}
            textAnchor={anchor}
            style={{fontFamily: BRAND_FONT, fontSize: 15, fontWeight: 700}}
            fill={TOKENS.inkHead}
          >
            {INDEX_META[id].short[locale]}
          </Text>
        );
      })}
    </Svg>
  );
}
