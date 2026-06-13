/**
 * `ResultView` chrome copy — the on-screen labels/buttons resolved server-side
 * from the `Result` next-intl namespace and handed to the client island as plain
 * strings (matching the 1.06/1.08 pattern, so the island ships no translation
 * runtime). The substantive result copy comes from `@/content/results`, not here.
 */
import type {ConstellationCopy} from './StrengthsConstellation';
import type {CertificateFace} from './Certificate';
import type {CertificateCardCopy} from './CertificateCard';
import type {TrialCopy} from './TrialInvite';

export interface ResultChrome {
  hero: {
    /** Raw template "Brilliant work, {name}!" — filled client-side. */
    title: string;
    lede: string;
  };
  constellation: ConstellationCopy;
  certificate: {
    card: CertificateCardCopy;
    face: CertificateFace;
    /** Raw alt template with `{name}` + `{strengths}`. */
    alt: string;
  };
  parentsEyebrow: string;
  trial: TrialCopy;
  ending: {
    heading: string;
    signoff: string;
  };
}
