import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {SiteFooter} from '@/components/landing/SiteFooter';
import {ReportFlow, type FormCopy} from '@/components/report';

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
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
          <ReportFlow locale={locale as Locale} copy={copy} />
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
