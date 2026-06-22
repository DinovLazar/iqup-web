/**
 * Shared generator utilities: deterministic item ids, equality helpers used by
 * `judge`, and the generic correct/wrong answer oracle the tests + the
 * end-to-end session driver use against REAL items.
 *
 * The oracle keys off `interaction.mode` (never the domain), so it works for any
 * spec that follows the `solution.answer = canonical correct Response.answer`
 * convention in `types.ts`. This is how a "perfect" and a "definitely-wrong"
 * responder are built without the test hard-coding each task's internals.
 */
import {nextInt, type Rng} from '@/lib/engine/prng';
import type {Item} from '@/lib/engine/types';
import type {PegState, TaskSpec, TaskType} from './types';

/**
 * A deterministic, session-unique item id: `<taskType>-L<level>-<format>-<tag>`,
 * where `tag` is drawn from the item's PRNG stream (so two items at the same
 * level still differ, and the id is reproducible for a given seed).
 */
export function itemId(taskType: TaskType, level: number, format: string, rng: Rng): string {
  return `${taskType}-L${level}-${format}-${nextInt(rng, 0, 0xffffff).toString(16)}`;
}

/** Element-wise array equality (numbers / strings). */
export function arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Deep equality for a Tower-of-London peg configuration. */
export function pegStateEquals(a: PegState[], b: PegState[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((peg, i) => arraysEqual(peg, b[i]));
}

/** Read a generated item's content spec (typed). */
export function specOf(item: Item): TaskSpec {
  return item.payload as TaskSpec;
}

/** The canonical fully-correct `Response.answer` for any generated item. */
export function correctAnswerFor(item: Item): unknown {
  return specOf(item).solution.answer;
}

/**
 * A definitely-wrong `Response.answer` for any generated item, derived generically
 * from its `interaction.mode`. Used to drive the "wrong" path in tests + the
 * end-to-end session check. Guaranteed to be judged incorrect.
 */
export function wrongAnswerFor(item: Item): unknown {
  const spec = specOf(item);
  const {interaction} = spec;
  switch (interaction.mode) {
    case 'select-one':
      return ((spec.solution.answer as number) + 1) % interaction.optionCount;
    case 'tap-error':
      return ((spec.solution.answer as number) + 1) % interaction.stepCount;
    case 'tap-sequence':
    case 'multi-tap-timed':
    case 'order-steps':
      // An empty response reproduces/finds/walks nothing → never the target.
      return [];
    case 'move-balls': {
      // Don't move: the start state is never the goal (generators guarantee it).
      const tower = spec as Extract<TaskSpec, {taskType: 'ef.towerOfLondon'}>;
      return {finalState: tower.start.map((p) => p.slice()), moves: 0};
    }
    case 'match-pairs': {
      const glr = spec as Extract<TaskSpec, {taskType: 'glr.pairedAssociate'}>;
      // For each trial pick an option that is NOT the correct target.
      return glr.trials.map((trial, i) => {
        const correct = glr.solution.answer[i];
        return trial.options.find((o) => o !== correct) ?? correct;
      });
    }
  }
}
