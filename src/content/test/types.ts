/**
 * Content schema for the brain-games question banks.
 *
 * Follows the Phase 1.04 spec §4 recommended shape, extended (the spec invites
 * Code to own the final implementation) with a small, typed visual model so the
 * graphic stems and image options are *data* rather than per-question bespoke
 * JSX. This keeps the banks self-describing and lets the content-integrity tests
 * assert structure (counts, parity, one strength per question).
 *
 * Bands are keyed by the canonical `BandKey` from `src/lib/bands.ts` (`3-5` /
 * `6-9` / `10-13`) — the project's single source of truth. The spec's `band-a/
 * b/c` labels map 1:1 onto these and are NOT re-introduced here.
 */
import type {BandKey} from '@/lib/bands';
import type {Localized} from '@/content/locale';
import type {StrengthCode} from '@/content/strengths';

/** Eight compass directions used by arrow glyphs. */
export type Direction =
  | 'up'
  | 'right'
  | 'down'
  | 'left'
  | 'up-right'
  | 'up-left'
  | 'down-right'
  | 'down-left';

/** Recognisable, child-friendly puzzle colours (tokenised in globals.css as
 *  `--toy-*`). These are *content* colours (a "red circle" must read as red),
 *  kept as semantic keys so no literal hex appears in content or components. */
export type ToyColor =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'neutral';

/** Every atomic glyph the visual library can draw (see components/test/visuals). */
export type GlyphName =
  // recognisable objects
  | 'apple'
  | 'banana'
  | 'grapes'
  | 'cat'
  | 'dog'
  | 'rabbit'
  | 'bird'
  | 'fish'
  | 'duck'
  | 'plane'
  | 'butterfly'
  | 'car'
  | 'tree'
  | 'sun'
  | 'moon'
  | 'ball'
  | 'sock'
  | 'shoe'
  | 'balloon'
  | 'block'
  // basic geometric shapes
  | 'circle'
  | 'square'
  | 'triangle'
  | 'star'
  | 'heart'
  // abstract / puzzle figures
  | 'dots'
  | 'arrow'
  | 'wedge-circle'
  | 'wedge'
  | 'piece-square'
  | 'wedge-small'
  | 'rot-base'
  | 'rot-rotated'
  | 'rot-mirror'
  | 'rot-different'
  | 'cube-net'
  | 'cube';

/** A single drawable atom. */
export interface GlyphSpec {
  glyph: GlyphName;
  color?: ToyColor;
  /** Arrow direction (arrow glyph only). */
  dir?: Direction;
  /** Mirror horizontally (e.g. rotation distractors). */
  mirror?: boolean;
  /** Count for the `dots` glyph (a dot-group of N), and `cube` variant index. */
  count?: number;
  /** Variant selector for multi-form figures (e.g. `cube`). */
  variant?: string;
}

/**
 * The stem graphic shown above the question. Optional — text-only items (most of
 * the older bands) carry everything in `prompt` and have no stem.
 *
 * For memory items (`mechanic: 'reveal'`) the stem is the *stimulus*: shown for
 * `revealMs`, then hidden before the prompt + options appear (see spec §7).
 */
export type StemSpec =
  | {kind: 'single'; item: GlyphSpec}
  /** A left-to-right row; with `missing: true` a trailing "?" slot is drawn. */
  | {kind: 'sequence'; items: GlyphSpec[]; missing?: boolean}
  /** N copies of one glyph, to be counted. */
  | {kind: 'count'; item: GlyphSpec; count: number}
  /** Two groups side by side (e.g. 2 balloons vs 4 balloons). */
  | {kind: 'compare'; item: GlyphSpec; leftCount: number; rightCount: number}
  /** A shaped hole/cut-out (spatial "which fits" items). */
  | {kind: 'hole'; shape: 'star'}
  /** Big numerals/text (memory reveal of numbers). */
  | {kind: 'number'; values: string[]}
  /** A 3×3 grid of dot-counts; `'?'` marks the missing cell. */
  | {kind: 'grid'; rows: (number | '?')[][]}
  /** A small grouped scene of objects (observation items). */
  | {kind: 'scene'; items: GlyphSpec[]}
  /** A tree with N birds to find/count. */
  | {kind: 'scene-birds'; count: number};

export interface TestOption {
  /** 'a' | 'b' | 'c' | 'd'. */
  id: string;
  /** Visible text AND the accessible alt-text for image options. */
  label: Localized;
  /** Present for image options — one glyph, or a short row of glyphs. */
  glyphs?: GlyphSpec[];
}

export interface TestQuestion {
  /** Stable id, e.g. `a-q01` (maps to spec item A-Q01). */
  id: string;
  band: BandKey;
  /** The single strength this question feeds (spec: exactly one). */
  strength: StrengthCode;
  prompt: Localized;
  /** 2–4 options. */
  options: TestOption[];
  /** Option id of the single best answer. */
  correct: string;
  /** Optional stem graphic / stimulus. */
  stem?: StemSpec;
  /** Memory items only — show the stem, then hide it (spec §7). */
  mechanic?: 'reveal';
  /** Reveal duration hint in ms (default 3000; 4000 for multi-item sequences). */
  revealMs?: number;
  /** Coarse asset class, mirrors the spec's `asset` hint. */
  asset?: 'shapes' | 'icons' | 'scene' | 'text' | 'bibi-optional';
}

/** A complete band: its key plus the ordered question list. */
export interface BandContent {
  band: BandKey;
  questions: TestQuestion[];
}
