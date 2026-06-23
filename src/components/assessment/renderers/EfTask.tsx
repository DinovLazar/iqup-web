/**
 * EF renderer (Planning & speed) — `ef.towerOfLondon`, interaction
 * `mode: 'move-balls'`. Tower of London: a small set of coloured balls stacked on
 * capacity-limited pegs. The child lifts the TOP ball of one peg and drops it on
 * another peg that is below its capacity, transforming the `start` configuration
 * into the `goal` configuration shown beside it.
 *
 * INTERACTION (keyboard-operable): each peg is a `<button>`. Tapping a peg with
 * balls "picks up" its top ball (highlighted); tapping a second peg drops it there
 * IF that peg is below capacity (an over-capacity drop is rejected with a quiet,
 * non-error nudge — no state change); tapping the held peg again cancels. Every
 * successful drop increments a `moves` count, shown as a row of orange pips (one
 * per move) — never a digit, to honour the project's no-number / no-progress rule.
 * No timer, no anxiety.
 *
 * ANSWER: `onAnswer({finalState, moves}, telemetry)`. `finalState` is a deep copy
 * of the current pegs as `PegState[]` (each peg a ball-id array bottom→top),
 * mirroring `start`/`goal` exactly so the judge's `pegStateEquals` compares true.
 * The EF `judge` (see content/tasks/ef.ts) gates `correct` on REACHING THE GOAL
 * ONLY — `moves` is not required to equal `minMoves`; it only shapes partial
 * credit (`minMoves / movesUsed`). So the child may submit at any time; reaching
 * the goal yields `correct:true`, and doing it in fewer moves yields more credit.
 * `solution`/`minMoves` is never revealed. No localized literals (use `copy`).
 */
'use client';

import {useMemo, useState} from 'react';
import {m} from 'framer-motion';
import {RotateCcw} from 'lucide-react';
import type {EfTowerSpec, PegState} from '@/content/tasks';
import {cn} from '@/lib/utils';
import {TaskFrame} from '../TaskFrame';
import {ConfirmAction} from './ConfirmAction';
import type {TaskRendererProps} from '../types';

/**
 * Stable, mutually-distinct fills per ball-id (AA on light, each outlined in ink
 * and labelled with its id so distinction is never colour-only). Mirrors the
 * `COLOR_HEX` palette used elsewhere so balls read as part of the same world.
 */
const BALL_HEX = ['#e63946', '#00b6f1', '#2a9d57', '#ffc20e', '#762d90', '#f7941d'] as const;
const ballFill = (id: number) => BALL_HEX[id % BALL_HEX.length];

function cloneState(state: readonly PegState[]): PegState[] {
  return state.map((peg) => peg.slice());
}

/** One ball: a fixed-colour disc, outlined in ink, with its id for non-colour ID. */
function Ball({id, held = false, size = 34}: {id: number; held?: boolean; size?: number}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-brand font-bold text-white',
        held && 'ring-3 ring-iq-orange ring-offset-1'
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: ballFill(id),
        border: '2px solid var(--ink)',
        fontSize: Math.round(size * 0.42),
        textShadow: '0 1px 1px rgba(0,0,0,0.35)'
      }}
    >
      {id + 1}
    </span>
  );
}

/**
 * A single peg post with its stacked balls (bottom→top). In the interactive
 * tower it is a `<button>`; in the read-only goal reference it is a static column.
 */
function Peg({
  balls,
  capacity,
  index,
  ballSize,
  interactive,
  held,
  ariaLabel,
  onActivate
}: {
  balls: readonly number[];
  capacity: number;
  index: number;
  ballSize: number;
  interactive: boolean;
  held?: boolean;
  ariaLabel?: string;
  onActivate?: () => void;
}) {
  // Reserve vertical room for the peg's full capacity so columns sit level.
  const slotGap = 4;
  const stageHeight = capacity * ballSize + (capacity - 1) * slotGap + 12;

  const column = (
    <div className="flex flex-col items-center justify-end gap-1" style={{minHeight: stageHeight}}>
      {balls.map((id, i) => (
        <Ball key={`${id}-${i}`} id={id} size={ballSize} held={held && i === balls.length - 1} />
      ))}
    </div>
  );

  const post = (
    <span
      aria-hidden
      className="mt-1 block rounded-full bg-iq-grey/40"
      style={{width: 6, height: 14}}
    />
  );

  const base = (
    <span
      aria-hidden
      className="block rounded-full bg-iq-grey/60"
      style={{width: ballSize + 18, height: 6}}
    />
  );

  if (!interactive) {
    return (
      <div className="flex flex-col items-center">
        {column}
        {post}
        {base}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={ariaLabel}
      data-peg={index}
      className={cn(
        'flex min-h-tap min-w-[4.5rem] flex-col items-center rounded-card border-2 bg-field px-2 pt-2 pb-1 transition-colors',
        'focus-visible:ring-3 focus-visible:ring-iq-violet/50 focus-visible:outline-none',
        held ? 'border-iq-orange bg-iq-orange/10' : 'border-border hover:border-iq-violet/60'
      )}
    >
      {column}
      {post}
      {base}
    </button>
  );
}

/** The moves indicator: one filled orange pip per move made (no digit, no "N of M"). */
function MovePips({count, label}: {count: number; label: string}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-brand text-sm font-medium text-ink-soft">{label}</span>
      <div className="flex min-h-3 flex-wrap items-center justify-center gap-1" aria-hidden>
        {Array.from({length: count}, (_, i) => (
          <span key={i} className="inline-flex size-2.5 rounded-full bg-iq-orange" />
        ))}
      </div>
    </div>
  );
}

export function EfTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const tower = spec as EfTowerSpec;
  const {capacities, goal, start} = tower;

  const [pegs, setPegs] = useState<PegState[]>(() => cloneState(start));
  const [held, setHeld] = useState<number | null>(null); // index of peg whose top ball is picked up
  const [moves, setMoves] = useState(0);
  const [nudge, setNudge] = useState(0); // bumps to re-trigger the "rejected drop" wiggle

  const ballSize = assist ? 40 : 34;
  const goalBallSize = Math.round(ballSize * 0.6);

  // Pristine = unchanged from start with nothing held → submitting counts as omitted.
  const pristine = held === null && moves === 0;

  /** A locale-neutral peg description: position + how many balls it holds. */
  const pegLabel = (i: number) => `${copy.tower.goalLabel} ${i + 1} (${pegs[i].length}/${capacities[i]})`;

  function handlePeg(index: number) {
    setNudge(0);
    if (held === null) {
      // Pick up the top ball, if any.
      if (pegs[index].length === 0) return;
      setHeld(index);
      return;
    }
    if (held === index) {
      // Tapping the held peg again cancels the pickup.
      setHeld(null);
      return;
    }
    // Attempt to drop: only if the destination is below capacity.
    if (pegs[index].length >= capacities[index]) {
      setHeld(null);
      setNudge((n) => n + 1); // quiet, non-error nudge — no state change beyond releasing
      return;
    }
    setPegs((prev) => {
      const next = cloneState(prev);
      const ball = next[held].pop();
      if (ball === undefined) return prev;
      next[index].push(ball);
      return next;
    });
    setMoves((m) => m + 1);
    setHeld(null);
  }

  function reset() {
    setPegs(cloneState(start));
    setHeld(null);
    setMoves(0);
    setNudge(0);
  }

  function submit() {
    onAnswer(
      {finalState: cloneState(pegs), moves},
      pristine ? {omitted: true} : {}
    );
  }

  const pegOrder = useMemo(() => capacities.map((_, i) => i), [capacities]);

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={pristine}
            aria-disabled={pristine}
            className={cn(
              'flex min-h-tap w-full items-center justify-center gap-2 rounded-card border-2 px-6 font-brand text-base font-semibold transition-colors',
              'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
              pristine
                ? 'cursor-not-allowed border-border text-ink-faint'
                : 'border-border text-ink-soft hover:border-iq-violet/60 hover:text-ink'
            )}
          >
            <RotateCcw className="size-5" aria-hidden />
            {copy.clear}
          </button>
          <ConfirmAction label={copy.confirm} onConfirm={submit} />
        </div>
      }
    >
      <div className="flex w-full flex-col items-center gap-6">
        {/* Goal reference — smaller, read-only. */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-brand text-sm font-semibold text-ink-soft">{copy.tower.goalLabel}</span>
          <div
            className="flex items-end justify-center gap-3 rounded-card border-2 border-border bg-card/60 px-4 py-3"
            role="img"
            aria-label={copy.tower.goalLabel}
          >
            {pegOrder.map((i) => (
              <Peg
                key={i}
                index={i}
                balls={goal[i]}
                capacity={capacities[i]}
                ballSize={goalBallSize}
                interactive={false}
              />
            ))}
          </div>
        </div>

        {/* Interactive tower — the child manipulates this one. */}
        <m.div
          className="flex items-end justify-center gap-3"
          key={nudge}
          animate={nudge && !reducedMotion ? {x: [0, -5, 5, -3, 0]} : undefined}
          transition={{duration: 0.3, ease: 'easeInOut'}}
        >
          {pegOrder.map((i) => (
            <Peg
              key={i}
              index={i}
              balls={pegs[i]}
              capacity={capacities[i]}
              ballSize={ballSize}
              interactive
              held={held === i}
              ariaLabel={pegLabel(i)}
              onActivate={() => handlePeg(i)}
            />
          ))}
        </m.div>

        <MovePips count={moves} label={copy.tower.movesLabel} />
      </div>
    </TaskFrame>
  );
}
