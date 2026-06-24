/**
 * Literal-hex mirror of the v2 semantic token layer in `src/app/globals.css`
 * (the `--ix-*` / `--band-*` / `--action*` / `--ink-*` ramps added in 3.09).
 *
 * `@react-pdf/renderer` cannot resolve `var(--…)` — its renderer takes concrete
 * colours — so the PDF references THESE constants instead. This is the same
 * documented exception `src/lib/email/brand.ts` already makes for the email
 * template and the OG image: **no new colours are invented here; keep every
 * value in sync with `globals.css`.** The on-screen results screen (3.09) reads
 * the same hues via the CSS vars, so the PDF and the screen stay one palette.
 */
import type {IndexId} from '@/lib/scoring/v2';
import {INDEX_META} from '@/components/report/index-meta';

/** The locked hue slug used by `index-meta` → the `--ix-${hue}` ramp. */
export type HueSlug = 'logic' | 'spatial' | 'memory' | 'planning' | 'learning';

/** One index hue ramp: the solid fill + its tint surface + its darkened ink. */
export interface HueRamp {
  readonly solid: string;
  readonly soft: string;
  readonly tint: string;
  readonly ink: string;
}

/** The five index hue ramps — copied verbatim from `globals.css` `--ix-*`. */
export const HUE: Readonly<Record<HueSlug, HueRamp>> = {
  logic: {solid: '#ec008c', soft: '#f47cc2', tint: '#fbddef', ink: '#a8005e'},
  spatial: {solid: '#00b6f1', soft: '#74d2f7', tint: '#daf1fc', ink: '#0a6a8c'},
  memory: {solid: '#00b9ad', soft: '#6fd3cc', tint: '#d9f3f0', ink: '#07655e'},
  planning: {solid: '#f7941d', soft: '#fbc07a', tint: '#fdebd3', ink: '#97550a'},
  learning: {solid: '#ffc20e', soft: '#ffdd78', tint: '#fff2cc', ink: '#806100'}
};

/** Resolve an `IndexId` to its hue ramp (via the locked `index-meta` hue slug). */
export function hueFor(id: IndexId): HueRamp {
  return HUE[INDEX_META[id].hue];
}

/** Ink, surface, line, and the violet action ramp — copied from `globals.css`. */
export const TOKENS = {
  // ink levels
  ink: '#241f36',
  inkSoft: '#5a5570',
  inkFaint: '#8a8499',
  inkHead: '#3b4757',
  inkMuted: '#5a6675',
  neutral: '#999999',

  // the violet action ramp (CTA + accents)
  action: '#762d90',
  actionHover: '#5e2274',
  actionTint: '#efe4f4',
  actionInk: '#5e2274',
  actionSoft: '#b98fcb',

  // surfaces + lines
  white: '#ffffff',
  surface2: '#fafcfc',
  band1: '#f0f8fb',
  band2: '#eaf5f7',
  field: '#f6f4f0',
  line: '#eceff2',
  lineStrong: '#d8dee4'
} as const;
