/**
 * The live v2 assessment flow shell (Phase 3.05) — the centerpiece coming alive.
 * Mounts at `/test` (superseding the v1 TestRunner). Drives the 3.03 engine over
 * the 3.04 item bank via {@link useAssessment}, renders one task at a time inside
 * the shared frame, shows the puzzle-brain progress (no numbers), and routes
 * through age setup → (parent-assist) → practice → tasks → completion / retry.
 *
 * All copy arrives resolved server-side (the island ships no translation runtime).
 * The completion screen's "continue" is the `// HANDOFF (3.06)` seam.
 */
'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import {useRouter} from '@/i18n/navigation';
import {MotionProvider} from '@/components/landing/MotionProvider';
import {correctAnswerFor, specOf} from '@/content/tasks';
import {DOMAIN_REGION} from './types';
import {useAssessment, type AssessmentOptions} from './useAssessment';
import {PuzzleBrain} from './PuzzleBrain';
import {TaskRenderer} from './renderers/TaskRenderer';
import {AgeSetup} from './screens/AgeSetup';
import {ParentAssist} from './screens/ParentAssist';
import {PracticeScreen} from './screens/PracticeScreen';
import {CompletionScreen} from './screens/CompletionScreen';
import {RetryScreen} from './screens/RetryScreen';
import {rendererCopy, type AssessmentCopy} from './copy';
import type {AnswerTelemetry} from './types';

export type DevMode = 'off' | 'finish' | 'retry';

export function AssessmentFlow({
  copy,
  initialAge,
  dev = false,
  options
}: {
  copy: AssessmentCopy;
  /** Optional age from `/test?age=N` — auto-starts setup so the picker is skipped. */
  initialAge?: number;
  /** Non-production QA autopilot (stripped in prod by the server shell). */
  dev?: boolean;
  /** Test/dev overrides (fixed seed + baseline). */
  options?: AssessmentOptions;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const router = useRouter();
  const a = useAssessment(options);
  const {
    phase,
    currentDomain,
    currentItem,
    completedDomains,
    needsCalibration,
    practiceItem,
    result,
    setAge,
    confirmAssist,
    finishPractice,
    calibrate,
    answer,
    retry
  } = a;

  const assist = a.age !== null && a.age <= 7;

  // Auto-start from a URL `?age=N` so the landing's age picker isn't repeated.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    if (phase === 'setup' && initialAge && initialAge >= 5 && initialAge <= 13) {
      startedRef.current = true;
      setAge(initialAge);
    }
  }, [phase, initialAge, setAge]);

  // — Dev autopilot: fast-advance the whole flow for QA (no-op in prod). Kept as
  // STATE (not a ref) so toggling it from the DevBar re-runs this effect. —
  const [devMode, setDevMode] = useState<DevMode>('off');
  useEffect(() => {
    if (!dev || devMode === 'off') return;
    const fast = devMode === 'retry'; // too-fast → strong flag → retry path
    const delay = fast ? 30 : 600;
    const t = setTimeout(() => {
      if (phase === 'setup') setAge(initialAge ?? 8);
      else if (phase === 'assist') confirmAssist();
      else if (phase === 'practice') {
        if (needsCalibration) calibrate(600);
        else finishPractice();
      } else if (phase === 'task' && currentItem) {
        const spec = specOf(currentItem);
        const ans = correctAnswerFor(currentItem);
        const tel: AnswerTelemetry = {};
        if (spec.interaction.mode === 'select-one' && typeof ans === 'number') {
          tel.selectedPosition = ans;
        } else if (spec.interaction.mode === 'multi-tap-timed') {
          tel.tappedCells = Array.isArray(ans) ? ans.length : 0;
        }
        answer(ans, tel);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [
    dev,
    devMode,
    phase,
    currentItem,
    needsCalibration,
    initialAge,
    setAge,
    confirmAssist,
    finishPractice,
    calibrate,
    answer
  ]);

  const onContinue = useCallback(() => {
    // HANDOFF (3.06) — RESOLVED: the parent form lives at `/report`. The completed
    // SessionRun + validity outcome are already persisted (sessionStorage, no PII,
    // never in the URL) by the orchestrator; `/report` reads
    // `ASSESSMENT_RESULT_STORAGE_KEY`, recomputes the profile client-side, captures
    // the parent + consents, and writes the two stores. Results reveal there (3.09).
    router.push('/report');
  }, [router]);

  const activeRegion = currentDomain ? DOMAIN_REGION[currentDomain] : null;
  const showBrain = phase === 'practice' || phase === 'task';

  return (
    <MotionProvider>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:py-8">
        {showBrain && (
          <div className="flex justify-center">
            <PuzzleBrain
              completedDomains={completedDomains}
              activeRegion={activeRegion}
              labels={copy.brain.regions}
              title={copy.brain.title}
              doneWord={copy.brain.doneWord}
              reducedMotion={reducedMotion}
            />
          </div>
        )}

        {phase === 'setup' && <AgeSetup copy={copy.setup} onAge={setAge} />}

        {phase === 'assist' && (
          <ParentAssist copy={copy.assist} onConfirm={confirmAssist} />
        )}

        {phase === 'practice' && practiceItem && (
          <PracticeScreen
            copy={copy.practice}
            fullCopy={copy}
            practiceItem={practiceItem}
            needsCalibration={needsCalibration}
            reducedMotion={reducedMotion}
            assist={assist}
            onCalibrate={calibrate}
            onReady={finishPractice}
          />
        )}

        {phase === 'task' && currentItem && (
          <TaskRenderer
            key={currentItem.id}
            item={currentItem}
            copy={rendererCopy(copy, specOf(currentItem).taskType)}
            reducedMotion={reducedMotion}
            assist={assist}
            onAnswer={answer}
          />
        )}

        {phase === 'complete' && (
          <CompletionScreen
            copy={copy.complete}
            showGentleNote={result?.validity.outcome === 'gentle_note'}
            reducedMotion={reducedMotion}
            onContinue={onContinue}
          />
        )}

        {phase === 'retry' && <RetryScreen copy={copy.retry} onRetry={retry} />}
      </div>

      {dev && (
        <DevBar
          onFinish={() => setDevMode('finish')}
          onForceRetry={() => setDevMode('retry')}
          onStop={() => setDevMode('off')}
        />
      )}
    </MotionProvider>
  );
}

/** Dev-only autopilot controls (rendered only when `dev`, stripped in prod). */
function DevBar({
  onFinish,
  onForceRetry,
  onStop
}: {
  onFinish: () => void;
  onForceRetry: () => void;
  onStop: () => void;
}) {
  return (
    <div
      data-dev-only
      className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-300 bg-amber-50/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-2 text-xs">
        <span className="font-bold tracking-wide text-amber-700 uppercase">dev</span>
        <span className="text-amber-700">autopilot:</span>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-md bg-amber-100 px-2 py-1 font-mono font-semibold text-amber-800 hover:bg-amber-200"
        >
          finish ✓
        </button>
        <button
          type="button"
          onClick={onForceRetry}
          className="rounded-md bg-amber-100 px-2 py-1 font-mono font-semibold text-amber-800 hover:bg-amber-200"
        >
          force retry ⚡
        </button>
        <button
          type="button"
          onClick={onStop}
          className="rounded-md bg-amber-100 px-2 py-1 font-mono font-semibold text-amber-800 hover:bg-amber-200"
        >
          stop
        </button>
      </div>
    </div>
  );
}
