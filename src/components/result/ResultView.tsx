'use client';

import {useEffect, useMemo, useSyncExternalStore} from 'react';
import type {Locale} from '@/content/locale';
import type {StrengthCode} from '@/content/strengths';
import {useRouter} from '@/i18n/navigation';
import {
  TEST_RESULT_STORAGE_KEY,
  isTestResult,
  type TestResult
} from '@/lib/scoring';
import {
  LEAD_CONTEXT_STORAGE_KEY,
  isLeadContext,
  type LeadContext
} from '@/lib/leads/lead-context';
import {getResultCopy, fillSlots} from '@/content/results';
import {MotionProvider} from '@/components/landing/MotionProvider';
import {ResultHero} from './ResultHero';
import {StrengthsConstellation} from './StrengthsConstellation';
import {ParentNote} from './ParentNote';
import {CertificateCard} from './CertificateCard';
import {TrialInvite} from './TrialInvite';
import {CuriousMindEnding} from './CuriousMindEnding';
import {certificateStrengthList} from './certificate-model';
import type {ResultChrome} from './copy';

const subscribe = () => () => {};

/** Stable JSON snapshot of the two sessionStorage entries (read once after mount). */
function readSnapshot(): string {
  try {
    return JSON.stringify([
      window.sessionStorage.getItem(TEST_RESULT_STORAGE_KEY),
      window.sessionStorage.getItem(LEAD_CONTEXT_STORAGE_KEY)
    ]);
  } catch {
    return '[null,null]';
  }
}

function parseEntry<T>(raw: unknown, guard: (v: unknown) => v is T): T | null {
  if (typeof raw !== 'string' || raw === '') return null;
  try {
    const value: unknown = JSON.parse(raw);
    return guard(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * The real results island (Phase 1.10) — replaces `ResultPlaceholder` at the
 * `// PLUGS INTO 1.10` seam. Reads the SAME hand-off (`iqup.testResult.v1` +
 * `iqup.leadContext.v1`), preserves the direct-access guard, and renders the
 * strengths profile + certificate from the spec §6 templates. NO total, NO IQ,
 * NO score/bar/rank — anywhere.
 */
export function ResultView({locale, chrome}: {locale: Locale; chrome: ResultChrome}) {
  const router = useRouter();
  const snapshot = useSyncExternalStore<string | null>(
    subscribe,
    readSnapshot,
    () => null
  );

  const data = useMemo(() => {
    if (snapshot === null) return null;
    let entries: unknown;
    try {
      entries = JSON.parse(snapshot);
    } catch {
      return null;
    }
    if (!Array.isArray(entries)) return null;
    const result: TestResult | null = parseEntry(entries[0], isTestResult);
    const context: LeadContext | null = parseEntry(entries[1], isLeadContext);
    if (!result || !context) return null;
    return {result, context};
  }, [snapshot]);

  // Guard: /result is only reachable after the gate. Missing either piece → home.
  const missing = snapshot !== null && data === null;
  useEffect(() => {
    if (missing) router.replace('/');
  }, [missing, router]);

  if (!data) return <div className="min-h-[60vh]" aria-hidden />;

  const {result, context} = data;
  const name = context.childFirstName;
  const copy = getResultCopy(result, name, locale);
  const celebratedCodes: StrengthCode[] = [result.top1, result.top2];
  const certAlt = fillSlots(chrome.certificate.alt, {
    name,
    strengths: certificateStrengthList(celebratedCodes, locale)
  });
  const isEnding = result.band === '10-13';
  const siteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${locale === 'en' ? '/en' : ''}`
      : '';

  return (
    <MotionProvider>
      {/* ===== Playful zone (child) ===== */}
      <div
        style={{
          background:
            'radial-gradient(130% 70% at 50% -8%, var(--hero-tint) 0%, transparent 60%), var(--canvas)'
        }}
      >
        <ResultHero
          celebration={copy.kidCelebration}
          titleTemplate={chrome.hero.title}
          name={name}
          lede={chrome.hero.lede}
        />
        <StrengthsConstellation
          celebrated={copy.celebrated}
          also={copy.also}
          growing={copy.growing}
          copy={chrome.constellation}
        />
        <div className="px-4 pb-14">
          <CertificateCard
            name={name}
            celebrated={celebratedCodes}
            locale={locale}
            dateISO={context.submittedAt ?? result.completedAt}
            face={chrome.certificate.face}
            altLabel={certAlt}
            copy={chrome.certificate.card}
            shareText={copy.certificateLine}
            siteUrl={siteUrl}
          />
        </div>
      </div>

      {/* ===== Calm zone (parent) ===== */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
          <ParentNote
            eyebrow={chrome.parentsEyebrow}
            headline={copy.headline}
            celebrated={copy.celebrated}
            alsoLine={copy.alsoLine}
            growingLine={copy.growingLine}
          />
          {isEnding ? (
            <CuriousMindEnding
              heading={chrome.ending.heading}
              body={copy.closing}
              signoff={chrome.ending.signoff}
            />
          ) : (
            <TrialInvite
              locale={locale}
              band={result.band}
              intro={copy.trialIntro}
              copy={chrome.trial}
            />
          )}
        </div>
      </div>
    </MotionProvider>
  );
}
