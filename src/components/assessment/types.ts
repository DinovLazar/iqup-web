/**
 * Shared types + the index/domain mapping for the live v2 assessment flow (Phase
 * 3.05). The flow drives the 3.03 engine (`createDomainController`) over the 3.04
 * item bank and renders each `TaskSpec` (the content-spec the generators emit).
 *
 * No scoring or engine logic lives here — this layer renders the engine and
 * captures exactly the telemetry the scoring + validity layers consume. The
 * five parent-facing index-regions of the progress brain roll up from the seven
 * measured task-domains per the mapping below (phase prompt §"Index ↔ task-domain
 * mapping"). The order matches the engine's canonical `DOMAINS` order.
 */
import type {Domain} from '@/lib/engine/types';
import type {TaskSpec} from '@/content/tasks/types';

/** The five parent-facing index-regions (the assembled puzzle-brain pieces). */
export type IndexRegion = 'logical' | 'spatial' | 'memory' | 'planning' | 'learning';

/** Region ids in the visual order the brain assembles (spec Дел 6 / brand §6). */
export const INDEX_REGIONS: readonly IndexRegion[] = [
  'logical',
  'spatial',
  'memory',
  'planning',
  'learning'
];

/**
 * Which task-domains contribute to each index-region. A region fills only when
 * **all** of its contributing domains are complete (phase prompt). Attention is
 * derived in scoring — it has no task and no region of its own (it folds into
 * Memory & focus via Gsm).
 */
export const REGION_DOMAINS: Record<IndexRegion, readonly Domain[]> = {
  logical: ['Gf'],
  spatial: ['Gv'],
  memory: ['Gsm'],
  planning: ['EF', 'Gs'],
  learning: ['CT', 'Glr']
};

/**
 * The brand-hue each region paints with (brand §6 / Прилог G), as LITERAL hex.
 * The `--index-*` / `--iq-*` tokens live in Tailwind's `@theme inline` (their
 * values are inlined into utility classes, NOT emitted as raw `:root` custom
 * properties), so `var(--index-*)` does not resolve inside SVG `fill` / inline
 * styles — bespoke SVG must use the hex directly.
 */
export const REGION_HEX: Record<IndexRegion, string> = {
  logical: '#ec008c', // magenta
  spatial: '#00b6f1', // blue
  memory: '#00b9ad', // teal
  planning: '#f7941d', // orange
  learning: '#ffc20e' // yellow
};

/** Reverse lookup: the region a single domain rolls up into. */
export const DOMAIN_REGION: Record<Domain, IndexRegion> = {
  Gf: 'logical',
  Gv: 'spatial',
  Gsm: 'memory',
  Gs: 'planning',
  EF: 'planning',
  Glr: 'learning',
  CT: 'learning'
};

/**
 * The high-level phases of the live flow. `setup` collects the age; `assist`
 * gates the 5–7 band; `practice` shows the unscored example before each new
 * task-domain (the first also calibrates the device); `task` runs the adaptive
 * items; `complete` shows the reward; `retry` is the not-representative outcome.
 */
export type FlowPhase =
  | 'setup'
  | 'assist'
  | 'practice'
  | 'task'
  | 'complete'
  | 'retry';

/**
 * The localized copy a single task renderer needs: the instruction line keyed by
 * `taskType`, plus the shared action labels. Resolved server-side and threaded
 * down so the interactive island ships no translation runtime (mirrors the v1
 * `TestCopy` pattern).
 */
export interface TaskRendererCopy {
  /** The per-`taskType` instruction sentence (child-facing, friendly). */
  instruction: string;
  /** "Confirm" / "Done" — submits the current answer. */
  confirm: string;
  /** "Clear" / "Start over" — resets an in-progress arrange/build answer. */
  clear: string;
  /** Corsi reveal chrome (show → hide → repeat) + reduced-motion manual path. */
  reveal: {
    watch: string;
    showButton: string;
    ready: string;
    yourTurn: string;
  };
  /** Gs visible-countdown chrome. */
  timer: {
    label: string;
    timeUp: string;
  };
  /** Tower-of-London move chrome. */
  tower: {
    movesLabel: string;
    goalLabel: string;
  };
}

/**
 * What a task renderer is handed: the typed content spec, the localized copy, a
 * `reducedMotion` flag (drives the Gsm manual reveal + still visuals), the
 * `assist` flag (5–7 larger-text / slower mode), and the `onAnswer` callback the
 * renderer calls with the child's `Response.answer` plus the per-item telemetry
 * the scoring/validity layers read.
 */
export interface TaskRendererProps {
  spec: TaskSpec;
  copy: TaskRendererCopy;
  reducedMotion: boolean;
  assist: boolean;
  /**
   * Report the child's answer. `answer` is the canonical `Response.answer` for
   * the spec's `interaction.mode`; the extra fields are the telemetry the
   * orchestrator folds into the engine `Response` (selected position for the
   * same-position flag, tapped-cell count for Gs smearing, omitted for a
   * time-out). Response time + idle are captured by the orchestrator's timer.
   */
  onAnswer: (answer: unknown, telemetry?: AnswerTelemetry) => void;
}

/** Per-item telemetry a renderer supplies alongside the answer. */
export interface AnswerTelemetry {
  /** 0-based chosen option position (select-one / tap-error) → same-position flag. */
  selectedPosition?: number;
  /** Gs only: how many cells the child tapped in total → speed-gaming flag. */
  tappedCells?: number;
  /** True if the item timed out / was skipped (an omission). */
  omitted?: boolean;
}
