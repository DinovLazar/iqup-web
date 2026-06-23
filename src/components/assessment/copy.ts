/**
 * The localized copy contract for the whole live flow, resolved server-side and
 * threaded into the client island (mirrors the v1 `components/test/copy.ts`
 * pattern — the island ships no translation runtime). Every human-readable string
 * the flow shows lives here; the visual tasks themselves are language-neutral
 * (the item bank emits no text), so only instructions + chrome are localized.
 */
import type {TaskType} from '@/content/tasks';
import type {IndexRegion, TaskRendererCopy} from './types';

export interface AssessmentCopy {
  /** Age setup — the child's exact age (5–13), no name. */
  setup: {
    title: string;
    lead: string;
    ageQuestion: string;
    ageHint: string;
    start: string;
    /** ICU `{age}` aria template for an age button. */
    ariaAge: string;
  };
  /** 5–7 parent-assist gate (technical-help-only + checkbox). */
  assist: {
    forParent: string;
    title: string;
    body: string;
    rules: string[];
    checkbox: string;
    confirm: string;
  };
  /** Practice / example screen (first one calibrates the device). */
  practice: {
    label: string;
    title: string;
    intro: string;
    ready: string;
    calibrationTitle: string;
    calibrationIntro: string;
    tapHere: string;
    calibrating: string;
  };
  /** The puzzle-brain progress motif chrome (no numbers). */
  brain: {
    title: string;
    doneWord: string;
    regions: Record<IndexRegion, string>;
  };
  /** Completion + the child reward badge. */
  complete: {
    title: string;
    body: string;
    badgeName: string;
    badgeTagline: string;
    continue: string;
    /** Shown when validity outcome is `gentle_note` (mild flag carried forward). */
    gentleNote: string;
  };
  /** Not-representative outcome (strong flag) + retry. */
  retry: {
    title: string;
    body: string;
    button: string;
  };
  /** Shared task chrome (confirm/clear/reveal/timer/tower). */
  task: {
    confirm: string;
    clear: string;
    reveal: {watch: string; showButton: string; ready: string; yourTurn: string};
    timer: {label: string; timeUp: string};
    tower: {movesLabel: string; goalLabel: string};
  };
  /** Per-`taskType` instruction sentence (the i18n key IS the taskType). */
  instructions: Record<TaskType, string>;
}

/** Build the per-renderer copy slice for a given task type. */
export function rendererCopy(copy: AssessmentCopy, taskType: TaskType): TaskRendererCopy {
  return {
    instruction: copy.instructions[taskType],
    confirm: copy.task.confirm,
    clear: copy.task.clear,
    reveal: copy.task.reveal,
    timer: copy.task.timer,
    tower: copy.task.tower
  };
}
