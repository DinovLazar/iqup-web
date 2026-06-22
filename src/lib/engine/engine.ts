/**
 * The adaptive engine (spec Дел 5) — deterministic, no AI.
 *
 * Per domain: start at an age-keyed level, raise the level on a correct answer
 * and lower it on an error (basal/ceiling, WISC-style), and end the domain at
 * its ceiling (two consecutive errors) or its per-domain item cap. Item *format*
 * is chosen by age cluster (e.g. Gsm forward-only under 8, forward+backward from
 * 8); the engine selects the format, the item-provider supplies the matching
 * item.
 *
 * Determinism: each domain draws from an INDEPENDENT, reproducible PRNG stream
 * derived from `(seed, domain)`, so the same (age, seed, response-sequence)
 * yields a byte-identical path — and the order in which domains run never
 * perturbs another domain's stream.
 *
 * The engine is exposed two ways:
 *   • {@link createDomainController} — a stateful, step-by-step controller the
 *     live UI (3.05) drives one response at a time;
 *   • {@link runDomain} / {@link runSession} — pure drivers that feed the
 *     controller from a `Responder`, used by the determinism + golden tests.
 */
import {
  CEILING_CONSECUTIVE_ERRORS,
  MAX_AGE,
  MIN_AGE,
  START_LEVEL_BY_AGE,
  maxItemsFor
} from '@/content/norms';
import {deriveSeed, makeRng} from './prng';
import {
  ageCluster,
  DOMAINS,
  MAX_LEVEL,
  MIN_LEVEL,
  type Domain,
  type Item,
  type ItemFormat,
  type ItemJudgment,
  type ItemProvider,
  type Response
} from './types';

/** Bump when the engine's selection/stop logic changes (spec 19.4). */
export const ENGINE_VERSION = 'v2-engine-0.1.0';

/** Session parameters — a session is fully defined by (age, seed). */
export interface SessionInput {
  /** Exact age 5–13 (per-year, not a broad band). */
  age: number;
  /** Numeric or string seed; the same seed reproduces the session exactly. */
  seed: number | string;
  /**
   * Device tap-speed baseline (ms) measured by the first practice task in the
   * live flow (spec 7.2). Consumed by timing-dependent scoring so the same
   * answers score equivalently on a slow phone and a fast laptop. The CAPTURE
   * is 3.05; the engine only carries it through.
   */
  calibrationBaselineMs: number;
}

/** One presented item plus its response and outcome, with the level it was shown at. */
export interface DomainRunItem {
  item: Item;
  response: Response;
  judgment: ItemJudgment;
  /** The difficulty level the item was presented at (1–10). */
  level: number;
}

/** How a domain ended. */
export type DomainEnd = 'discontinue' | 'cap';

/** The full record of one domain's adaptive run — the input to v2 scoring. */
export interface DomainRun {
  domain: Domain;
  startLevel: number;
  items: DomainRunItem[];
  endedBy: DomainEnd;
  /** Solved an item at the maximum level → "reached the top" extreme (spec 7.3). */
  reachedCeilingExtreme: boolean;
  /** Errored at the minimum level → floor extreme (spec 7.3). */
  reachedFloorExtreme: boolean;
}

/** Every domain's run for one session. */
export interface SessionRun {
  input: SessionInput;
  engineVersion: string;
  domains: Record<Domain, DomainRun>;
}

/** Supplies a response for a presented item (the UI in 3.05; scripted in tests). */
export type Responder = (item: Item) => Response;

/** Validate the session age; throws on out-of-range (spec: 5–13 only). */
export function assertValidAge(age: number): void {
  if (!Number.isInteger(age) || age < MIN_AGE || age > MAX_AGE) {
    throw new Error(`Invalid age ${age}: must be an integer ${MIN_AGE}–${MAX_AGE}.`);
  }
}

/** The age-keyed start level for a domain (spec Дел 5; see norms for the curve). */
export function startLevel(_domain: Domain, age: number): number {
  assertValidAge(age);
  return START_LEVEL_BY_AGE[age];
}

/**
 * The item format for the n-th item of a domain at a given age (spec Дел 5).
 * Only Gsm varies today: forward-only under 8; alternating forward/backward
 * from 8 so both spans are measured. PROVISIONAL alternation policy.
 */
export function formatFor(domain: Domain, age: number, itemIndex: number): ItemFormat {
  if (domain === 'Gsm') {
    if (age < 8) return 'forward'; // forward-only under 8
    return itemIndex % 2 === 0 ? 'forward' : 'backward'; // both from 8
  }
  return 'standard';
}

/**
 * A stateful, step-by-step runner for ONE domain. The live flow calls
 * `peek()` to get the current item, presents it, then `submit(response)`; when
 * `done` is true it reads `result()`.
 */
export interface DomainController {
  domain: Domain;
  /** True once the domain has ended (ceiling or cap). */
  readonly done: boolean;
  /** The item to present next, or `null` when the domain is done. */
  peek(): Item | null;
  /** Record a response to the current item and advance the adaptive level. */
  submit(response: Response): void;
  /** The accumulated run. Valid at any point; final once `done`. */
  result(): DomainRun;
}

/** Create the step-by-step controller for one domain of a session. */
export function createDomainController(
  domain: Domain,
  input: SessionInput,
  provider: ItemProvider
): DomainController {
  assertValidAge(input.age);
  const {age} = input;
  const cluster = ageCluster(age);
  const maxItems = maxItemsFor(domain, cluster);
  const rng = makeRng(deriveSeed(input.seed, domain));
  const start = startLevel(domain, age);

  let level = start;
  let consecutiveErrors = 0;
  let endedBy: DomainEnd | null = null;
  let reachedCeilingExtreme = false;
  let reachedFloorExtreme = false;
  const items: DomainRunItem[] = [];

  // The next item is generated lazily and cached so peek() is idempotent.
  let pending: Item | null = null;

  function isDone(): boolean {
    return endedBy !== null;
  }

  function peek(): Item | null {
    if (isDone()) return null;
    if (pending === null) {
      const format = formatFor(domain, age, items.length);
      pending = provider.getItem(domain, level, format, rng);
    }
    return pending;
  }

  function submit(response: Response): void {
    if (isDone()) throw new Error(`${domain}: submit after the domain ended.`);
    const item = peek();
    if (item === null) throw new Error(`${domain}: no current item to answer.`);

    const judgment = item.judge(response);
    items.push({item, response, judgment, level});
    pending = null;

    if (judgment.correct) {
      consecutiveErrors = 0;
      if (level === MAX_LEVEL) reachedCeilingExtreme = true;
      level = Math.min(level + 1, MAX_LEVEL);
    } else {
      consecutiveErrors += 1;
      // Floor extreme: an error WHILE already at the minimum level (the child
      // could not solve even the easiest item). Flag fires on that error event;
      // 3.07 frames it kindly ("the tasks were too new for a moment" — spec 7.3).
      if (level === MIN_LEVEL) reachedFloorExtreme = true;
      level = Math.max(level - 1, MIN_LEVEL);
      if (consecutiveErrors >= CEILING_CONSECUTIVE_ERRORS) {
        endedBy = 'discontinue';
      }
    }
    if (!isDone() && items.length >= maxItems) endedBy = 'cap';
  }

  function result(): DomainRun {
    return {
      domain,
      startLevel: start,
      items,
      endedBy: endedBy ?? 'cap',
      reachedCeilingExtreme,
      reachedFloorExtreme
    };
  }

  return {
    domain,
    get done() {
      return isDone();
    },
    peek,
    submit,
    result
  };
}

/** Run a single domain to completion against a `Responder`. */
export function runDomain(
  domain: Domain,
  input: SessionInput,
  provider: ItemProvider,
  responder: Responder
): DomainRun {
  const controller = createDomainController(domain, input, provider);
  let guard = 0;
  while (!controller.done) {
    const item = controller.peek();
    if (item === null) break;
    controller.submit(responder(item));
    // Hard backstop against a misbehaving provider/responder loop.
    if (++guard > 1000) throw new Error(`${domain}: runaway domain loop.`);
  }
  return controller.result();
}

/** Run every domain of a session to completion. */
export function runSession(
  input: SessionInput,
  provider: ItemProvider,
  responder: Responder
): SessionRun {
  assertValidAge(input.age);
  const domains = {} as Record<Domain, DomainRun>;
  for (const domain of DOMAINS) {
    domains[domain] = runDomain(domain, input, provider, responder);
  }
  return {input, engineVersion: ENGINE_VERSION, domains};
}
