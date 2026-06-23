/**
 * Public surface of the deterministic report engine (spec Дел 9). Import from
 * `@/lib/report`. The headline entry point is {@link buildReport}: a
 * `CognitiveProfile` (from `@/lib/scoring/v2`) + a `ReportContext` → the
 * parent-facing `ReportContent` that 3.08 designs against and 3.09 / 3.10 render.
 *
 * Pure + isomorphic (no i18n runtime, no clock, no randomness) so it runs in the
 * client island, server-side PDF assembly, and Vitest alike. The localised module
 * library it assembles from lives in `@/content/report`.
 */
export * from './types';
export {buildReport} from './assemble';
export {
  activityIndices,
  growthVariant,
  learningBucket,
  stemBridgeVariant,
  LEARNING_THRESHOLDS
} from './select';
export {programForAge} from '@/content/report';
