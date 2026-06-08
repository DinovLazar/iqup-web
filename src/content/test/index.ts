/**
 * Question-bank registry — the one place the runner and tests read content from.
 *
 * Banks are keyed by the canonical `BandKey` (`src/lib/bands.ts`). The runner
 * resolves the band from the child's age and asks here for that band's questions.
 */
import type {BandKey} from '@/lib/bands';
import {BAND_KEYS} from '@/lib/bands';
import type {BandContent, TestQuestion} from './types';
import {BAND_3_5} from './band-3-5';
import {BAND_6_9} from './band-6-9';
import {BAND_10_13} from './band-10-13';

/** Every band's content, keyed by canonical band key. */
export const TEST_CONTENT: Readonly<Record<BandKey, BandContent>> = {
  '3-5': BAND_3_5,
  '6-9': BAND_6_9,
  '10-13': BAND_10_13
};

/** The ordered question list for a band. */
export function getQuestionsForBand(band: BandKey): TestQuestion[] {
  return TEST_CONTENT[band].questions;
}

/** Every question across all bands (used by the content-integrity tests). */
export const ALL_QUESTIONS: readonly TestQuestion[] = BAND_KEYS.flatMap(
  (band) => TEST_CONTENT[band].questions
);

export type {BandContent, TestQuestion} from './types';
