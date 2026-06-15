/**
 * Literal-hex mirror of the brand tokens in `src/app/globals.css`.
 *
 * The two render targets in this phase cannot resolve CSS custom properties:
 *  - the Satori certificate image (`next/og`) — satori has no access to globals.css;
 *  - the React Email template — email clients have no stylesheet, only inline hex.
 *
 * So both reference these constants instead of `var(--…)`. This is the same
 * documented exception the OG image routes already make (`opengraph-image.tsx`):
 * **keep these values in sync with `globals.css`.** No new colours are invented —
 * every value below is copied from the 1.03 brand foundation.
 */
import {STRENGTHS, type StrengthCode, type StrengthToken} from '@/content/strengths';

/** Brand surface / ink / accent tokens (from `globals.css` `:root`). */
export const BRAND = {
  white: '#ffffff',
  ink: '#241f36',
  inkSoft: '#5a5570',
  inkFaint: '#8a8499',
  canvas: '#fbf8f3',
  /** Certificate base — constant warm cream, never tinted (decision #63). */
  cream: '#FFFBF2',
  creamEdge: '#FDF4E2',
  border: '#ece8e1',
  input: '#dad5cc',
  hero: '#ffc83d',
  heroStrong: '#f4b000',
  heroTint: '#fff3d1',
  heroInk: '#2a2440',
  secondary: '#11689e',
  secondaryTint: '#e3f1fb',
  secondaryInk: '#0e5278',
  grape: '#7a5af0',
  coral: '#ff7a59'
} as const;

export interface StrengthHex {
  readonly solid: string;
  readonly tint: string;
  readonly ink: string;
}

/**
 * The per-strength colour triad, keyed by the 1.03 colour TOKEN (note `words_obs`
 * binds to the `verbal` token). Copied from `--strength-<token>{,-tint,-ink}`.
 */
export const STRENGTH_HEX: Readonly<Record<StrengthToken, StrengthHex>> = {
  pattern: {solid: '#5b5bd6', tint: '#ecebfb', ink: '#3a33ae'},
  logic: {solid: '#2e7dd1', tint: '#e4f0fb', ink: '#18558f'},
  memory: {solid: '#e05a8a', tint: '#fce7ef', ink: '#a8295c'},
  spatial: {solid: '#109b8e', tint: '#ddf3f0', ink: '#0a625a'},
  numeracy: {solid: '#e08a12', tint: '#fcefd6', ink: '#8a5206'},
  verbal: {solid: '#2e9e58', tint: '#e2f4e8', ink: '#1a6638'}
};

/** Resolve a strength CODE to its literal-hex triad (via its colour token). */
export function strengthHex(code: StrengthCode): StrengthHex {
  return STRENGTH_HEX[STRENGTHS[code].token];
}
