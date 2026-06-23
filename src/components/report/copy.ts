/**
 * The localized copy contract for the parent report form (Phase 3.06), resolved
 * server-side and threaded into the client island (mirrors the v1 gate `copy.ts`
 * pattern — the island ships no translation runtime).
 */
export interface FormCopy {
  /** "For the grown-up" eyebrow above the form. */
  forParent: string;
  heading: string;
  intro: string;
  parentName: {label: string; placeholder: string; errorRequired: string};
  email: {
    label: string;
    placeholder: string;
    errorRequired: string;
    errorInvalid: string;
  };
  phone: {label: string; placeholder: string; errorRequired: string};
  city: {label: string; placeholder: string; errorRequired: string};
  /** Optional child gender — a minimal value set (flagged for IqUp confirmation). */
  gender: {
    label: string;
    optionalHint: string;
    none: string;
    female: string;
    male: string;
    unspecified: string;
  };
  /** Three SEPARATE consents, none pre-ticked (2 required + 1 optional marketing). */
  consent: {
    process: string;
    guardian: string;
    marketing: string;
    processError: string;
    guardianError: string;
    privacyPrefix: string;
    privacyLink: string;
    privacySuffix: string;
  };
  submit: string;
  submitting: string;
  honeypotLabel: string;
  privacyNote: string;
  /** The minimal post-submit interstitial (3.09 replaces it with real results). */
  interstitial: {title: string; body: string};
}
