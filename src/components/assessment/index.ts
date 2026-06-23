/**
 * Public surface of the live v2 assessment flow (Phase 3.05). Import from
 * `@/components/assessment`.
 *
 * `AssessmentFlow` is the client island the `/test` route mounts; `AssessmentCopy`
 * is the server-resolved copy contract it consumes. The persisted hand-off (the
 * `// HANDOFF (3.06)` seam) lives in `session.ts`.
 */
export {AssessmentFlow} from './AssessmentFlow';
export type {AssessmentCopy} from './copy';
export {
  ASSESSMENT_RESULT_STORAGE_KEY,
  readHandoff,
  type AssessmentHandoff
} from './session';
export type {IndexRegion} from './types';
export {INDEX_REGIONS, REGION_DOMAINS, DOMAIN_REGION} from './types';
