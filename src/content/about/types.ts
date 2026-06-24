/**
 * About-the-test content types (Phase 3.14).
 *
 * The substantive prose lives as structured, typed bilingual content
 * (`mk.ts` / `en.ts`) so the page renders real semantic HTML (sections,
 * paragraphs, lists) and a parity test can assert MK↔EN structural equivalence.
 * The on-screen chrome (page title, lead, the honest notice, the CTA) lives in
 * the `About` next-intl namespace, not here — exactly as `/privacy` splits content
 * (`content/privacy`) from chrome (the `Privacy` namespace).
 *
 * HARD RULE (project guardrail): no string here may introduce a number, %, score /
 * IQ word, rank, "level N", "below average", "weak", or clinical/diagnostic
 * vocabulary. The clinical/IQ/diagnosis NEGATION is delivered by the shared
 * honest-framing notice (the `Disclaimer` namespace), never authored into this
 * content. Enforced by `about.test.ts`.
 *
 * PROVISIONAL: all MK copy is provisional pending native-MK review.
 */

/** A single rendered block inside an About section. */
export type AboutBlock =
  | {kind: 'p'; text: string}
  | {kind: 'list'; items: string[]};

/** One About section: stable language-neutral id, localized heading + blocks. */
export type AboutSection = {
  /** Stable, language-neutral anchor id (e.g. `what-it-is`). */
  id: string;
  heading: string;
  blocks: AboutBlock[];
  /**
   * When true, the shared honest-framing notice (the `Disclaimer` namespace) is
   * rendered at the end of this section — the "lean on the shared notice" point
   * (the "what it isn't" section). The notice text is NOT stored here.
   */
  withNotice?: boolean;
};

/** The full per-locale About content. */
export type AboutContent = {
  sections: AboutSection[];
};
