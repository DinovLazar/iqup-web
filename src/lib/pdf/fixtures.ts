/**
 * Shared `CognitiveProfile` / `ReportContent` fixtures for the PDF + email tests
 * and the dev harnesses (`report:sample`, `test:report-email`).
 *
 * The profile factory mirrors `src/lib/report/report.test.ts` — a minimal but
 * fully-typed profile where only the band/confidence/feature inputs vary. NOT a
 * production path: this is fixture setup, so the report can be assembled without
 * running a whole session. Production recomputes the real profile via
 * `buildProfile(run)` (the 3.05/3.06 path).
 */
import type {Domain} from '@/lib/engine/types';
import type {Locale} from '@/content/locale';
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
import {buildReport, type ReportContent} from '@/lib/report';

export interface ProfileOpts {
  age?: number;
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

/** Build a minimal, fully-typed `CognitiveProfile` fixture. */
export function makeProfile(opts: ProfileOpts = {}): CognitiveProfile {
  const values = {...DEFAULT_VALUES, ...opts.values};

  const signals = {} as Record<Signal, SignalScore>;
  for (const s of SIGNALS) signals[s] = {signal: s, raw: 1, index: 50, nItems: 5};

  const indices = {} as Record<IndexId, IndexScore>;
  for (const id of INDICES) {
    indices[id] = {
      index: id,
      value: values[id],
      band: bandFor(values[id]),
      confidence: opts.confidence?.[id] ?? 'high'
    };
  }

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
      seed: 'fixture',
      seedInt: 12345,
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

/** A fixed generation instant so fixtures are byte-stable across runs. */
export const FIXTURE_GENERATED_AT = '2026-06-23T10:15:00.000Z';

/** Assemble a sample `ReportContent` for a locale + validity outcome. */
export function sampleReport(
  locale: Locale,
  opts: ProfileOpts = {},
  city = 'aerodrom'
): ReportContent {
  return buildReport(makeProfile(opts), {
    locale,
    city,
    generatedAt: FIXTURE_GENERATED_AT
  });
}
