import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {SiteHeader} from '@/components/landing/SiteHeader';
import {AssessmentFlow, type AssessmentCopy} from '@/components/assessment';
import type {Locale} from '@/content/locale';
import type {TaskType} from '@/content/tasks';

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

function readAge(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw.trim() === '') return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 5 && n <= 13 ? n : undefined;
}

const TASK_TYPES: readonly TaskType[] = [
  'gf.matrix',
  'gf.series',
  'gv.rotation',
  'gsm.corsi',
  'gs.symbolSearch',
  'ef.towerOfLondon',
  'glr.pairedAssociate',
  'ct.sequence',
  'ct.debug',
  'ct.loop',
  'ct.conditional',
  'ct.maze'
];

/**
 * The `/test` route is now the **v2 assessment** (Phase 3.05). It supersedes the
 * v1 `TestRunner`, which is left intact but no longer mounted here (its files,
 * `/result`, gate, and email code stay until their v2 replacements land — see
 * Compatibility). The age is read from `?age=N` (the landing's age picker links
 * here); a missing/invalid age falls back to the flow's own age-setup screen.
 */
export default async function TestPage({params, searchParams}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const initialAge = readAge(sp.age);

  // Dev preview is gated to non-production AND an explicit ?dev=1 — a no-op in prod.
  const devParam = Array.isArray(sp.dev) ? sp.dev[0] : sp.dev;
  const dev =
    process.env.NODE_ENV !== 'production' && (devParam === '1' || devParam === 'true');

  const tA11y = await getTranslations({locale, namespace: 'A11y'});
  const copy = await resolveAssessmentCopy(locale);

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
        <AssessmentFlow
          copy={copy}
          locale={locale as Locale}
          initialAge={initialAge}
          dev={dev}
        />
      </main>
    </>
  );
}

/** Resolve the whole flow's copy server-side (the island ships no i18n runtime). */
async function resolveAssessmentCopy(locale: string): Promise<AssessmentCopy> {
  const t = await getTranslations({locale, namespace: 'Assessment'});
  const instructions = Object.fromEntries(
    TASK_TYPES.map((tt) => [tt, t(`instructions.${tt}`)])
  ) as Record<TaskType, string>;

  return {
    setup: {
      title: t('setup.title'),
      lead: t('setup.lead'),
      ageQuestion: t('setup.ageQuestion'),
      ageHint: t('setup.ageHint'),
      start: t('setup.start'),
      // Raw template — the `{age}` token is filled client-side in AgeSetup.
      ariaAge: t.raw('setup.ariaAge') as string
    },
    assist: {
      forParent: t('assist.forParent'),
      title: t('assist.title'),
      body: t('assist.body'),
      rules: t.raw('assist.rules') as string[],
      checkbox: t('assist.checkbox'),
      confirm: t('assist.confirm')
    },
    practice: {
      label: t('practice.label'),
      title: t('practice.title'),
      intro: t('practice.intro'),
      ready: t('practice.ready'),
      calibrationTitle: t('practice.calibrationTitle'),
      calibrationIntro: t('practice.calibrationIntro'),
      tapHere: t('practice.tapHere'),
      calibrating: t('practice.calibrating')
    },
    brain: {
      title: t('brain.title'),
      doneWord: t('brain.doneWord'),
      regions: {
        logical: t('brain.regions.logical'),
        spatial: t('brain.regions.spatial'),
        memory: t('brain.regions.memory'),
        planning: t('brain.regions.planning'),
        learning: t('brain.regions.learning')
      }
    },
    complete: {
      title: t('complete.title'),
      body: t('complete.body'),
      badgeName: t('complete.badgeName'),
      badgeTagline: t('complete.badgeTagline'),
      continue: t('complete.continue'),
      gentleNote: t('complete.gentleNote')
    },
    retry: {
      title: t('retry.title'),
      body: t('retry.body'),
      button: t('retry.button')
    },
    task: {
      confirm: t('task.confirm'),
      clear: t('task.clear'),
      reveal: {
        watch: t('task.reveal.watch'),
        showButton: t('task.reveal.showButton'),
        ready: t('task.reveal.ready'),
        yourTurn: t('task.reveal.yourTurn')
      },
      timer: {
        label: t('task.timer.label'),
        timeUp: t('task.timer.timeUp')
      },
      tower: {
        movesLabel: t('task.tower.movesLabel'),
        goalLabel: t('task.tower.goalLabel')
      }
    },
    instructions
  };
}
