/**
 * CT renderer (Learning & STEM) — all five computational-thinking sub-types,
 * dispatched on `spec.taskType` into three interaction shapes:
 *
 *   • `ct.sequence` / `ct.maze`  — `order-steps`: order the available direction
 *       tokens into a slot row so the robot walks `start → goal`. The judge
 *       (`pathJudge`) simulates the ordered program over the `GridWorld`; the
 *       answer IS the ordered `Direction[]`, so we submit the slot contents.
 *   • `ct.debug`                 — `tap-error`: tap the single wrong step. The
 *       judge compares the tapped index to the buggy index; the answer IS that
 *       step index (number), NO `selectedPosition`.
 *   • `ct.loop` / `ct.conditional` — `select-one`: pick one option. The answer
 *       IS the chosen option index (number) + `selectedPosition` telemetry.
 *
 * Bespoke SVG via the shared `Glyph` (`DirectionArrow`, `COLOR_HEX`); the shared
 * `SelectOneGrid` drives the two select-one sub-types. Language-neutral: every
 * sentence comes from `copy`; the only on-screen digits are intrinsic task
 * content (a loop's repeat count) — never a progress counter, score, %, or
 * "N of M". No Bibi/characters. Grid convention matches `ct.ts`: `Cell =
 * [col,row]`, origin top-left.
 */
'use client';

import {useState} from 'react';
import {m} from 'framer-motion';
import {Repeat, X} from 'lucide-react';
import type {
  CtConditionalSpec,
  CtDebugSpec,
  CtLoopSpec,
  CtMazeSpec,
  CtSequenceSpec,
  Direction,
  GridWorld
} from '@/content/tasks';
import {cn} from '@/lib/utils';
import {TaskFrame} from '../TaskFrame';
import {SelectOneGrid} from '../interactions/SelectOneGrid';
import {COLOR_HEX, DirectionArrow} from '../visuals/Glyph';
import {ConfirmAction} from './ConfirmAction';
import type {TaskRendererProps} from '../types';

const INK = 'var(--ink)';
/** Learning index hue (CT lives in the Learning region) — accent only. */
// Learning & STEM hue (yellow) as a literal — the `--index-*` theme tokens are
// inlined into utilities, not emitted as raw `:root` vars, so `var(--index-*)`
// would not resolve inside an SVG `fill` / inline style.
const ACCENT = '#ffc20e';

// ─── Shared GridWorld visual (sequence / maze / debug) ───────────────────────

function cellEq(c: readonly [number, number], col: number, row: number): boolean {
  return c[0] === col && c[1] === row;
}

/**
 * Render the cols×rows world: robot at `start`, goal flag at `goal`, walls as
 * blocked cells. High-contrast, outlined with `--ink`; start/goal/wall each get a
 * distinct mark (never colour-only). `aria-label` carries a locale-neutral note.
 */
function WorldGrid({world}: {world: GridWorld}) {
  const wallSet = new Set(world.walls.map((w) => `${w[0]},${w[1]}`));
  // Keep the whole board comfortably on a 360px viewport.
  const unit = Math.max(28, Math.min(48, Math.floor(280 / Math.max(world.cols, world.rows))));
  const cells: React.ReactNode[] = [];
  for (let row = 0; row < world.rows; row++) {
    for (let col = 0; col < world.cols; col++) {
      const isStart = cellEq(world.start, col, row);
      const isGoal = cellEq(world.goal, col, row);
      const isWall = wallSet.has(`${col},${row}`);
      cells.push(
        <div
          key={`${col},${row}`}
          className={cn(
            'relative flex items-center justify-center border-2',
            isWall ? 'bg-ink/85' : 'bg-field'
          )}
          style={{width: unit, height: unit, borderColor: INK}}
        >
          {isStart && (
            // Robot: a filled rounded square with two "eyes" — distinct mark.
            <svg width={unit * 0.62} height={unit * 0.62} viewBox="0 0 100 100" aria-hidden>
              <rect x="14" y="20" width="72" height="64" rx="14" fill={ACCENT} stroke={INK} strokeWidth={7} />
              <circle cx="36" cy="48" r="9" fill={INK} />
              <circle cx="64" cy="48" r="9" fill={INK} />
              <rect x="44" y="6" width="12" height="18" rx="4" fill={INK} />
            </svg>
          )}
          {isGoal && (
            // Goal flag: a pole + triangular pennant — distinct mark.
            <svg width={unit * 0.6} height={unit * 0.6} viewBox="0 0 100 100" aria-hidden>
              <rect x="24" y="12" width="8" height="78" rx="3" fill={INK} />
              <polygon points="32,16 84,32 32,48" fill={ACCENT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            </svg>
          )}
          {isWall && <span className="sr-only">wall</span>}
        </div>
      );
    }
  }
  return (
    <div
      role="img"
      aria-label="robot grid: start, goal, and walls"
      className="grid w-fit overflow-hidden rounded-card"
      style={{gridTemplateColumns: `repeat(${world.cols}, ${unit}px)`}}
    >
      {cells}
    </div>
  );
}

// ─── order-steps (ct.sequence / ct.maze) ─────────────────────────────────────

function OrderStepsView({
  spec,
  copy,
  assist,
  reducedMotion,
  onAnswer
}: {
  spec: CtSequenceSpec | CtMazeSpec;
  copy: TaskRendererProps['copy'];
  assist: boolean;
  reducedMotion: boolean;
  onAnswer: TaskRendererProps['onAnswer'];
}) {
  const slotCount = spec.interaction.slotCount;
  // Each slot holds the index into `spec.steps` of the placed token (or null).
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(slotCount).fill(null));
  const placed = new Set(slots.filter((s): s is number => s !== null));
  const allFilled = slots.every((s) => s !== null);

  const placeToken = (stepIndex: number) => {
    if (placed.has(stepIndex)) return;
    const next = slots.slice();
    const empty = next.indexOf(null);
    if (empty === -1) return;
    next[empty] = stepIndex;
    setSlots(next);
  };

  const removeSlot = (slotIndex: number) => {
    if (slots[slotIndex] === null) return;
    // Remove and left-shift so the row stays contiguous.
    const filled = slots.filter((s, i) => s !== null && i !== slotIndex) as number[];
    const next: (number | null)[] = Array(slotCount).fill(null);
    filled.forEach((v, i) => (next[i] = v));
    setSlots(next);
  };

  const clear = () => setSlots(Array(slotCount).fill(null));

  const submit = () => {
    if (!allFilled) return;
    const ordered = slots.map((s) => spec.steps[s as number]) as Direction[];
    onAnswer(ordered); // Direction[]; pathJudge simulates this over the world.
  };

  const arrowSize = assist ? 40 : 34;

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        <div className="flex flex-col gap-3">
          <ConfirmAction label={copy.confirm} disabled={!allFilled} onConfirm={submit} />
          <button
            type="button"
            onClick={clear}
            disabled={placed.size === 0}
            aria-disabled={placed.size === 0}
            className={cn(
              'min-h-tap rounded-card border-2 px-4 font-brand text-sm font-semibold transition-colors',
              'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
              placed.size === 0
                ? 'cursor-not-allowed border-border text-ink-faint'
                : 'border-iq-violet/50 text-ink hover:bg-iq-violet/5'
            )}
          >
            {copy.clear}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <WorldGrid world={spec.world} />

        {/* The program row (slots) — tap a filled slot to remove it. */}
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="program steps">
          {slots.map((stepIndex, i) => (
            <button
              key={i}
              type="button"
              disabled={stepIndex === null}
              aria-disabled={stepIndex === null}
              aria-label={stepIndex === null ? `empty slot ${i + 1}` : `step ${i + 1}, tap to remove`}
              onClick={() => removeSlot(i)}
              className={cn(
                'flex items-center justify-center rounded-card border-2 transition-colors',
                'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
                stepIndex === null
                  ? 'border-dashed border-border bg-field'
                  : 'border-iq-violet bg-iq-violet/5 hover:bg-iq-violet/10'
              )}
              style={{width: 52, height: 52}}
            >
              {stepIndex !== null && (
                <DirectionArrow direction={spec.steps[stepIndex]} size={arrowSize} />
              )}
            </button>
          ))}
        </div>

        {/* The palette — tap a token to append it to the next empty slot. */}
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="available steps">
          {spec.steps.map((dir, i) => {
            const used = placed.has(i);
            return (
              <m.button
                key={i}
                type="button"
                disabled={used}
                aria-disabled={used}
                aria-label={used ? `${dir} step, placed` : `${dir} step, tap to add`}
                onClick={() => placeToken(i)}
                whileTap={reducedMotion ? undefined : {scale: 0.92}}
                className={cn(
                  'flex min-h-tap items-center justify-center rounded-card border-2 bg-card transition-all',
                  'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
                  used
                    ? 'cursor-not-allowed border-border opacity-35'
                    : 'border-border hover:-translate-y-0.5 hover:border-iq-violet/60'
                )}
                style={{width: 56, height: 56}}
              >
                <DirectionArrow direction={dir} size={arrowSize} />
              </m.button>
            );
          })}
        </div>
      </div>
    </TaskFrame>
  );
}

// ─── tap-error (ct.debug) ────────────────────────────────────────────────────

function TapErrorView({
  spec,
  copy,
  assist,
  reducedMotion,
  onAnswer
}: {
  spec: CtDebugSpec;
  copy: TaskRendererProps['copy'];
  assist: boolean;
  reducedMotion: boolean;
  onAnswer: TaskRendererProps['onAnswer'];
}) {
  const [tapped, setTapped] = useState<number | null>(null);
  const arrowSize = assist ? 40 : 34;

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        <ConfirmAction
          label={copy.confirm}
          disabled={tapped === null}
          // tap-error: answer is the step index (number); NO selectedPosition.
          onConfirm={() => tapped !== null && onAnswer(tapped)}
        />
      }
    >
      <div className="flex flex-col items-center gap-6">
        <WorldGrid world={spec.world} />

        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="program steps">
          {spec.program.map((dir, i) => {
            const isSel = tapped === i;
            return (
              <m.button
                key={i}
                type="button"
                aria-pressed={isSel}
                aria-label={`step ${i + 1}: ${dir}`}
                onClick={() => setTapped(i)}
                whileTap={reducedMotion ? undefined : {scale: 0.94}}
                className={cn(
                  'relative flex min-h-tap items-center justify-center rounded-card border-2 transition-all',
                  'focus-visible:ring-3 focus-visible:ring-iq-violet/40 focus-visible:outline-none',
                  isSel
                    ? 'border-iq-violet bg-iq-violet/5 shadow-sm'
                    : 'border-border bg-card hover:-translate-y-0.5 hover:border-iq-violet/60'
                )}
                style={{width: 56, height: 56}}
              >
                <DirectionArrow direction={dir} size={arrowSize} />
                <span
                  aria-hidden
                  className={cn(
                    'absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-iq-violet text-white transition-opacity',
                    isSel ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <X className="size-4" strokeWidth={3} />
                </span>
              </m.button>
            );
          })}
        </div>
      </div>
    </TaskFrame>
  );
}

// ─── select-one (ct.loop) ────────────────────────────────────────────────────

function LoopView({
  spec,
  copy,
  assist,
  reducedMotion,
  onAnswer
}: {
  spec: CtLoopSpec;
  copy: TaskRendererProps['copy'];
  assist: boolean;
  reducedMotion: boolean;
  onAnswer: TaskRendererProps['onAnswer'];
}) {
  const [selected, setSelected] = useState<number | null>(null);
  // Option rows can be wide (loop icon + N + body arrows) → single column.

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        <ConfirmAction
          label={copy.confirm}
          disabled={selected === null}
          onConfirm={() =>
            selected !== null && onAnswer(selected, {selectedPosition: selected})
          }
        />
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* The flat sequence under test. */}
        <div
          className="flex flex-wrap items-center justify-center gap-1.5 rounded-card border-2 border-border bg-field p-3"
          role="img"
          aria-label="sequence of steps"
        >
          {spec.sequence.map((dir, i) => (
            <DirectionArrow key={i} direction={dir} size={28} />
          ))}
        </div>

        <SelectOneGrid
          count={spec.interaction.optionCount}
          selected={selected}
          onSelect={setSelected}
          columns={2}
          assist={assist}
          optionLabel={(i) =>
            i < 0
              ? copy.instruction
              : `repeat ${spec.options[i].repeat} times: ${spec.options[i].body.join(', ')}`
          }
          renderOption={(i) => {
            const opt = spec.options[i];
            return (
              <span className="flex flex-wrap items-center justify-center gap-1.5">
                {/* repeat ×N — a language-neutral loop badge (icon + count). */}
                <span
                  className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-brand text-sm font-bold text-ink"
                  style={{backgroundColor: ACCENT, opacity: 0.95}}
                >
                  <Repeat className="size-3.5" aria-hidden strokeWidth={2.5} />
                  {opt.repeat}
                </span>
                {opt.body.map((dir, k) => (
                  <DirectionArrow key={k} direction={dir} size={24} />
                ))}
              </span>
            );
          }}
        />
      </div>
    </TaskFrame>
  );
}

// ─── select-one (ct.conditional) ─────────────────────────────────────────────

function ConditionalView({
  spec,
  copy,
  assist,
  reducedMotion,
  onAnswer
}: {
  spec: CtConditionalSpec;
  copy: TaskRendererProps['copy'];
  assist: boolean;
  reducedMotion: boolean;
  onAnswer: TaskRendererProps['onAnswer'];
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <TaskFrame
      instruction={copy.instruction}
      assist={assist}
      reducedMotion={reducedMotion}
      action={
        <ConfirmAction
          label={copy.confirm}
          disabled={selected === null}
          onConfirm={() =>
            selected !== null && onAnswer(selected, {selectedPosition: selected})
          }
        />
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* The rules: colour swatch → direction. */}
        <div className="flex flex-wrap items-center justify-center gap-3" role="img" aria-label="rules: colour maps to direction">
          {spec.rules.map((rule, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-card border-2 border-border bg-field px-2 py-1"
            >
              <ColorSwatch color={rule.color} size={24} />
              <span aria-hidden className="text-ink-soft">→</span>
              <DirectionArrow direction={rule.direction} size={26} />
            </span>
          ))}
        </div>

        {/* The inputs: colour swatches the rules run over. */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-card border-2 border-border bg-field p-3" role="img" aria-label="input colours">
          {spec.inputs.map((color, i) => (
            <ColorSwatch key={i} color={color} size={30} />
          ))}
        </div>

        <SelectOneGrid
          count={spec.interaction.optionCount}
          selected={selected}
          onSelect={setSelected}
          columns={2}
          assist={assist}
          optionLabel={(i) => (i < 0 ? copy.instruction : `option: ${spec.options[i].join(', ')}`)}
          renderOption={(i) => (
            <span className="flex flex-wrap items-center justify-center gap-1">
              {spec.options[i].map((dir, k) => (
                <DirectionArrow key={k} direction={dir} size={22} />
              ))}
            </span>
          )}
        />
      </div>
    </TaskFrame>
  );
}

/** A colour-token swatch with the brand ink outline (never colour-only — the
 * accessible name carries the colour token). */
function ColorSwatch({color, size = 28}: {color: keyof typeof COLOR_HEX; size?: number}) {
  return (
    <span
      role="img"
      aria-label={`${color} tile`}
      className="inline-block shrink-0 rounded-md"
      style={{
        width: size,
        height: size,
        backgroundColor: COLOR_HEX[color],
        border: `2px solid ${INK}`
      }}
    />
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export function CtTask({spec, copy, reducedMotion, assist, onAnswer}: TaskRendererProps) {
  const shared = {copy, assist, reducedMotion, onAnswer};
  switch (spec.taskType) {
    case 'ct.sequence':
    case 'ct.maze':
      return <OrderStepsView spec={spec as CtSequenceSpec | CtMazeSpec} {...shared} />;
    case 'ct.debug':
      return <TapErrorView spec={spec as CtDebugSpec} {...shared} />;
    case 'ct.loop':
      return <LoopView spec={spec as CtLoopSpec} {...shared} />;
    case 'ct.conditional':
      return <ConditionalView spec={spec as CtConditionalSpec} {...shared} />;
    default:
      return null;
  }
}
