import * as React from 'react';
import {
  Apple,
  Banana,
  Bird,
  Car,
  Cat,
  Dog,
  Fish,
  Grape,
  Moon,
  Plane,
  Rabbit,
  Sun,
  TreeDeciduous
} from 'lucide-react';
import type {Direction, GlyphName, GlyphSpec} from '@/content/test/types';
import {DEFAULT_GLYPH_COLOR, toyVar} from './lexicon';

/**
 * Renders one puzzle glyph. Recognisable real-world objects come from Lucide (a
 * locked dependency, endorsed by spec §7); the abstract puzzle figures and the
 * few objects Lucide lacks (duck, sock, shoe, butterfly, ball, balloon, block)
 * are original, lightweight inline SVG. Every glyph is decorative — the text
 * alternative is supplied by the option's `label` (option tiles) or by
 * `stemAlt()` (stems) on the parent — so glyphs are `aria-hidden`.
 */

type LucideIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

const LUCIDE: Partial<Record<GlyphName, LucideIcon>> = {
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
  bird: Bird,
  fish: Fish,
  apple: Apple,
  banana: Banana,
  grapes: Grape,
  plane: Plane,
  sun: Sun,
  moon: Moon,
  car: Car,
  tree: TreeDeciduous
};

const ARROW_ANGLE: Record<Direction, number> = {
  right: 0,
  'down-right': 45,
  down: 90,
  'down-left': 135,
  left: 180,
  'up-left': 225,
  up: 270,
  'up-right': 315
};

/** Tidy dot positions (in a 100×100 box) for a dot-group of N. */
function dotPositions(n: number): Array<[number, number]> {
  switch (n) {
    case 1:
      return [[50, 50]];
    case 2:
      return [[34, 50], [66, 50]];
    case 3:
      return [[28, 50], [50, 50], [72, 50]];
    case 4:
      return [[34, 34], [66, 34], [34, 66], [66, 66]];
    case 5:
      return [[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]];
    case 6:
      return [[36, 26], [64, 26], [36, 50], [64, 50], [36, 74], [64, 74]];
    default: {
      // Fallback grid for any other count.
      const out: Array<[number, number]> = [];
      const cols = Math.ceil(Math.sqrt(n));
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        out.push([24 + (c * 52) / Math.max(1, cols - 1 || 1), 24 + r * 24]);
      }
      return out;
    }
  }
}

export interface GlyphProps {
  spec: GlyphSpec;
  /** Rendered square size in px. */
  size?: number;
  className?: string;
}

export function Glyph({spec, size = 64, className}: GlyphProps) {
  const Lucide = LUCIDE[spec.glyph];
  if (Lucide) {
    const color = toyVar(spec.color ?? DEFAULT_GLYPH_COLOR[spec.glyph]);
    return (
      <Lucide
        size={size}
        color={color}
        strokeWidth={1.9}
        aria-hidden
        className={className}
      />
    );
  }

  const fill = toyVar(spec.color);
  const shape: React.CSSProperties = {
    fill,
    stroke: 'var(--ink)',
    strokeWidth: 3,
    strokeLinejoin: 'round',
    strokeLinecap: 'round'
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
    >
      <CustomGlyph spec={spec} shape={shape} fill={fill} />
    </svg>
  );
}

function CustomGlyph({
  spec,
  shape,
  fill
}: {
  spec: GlyphSpec;
  shape: React.CSSProperties;
  fill: string;
}) {
  const ink = 'var(--ink)';
  switch (spec.glyph) {
    case 'circle':
      return <circle cx={50} cy={50} r={36} style={shape} />;
    case 'square':
      return <rect x={16} y={16} width={68} height={68} rx={12} style={shape} />;
    case 'triangle':
      return <path d="M50 16 L86 82 L14 82 Z" style={shape} />;
    case 'star':
      return (
        <path
          d="M50 12 L61 38 L89 40 L67 58 L74 86 L50 70 L26 86 L33 58 L11 40 L39 38 Z"
          style={shape}
        />
      );
    case 'heart':
      return (
        <path
          d="M50 84 C 14 58 16 30 38 26 C 46 24 50 30 50 36 C 50 30 54 24 62 26 C 84 30 86 58 50 84 Z"
          style={shape}
        />
      );
    case 'ball':
      return (
        <g>
          <circle cx={50} cy={50} r={36} style={shape} />
          <path
            d="M22 40 Q50 30 78 40"
            style={{fill: 'none', stroke: ink, strokeWidth: 2.4, strokeLinecap: 'round'}}
          />
          <path
            d="M24 62 Q50 72 76 62"
            style={{fill: 'none', stroke: ink, strokeWidth: 2.4, strokeLinecap: 'round'}}
          />
          <ellipse cx={40} cy={38} rx={8} ry={5} style={{fill: '#ffffff', opacity: 0.45}} />
        </g>
      );
    case 'balloon':
      return (
        <g>
          <path
            d="M50 78 q7 9 -2 16"
            style={{fill: 'none', stroke: ink, strokeWidth: 2, strokeLinecap: 'round'}}
          />
          <ellipse cx={50} cy={42} rx={25} ry={31} style={shape} />
          <path d="M44 72 L56 72 L50 82 Z" style={{...shape, fill}} />
          <ellipse cx={41} cy={32} rx={6} ry={9} style={{fill: '#ffffff', opacity: 0.4}} />
        </g>
      );
    case 'block': {
      // Cabinet-projection cube: shared fill, light top + dark side overlays.
      const front = 'M28 42 H68 V84 H28 Z';
      const top = 'M28 42 L44 26 H84 L68 42 Z';
      const side = 'M68 42 L84 26 V68 L68 84 Z';
      return (
        <g style={{stroke: ink, strokeWidth: 3, strokeLinejoin: 'round'}}>
          <path d={side} style={{fill}} />
          <path d={top} style={{fill}} />
          <path d={front} style={{fill}} />
          <path d={top} style={{fill: '#ffffff', opacity: 0.32, stroke: 'none'}} />
          <path d={side} style={{fill: '#000000', opacity: 0.18, stroke: 'none'}} />
        </g>
      );
    }
    case 'duck':
      return (
        <g style={{stroke: ink, strokeWidth: 3, strokeLinejoin: 'round'}}>
          <ellipse cx={54} cy={60} rx={30} ry={20} style={{fill}} />
          <path d="M78 56 q12 -2 12 8 q0 6 -10 6 z" style={{fill}} />
          <circle cx={32} cy={40} r={15} style={{fill}} />
          <path d="M18 38 l-13 3 l13 5 z" style={{fill: toyVar('orange')}} />
          <circle cx={30} cy={37} r={2.6} style={{fill: ink, stroke: 'none'}} />
        </g>
      );
    case 'sock':
      return (
        <g style={{stroke: ink, strokeWidth: 3, strokeLinejoin: 'round'}}>
          <path
            d="M38 14 H62 V52 L80 64 a16 16 0 0 1 -6 30 l-2 1 a16 16 0 0 1 -20 -7 L38 60 Z"
            style={{fill}}
          />
          <path
            d="M38 24 H62"
            style={{fill: 'none', stroke: ink, strokeWidth: 2.4}}
          />
        </g>
      );
    case 'shoe':
      return (
        <g style={{stroke: ink, strokeWidth: 3, strokeLinejoin: 'round'}}>
          <path
            d="M14 72 Q14 56 32 52 L52 48 Q64 46 72 56 L86 66 Q92 70 90 78 L18 78 Q14 78 14 72 Z"
            style={{fill}}
          />
          <path
            d="M40 52 l6 12 M52 49 l6 12"
            style={{fill: 'none', stroke: ink, strokeWidth: 2.2, strokeLinecap: 'round'}}
          />
          <path d="M14 78 H90" style={{fill: 'none', stroke: ink, strokeWidth: 4}} />
        </g>
      );
    case 'butterfly':
      return (
        <g style={{stroke: ink, strokeWidth: 2.6, strokeLinejoin: 'round'}}>
          <ellipse cx={34} cy={36} rx={18} ry={15} transform="rotate(-18 34 36)" style={{fill}} />
          <ellipse cx={66} cy={36} rx={18} ry={15} transform="rotate(18 66 36)" style={{fill}} />
          <ellipse cx={36} cy={64} rx={14} ry={12} transform="rotate(18 36 64)" style={{fill}} />
          <ellipse cx={64} cy={64} rx={14} ry={12} transform="rotate(-18 64 64)" style={{fill}} />
          <rect x={47.5} y={28} width={5} height={44} rx={2.5} style={{fill: ink, stroke: 'none'}} />
          <path
            d="M50 28 q-6 -10 -12 -12 M50 28 q6 -10 12 -12"
            style={{fill: 'none', stroke: ink, strokeWidth: 2, strokeLinecap: 'round'}}
          />
        </g>
      );
    case 'dots': {
      const n = spec.count ?? 1;
      return (
        <g>
          {dotPositions(n).map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={9}
              style={{fill: spec.color ? fill : 'var(--ink)', stroke: 'var(--ink)', strokeWidth: 2}}
            />
          ))}
        </g>
      );
    }
    case 'arrow': {
      const angle = spec.dir ? ARROW_ANGLE[spec.dir] : 0;
      const mirror = spec.mirror ? ' scale(-1 1) translate(-100 0)' : '';
      return (
        <g transform={`rotate(${angle} 50 50)${mirror}`}>
          <path
            d="M16 42 H58 V28 L88 50 L58 72 V58 H16 Z"
            style={{...shape, strokeLinejoin: 'round'}}
          />
        </g>
      );
    }
    case 'wedge-circle':
      // A full disc with a small triangular wedge cut to the centre (top-right).
      return <path d="M50 50 L80 28 A38 38 0 1 1 88 50 Z" style={shape} />;
    case 'wedge':
      // The matching wedge piece that fills the gap.
      return <path d="M50 50 L80 28 A38 38 0 0 1 88 50 Z" style={shape} />;
    case 'piece-square':
      return <rect x={30} y={32} width={38} height={38} rx={6} style={shape} />;
    case 'wedge-small':
      return <path d="M52 54 L72 40 A26 26 0 0 1 78 56 Z" style={shape} />;
    case 'rot-base':
      return <path d="M30 20 V80 H45 V52 H68 V37 H45 V20 Z" style={shape} />;
    case 'rot-rotated':
      return (
        <path
          d="M30 20 V80 H45 V52 H68 V37 H45 V20 Z"
          transform="rotate(90 50 50)"
          style={shape}
        />
      );
    case 'rot-mirror':
      return (
        <path
          d="M30 20 V80 H45 V52 H68 V37 H45 V20 Z"
          transform="translate(100 0) scale(-1 1)"
          style={shape}
        />
      );
    case 'rot-different':
      return (
        <path d="M26 44 H44 V26 H58 V44 H78 V60 H58 V78 H44 V60 H26 Z" style={shape} />
      );
    case 'cube-net': {
      const cells = [
        [40, 8],
        [40, 28],
        [20, 28],
        [60, 28],
        [40, 48],
        [40, 68]
      ];
      return (
        <g style={{stroke: 'var(--ink)', strokeWidth: 2.6, strokeLinejoin: 'round'}}>
          {cells.map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={20}
              height={20}
              rx={3}
              style={{fill, opacity: 0.92}}
            />
          ))}
        </g>
      );
    }
    case 'cube': {
      const front = 'M28 42 H68 V84 H28 Z';
      const top = 'M28 42 L44 26 H84 L68 42 Z';
      const side = 'M68 42 L84 26 V68 L68 84 Z';
      const v = spec.variant ?? 'match';
      return (
        <g style={{stroke: ink, strokeWidth: 3, strokeLinejoin: 'round'}}>
          <path d={side} style={{fill}} />
          <path d={top} style={{fill}} />
          <path d={front} style={{fill}} />
          <path d={top} style={{fill: '#ffffff', opacity: 0.32, stroke: 'none'}} />
          <path d={side} style={{fill: '#000000', opacity: 0.18, stroke: 'none'}} />
          {/* Tiny face marks differ per variant (illustrative — scoring uses `correct`). */}
          {v === 'match' && (
            <circle cx={48} cy={62} r={5} style={{fill: '#ffffff', stroke: 'none'}} />
          )}
          {v === 'swapped' && (
            <rect x={74} y={50} width={8} height={8} style={{fill: '#ffffff', stroke: 'none'}} />
          )}
          {v === 'wrong' && (
            <path
              d="M42 56 l12 12 M54 56 l-12 12"
              style={{fill: 'none', stroke: '#ffffff', strokeWidth: 3, strokeLinecap: 'round'}}
            />
          )}
        </g>
      );
    }
    default:
      return <circle cx={50} cy={50} r={34} style={shape} />;
  }
}
