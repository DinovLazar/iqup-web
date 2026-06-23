/**
 * The localized CHROME copy for the v2 results screen (Phase 3.09) — section
 * labels, the report-emailed line, the trial-CTA + certificate-entry labels, the
 * header eyebrow/title/meta, and the validity-state chrome. Resolved server-side
 * (in `/report/page.tsx`) from the `Results` messages namespace and threaded into
 * the client island, mirroring `FormCopy` (the island ships no i18n runtime).
 *
 * This is CHROME ONLY. The report CONTENT (band words, confidence notes, overview,
 * strengths, the validity caveat sentence, disclaimer) comes from `buildReport`
 * and is NEVER duplicated here. `{age}` / `{date}` are interpolated at render.
 */
export interface ResultsCopy {
  /** Header. */
  eyebrow: string;
  title: string;
  /** "Age {age}" — `{age}` interpolated at render. */
  ageLabel: string;
  /** "Generated on {date}" — `{date}` interpolated at render. */
  generatedLabel: string;
  /** Caption under the identity pentagon (identity-not-magnitude; no "score"). */
  heroCaption: string;
  /** Section kickers. */
  sectionIndices: string;
  sectionNoticed: string;
  sectionCertificate: string;
  shineKicker: string;
  /** The neutral "Confidence" prefix on each card (the WORD comes from content). */
  confidencePrefix: string;
  /** "How they solve:" label before the solving-style sentence. */
  solvingStyleLabel: string;
  /** Report-emailed confirmation strip. */
  emailedHeading: string;
  emailedBody: string;
  /** Trial CTA. */
  trialHeading: string;
  trialBody: string;
  trialCta: string;
  /** Certificate entry affordance. */
  certificateHeading: string;
  certificateBody: string;
  /** Validity-state chrome (the body sentence itself comes from the engine note). */
  validity: {
    gentleHeading: string;
    caveatHeading: string;
    retry: string;
  };
}
