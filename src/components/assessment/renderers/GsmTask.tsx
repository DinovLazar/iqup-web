/**
 * Gsm renderer (Memory & focus) — the Corsi span task (`tap-sequence`). A fixed
 * board of scattered tiles is shown; a `sequence` of tile-ids lights up one at a
 * time (show → hide → repeat), then the board becomes tappable and the child
 * reproduces the order by tapping (the "Corsi block-tapping" paradigm).
 *
 * ── ANSWER CONTRACT (verified against `@/content/tasks/gsm.ts`) ───────────────
 * The generator stores `solution.answer` as the *tap order the child must
 * reproduce* — identical to `sequence` for `forward`, and **already reversed**
 * for `backward`. The judge (`corsiJudge`) compares the reported answer to that
 * solution with `arraysEqual`. So this renderer reports the tapped tile-ids
 * **verbatim, in tap order**, and reverses NOTHING: for the backward condition
 * the child themselves taps the sequence in reverse, and that literal tap order
 * is what makes the judge return `correct: true`. We do not read `solution`.
 *
 * Reduced motion: no auto-animation — a manual "Show" reveals the sequence
 * stepwise and "I'm ready" switches to the tap phase (mirrors the v1 reveal
 * accessibility mechanic). Progress is shown as filled pips, never digits / a
 * score / "N of M". Teal is the Memory hue used for the active/highlight tile.
 */
'use client';

import {useCallback, useEffect, useId, useState} from 'react';
import {m} from 'framer-motion';
import {RotateCcw} from 'lucide-react';
import type {GsmCorsiSpec} from '@/content/tasks';
import {cn} from '@/lib/utils';
import {TaskFrame} from '../TaskFrame';
import {ConfirmAction} from './ConfirmAction';
import type {TaskRendererProps} from '../types';

/** The phases of a single Corsi trial. */
type Phase = 'reveal' | 'tap';

/** Tile rendered as a percentage-positioned square button on an aspect-square board. */
function Tile({
  x,
  y,
  lit,
  tappable,
  onTap,
  reducedMotion,
  label
}: {
  x: number;
  y: number;
  lit: boolean;
  tappable: boolean;
  onTap: () => void;
  reducedMotion: boolean;
  label: string;
}) {
  return (
    <m.button
      type="button"
      aria-label={label}
      disabled={!tappable}
      onClick={onTap}
      animate={reducedMotion ? undefined : {scale: lit ? 1.12 : 1}}
      transition={{type: 'spring', stiffness: 420, damping: 22}}
      style={{left: `${x * 100}%`, top: `${y * 100}%`}}
      className={cn(
        'absolute size-[18%] min-h-tap min-w-[44px] -translate-x-1/2 -translate-y-1/2 rounded-card border-2 transition-colors',
        'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none',
        lit
          ? 'border-iq-teal bg-iq-teal shadow-lg'
          : 'border-border bg-field',
        tappable && !lit && 'hover:border-iq-teal/60 hover:bg-iq-teal/10',
        !tappable && 'cursor-default'
      )}
    />
  );
}

/** Non-numeric progress: one filled pip per recorded tap (no digits, no "N of M"). */
function TapPips({taken, total}: {taken: number; total: number}) {
  return (
    <div aria-hidden className="flex flex-wrap items-center justify-center gap-1.5">
      {Array.from({length: total}, (_, i) => (
        <span
          key={i}
          className={cn(
            'inline-flex size-2.5 rounded-full transition-colors',
            i < taken ? 'bg-iq-teal' : 'bg-border'
          )}
        />
      ))}
    </div>
  );
}

export function GsmTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const gsm = spec as GsmCorsiSpec;
  const {tiles, sequence, revealMs} = gsm;
  const length = gsm.interaction.length;

  // The recorded tap order — reported verbatim (see ANSWER CONTRACT above).
  const [taps, setTaps] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('reveal');
  // The index of the tile currently lit during the reveal, or null between lights.
  const [litStep, setLitStep] = useState<number | null>(null);
  // Reduced-motion manual path: whether the child has pressed "Show" yet.
  const [manualShown, setManualShown] = useState(false);

  const statusId = useId();

  // ── Auto reveal (motion path): light each tile for `revealMs`, then go tappable.
  useEffect(() => {
    if (reducedMotion || phase !== 'reveal') return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = (i: number) => {
      if (cancelled) return;
      if (i >= sequence.length) {
        setLitStep(null);
        setPhase('tap');
        return;
      }
      setLitStep(i);
      timer = setTimeout(() => {
        if (cancelled) return;
        // Brief gap between tiles so consecutive different tiles read distinctly.
        setLitStep(null);
        timer = setTimeout(() => step(i + 1), Math.max(120, Math.round(revealMs * 0.25)));
      }, revealMs);
    };

    // Small lead-in so the child can settle before the first tile lights.
    timer = setTimeout(() => step(0), 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reducedMotion, phase, sequence.length, revealMs]);

  // ── Reduced-motion manual reveal: light each tile stepwise on a slower cadence.
  useEffect(() => {
    if (!reducedMotion || phase !== 'reveal' || !manualShown) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = (i: number) => {
      if (cancelled) return;
      if (i >= sequence.length) {
        setLitStep(null);
        return;
      }
      setLitStep(i);
      timer = setTimeout(() => {
        if (cancelled) return;
        setLitStep(null);
        timer = setTimeout(() => step(i + 1), 300);
      }, Math.max(revealMs, 900));
    };

    step(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reducedMotion, phase, manualShown, sequence.length, revealMs]);

  const submit = useCallback(
    (order: number[]) => {
      if (order.length === 0) {
        onAnswer([], {omitted: true});
        return;
      }
      onAnswer(order);
    },
    [onAnswer]
  );

  const handleTap = useCallback(
    (tileId: number) => {
      if (phase !== 'tap') return;
      setTaps((prev) => {
        if (prev.length >= length) return prev;
        const next = [...prev, tileId];
        // Auto-submit on the final tap (Clear remains available until then).
        if (next.length === length) submit(next);
        return next;
      });
    },
    [phase, length, submit]
  );

  const clear = useCallback(() => setTaps([]), []);

  // Which tile-id (if any) is lit right now during the reveal.
  const litTileId =
    phase === 'reveal' && litStep !== null ? sequence[litStep] : null;

  // Status line for the aria-live region + heading-equivalent within the stage.
  const inManualPreShow = reducedMotion && phase === 'reveal' && !manualShown;
  const status =
    phase === 'tap'
      ? copy.reveal.yourTurn
      : inManualPreShow
        ? copy.reveal.showButton
        : copy.reveal.watch;

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        phase === 'tap' ? (
          <>
            <button
              type="button"
              onClick={clear}
              disabled={taps.length === 0}
              aria-disabled={taps.length === 0}
              className={cn(
                'flex min-h-tap w-full items-center justify-center gap-2 rounded-card border-2 px-8 font-brand text-base font-semibold transition-colors',
                'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
                taps.length === 0
                  ? 'cursor-not-allowed border-border bg-field text-ink-faint'
                  : 'border-border bg-card text-ink-soft hover:bg-field'
              )}
            >
              <RotateCcw className="size-5" aria-hidden />
              {copy.clear}
            </button>
            <ConfirmAction
              label={copy.confirm}
              disabled={taps.length === 0}
              onConfirm={() => submit(taps)}
            />
          </>
        ) : reducedMotion && !manualShown ? (
          <ConfirmAction label={copy.reveal.showButton} onConfirm={() => setManualShown(true)} />
        ) : reducedMotion ? (
          <ConfirmAction label={copy.reveal.ready} onConfirm={() => setPhase('tap')} />
        ) : undefined
      }
    >
      <div className="flex w-full flex-col items-center gap-5">
        <p
          id={statusId}
          aria-live="polite"
          className={cn(
            'font-brand font-semibold text-ink-soft',
            assist ? 'text-lg' : 'text-base'
          )}
        >
          {status}
        </p>

        <div
          role="group"
          aria-label={copy.instruction}
          className="relative aspect-square w-full max-w-sm rounded-card-lg border-2 border-border bg-card"
        >
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              x={tile.x}
              y={tile.y}
              lit={litTileId === tile.id}
              tappable={phase === 'tap'}
              onTap={() => handleTap(tile.id)}
              reducedMotion={reducedMotion}
              label={`${copy.instruction} ${tile.id + 1}`}
            />
          ))}
        </div>

        {phase === 'tap' && <TapPips taken={taps.length} total={length} />}
      </div>
    </TaskFrame>
  );
}
