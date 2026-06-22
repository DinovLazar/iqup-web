/**
 * `TaskItemProvider` — the production item source (spec Дел 4 + Прилог A).
 *
 * Implements the engine's `ItemProvider` over the seven procedural generators, so
 * `createDomainController` (3.03) can pull a real item by `(domain, level,
 * format, rng)`. This is what 3.05 injects into the engine in place of the
 * `fixtures.ts` stubs. Adds `getPracticeItem(domain)` for the pre-task practice
 * screen (3.05).
 *
 * Per-domain + per-item stream independence is already provided by the engine:
 * `createDomainController` derives an independent `rng` per `(seed, domain)` via
 * `deriveSeed` and threads it into every `getItem` call, and each generator draws
 * a unique id tag from that stream. The provider therefore stays a thin,
 * stateless dispatcher (the one documented exception — Glr's multi-attempt
 * learning block — is memoized inside `glr.ts` by the per-domain `rng` identity,
 * so it is reproducible without per-provider state).
 */
import type {Domain, Item, ItemFormat, ItemProvider} from '@/lib/engine/types';
import type {Rng} from '@/lib/engine/prng';
import {generateGf, practiceGf} from './gf';
import {generateGv, practiceGv} from './gv';
import {generateGsm, practiceGsm} from './gsm';
import {generateGs, practiceGs} from './gs';
import {generateEf, practiceEf} from './ef';
import {generateGlr, practiceGlr} from './glr';
import {generateCt, practiceCt} from './ct';

/** The engine's `ItemProvider` plus the practice-item capability 3.05 uses. */
export interface TaskItemProvider extends ItemProvider {
  /** A stable, easy, demonstrative item for the pre-task practice screen. */
  getPracticeItem(domain: Domain): Item;
}

/** One generator per generated domain. (Attention is derived — no generator.) */
const GENERATORS: Record<Domain, (level: number, format: ItemFormat, rng: Rng) => Item> = {
  Gf: generateGf,
  Gv: generateGv,
  Gsm: generateGsm,
  Gs: generateGs,
  EF: generateEf,
  Glr: generateGlr,
  CT: generateCt
};

/** One practice item per generated domain. */
const PRACTICE: Record<Domain, () => Item> = {
  Gf: practiceGf,
  Gv: practiceGv,
  Gsm: practiceGsm,
  Gs: practiceGs,
  EF: practiceEf,
  Glr: practiceGlr,
  CT: practiceCt
};

/**
 * Build the production item provider. A fresh provider has no mutable state of
 * its own; determinism is carried by the engine's per-domain `rng`. Construct one
 * per session (or reuse — both are deterministic).
 */
export function createTaskItemProvider(): TaskItemProvider {
  return {
    getItem(domain: Domain, level: number, format: ItemFormat, rng: Rng): Item {
      return GENERATORS[domain](level, format, rng);
    },
    getPracticeItem(domain: Domain): Item {
      return PRACTICE[domain]();
    }
  };
}
