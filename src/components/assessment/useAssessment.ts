/**
 * The flow orchestrator (Phase 3.05). Drives the 3.03 engine one item at a time
 * across the canonical domain sequence, injecting the 3.04 production item
 * provider, threading the captured telemetry into each engine `Response`, and —
 * at session end — assembling the `SessionRun`, running the 3.03 validity
 * functions over it, and persisting the hand-off for 3.06.
 *
 * One task at a time; practice precedes each new domain; the first practice
 * captures the device baseline. No numbers/score/"N of M" are produced here — the
 * progress brain reads `completedDomains` only.
 */
'use client';

import {useCallback, useMemo, useRef, useState} from 'react';
import {
  ENGINE_VERSION,
  createDomainController,
  type DomainController,
  type DomainRun,
  type SessionInput,
  type SessionRun
} from '@/lib/engine';
import {DOMAINS, type Domain, type Item, type Response} from '@/lib/engine/types';
import {evaluateValidity, type ValiditySummary} from '@/lib/validity';
import {toResponseOutcomes} from '@/lib/scoring/v2';
import {createTaskItemProvider, type TaskItemProvider} from '@/content/tasks';
import {persistHandoff, generateSeed, type AssessmentHandoff} from './session';
import type {AnswerTelemetry, FlowPhase} from './types';
import {useItemTimer} from './telemetry';

/** Optional overrides for tests / the dev preview (fixed seed + baseline). */
export interface AssessmentOptions {
  /** Fix the seed (determinism tests / dev). Defaults to a fresh per-session seed. */
  seed?: string;
  /** Inject a fixed device baseline, skipping live calibration (tests / dev). */
  calibrationBaselineMs?: number;
  /** Called once the SessionRun + validity are assembled (analytics seam, 3.12). */
  onComplete?: (handoff: AssessmentHandoff) => void;
}

/** Everything the flow UI needs from the orchestrator. */
export interface AssessmentState {
  phase: FlowPhase;
  age: number | null;
  /** The domain currently being practised/run, or null before the run starts. */
  currentDomain: Domain | null;
  /** The item to present right now (during `task`), or null. */
  currentItem: Item | null;
  /** Domains finished (drives the puzzle-brain region fill). */
  completedDomains: ReadonlySet<Domain>;
  /** True while the first practice must still capture the device baseline. */
  needsCalibration: boolean;
  /** The validity verdict + assembled run, available from `complete`/`retry`. */
  result: AssessmentHandoff | null;
  /** Practice item for the current domain (shown before its first task item). */
  practiceItem: Item | null;

  // — transitions —
  /** Submit the child's age (5–13); routes to parent-assist (≤7) or the run. */
  setAge: (age: number) => void;
  /** Parent confirmed the technical-help-only rule (5–7). */
  confirmAssist: () => void;
  /** Finish the practice for the current domain → its first task item. */
  finishPractice: () => void;
  /** Supply the measured device baseline from the first practice calibration. */
  calibrate: (baselineMs: number) => void;
  /** Answer the current task item (the renderer's `onAnswer`). */
  answer: (answer: unknown, telemetry?: AnswerTelemetry) => void;
  /** Retry after a not-representative outcome — fresh seed → fresh item set. */
  retry: () => void;
}

/**
 * The age-keyed format cluster decides whether the 5–7 parent-assist gate shows.
 * (Format/level effects of age are the engine's concern; here we only branch UI.)
 */
function needsParentAssist(age: number): boolean {
  return age <= 7;
}

export function useAssessment(opts: AssessmentOptions = {}): AssessmentState {
  const provider = useMemo<TaskItemProvider>(() => createTaskItemProvider(), []);
  const timer = useItemTimer();

  const [phase, setPhase] = useState<FlowPhase>('setup');
  const [age, setAgeState] = useState<number | null>(null);
  const [seed, setSeed] = useState<string | null>(opts.seed ?? null);
  const [baseline, setBaseline] = useState<number | null>(
    opts.calibrationBaselineMs ?? null
  );
  const [domainIndex, setDomainIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [practiceItem, setPracticeItem] = useState<Item | null>(null);
  const [completedDomains, setCompletedDomains] = useState<Set<Domain>>(new Set());
  const [result, setResult] = useState<AssessmentHandoff | null>(null);

  // The live controller for the current domain + the finished runs accumulator.
  const controllerRef = useRef<DomainController | null>(null);
  const runsRef = useRef<Partial<Record<Domain, DomainRun>>>({});

  const currentDomain: Domain | null =
    phase === 'setup' || phase === 'assist' || phase === 'complete' || phase === 'retry'
      ? null
      : (DOMAINS[domainIndex] ?? null);

  const needsCalibration = domainIndex === 0 && baseline === null && opts.calibrationBaselineMs == null;

  /** Show the practice screen for domain N (its unscored example). */
  const enterPractice = useCallback(
    (index: number) => {
      const domain = DOMAINS[index];
      setPracticeItem(provider.getPracticeItem(domain));
      setDomainIndex(index);
      setPhase('practice');
    },
    [provider]
  );

  const setAge = useCallback(
    (next: number) => {
      setAgeState(next);
      setSeed((s) => s ?? generateSeed(next));
      if (needsParentAssist(next)) setPhase('assist');
      else enterPractice(0);
    },
    [enterPractice]
  );

  const confirmAssist = useCallback(() => {
    enterPractice(0);
  }, [enterPractice]);

  const calibrate = useCallback((baselineMs: number) => {
    setBaseline(baselineMs);
  }, []);

  /** Begin the adaptive run for the current domain (create its controller). */
  const finishPractice = useCallback(() => {
    if (age == null || seed == null) return;
    const effectiveBaseline = baseline ?? opts.calibrationBaselineMs ?? null;
    if (effectiveBaseline == null) return; // calibration must complete first
    const input: SessionInput = {
      age,
      seed,
      calibrationBaselineMs: effectiveBaseline
    };
    const domain = DOMAINS[domainIndex];
    const controller = createDomainController(domain, input, provider);
    controllerRef.current = controller;
    setPracticeItem(null);
    setCurrentItem(controller.peek());
    setPhase('task');
    timer.start();
  }, [age, seed, baseline, opts.calibrationBaselineMs, domainIndex, provider, timer]);

  /** Assemble the run + validity, persist, and route to complete/retry. */
  const finalize = useCallback(() => {
    if (age == null || seed == null) return;
    const input: SessionInput = {
      age,
      seed,
      calibrationBaselineMs: baseline ?? opts.calibrationBaselineMs ?? 0
    };
    const domains = runsRef.current as Record<Domain, DomainRun>;
    const run: SessionRun = {input, engineVersion: ENGINE_VERSION, domains};
    const validity: ValiditySummary = evaluateValidity(toResponseOutcomes(run));
    const handoff: AssessmentHandoff = {
      version: 1,
      run,
      validity,
      completedAt: new Date().toISOString()
    };
    setResult(handoff);
    opts.onComplete?.(handoff);
    if (validity.outcome === 'not_representative') {
      // Strong flag → withhold the confident profile; offer a real retry.
      setPhase('retry');
    } else {
      // valid / gentle_note → persist the hand-off and reward the child.
      // HANDOFF (3.06): the completion screen's "continue to your report" action
      // sends the parent into the form, which reads this persisted run.
      persistHandoff(handoff);
      setPhase('complete');
    }
  }, [age, seed, baseline, opts]);

  /** Advance to the next domain's practice, or finalize after the last domain. */
  const advanceDomain = useCallback(() => {
    const next = domainIndex + 1;
    if (next < DOMAINS.length) enterPractice(next);
    else finalize();
  }, [domainIndex, enterPractice, finalize]);

  const answer = useCallback(
    (ans: unknown, telemetry: AnswerTelemetry = {}) => {
      const controller = controllerRef.current;
      const item = currentItem;
      if (!controller || !item) return;
      const {responseTimeMs, idleMs} = timer.stop();
      const response: Response = {
        itemId: item.id,
        answer: ans,
        responseTimeMs,
        ...(idleMs > 0 ? {idleMs} : {}),
        ...(telemetry.selectedPosition !== undefined
          ? {selectedPosition: telemetry.selectedPosition}
          : {}),
        ...(telemetry.tappedCells !== undefined
          ? {tappedCells: telemetry.tappedCells}
          : {}),
        ...(telemetry.omitted ? {omitted: true} : {})
      };
      controller.submit(response);

      if (controller.done) {
        runsRef.current[controller.domain] = controller.result();
        setCompletedDomains((prev) => {
          const nextSet = new Set(prev);
          nextSet.add(controller.domain);
          return nextSet;
        });
        controllerRef.current = null;
        setCurrentItem(null);
        advanceDomain();
      } else {
        // Next item in the same domain.
        setCurrentItem(controller.peek());
        timer.start();
      }
    },
    [currentItem, timer, advanceDomain]
  );

  const retry = useCallback(() => {
    // Fresh seed → a fresh item set on the same age (determinism gives new tasks).
    runsRef.current = {};
    controllerRef.current = null;
    setCompletedDomains(new Set());
    setResult(null);
    setCurrentItem(null);
    if (age != null) setSeed(generateSeed(age));
    enterPractice(0);
  }, [age, enterPractice]);

  return {
    phase,
    age,
    currentDomain,
    currentItem,
    completedDomains,
    needsCalibration,
    result,
    practiceItem,
    setAge,
    confirmAssist,
    finishPractice,
    calibrate,
    answer,
    retry
  };
}
