/**
 * Practice / example screen (spec 7.x). A short unscored "here's how" example
 * precedes each new task-domain, rendered from `getPracticeItem(domain)` with the
 * real renderer so the child sees the actual interaction. The FIRST practice also
 * **calibrates the device tap-baseline** (spec 7.2) — captured before the example
 * so downstream timing is read as calibration-relative patterns, not raw ms. The
 * example is skippable (older / repeat users); calibration is not.
 */
'use client';

import {useCallback, useRef, useState} from 'react';
import {m} from 'framer-motion';
import {cn} from '@/lib/utils';
import type {Item} from '@/lib/engine/types';
import {ConfirmAction} from '../renderers/ConfirmAction';
import {TaskRenderer} from '../renderers/TaskRenderer';
import {baselineFromTaps} from '../telemetry';
import {rendererCopy, type AssessmentCopy} from '../copy';
import {specOf} from '@/content/tasks';

/** How many taps the calibration samples (median → device baseline). */
const CALIBRATION_TAPS = 5;

function Calibration({
  copy,
  reducedMotion,
  onDone
}: {
  copy: AssessmentCopy['practice'];
  reducedMotion: boolean;
  onDone: (baselineMs: number) => void;
}) {
  const [taps, setTaps] = useState(0);
  const last = useRef<number | null>(null);
  const latencies = useRef<number[]>([]);

  const tap = useCallback(() => {
    const now =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (last.current !== null) latencies.current.push(now - last.current);
    last.current = now;
    const next = taps + 1;
    setTaps(next);
    if (next >= CALIBRATION_TAPS) {
      onDone(baselineFromTaps(latencies.current));
    }
  }, [taps, onDone]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
      <h1 className="font-brand text-2xl font-extrabold text-ink text-balance">
        {copy.calibrationTitle}
      </h1>
      <p className="text-ink-soft">{copy.calibrationIntro}</p>

      <button
        type="button"
        onClick={tap}
        aria-label={copy.tapHere}
        className="flex size-40 items-center justify-center rounded-full bg-iq-violet text-white shadow-lg transition-transform focus-visible:ring-4 focus-visible:ring-iq-violet/40 focus-visible:outline-none active:scale-95"
      >
        {reducedMotion ? (
          <span className="font-brand text-lg font-bold">{copy.tapHere}</span>
        ) : (
          <m.span
            key={taps}
            initial={{scale: 0.8, opacity: 0.6}}
            animate={{scale: 1, opacity: 1}}
            className="font-brand text-lg font-bold"
          >
            {copy.tapHere}
          </m.span>
        )}
      </button>

      {/* Non-numeric progress: filled pips, one per tap. */}
      <div className="flex gap-2" aria-hidden>
        {Array.from({length: CALIBRATION_TAPS}, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-2.5 rounded-full',
              i < taps ? 'bg-iq-violet' : 'bg-field'
            )}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {taps >= CALIBRATION_TAPS ? copy.ready : copy.calibrating}
      </p>
    </div>
  );
}

export function PracticeScreen({
  copy,
  fullCopy,
  practiceItem,
  needsCalibration,
  reducedMotion,
  assist,
  onCalibrate,
  onReady
}: {
  copy: AssessmentCopy['practice'];
  fullCopy: AssessmentCopy;
  practiceItem: Item;
  needsCalibration: boolean;
  reducedMotion: boolean;
  assist: boolean;
  onCalibrate: (baselineMs: number) => void;
  onReady: () => void;
}) {
  const [calibrated, setCalibrated] = useState(!needsCalibration);

  if (needsCalibration && !calibrated) {
    return (
      <Calibration
        copy={copy}
        reducedMotion={reducedMotion}
        onDone={(ms) => {
          onCalibrate(ms);
          setCalibrated(true);
        }}
      />
    );
  }

  const taskType = specOf(practiceItem).taskType;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <header className="flex flex-col gap-1 text-center">
        <p className="font-brand text-sm font-bold tracking-wide text-iq-violet uppercase">
          {copy.label}
        </p>
        <h1 className="font-brand text-xl font-extrabold text-ink text-balance">
          {copy.title}
        </h1>
        <p className="text-ink-soft">{copy.intro}</p>
      </header>

      {/* The real interaction, unscored — answers here are ignored. */}
      <div aria-hidden={false}>
        <TaskRenderer
          item={practiceItem}
          copy={rendererCopy(fullCopy, taskType)}
          reducedMotion={reducedMotion}
          assist={assist}
          onAnswer={() => {
            /* practice is unscored — proceed when the child is ready */
          }}
        />
      </div>

      <ConfirmAction label={copy.ready} onConfirm={onReady} />
    </div>
  );
}
