import type {Locale} from '@/content/locale';
import type {GlyphSpec, StemSpec} from '@/content/test/types';
import {cn} from '@/lib/utils';
import {Glyph} from './Glyph';
import {stemAlt} from './lexicon';

/**
 * Renders a question's stem graphic from its structured `StemSpec`, composing
 * the atomic {@link Glyph}s into sequences, grids, scenes, etc. The whole stem is
 * exposed to assistive tech as a single `role="img"` with a localised
 * `aria-label` built by {@link stemAlt} — so screen-reader users get the same
 * puzzle content sighted users see (WCAG 1.1.1). Decorative inner glyphs stay
 * `aria-hidden`.
 */
export function StemVisual({
  stem,
  locale,
  className
}: {
  stem: StemSpec;
  locale: Locale;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={stemAlt(stem, locale)}
      className={cn(
        'flex min-h-32 w-full items-center justify-center rounded-2xl bg-secondary-tint/40 px-4 py-6',
        className
      )}
    >
      <StemInner stem={stem} />
    </div>
  );
}

/** A dashed placeholder for the "?" / missing slot in a sequence or grid. */
function MissingSlot({size = 52}: {size?: number}) {
  return (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-xl border-2 border-dashed border-brand-blue/60 bg-card font-display font-extrabold text-brand-blue"
      style={{width: size, height: size, fontSize: size * 0.5}}
    >
      ?
    </span>
  );
}

function Row({items, size = 52}: {items: GlyphSpec[]; size?: number}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {items.map((g, i) => (
        <Glyph key={i} spec={g} size={size} />
      ))}
    </div>
  );
}

function StemInner({stem}: {stem: StemSpec}) {
  switch (stem.kind) {
    case 'single':
      return <Glyph spec={stem.item} size={92} />;

    case 'sequence':
      return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {stem.items.map((g, i) => (
            <Glyph key={i} spec={g} size={52} />
          ))}
          {stem.missing ? <MissingSlot /> : null}
        </div>
      );

    case 'count':
      return (
        <Row
          items={Array.from({length: stem.count}, () => stem.item)}
          size={48}
        />
      );

    case 'compare':
      return (
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            {Array.from({length: stem.leftCount}, (_, i) => (
              <Glyph key={i} spec={stem.item} size={40} />
            ))}
          </div>
          <span aria-hidden className="font-display text-2xl font-bold text-ink-soft">
            ·
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            {Array.from({length: stem.rightCount}, (_, i) => (
              <Glyph key={i} spec={stem.item} size={40} />
            ))}
          </div>
        </div>
      );

    case 'hole':
      return <StarHole />;

    case 'number':
      return (
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {stem.values.map((v, i) => (
            <span
              key={i}
              aria-hidden
              className="font-display text-5xl font-extrabold tracking-wide text-ink sm:text-6xl"
            >
              {v}
            </span>
          ))}
        </div>
      );

    case 'grid':
      return (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {stem.rows.flatMap((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="flex size-14 items-center justify-center rounded-xl bg-card ring-1 ring-border sm:size-16"
              >
                {cell === '?' ? (
                  <MissingSlot size={40} />
                ) : (
                  <Glyph spec={{glyph: 'dots', count: cell}} size={44} />
                )}
              </div>
            ))
          )}
        </div>
      );

    case 'scene':
      return (
        <div className="flex flex-wrap items-end justify-center gap-5 border-b-2 border-input/60 pb-2 sm:gap-7">
          {stem.items.map((g, i) => (
            <Glyph key={i} spec={g} size={60} />
          ))}
        </div>
      );

    case 'scene-birds':
      return <TreeWithBirds count={stem.count} />;

    default:
      return null;
  }
}

/** A star-shaped hole/cut-out (spatial "which shape fits the hole?"). */
function StarHole() {
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} aria-hidden focusable="false">
      <rect
        x={6}
        y={6}
        width={108}
        height={108}
        rx={18}
        style={{fill: 'var(--secondary-tint)', stroke: 'var(--input)', strokeWidth: 2}}
      />
      <path
        d="M60 22 L73 53 L106 56 L80 78 L88 110 L60 92 L32 110 L40 78 L14 56 L47 53 Z"
        style={{
          fill: 'var(--canvas)',
          stroke: 'var(--ink-soft)',
          strokeWidth: 2.5,
          strokeDasharray: '5 5',
          strokeLinejoin: 'round'
        }}
      />
    </svg>
  );
}

/** A simple tree carrying N birds to find/count. */
function TreeWithBirds({count}: {count: number}) {
  // Fixed, tidy perch positions; we render exactly `count` of them.
  const perches: Array<[number, number]> = [
    [40, 50],
    [92, 64],
    [58, 38],
    [108, 96],
    [30, 86]
  ];
  return (
    <svg viewBox="0 0 150 130" width={190} height={165} aria-hidden focusable="false">
      {/* trunk */}
      <rect x={66} y={78} width={16} height={40} rx={4} style={{fill: toy('orange')}} />
      {/* canopy */}
      <circle cx={74} cy={56} r={42} style={{fill: toy('green')}} />
      <circle cx={44} cy={66} r={26} style={{fill: toy('green')}} />
      <circle cx={104} cy={66} r={26} style={{fill: toy('green')}} />
      {perches.slice(0, count).map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <ellipse rx={9} ry={6} style={{fill: toy('blue'), stroke: 'var(--ink)', strokeWidth: 1.5}} />
          <circle cx={8} cy={-4} r={4.5} style={{fill: toy('blue'), stroke: 'var(--ink)', strokeWidth: 1.5}} />
          <path d="M12 -4 l5 1 l-5 2 z" style={{fill: toy('orange')}} />
          <path d="M-9 -2 l-7 -4 l3 7 z" style={{fill: toy('blue'), stroke: 'var(--ink)', strokeWidth: 1}} />
        </g>
      ))}
    </svg>
  );
}

function toy(name: string): string {
  return `var(--toy-${name})`;
}
