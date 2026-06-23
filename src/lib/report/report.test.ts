import {describe, expect, it} from 'vitest';

import {BAND_WORDS, CONFIDENCE_WORDS} from '@/content/report';
import type {Domain} from '@/lib/engine/types';
import {
  INDICES,
  SIGNALS,
  bandFor,
  type CognitiveProfile,
  type Confidence,
  type DerivedFeatures,
  type IndexId,
  type IndexPair,
  type IndexScore,
  type Signal,
  type SignalScore,
  type SolvingStyle
} from '@/lib/scoring/v2';
import type {ValidityOutcome} from '@/lib/validity';
import {programForAge} from '@/content/report';
import {buildReport} from './assemble';
import type {ReportContent, ReportContext} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// A minimal but fully-typed CognitiveProfile fixture. buildReport reads only the
// session metadata, the per-index band/confidence, and features — those are what
// we vary; the rest is filled with inert, valid data.
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileOpts {
  age?: number;
  seedInt?: number;
  values?: Partial<Record<IndexId, number>>;
  confidence?: Partial<Record<IndexId, Confidence>>;
  solvingStyle?: SolvingStyle;
  learningSlope?: number;
  ceilingDomains?: Domain[];
  floorDomains?: Domain[];
  validity?: ValidityOutcome;
}

const DEFAULT_VALUES: Record<IndexId, number> = {
  logical: 72,
  spatial: 66,
  memory_focus: 58,
  planning_speed: 50,
  learning_stem: 61
};

function makeProfile(opts: ProfileOpts = {}): CognitiveProfile {
  const values = {...DEFAULT_VALUES, ...opts.values};

  const signals = {} as Record<Signal, SignalScore>;
  for (const s of SIGNALS) {
    signals[s] = {signal: s, raw: 1, index: 50, nItems: 5};
  }

  const indices = {} as Record<IndexId, IndexScore>;
  for (const id of INDICES) {
    indices[id] = {
      index: id,
      value: values[id],
      band: bandFor(values[id]),
      confidence: opts.confidence?.[id] ?? 'high'
    };
  }

  // Derive highest/lowest + strong pairs from the values (mirrors the upstream
  // feature logic — this is fixture setup, not production recomputation).
  const sorted = [...INDICES].sort((a, b) => values[b] - values[a]);
  const strongPairs: IndexPair[] = [];
  for (let i = 0; i < INDICES.length; i++) {
    for (let j = i + 1; j < INDICES.length; j++) {
      const a = INDICES[i];
      const b = INDICES[j];
      if (values[a] >= 64 && values[b] >= 64) {
        strongPairs.push({a, b, delta: Math.abs(values[a] - values[b])});
      }
    }
  }
  const vlist = INDICES.map((i) => values[i]);

  const features: DerivedFeatures = {
    profileShape: Math.max(...vlist) - Math.min(...vlist) >= 20 ? 'spiky' : 'flat',
    indexSpread: Math.max(...vlist) - Math.min(...vlist),
    highestIndex: sorted[0],
    lowestIndex: sorted[sorted.length - 1],
    strongPairs,
    gapPairs: [],
    solvingStyle: opts.solvingStyle ?? 'balanced',
    memoryAsymmetry: null,
    learningSlope: opts.learningSlope ?? 0.1,
    ceilingDomains: opts.ceilingDomains ?? [],
    floorDomains: opts.floorDomains ?? []
  };

  const outcome = opts.validity ?? 'valid';
  return {
    version: 2,
    session: {
      age: opts.age ?? 9,
      seed: 'test',
      seedInt: opts.seedInt ?? 12345,
      calibrationBaselineMs: 400,
      engineVersion: 'engine-test',
      scoringVersion: 'scoring-test',
      normsVersion: 'seed-2026-06-PROVISIONAL'
    },
    signals,
    indices,
    features,
    validity: {
      outcome,
      flags: [],
      mildCount: outcome === 'gentle_note' ? 1 : 0,
      strongCount: outcome === 'not_representative' ? 1 : 0,
      chanceLevelDomains: []
    }
  };
}

const CTX: ReportContext = {locale: 'en', city: 'aerodrom', generatedAt: '2026-06-23T10:15:00.000Z'};

/** Gather every PARENT-FACING prose string from an assembled report. */
function collectProse(r: ReportContent): string[] {
  const out: string[] = [];
  for (const i of r.indices) out.push(i.name, i.bandLabel, i.confidenceLabel, i.confidenceNote);
  out.push(r.overview.shape, ...r.overview.pairs);
  out.push(r.topStrength.name, r.topStrength.bandLabel, r.topStrength.body);
  out.push(r.growthArea.name, r.growthArea.body, r.growthArea.activity);
  for (const a of r.homeActivities) out.push(a.title, a.body);
  out.push(r.solvingStyle.body, r.solvingStyle.learning);
  out.push(r.stemReadiness.body, r.stemReadiness.bridge);
  if (r.extremes.ceiling) out.push(r.extremes.ceiling);
  if (r.extremes.floor) out.push(r.extremes.floor);
  out.push(r.iqup.positioning, r.iqup.programFit, r.iqup.programName, r.iqup.demoCta);
  out.push(r.disclaimer.body, r.disclaimer.provisional);
  if (r.meta.validity.note) out.push(r.meta.validity.note);
  return out.filter((s) => s.length > 0);
}

const FORBIDDEN_EN =
  /\b(scores?|iq|ranked|ranking|rank|percent|percentile|points?|grades?|weak|weaker|weakness|fail|failed|failure|below\s+average|deficits?)\b/i;
const FORBIDDEN_MK = /(оценк|слаб|коефициент|процент|ранг|неуспе|поен|просек)/i;

describe('buildReport — determinism', () => {
  it('produces byte-identical output for the same profile + context', () => {
    const p = makeProfile({seedInt: 99});
    const a = JSON.stringify(buildReport(p, CTX));
    const b = JSON.stringify(buildReport(p, CTX));
    expect(a).toBe(b);
  });

  it('day-levels the generated date and never reads the clock', () => {
    const r = buildReport(makeProfile(), CTX);
    expect(r.meta.generatedDate).toBe('2026-06-23');
    // No generatedAt → no date (the caller owns the instant).
    const r2 = buildReport(makeProfile(), {locale: 'en', city: 'aerodrom'});
    expect(r2.meta.generatedDate).toBeNull();
  });
});

describe('buildReport — honest framing (no numbers, approved words only)', () => {
  const bandWords = new Set(
    Object.values(BAND_WORDS).flatMap((l) => [l.mk, l.en])
  );
  const confWords = new Set(
    Object.values(CONFIDENCE_WORDS).flatMap((c) => [c.word.mk, c.word.en])
  );

  for (const locale of ['mk', 'en'] as const) {
    it(`assembled prose carries no forbidden tokens (${locale})`, () => {
      const r = buildReport(makeProfile({validity: 'gentle_note'}), {...CTX, locale});
      const prose = collectProse(r);
      expect(prose.length).toBeGreaterThan(20); // non-vacuous
      for (const s of prose) {
        expect(/\d/.test(s), `digit in: "${s}"`).toBe(false);
        expect(s.includes('%'), `percent in: "${s}"`).toBe(false);
        expect(FORBIDDEN_EN.test(s), `forbidden EN: "${s}"`).toBe(false);
        expect(FORBIDDEN_MK.test(s), `forbidden MK: "${s}"`).toBe(false);
      }
    });
  }

  it('band + confidence labels are only the approved words', () => {
    const r = buildReport(makeProfile(), CTX);
    for (const idx of r.indices) {
      expect(bandWords.has(idx.bandLabel), `band word: ${idx.bandLabel}`).toBe(true);
      expect(confWords.has(idx.confidenceLabel), `conf word: ${idx.confidenceLabel}`).toBe(true);
    }
    expect(bandWords.has(r.topStrength.bandLabel)).toBe(true);
  });

  it('has no child-name slot and leaves no placeholder unfilled', () => {
    const r = buildReport(makeProfile({values: {logical: 88, spatial: 85, memory_focus: 84, planning_speed: 82, learning_stem: 80}}), CTX);
    for (const s of collectProse(r)) {
      expect(s.includes('{'), `unfilled slot in: "${s}"`).toBe(false);
    }
  });
});

describe('buildReport — selection + edge cases', () => {
  it('picks the strongest index as the top strength and the weakest as growth', () => {
    const r = buildReport(
      makeProfile({values: {logical: 40, spatial: 90, memory_focus: 55, planning_speed: 48, learning_stem: 60}}),
      CTX
    );
    expect(r.topStrength.index).toBe('spatial');
    expect(r.growthArea.index).toBe('logical');
    expect(r.growthArea.variant).toBe('standard');
    expect(r.growthArea.activity.length).toBeGreaterThan(0);
  });

  it('frames the all-strong case as a next frontier, not a deficit', () => {
    const r = buildReport(
      makeProfile({values: {logical: 85, spatial: 84, memory_focus: 88, planning_speed: 82, learning_stem: 90}}),
      CTX
    );
    expect(r.growthArea.variant).toBe('all_strong');
    expect(r.growthArea.body).toContain(r.growthArea.name);
  });

  it('frames the all-floor case gently with no activity pressure', () => {
    const r = buildReport(
      makeProfile({values: {logical: 30, spatial: 28, memory_focus: 35, planning_speed: 33, learning_stem: 31}}),
      CTX
    );
    expect(r.growthArea.variant).toBe('all_floor');
    expect(r.growthArea.activity).toBe('');
  });

  it('surfaces ceiling and floor extremes only when present', () => {
    const none = buildReport(makeProfile(), CTX);
    expect(none.extremes.ceiling).toBeNull();
    expect(none.extremes.floor).toBeNull();
    const both = buildReport(makeProfile({ceilingDomains: ['Gf'], floorDomains: ['Gs']}), CTX);
    expect(both.extremes.ceiling).not.toBeNull();
    expect(both.extremes.floor).not.toBeNull();
  });

  it('draws 2–3 home activities matching the chosen indices', () => {
    const r = buildReport(makeProfile(), CTX);
    expect(r.homeActivities.length).toBeGreaterThanOrEqual(2);
    expect(r.homeActivities.length).toBeLessThanOrEqual(3);
  });
});

describe('buildReport — validity handling', () => {
  it('valid → no note, not caveated', () => {
    const r = buildReport(makeProfile({validity: 'valid'}), CTX);
    expect(r.meta.validity.note).toBeNull();
    expect(r.meta.validity.caveated).toBe(false);
  });
  it('gentle_note → a soft note, not caveated', () => {
    const r = buildReport(makeProfile({validity: 'gentle_note'}), CTX);
    expect(r.meta.validity.note).not.toBeNull();
    expect(r.meta.validity.caveated).toBe(false);
  });
  it('not_representative → a strong caveat, caveated variant', () => {
    const r = buildReport(makeProfile({validity: 'not_representative'}), CTX);
    expect(r.meta.validity.note).not.toBeNull();
    expect(r.meta.validity.caveated).toBe(true);
  });
});

describe('buildReport — CTA + program fit', () => {
  it('maps every exact age 5–13 to exactly one program and carries the city', () => {
    for (let age = 5; age <= 13; age++) {
      const r = buildReport(makeProfile({age}), {...CTX, city: 'veles'});
      expect(r.iqup.programId).toBe(programForAge(age));
      expect(r.iqup.programName.length).toBeGreaterThan(0);
      expect(r.iqup.programFit).toContain(r.iqup.programName);
      expect(r.iqup.city).toBe('veles');
    }
  });
});

describe('buildReport — personalization diversity', () => {
  it('two children rarely get the same report', () => {
    const styles: SolvingStyle[] = ['reflective_accurate', 'fast_accurate', 'fast_errors', 'balanced'];
    const vectors: Array<Partial<Record<IndexId, number>>> = [
      {logical: 90, spatial: 50, memory_focus: 60, planning_speed: 55, learning_stem: 70},
      {logical: 50, spatial: 88, memory_focus: 47, planning_speed: 66, learning_stem: 72},
      {logical: 60, spatial: 62, memory_focus: 85, planning_speed: 58, learning_stem: 49},
      {logical: 55, spatial: 52, memory_focus: 50, planning_speed: 84, learning_stem: 60},
      {logical: 66, spatial: 70, memory_focus: 58, planning_speed: 62, learning_stem: 88},
      {logical: 46, spatial: 48, memory_focus: 51, planning_speed: 49, learning_stem: 47}
    ];
    const reports = new Set<string>();
    let n = 0;
    vectors.forEach((values, vi) => {
      styles.forEach((solvingStyle, si) => {
        const age = 5 + ((vi + si) % 9);
        const r = buildReport(
          makeProfile({values, solvingStyle, age, seedInt: vi * 7 + si * 13 + 1}),
          CTX
        );
        reports.add(JSON.stringify(r));
        n += 1;
      });
    });
    // The assembled text is highly personalised — expect near-total uniqueness.
    expect(reports.size).toBeGreaterThanOrEqual(Math.floor(n * 0.9));
  });
});
