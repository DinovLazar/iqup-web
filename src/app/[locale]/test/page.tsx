import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/content/locale';
import {AGES, BANDS, getBandForAge} from '@/lib/bands';
import {AgeStart, type AgeStartProps} from '@/components/landing/AgeStart';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {Card} from '@/components/ui/card';
import {TestRunner} from '@/components/test/TestRunner';
import type {TestCopy} from '@/components/test/copy';
import type {GateCopy} from '@/components/gate/copy';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Test.meta'});
  const canonical = locale === 'en' ? '/en/test' : '/test';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {mk: '/test', en: '/en/test', 'x-default': '/test'}
    },
    openGraph: {
      type: 'website',
      siteName: 'IqUp',
      title: t('title'),
      description: t('description'),
      url: canonical,
      locale: locale === 'en' ? 'en_US' : 'mk_MK'
    }
  };
}

function readAge(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw != null && raw.trim() !== '' ? Number(raw) : Number.NaN;
}

export default async function TestPage({params, searchParams}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const loc = locale as Locale;
  const age = readAge(sp.age);
  const band = getBandForAge(age);

  // Dev preview is gated to non-production AND an explicit ?dev=1 — a no-op in prod.
  const devParam = Array.isArray(sp.dev) ? sp.dev[0] : sp.dev;
  const dev =
    process.env.NODE_ENV !== 'production' &&
    (devParam === '1' || devParam === 'true');

  const tA11y = await getTranslations({locale, namespace: 'A11y'});

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
        {band ? (
          <TestRunner
            band={band}
            bandLabel={await bandLabel(locale, band)}
            age={age}
            locale={loc}
            copy={await resolveCopy(locale)}
            gateCopy={await resolveGateCopy(locale)}
            dev={dev}
          />
        ) : (
          <AgePickerFallback locale={locale} />
        )}
      </main>
    </>
  );
}

/** Resolve the runner's chrome copy server-side (templated strings via `.raw`). */
async function resolveCopy(locale: string): Promise<TestCopy> {
  const t = await getTranslations({locale, namespace: 'Test'});
  return {
    start: {
      title: t('start.title'),
      subtitle: t('start.subtitle'),
      metaCount: t.raw('start.metaCount'),
      metaTime: t('start.metaTime'),
      cta: t('start.cta')
    },
    progress: t.raw('progress'),
    progressAria: t.raw('progressAria'),
    back: t('back'),
    next: t('next'),
    finish: t('finish'),
    reveal: {
      title: t('reveal.title'),
      intro: t('reveal.intro'),
      ready: t('reveal.ready'),
      show: t('reveal.show'),
      watching: t('reveal.watching'),
      hide: t('reveal.hide')
    }
  };
}

/** Resolve the email-gate copy server-side (templated `preview` via `.raw`). */
async function resolveGateCopy(locale: string): Promise<GateCopy> {
  const t = await getTranslations({locale, namespace: 'Gate'});
  return {
    forParent: t('forParent'),
    heading: t('heading'),
    intro: t('intro'),
    preview: t.raw('preview'),
    email: {
      label: t('email.label'),
      placeholder: t('email.placeholder'),
      errorRequired: t('email.errorRequired'),
      errorInvalid: t('email.errorInvalid')
    },
    childName: {
      label: t('childName.label'),
      placeholder: t('childName.placeholder'),
      errorRequired: t('childName.errorRequired'),
      errorTooLong: t('childName.errorTooLong')
    },
    consent: {
      label: t('consent.label'),
      error: t('consent.error')
    },
    marketing: {
      label: t('marketing.label')
    },
    privacyNote: t('privacyNote'),
    submit: t('submit'),
    submitting: t('submitting'),
    error: t('error'),
    honeypotLabel: t('honeypotLabel')
  };
}

async function bandLabel(locale: string, band: string): Promise<string> {
  const t = await getTranslations({locale, namespace: 'Landing.age'});
  return t(`bands.${band}`);
}

/**
 * Robust direct-visit fallback: no/invalid `?age` → show the same band-aware age
 * picker as the landing (reusing `AgeStart`), which links back to `/test?age=N`.
 */
async function AgePickerFallback({locale}: {locale: string}) {
  const tTest = await getTranslations({locale, namespace: 'Test.age'});
  const tAge = await getTranslations({locale, namespace: 'Landing.age'});

  const ageProps: AgeStartProps = {
    labels: {
      question: tAge('question'),
      hint: tAge('hint'),
      start: tAge('start'),
      startHint: tAge('startHint'),
      noSignup: tAge('noSignup')
    },
    bands: BANDS.map((b) => ({
      key: b.key,
      label: tAge(`bands.${b.key}`),
      ages: AGES.filter((a) => a >= b.minAge && a <= b.maxAge).map((a) => ({
        value: a,
        ariaLabel: tAge('ariaAge', {age: a})
      }))
    }))
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink text-balance">
        {tTest('title')}
      </h1>
      <p className="mt-2 text-ink-soft">{tTest('lead')}</p>
      <Card className="mt-6 p-5 sm:p-6">
        <AgeStart {...ageProps} />
      </Card>
    </div>
  );
}
