/**
 * Public surface of the v2 adaptive engine. Import from `@/lib/engine`.
 *
 * Input seam (implemented by 3.04): {@link Item}, {@link ItemProvider},
 * {@link Response}. Engine core: {@link runSession} / {@link createDomainController}.
 * The output `CognitiveProfile` (consumed by 3.05/3.07/3.09) lives in
 * `@/lib/scoring/v2`, which consumes the {@link SessionRun} this module emits.
 */
export * from './types';
export * from './prng';
export {
  ENGINE_VERSION,
  assertValidAge,
  startLevel,
  formatFor,
  createDomainController,
  runDomain,
  runSession,
  type SessionInput,
  type SessionRun,
  type DomainRun,
  type DomainRunItem,
  type DomainEnd,
  type DomainController,
  type Responder
} from './engine';
