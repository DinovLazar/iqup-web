/**
 * The headline integration check (DoD): a full session driven through the
 * engine + the REAL item provider + v2 scoring reproduces a byte-identical
 * `SessionRun` + `CognitiveProfile` across two runs — proving the procedural
 * items plug into the 3.03 deterministic logic layer end-to-end.
 */
import {describe, expect, it} from 'vitest';
import {runSession, type Item, type Response, type SessionInput} from '@/lib/engine';
import {buildProfile} from '@/lib/scoring/v2';
import {createTaskItemProvider} from './provider';
import {correctAnswerFor, wrongAnswerFor} from './shared';

/**
 * A deterministic responder over REAL items: answers correctly while the item's
 * level is at/below `threshold`, else wrong — a realistic adaptive path that also
 * exercises ceilings. Pure function of the item (no randomness), so the whole
 * session is reproducible. Carries the telemetry the scoring/validity layers read.
 */
function adaptiveResponder(threshold: number) {
  return (item: Item): Response => {
    const correct = item.level <= threshold;
    const answer = correct ? correctAnswerFor(item) : wrongAnswerFor(item);
    const base: Response = {itemId: item.id, answer, responseTimeMs: 1400 + item.level * 30};
    // Gs reads tapped-cell count for the smearing flag; supply a faithful count.
    if (item.domain === 'Gs' && Array.isArray(answer)) {
      return {...base, tappedCells: (answer as unknown[]).length};
    }
    return base;
  };
}

function input(age: number, seed: number | string): SessionInput {
  return {age, seed, calibrationBaselineMs: 400};
}

/** Serialise a value, dropping function closures (judge) so only data compares. */
function ser(value: unknown): string {
  return JSON.stringify(value);
}

describe('end-to-end determinism (engine + real items + v2 scoring)', () => {
  it('reproduces a byte-identical SessionRun across two runs (fresh providers)', () => {
    const responder = adaptiveResponder(6);
    const runA = runSession(input(9, 'child-seed-1'), createTaskItemProvider(), responder);
    const runB = runSession(input(9, 'child-seed-1'), createTaskItemProvider(), responder);
    expect(ser(runA)).toBe(ser(runB));
  });

  it('reproduces a byte-identical CognitiveProfile across two runs', () => {
    const responder = adaptiveResponder(6);
    const profA = buildProfile(runSession(input(9, 'child-seed-1'), createTaskItemProvider(), responder));
    const profB = buildProfile(runSession(input(9, 'child-seed-1'), createTaskItemProvider(), responder));
    expect(ser(profA)).toBe(ser(profB));
  });

  it('produces a well-formed profile (8 signals, 5 indices) from real items', () => {
    const prof = buildProfile(
      runSession(input(11, 'child-seed-2'), createTaskItemProvider(), adaptiveResponder(8))
    );
    expect(Object.keys(prof.signals)).toHaveLength(8);
    expect(Object.keys(prof.indices)).toHaveLength(5);
    for (const idx of Object.values(prof.indices)) {
      expect(idx.value).toBeGreaterThanOrEqual(0);
      expect(idx.value).toBeLessThanOrEqual(100);
      expect(['exceptional', 'strong', 'solid', 'developing']).toContain(idx.band);
      expect(['high', 'medium', 'low']).toContain(idx.confidence);
    }
  });

  it('different seeds → different sessions (procedural variety on retest)', () => {
    const responder = adaptiveResponder(6);
    const a = ser(runSession(input(9, 'seed-A'), createTaskItemProvider(), responder));
    const b = ser(runSession(input(9, 'seed-B'), createTaskItemProvider(), responder));
    expect(a).not.toBe(b);
  });

  it('honors Gsm format by age: forward-only under 8, forward+backward from 8', () => {
    const young = runSession(input(6, 's'), createTaskItemProvider(), adaptiveResponder(6));
    const older = runSession(input(10, 's'), createTaskItemProvider(), adaptiveResponder(6));
    const youngDirs = new Set(young.domains.Gsm.items.map((i) => i.item.format));
    const olderDirs = new Set(older.domains.Gsm.items.map((i) => i.item.format));
    expect(youngDirs.has('backward')).toBe(false);
    expect(olderDirs.has('backward')).toBe(true);
  });

  it('derives a Glr learning slope from the multi-attempt block', () => {
    // A child who improves: wrong early, correct later → positive slope possible.
    const prof = buildProfile(
      runSession(input(9, 'glr-seed'), createTaskItemProvider(), adaptiveResponder(8))
    );
    expect(typeof prof.features.learningSlope).toBe('number');
    // Glr items all share one learned set → attempts are tagged 1..n.
    const run = runSession(input(9, 'glr-seed'), createTaskItemProvider(), adaptiveResponder(8));
    const attempts = run.domains.Glr.items.map((i) => i.item.meta?.attempt);
    expect(attempts.every((a) => typeof a === 'number')).toBe(true);
    expect(new Set(attempts).size).toBeGreaterThan(1);
  });
});
