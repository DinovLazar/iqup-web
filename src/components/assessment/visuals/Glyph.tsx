/**
 * The shared, language-neutral visual vocabulary for every task renderer: the
 * 3.04 `Glyph` shape tokens, the `ColorToken` swatches, the `Direction` arrows,
 * and a `PolyShape` (polyomino) renderer. Bespoke SVG — no image assets, no
 * charting library (brand §6 / plan §8). Each glyph carries the dark ink outline
 * the brand uses for edge definition so shape is legible regardless of fill, and
 * meaning is never carried by colour alone (shape + outline always differ).
 */
import type {ColorToken, Direction, Glyph as GlyphToken, PolyShape} from '@/content/tasks';

/** Brand-safe, mutually-distinct fills for the 6 colour tokens (AA on light). */
export const COLOR_HEX: Record<ColorToken, string> = {
  red: '#e63946',
  blue: '#00b6f1',
  green: '#2a9d57',
  yellow: '#ffc20e',
  purple: '#762d90',
  orange: '#f7941d'
};

const INK = 'var(--ink)';
/** Brand violet as a literal — the `--iq-*` theme tokens are inlined into
 * utility classes and not emitted as raw `:root` vars (so `var(--iq-violet)`
 * would not resolve inside an SVG `fill`). */
const VIOLET = '#762d90';

/** Path/element for each shape token, drawn inside a 0..100 view box. */
function shapePath(glyph: GlyphToken): React.ReactNode {
  switch (glyph) {
    case 'circle':
      return <circle cx="50" cy="50" r="38" />;
    case 'square':
      return <rect x="14" y="14" width="72" height="72" rx="8" />;
    case 'triangle':
      return <polygon points="50,12 88,84 12,84" />;
    case 'star':
      return (
        <polygon points="50,8 61,38 93,38 67,58 77,90 50,70 23,90 33,58 7,38 39,38" />
      );
    case 'hexagon':
      return <polygon points="50,10 87,30 87,70 50,90 13,70 13,30" />;
    case 'diamond':
      return <polygon points="50,8 90,50 50,92 10,50" />;
    case 'heart':
      return (
        <path d="M50 86 C18 62 12 40 26 28 C38 18 50 30 50 38 C50 30 62 18 74 28 C88 40 82 62 50 86 Z" />
      );
    case 'cross':
      return <polygon points="38,12 62,12 62,38 88,38 88,62 62,62 62,88 38,88 38,62 12,62 12,38 38,38" />;
    case 'moon':
      return <path d="M64 12 A40 40 0 1 0 64 88 A30 30 0 1 1 64 12 Z" />;
    case 'arrow':
      return <polygon points="12,40 56,40 56,22 92,50 56,78 56,60 12,60" />;
  }
}

/**
 * Render a glyph token as an SVG. `title` becomes the accessible name (a stable,
 * locale-neutral shape/colour description) so option tiles are not colour-only.
 */
export function Glyph({
  glyph,
  color,
  size = 56,
  rotationDeg = 0,
  count = 1,
  title
}: {
  glyph: GlyphToken;
  color?: ColorToken;
  size?: number;
  rotationDeg?: 0 | 90 | 180 | 270;
  /** Draw N copies (Gf matrices vary count); laid out in a small wrap row. */
  count?: number;
  title?: string;
}) {
  const fill = color ? COLOR_HEX[color] : VIOLET;
  const one = (key?: number) => (
    <svg
      key={key}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{transform: rotationDeg ? `rotate(${rotationDeg}deg)` : undefined}}
    >
      <g fill={fill} stroke={INK} strokeWidth={5} strokeLinejoin="round">
        {shapePath(glyph)}
      </g>
    </svg>
  );
  if (count <= 1) return one();
  return (
    <span className="flex flex-wrap items-center justify-center gap-1">
      {Array.from({length: count}, (_, i) => one(i))}
    </span>
  );
}

/** Render a polyomino (`PolyShape`) as filled cells on its bounding grid. */
export function PolyShapeGlyph({
  shape,
  color = 'blue',
  px = 132,
  title
}: {
  shape: PolyShape;
  color?: ColorToken;
  px?: number;
  title?: string;
}) {
  const {size, cells} = shape;
  const unit = px / size;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {cells.map(([c, r], i) => (
        <rect
          key={i}
          x={c}
          y={r}
          width={1}
          height={1}
          rx={0.12}
          fill={COLOR_HEX[color]}
          stroke={INK}
          strokeWidth={2 / unit}
        />
      ))}
    </svg>
  );
}

const ARROW_ROTATION: Record<Direction, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270
};

/** A direction arrow (CT steps, maze commands). Outlined; never colour-only. */
export function DirectionArrow({
  direction,
  size = 40,
  title
}: {
  direction: Direction;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{transform: `rotate(${ARROW_ROTATION[direction]}deg)`}}
    >
      <g fill={VIOLET} stroke={INK} strokeWidth={5} strokeLinejoin="round">
        <polygon points="12,40 56,40 56,22 92,50 56,78 56,60 12,60" />
      </g>
    </svg>
  );
}
