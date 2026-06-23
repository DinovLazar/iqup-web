/**
 * Report module-library types (spec Дел 9.2 / Прилог C — the v2 report).
 *
 * This module owns the localised CONTENT the deterministic report engine
 * (`@/lib/report`) assembles into a parent-facing `ReportContent`. It is data
 * only: no assembly logic, no psychometrics. Cognitive derivations come from the
 * `CognitiveProfile` (`@/lib/scoring/v2`); this layer maps the profile's stable
 * enums + features to warm, no-number prose.
 *
 * HARD RULE (project guardrail + spec 1.1 / 6.4): no user-facing string here may
 * contain a digit, `%`, "IQ", "score", "rank", "level N", "below average",
 * "weak", or any clinical / diagnostic term, in EITHER locale. Bands surface only
 * as the approved display WORDS; confidence only as the high/medium/low words +
 * a plain-language note. Growth areas are always "room to grow", never deficits.
 * Enforced, non-vacuously, by `report-content.test.ts`.
 *
 * All MK copy is PROVISIONAL — drafted for the native-Macedonian reviewer; EN is
 * the mirror and must stay equivalent with exact key parity.
 */
import type {Localized} from '@/content/locale';
import type {AgeCluster} from '@/lib/engine/types';
import type {Band, Confidence, IndexId, SolvingStyle} from '@/lib/scoring/v2';

/** A titled block of parent-facing prose (an activity, a positioning note, …). */
export interface TitledCopy {
  readonly title: Localized;
  readonly body: Localized;
}

/** The band → display-WORD mapping (spec 6.4). Lives in content; 3.03 keeps the
 *  band enum word-free. Never a number or a range — the word only. */
export type BandWords = Readonly<Record<Band, Localized>>;

/** The confidence → display-word + plain-language note (spec 6.5). */
export interface ConfidenceCopy {
  /** The single approved word (High / Medium / Low), localised. */
  readonly word: Localized;
  /** A plain-language sentence about what that confidence means for the reading. */
  readonly note: Localized;
}
export type ConfidenceWords = Readonly<Record<Confidence, ConfidenceCopy>>;

/** Per-index copy: the parent-facing name, the as-strength body, the as-growth
 *  body + a supporting activity sentence (spec 9.2 module families 1–2). */
export interface IndexCopy {
  /** Parent-facing index name (e.g. "Logical reasoning"). */
  readonly name: Localized;
  /** As the standout strength — what it looks like in a child (warm, concrete). */
  readonly strength: Localized;
  /** As the growth area — kind framing: what it means + how it shows up. */
  readonly growth: Localized;
  /** A short supporting "try this" line that rides with the growth area. */
  readonly growthActivity: Localized;
}
export type IndexCopyTable = Readonly<Record<IndexId, IndexCopy>>;

/** Profile-shape sentence (spec feature: flat / spiky). */
export type ProfileShapeCopy = Readonly<Record<'flat' | 'spiky', Localized>>;

/** Solving-style sentence (spec 9.5 — observed, never a speculative trait). */
export type SolvingStyleCopy = Readonly<Record<SolvingStyle, Localized>>;

/** Learning-trajectory copy bucket (spec feature: the Glr slope, framed kindly). */
export type LearningSlopeBucket = 'fast' | 'steady' | 'repetition';
export type LearningSlopeCopy = Readonly<Record<LearningSlopeBucket, Localized>>;

/** The ceiling / floor extreme notes (spec 6.5 / 7.3). */
export interface ExtremesCopy {
  /** Positive: "reached the top of this test for the age — ready for more". */
  readonly ceiling: Localized;
  /** Gentle: "the tasks were new for the moment" — never "failed/below average". */
  readonly floor: Localized;
}

/** STEM-bridge variant by which STEM-relevant strengths are present (spec 9). */
export type StemBridgeVariant =
  | 'spatial_logical' // both spatial + logical strong → the full bridge
  | 'computational' // learning_stem (CT) strong → name computational thinking
  | 'single' // one STEM-relevant strength present
  | 'emerging'; // none yet strong → gentle "building blocks" framing
export interface StemCopy {
  /** The STEM-readiness intro (shared). */
  readonly intro: Localized;
  /** The bridge sentence, by variant — connects the strengths to coding/robotics. */
  readonly bridge: Readonly<Record<StemBridgeVariant, Localized>>;
}

/** Index-pair narration (spec feature: meaningful pairings). */
export type IndexPairVariant =
  | 'spatial_logical' // a STEM-leaning combination
  | 'memory_planning' // a steady, organised-working-memory combination
  | 'generic_strong'; // any other strong pair
export type IndexPairCopy = Readonly<Record<IndexPairVariant, Localized>>;

/** The home-activity bank, keyed by (index, age-cluster) (spec 9.2, family 8 —
 *  the largest content block). 2+ activities per cell; the engine draws some. */
export type ActivityBank = Readonly<
  Record<IndexId, Readonly<Record<AgeCluster, readonly TitledCopy[]>>>
>;

/** An IqUp program (spec Дел 11 / brand.md §2). Age→program mapping is data. */
export type ProgramId = 'magic_lab' | 'magic_lab_plus' | 'oliver' | 'oliver_plus';
export interface ProgramCopy {
  readonly id: ProgramId;
  /** Display name, per locale (the real IqUp program name). */
  readonly name: Localized;
}

/** The IqUp positioning + CTA copy (spec 9 / 11). */
export interface IqupCopy {
  /** The expert positioning paragraph (brand voice, plain, no lesson narration). */
  readonly positioning: Localized;
  /** The age→program "natural next step" line. `{program}` is filled by assembly. */
  readonly programFit: Localized;
  /** The demo-class CTA line (city is carried via the booking-URL seam). */
  readonly demoCta: Localized;
}

/** The honest disclaimer (spec 6.4) — flagged for IqUp legal. */
export interface DisclaimerCopy {
  /** Indicative cognitive profile, NOT clinical / diagnostic. */
  readonly body: Localized;
  /** The explicit honesty that the norms are provisional / a starting point. */
  readonly provisional: Localized;
}

/** Validity-treatment notes (spec 7.1). */
export type ValidityNotes = Readonly<{
  /** Mild flag(s) → a soft confidence note added to a normal report. */
  gentle_note: Localized;
  /** Strong flag(s) → the clearly-caveated variant's lead caveat. */
  not_representative: Localized;
}>;
