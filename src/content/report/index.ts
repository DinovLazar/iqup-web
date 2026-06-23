/**
 * Public surface of the report module library (spec Дел 9.2 / Прилог C). Import
 * from `@/content/report`. Data only — the deterministic assembly lives in
 * `@/lib/report`. All MK copy is PROVISIONAL (native-MK review pending); EN is
 * the mirror with exact key parity.
 */
export * from './types';
export {BAND_WORDS, CONFIDENCE_WORDS} from './bands';
export {
  INDEX_COPY,
  NEXT_FRONTIER_GROWTH,
  GENTLE_FLOOR_GROWTH
} from './indices';
export {
  PROFILE_SHAPE_COPY,
  INDEX_PAIR_COPY,
  SOLVING_STYLE_COPY,
  LEARNING_SLOPE_COPY,
  EXTREMES_COPY
} from './narrative';
export {STEM_COPY} from './stem';
export {ACTIVITY_BANK} from './activities';
export {
  PROGRAMS,
  AGE_TO_PROGRAM,
  programForAge,
  IQUP_COPY
} from './iqup';
export {DISCLAIMER_COPY, VALIDITY_NOTES} from './disclaimer';
