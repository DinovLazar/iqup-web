import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';
import {
  ReportFlow,
  type FormCopy,
  type ResultsCopy,
  type CertificateCopy
} from '@/components/report';
import type {IndexId} from '@/lib/scoring/v2';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Form.meta'});

  return {
    title: t('title'),
    description: t('description'),
    // Behind the funnel + carries no shareable public content — keep it out of
    // search indexes (mirrors the post-test nature of this step).
    robots: {index: false, follow: false}
  };
}

/**
 * The parent report page (Phase 3.06) — the `// HANDOFF (3.06)` destination. The
 * completion screen's "continue to your report" lands here. It is a Server
 * Component shell (skip-link + header/footer, per-locale `<html lang>` from the
 * locale layout) that resolves the `Form` copy server-side and mounts the
 * `ReportFlow` client island, which reads the persisted `iqup.assessmentRun.v1`,
 * recomputes the profile client-side, captures the parent + consents, writes both
 * stores, and lands on the minimal interstitial (replaced by results in 3.09).
 *
 * Direct access without a completed run is guarded inside the island (it redirects
 * to `/test`). No PII is ever placed in the URL.
 */
export default async function ReportPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tA11y = await getTranslations({locale, namespace: 'A11y'});
  const copy = await resolveFormCopy(locale);
  const resultsCopy = await resolveResultsCopy(locale);
  const certificateCopy = await resolveCertificateCopy(locale);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-secondary-foreground"
      >
        {tA11y('skipToContent')}
      </a>
      <SiteHeader />
      <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-canvas">
        {/* Wide enough for the results' desktop two-column layout (≥880px); the
            form self-centres at max-w-md, so the capture step is unaffected. */}
        <div className="mx-auto max-w-[1080px] px-4 py-10 sm:py-14">
          <ReportFlow
            locale={locale as Locale}
            copy={copy}
            results={resultsCopy}
            certificate={certificateCopy}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Resolve the whole form's copy server-side (the island ships no i18n runtime). */
async function resolveFormCopy(locale: string): Promise<FormCopy> {
  const t = await getTranslations({locale, namespace: 'Form'});
  return {
    forParent: t('forParent'),
    heading: t('heading'),
    intro: t('intro'),
    parentName: {
      label: t('parentName.label'),
      placeholder: t('parentName.placeholder'),
      errorRequired: t('parentName.errorRequired')
    },
    email: {
      label: t('email.label'),
      placeholder: t('email.placeholder'),
      errorRequired: t('email.errorRequired'),
      errorInvalid: t('email.errorInvalid')
    },
    phone: {
      label: t('phone.label'),
      placeholder: t('phone.placeholder'),
      errorRequired: t('phone.errorRequired')
    },
    city: {
      label: t('city.label'),
      placeholder: t('city.placeholder'),
      errorRequired: t('city.errorRequired')
    },
    gender: {
      label: t('gender.label'),
      optionalHint: t('gender.optionalHint'),
      none: t('gender.none'),
      female: t('gender.female'),
      male: t('gender.male'),
      unspecified: t('gender.unspecified')
    },
    consent: {
      process: t('consent.process'),
      guardian: t('consent.guardian'),
      marketing: t('consent.marketing'),
      processError: t('consent.processError'),
      guardianError: t('consent.guardianError'),
      privacyPrefix: t('consent.privacyPrefix'),
      privacyLink: t('consent.privacyLink'),
      privacySuffix: t('consent.privacySuffix')
    },
    submit: t('submit'),
    submitting: t('submitting'),
    honeypotLabel: t('honeypotLabel'),
    privacyNote: t('privacyNote'),
    interstitial: {
      title: t('interstitial.title'),
      body: t('interstitial.body')
    }
  };
}

/** Resolve the results-screen CHROME server-side (Phase 3.09). Report CONTENT is
 *  built client-side from the recomputed profile via `buildReport` — not here. The
 *  `{age}` / `{date}` labels are read raw (placeholders intact) and interpolated in
 *  the island; everything else is a finished string. */
async function resolveResultsCopy(locale: string): Promise<ResultsCopy> {
  const t = await getTranslations({locale, namespace: 'Results'});
  return {
    eyebrow: t('eyebrow'),
    title: t('title'),
    ageLabel: String(t.raw('ageLabel')),
    generatedLabel: String(t.raw('generatedLabel')),
    heroCaption: t('heroCaption'),
    sectionIndices: t('sectionIndices'),
    sectionNoticed: t('sectionNoticed'),
    sectionCertificate: t('sectionCertificate'),
    shineKicker: t('shineKicker'),
    confidencePrefix: t('confidencePrefix'),
    solvingStyleLabel: t('solvingStyleLabel'),
    emailedHeading: t('emailedHeading'),
    emailedBody: t('emailedBody'),
    trialHeading: t('trialHeading'),
    trialBody: t('trialBody'),
    trialCta: t('trialCta'),
    certificateHeading: t('certificateHeading'),
    certificateBody: t('certificateBody'),
    validity: {
      gentleHeading: t('validity.gentleHeading'),
      caveatHeading: t('validity.caveatHeading'),
      retry: t('validity.retry')
    }
  };
}

/** Resolve the certificate CHROME server-side (Phase 3.11). The strength NAME on
 *  the certificate comes from `buildReport` (client-side); only the warm,
 *  child-facing one-liner per index lives here. */
async function resolveCertificateCopy(locale: string): Promise<CertificateCopy> {
  const t = await getTranslations({locale, namespace: 'Certificate'});
  const tDisc = await getTranslations({locale, namespace: 'Disclaimer'});
  const INDICES: IndexId[] = [
    'logical',
    'spatial',
    'memory_focus',
    'planning_speed',
    'learning_stem'
  ];
  const strengthLine = Object.fromEntries(
    INDICES.map((id) => [id, t(`strengthLine.${id}`)])
  ) as Record<IndexId, string>;

  return {
    intro: t('intro'),
    notice: tDisc('notice'),
    addName: t('addName'),
    nameLabel: t('nameLabel'),
    namePlaceholder: t('namePlaceholder'),
    namePrivacy: t('namePrivacy'),
    tag: t('tag'),
    reward: t('reward'),
    awardedTo: t('awardedTo'),
    from: t('from'),
    bibiPlaceholder: t('bibiPlaceholder'),
    bibiPlaceholderNote: t('bibiPlaceholderNote'),
    altLabel: t('altLabel'),
    download: t('download'),
    share: t('share'),
    preparing: t('preparing'),
    linkCopied: t('linkCopied'),
    shareError: t('shareError'),
    strengthLine,
    og: {
      headline: t('og.headline'),
      tagline: t('og.tagline')
    }
  };
}
