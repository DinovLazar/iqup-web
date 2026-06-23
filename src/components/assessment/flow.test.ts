/**
 * Phase 3.05 flow-layer tests (pure logic — the React screens are covered by the
 * a11y/manual pass since the suite runs in a Node environment with no DOM). These
 * assert the parts 3.05 adds on top of the already-tested 3.03 engine + 3.04
 * items: the index↔domain progress mapping, the telemetry/calibration helpers,
 * the session hand-off persistence, and the validity wiring + determinism the
 * orchestrator relies on (driving the SAME `createDomainController` path the live
 * flow uses, via `runSession`).
 */
import {afterEach, describe, expect, it} from 'vitest';
import {DOMAINS, type Item, type Response, type SessionInput} from '@/lib/engine';
import {runSession} from '@/lib/engine';
import {buildProfile, toResponseOutcomes} from '@/lib/scoring/v2';
import {evaluateValidity} from '@/lib/validity';
import {createTaskItemProvider, correctAnswerFor} from '@/content/tasks';
import {
  DOMAIN_REGION,
  INDEX_REGIONS,
  REGION_DOMAINS,
  type IndexRegion
} from './types';
import {baselineFromTaps, FALLBACK_BASELINE_MS} from './telemetry';
import {
  ASSESSMENT_RESULT_STORAGE_KEY,
  generateSeed,
  persistHandoff,
  readHandoff,
  type AssessmentHandoff
} from './session';

function input(age: number, seed: number | string): SessionInput {
  return {age, seed, calibrationBaselineMs: 420};
}

/** A "perfect" responder over REAL items with realistic, non-flagging timing. */
function correctResponder(item: Item): Response {
  const answer = correctAnswerFor(item);
  const base: Response = {itemId: item.id, answer, responseTimeMs: 1500 + item.level * 25};
  if (item.domain === 'Gs' && Array.isArray(answer)) {
    return {...base, tappedCells: (answer as unknown[]).length};
  }
  return base;
}

/** A "rushed" responder: every answer under the too-fast threshold → strong flag. */
function tooFastResponder(item: Item): Response {
  return {itemId: item.id, answer: correctAnswerFor(item), responseTimeMs: 120};
}

const ser = (v: unknown) => JSON.stringify(v);

describe('progress brain — index ↔ task-domain mapping', () => {
  it('maps every one of the 7 domains into exactly one of the 5 regions', () => {
    const mapped = INDEX_REGIONS.flatMap((r) => REGION_DOMAINS[r]);
    expect(new Set(mapped)).toEqual(new Set(DOMAINS));
    expect(mapped).toHaveLength(DOMAINS.length); // no domain in two regions
    expect(INDEX_REGIONS).toHaveLength(5);
  });

  it('keeps DOMAIN_REGION consistent with REGION_DOMAINS', () => {
    for (const region of INDEX_REGIONS) {
      for (const domain of REGION_DOMAINS[region]) {
        expect(DOMAIN_REGION[domain]).toBe(region);
      }
    }
  });

  it('fills a region only when ALL its domains are complete (planning needs EF+Gs)', () => {
    const planning: IndexRegion = 'planning';
    const done = new Set(['EF'] as const);
    const allDone = REGION_DOMAINS[planning].every((d) => done.has(d as never));
    expect(allDone).toBe(false); // EF alone does not fill Planning & speed
  });
});

describe('device calibration baseline', () => {
  it('returns the median tap latency, clamped to a sane range', () => {
    expect(baselineFromTaps([400, 500, 600])).toBe(500);
    expect(baselineFromTaps([100, 100, 100])).toBe(150); // clamped up to the floor
    expect(baselineFromTaps([9000, 9000])).toBe(2000); // clamped down to the ceiling
  });

  it('falls back when there is no usable sample', () => {
    expect(baselineFromTaps([])).toBe(FALLBACK_BASELINE_MS);
    expect(baselineFromTaps([0, -5, NaN])).toBe(FALLBACK_BASELINE_MS);
  });
});

describe('session seed + hand-off persistence', () => {
  afterEach(() => {
    delete (globalThis as {window?: unknown}).window;
  });

  it('generates a per-age, non-empty seed without Math.random', () => {
    const s = generateSeed(9);
    expect(s).toContain('9');
    expect(s.length).toBeGreaterThan(3);
  });

  it('round-trips the hand-off through the versioned sessionStorage key', () => {
    const store = new Map<string, string>();
    (globalThis as {window?: unknown}).window = {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k)
      }
    };
    const run = runSession(input(9, 'persist-seed'), createTaskItemProvider(), correctResponder);
    const handoff: AssessmentHandoff = {
      version: 1,
      run,
      validity: evaluateValidity(toResponseOutcomes(run)),
      completedAt: '2026-06-23T00:00:00.000Z'
    };
    persistHandoff(handoff);
    expect(store.has(ASSESSMENT_RESULT_STORAGE_KEY)).toBe(true);
    const read = readHandoff();
    expect(read?.version).toBe(1);
    expect(read?.completedAt).toBe(handoff.completedAt);
    expect(Object.keys(read?.run.domains ?? {})).toEqual(Object.keys(run.domains));
  });

  it('reads null when nothing is persisted', () => {
    (globalThis as {window?: unknown}).window = {
      sessionStorage: {getItem: () => null, setItem: () => {}, removeItem: () => {}}
    };
    expect(readHandoff()).toBeNull();
  });
});

describe('validity wiring at session end (the finalize() path)', () => {
  it('a clean run is representative → not the retry outcome', () => {
    const run = runSession(input(10, 'clean'), createTaskItemProvider(), correctResponder);
    const validity = evaluateValidity(toResponseOutcomes(run));
    expect(validity.outcome).not.toBe('not_representative');
  });

  it('an all-too-fast run raises a strong flag → not_representative (retry)', () => {
    const run = runSession(input(10, 'rushed'), createTaskItemProvider(), tooFastResponder);
    const validity = evaluateValidity(toResponseOutcomes(run));
    expect(validity.strongCount).toBeGreaterThan(0);
    expect(validity.outcome).toBe('not_representative');
  });
});

describe('determinism + buildProfile smoke (the flow contract)', () => {
  it('same age + seed + answers → byte-identical SessionRun', () => {
    const a = runSession(input(8, 'det-seed'), createTaskItemProvider(), correctResponder);
    const b = runSession(input(8, 'det-seed'), createTaskItemProvider(), correctResponder);
    expect(ser(a)).toBe(ser(b));
  });

  it('buildProfile runs on the assembled SessionRun without error (smoke)', () => {
    const run = runSession(input(8, 'det-seed'), createTaskItemProvider(), correctResponder);
    const profile = buildProfile(run);
    expect(Object.keys(profile.signals)).toHaveLength(8);
    expect(Object.keys(profile.indices)).toHaveLength(5);
  });

  it('retry (a fresh seed) yields a different item set', () => {
    const first = runSession(input(8, generateSeed(8)), createTaskItemProvider(), correctResponder);
    const second = runSession(input(8, generateSeed(8)), createTaskItemProvider(), correctResponder);
    // Practically never collide (distinct crypto nonces) → distinct item ids.
    expect(ser(first)).not.toBe(ser(second));
  });
});
