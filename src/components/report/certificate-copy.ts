/**
 * The localized CHROME copy for the v2 shareable certificate (Phase 3.11) —
 * resolved server-side (in `/report/page.tsx`) from the `Certificate` messages
 * namespace and threaded into the client island, mirroring `ResultsCopy` /
 * `FormCopy` (the island ships no i18n runtime).
 *
 * This is CHROME ONLY. The strength NAME shown on the certificate comes from
 * `ReportContent.topStrength.name` (`buildReport`) and is NEVER duplicated here;
 * only the warm, child-facing one-liner per index lives in `strengthLine`.
 *
 * HONESTY: no number / % / score / IQ / rank / band word in any value (the brand
 * "IQ UP!" wordmark is rendered as structural markup, not a string here). No
 * literal digit either — the keepsake date is computed from `meta.generatedDate`.
 */
import type {IndexId} from '@/lib/scoring/v2';

export interface CertificateCopy {
  /** The panel intro paragraph under the section heading. */
  intro: string;
  /** The opt-in toggle label ("add your child's name", off by default). */
  addName: string;
  /** The on-device-only name field label. */
  nameLabel: string;
  /** The name field placeholder. */
  namePlaceholder: string;
  /** The "stays on this device" privacy note next to the field. */
  namePrivacy: string;
  /** The small "Certificate" tag in the artwork header. */
  tag: string;
  /** The big reward word ("Explorer" / "Истражувач") under the wordmark. */
  reward: string;
  /** "Awarded to" — shown only when a name is added. */
  awardedTo: string;
  /** The brand sign-off line in the footer ("From the world of Bibi · IqUp"). */
  from: string;
  /** The Bibi-placeholder label (also the box's accessible name until art lands). */
  bibiPlaceholder: string;
  /** The Bibi-placeholder sub-note ("licensed illustration drops in later"). */
  bibiPlaceholderNote: string;
  /** The generic, name-free `aria-label` for the certificate image. */
  altLabel: string;
  /** Action labels. */
  download: string;
  share: string;
  preparing: string;
  linkCopied: string;
  shareError: string;
  /** The warm, child-facing top-strength line, keyed by the real index id. */
  strengthLine: Record<IndexId, string>;
  /** The dedicated share OG image copy (generic + name-free). */
  og: {
    headline: string;
    tagline: string;
  };
}
