/**
 * Glr — Associative learning (spec Прилог A.6): symbol↔symbol paired-associate,
 * recalled over MULTIPLE attempts. Score = recall accuracy + the learning slope
 * (later-attempt credit − earlier-attempt credit, computed by
 * `@/lib/scoring/v2/raw.ts` `learningSlope`, which groups by `meta.attempt`).
 *
 * ─── DESIGN EXCEPTION: per-rng learning block (intentional, documented) ───────
 * Every other generator is a PURE function of (level, format, rng-state): one
 * call → one self-contained item. Paired-associate learning cannot be: the SAME
 * learned pair set must be re-tested across several attempts for the slope to
 * mean anything, but the engine pulls Glr items ONE at a time via
 * `getItem(domain, level, format, rng)`, passing the SAME per-domain `rng`
 * instance to every call within a domain run (the level adapts between calls).
 *
 * Solution: a module-level `WeakMap<Rng, block>` keyed on the rng *instance*. The
 * first `generateGlr` call for a given rng generates the pair set (count derived
 * from `level`) and stores it with `attempt = 0`; each subsequent call for the
 * same rng increments `attempt` and re-tests the SAME stored pairs. This stays
 * fully deterministic and reproducible: `runSession` builds a FRESH per-domain
 * `rng` object per run, so each run's first Glr call regenerates the identical
 * pairs from the identical stream prefix → byte-identical items. The WeakMap
 * auto-GCs when the rng is collected. No engine or scoring change is needed
 * (`meta.attempt` already exists in `ItemScoringMeta`). The synthesis step should
 * log this as a decision: "Glr generator keeps a per-rng learning block via
 * WeakMap — a documented exception to the pure-function-of-inputs contract."
 *
 * ─── PROVISIONAL (flag for synthesis / review) ───────────────────────────────
 *  1. level→pairCount mapping (`pairsForLevel`): L1-2→4 … L9-10→8. Spec A.6 says
 *     "4–8 by age"; the exact level cut-points are our monotonic choice.
 *  2. ONE learning block recalled across however many Glr items the engine's cap
 *     yields. Spec A.6 says "2–3 attempts"; the engine's Glr cap is ~4–6. We use
 *     a single block recalled across ALL of them → richer slope data than 2–3.
 *  3. `correct` threshold of 0.5 (majority recalled drives the adaptive level
 *     step). Credit stays continuous (`correctCount / pairCount`).
 */
import {makeRng, shuffle, type Rng} from '@/lib/engine/prng';
import {GLYPHS, type Glyph} from './glyphs';
import type {Item, ItemFormat, ItemJudgment, Response} from '@/lib/engine/types';
import {itemId} from './shared';
import type {GlrPair, GlrPairedSpec} from './types';

/**
 * The per-rng learning block: the fixed learned pair set plus the running
 * 1-based attempt counter. Keyed on the rng INSTANCE (see header). WeakMap so a
 * collected rng frees its block automatically.
 */
const blocks = new WeakMap<Rng, {pairs: GlrPair[]; attempt: number}>();

/**
 * Pairs to learn at this level (PROVISIONAL #1). Monotonic non-decreasing:
 *   L1-2 → 4, L3-4 → 5, L5-6 → 6, L7-8 → 7, L9-10 → 8.
 */
export function pairsForLevel(level: number): number {
  if (level <= 2) return 4;
  if (level <= 4) return 5;
  if (level <= 6) return 6;
  if (level <= 8) return 7;
  return 8;
}

/**
 * Build a derangement: `count` distinct cue glyphs + `count` distinct target
 * glyphs where each cue maps to a DIFFERENT glyph than itself. Drawn from `rng`.
 * We shuffle the glyph vocabulary for cues, then keep shuffling a second copy
 * for targets until no position fixes (a derangement); GLYPHS has 10 entries and
 * count ≤ 8, so a derangement always exists and is found quickly + deterministically.
 */
function makePairs(rng: Rng, count: number): GlrPair[] {
  const cues = shuffle(rng, GLYPHS).slice(0, count) as Glyph[];
  let targets: Glyph[];
  do {
    targets = shuffle(rng, GLYPHS).slice(0, count) as Glyph[];
  } while (targets.some((t, i) => t === cues[i]));
  return cues.map((cue, i) => ({cue, target: targets[i]}));
}

/** Build the `match-pairs` judge: credit = fraction of trials recalled correctly. */
function pairsJudge(answer: Glyph[], pairCount: number) {
  return (response: Response): ItemJudgment => {
    if (response.omitted) return {correct: false, credit: 0};
    const chosen = response.answer as Glyph[];
    let correctCount = 0;
    for (let i = 0; i < pairCount; i++) {
      if (chosen?.[i] === answer[i]) correctCount += 1;
    }
    const credit = correctCount / pairCount;
    return {correct: credit >= 0.5, credit};
  };
}

/**
 * Generate one Glr recall item. The pair set is shared across calls that pass
 * the same `rng` instance (the learning block); each call is a fresh attempt.
 */
export function generateGlr(level: number, format: ItemFormat, rng: Rng): Item {
  let block = blocks.get(rng);
  if (!block) {
    block = {pairs: makePairs(rng, pairsForLevel(level)), attempt: 0};
    blocks.set(rng, block);
  }
  block.attempt += 1;

  const {pairs, attempt} = block;
  const pairCount = pairs.length;
  const id = itemId('glr.pairedAssociate', level, format, rng);

  // The full set of learned targets — the option pool for every trial.
  const targetPool = pairs.map((p) => p.target);

  // Per-attempt: present each pair once, in a per-attempt shuffled order; each
  // trial's options are the full target pool, shuffled independently.
  const order = shuffle(rng, pairs);
  const trials = order.map((pair) => ({
    cue: pair.cue,
    options: shuffle(rng, targetPool)
  }));
  const answer: Glyph[] = order.map((pair) => pair.target);

  const payload: GlrPairedSpec = {
    taskType: 'glr.pairedAssociate',
    pairs,
    attempt,
    trials,
    interaction: {mode: 'match-pairs', pairCount, optionCount: pairCount},
    solution: {answer}
  };

  return {
    id,
    domain: 'Glr',
    level,
    format,
    payload,
    meta: {attempt, optionCount: pairCount},
    judge: pairsJudge(answer, pairCount)
  };
}

/**
 * A stable, easy demonstrative Glr item for the 3.05 practice screen. A FRESH
 * rng each call → always attempt 1 with the same pairs (the rng is not reused,
 * so the WeakMap entry is private to this single call).
 */
export function practiceGlr(): Item {
  return generateGlr(1, 'standard', makeRng('practice::Glr'));
}
