/**
 * The six strengths — the single shared taxonomy for the whole product.
 *
 * Source of truth: Phase 1.04 content spec §1. Both the scoring library
 * (`src/lib/scoring/`, this phase) and the results screen (Phase 1.10) import
 * from here, so the codes, colours, and display names never drift apart.
 *
 * What each strength carries:
 *  - `code`   — the spec's exact code (never rename / merge / add a strength).
 *  - `token`  — the 1.03 design-foundation colour token base (§1 colour binding).
 *               The CSS custom properties are `--strength-<token>`,
 *               `--strength-<token>-tint`, `--strength-<token>-ink` (globals.css).
 *               Note: the spec code `words_obs` binds to the `verbal` colour token.
 *  - `name`   — the bilingual short display name (§1), used in headlines, the
 *               strength chip on the question screen, and the certificate.
 *  - `whatItIs` — the spec's one-line "what it is" (§1). English only: the spec
 *               provides this descriptor in English alone. The warm, bilingual
 *               *celebrated / growing* blurbs live in §6 and are parent/child
 *               result copy owned by Phase 1.10 (`src/content/results/`), not the
 *               taxonomy — so they are intentionally NOT duplicated here.
 */
import type {Localized} from './locale';

/** Strength codes, exactly per spec §1. The array order is documentation only —
 *  scoring defines its own deterministic tie-break order (see scoring/score.ts). */
export const STRENGTH_CODES = [
  'pattern',
  'logic',
  'memory',
  'spatial',
  'numeracy',
  'words_obs'
] as const;

export type StrengthCode = (typeof STRENGTH_CODES)[number];

/** The 1.03 colour-token base for a strength (globals.css `--strength-<token>`). */
export type StrengthToken =
  | 'pattern'
  | 'logic'
  | 'memory'
  | 'spatial'
  | 'numeracy'
  | 'verbal';

export interface Strength {
  readonly code: StrengthCode;
  readonly token: StrengthToken;
  readonly name: Localized;
  /** English-only one-line descriptor from spec §1 ("What it is"). */
  readonly whatItIs: string;
}

/** The six strengths, transcribed verbatim from spec §1. */
export const STRENGTHS: Readonly<Record<StrengthCode, Strength>> = {
  pattern: {
    code: 'pattern',
    token: 'pattern',
    name: {en: 'Pattern Spotting', mk: 'Откривање шаблони'},
    whatItIs: 'Spotting what repeats and predicting what comes next'
  },
  logic: {
    code: 'logic',
    token: 'logic',
    name: {en: 'Problem-Solving', mk: 'Решавање проблеми'},
    whatItIs: 'Connecting clues; sorting; simple step-by-step deduction'
  },
  memory: {
    code: 'memory',
    token: 'memory',
    name: {en: 'Memory', mk: 'Помнење'},
    whatItIs: 'Holding and recalling what was just seen'
  },
  spatial: {
    code: 'spatial',
    token: 'spatial',
    name: {en: 'Shapes & Space', mk: 'Форми и простор'},
    whatItIs: 'Shapes, rotation, fitting and picturing things in the mind'
  },
  numeracy: {
    code: 'numeracy',
    token: 'numeracy',
    name: {en: 'Numbers', mk: 'Броеви'},
    whatItIs: 'Counting, comparing, working with quantities and numbers'
  },
  words_obs: {
    code: 'words_obs',
    token: 'verbal',
    name: {en: 'Words & Observation', mk: 'Зборови и набљудување'},
    whatItIs: 'Careful looking (younger) + language/verbal reasoning (older)'
  }
};

/** Ordered list of all six strengths (codes in spec §1 order). */
export const STRENGTH_LIST: readonly Strength[] = STRENGTH_CODES.map(
  (code) => STRENGTHS[code]
);

/** Type guard for an arbitrary string being one of the six strength codes. */
export function isStrengthCode(value: string): value is StrengthCode {
  return (STRENGTH_CODES as readonly string[]).includes(value);
}

/** Convenience: the CSS custom-property names for a strength's colour set. */
export function strengthColorVars(code: StrengthCode): {
  solid: string;
  tint: string;
  ink: string;
} {
  const t = STRENGTHS[code].token;
  return {
    solid: `var(--strength-${t})`,
    tint: `var(--strength-${t}-tint)`,
    ink: `var(--strength-${t}-ink)`
  };
}
