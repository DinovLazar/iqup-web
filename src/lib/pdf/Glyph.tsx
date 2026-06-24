/**
 * Render an `index-meta` line glyph with react-pdf SVG primitives.
 *
 * The glyph strings in `index-meta.ts` are raw inner-SVG markup (`<circle …/>` +
 * `<path …/>`) shared with the on-screen surfaces. react-pdf can't take an HTML
 * string, so this parses the two shapes the glyph set uses into `<Circle>` /
 * `<Path>` elements. Same 24×24 viewBox, same round stroked stroke as the screen.
 */
import {Svg, Path, Circle} from '@react-pdf/renderer';

const CIRCLE_RE = /<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\s*\/>/g;
const PATH_RE = /<path d="([^"]+)"\s*\/>/g;

export function Glyph({
  glyph,
  size = 22,
  color
}: {
  glyph: string;
  size?: number;
  color: string;
}) {
  const circles = [...glyph.matchAll(CIRCLE_RE)];
  const paths = [...glyph.matchAll(PATH_RE)];

  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      {paths.map((m, i) => (
        <Path
          key={`p-${i}`}
          d={m[1]}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {circles.map((m, i) => (
        <Circle
          key={`c-${i}`}
          cx={Number(m[1])}
          cy={Number(m[2])}
          r={Number(m[3])}
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
      ))}
    </Svg>
  );
}
