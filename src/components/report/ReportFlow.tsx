'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent
} from 'react';
import {Loader2, Lock, Sparkles} from 'lucide-react';
import type {Locale} from '@/content/locale';
import {Link, useRouter} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {CENTERS} from '@/content/centers';
import {buildProfile} from '@/lib/scoring/v2';
import {
  ASSESSMENT_RESULT_STORAGE_KEY,
  type AssessmentHandoff
} from '@/components/assessment/session';
import {buildAnonymousScore, type ScoreGender} from '@/lib/scores/anonymous-score';
import {submitAssessment} from '@/lib/leads/submit-assessment';
import {writeLeadContextV2} from '@/lib/leads/lead-context-v2';
import type {FormCopy} from './copy';

/** No-op subscribe: the persisted run is read once after mount, never mutated. */
const subscribe = () => () => {};

/**
 * Stable raw snapshot of the persisted hand-off (the repo's SSR-safe idiom). The
 * client snapshot is ALWAYS a non-null string (`''` when absent) so a resolved-but-
 * absent run is distinguishable from the pre-hydration server snapshot (`null`).
 */
function readRawHandoff(): string {
  try {
    return window.sessionStorage.getItem(ASSESSMENT_RESULT_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Mirror of the schema's email rule for instant client feedback (server re-checks). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 80;

type GenderValue = '' | ScoreGender;

type FieldErrors = {
  parentName?: string;
  email?: string;
  phone?: string;
  city?: string;
  consentProcess?: string;
  consentGuardian?: string;
};

/**
 * The parent report form (Phase 3.06) — the single capture point, mounted at
 * `/report` after the completion badge (the `// HANDOFF (3.06)` seam). It reads the
 * persisted `iqup.assessmentRun.v1`, recomputes the `CognitiveProfile` CLIENT-SIDE
 * (so results never depend on a server write), collects the parent's contact +
 * three separate consents, then submits both stores via one server action.
 *
 * On submit it persists the v2 lead-context for 3.09 and lands on a minimal
 * interstitial. Results ALWAYS reveal — the form never traps the parent on a write
 * failure. No child name is collected anywhere; nothing PII touches the URL.
 */
export function ReportFlow({locale, copy}: {locale: Locale; copy: FormCopy}) {
  const router = useRouter();
  const uid = useId();

  // — Read the persisted run + recompute the profile client-side (the source of
  // truth for results; independent of any server write). `useSyncExternalStore`
  // with a null server snapshot is the repo's SSR-safe idiom: the first paint
  // matches the static shell (null), then the client snapshot resolves. —
  const raw = useSyncExternalStore<string | null>(
    subscribe,
    readRawHandoff,
    () => null
  );
  const profile = useMemo(() => {
    if (!raw) return null;
    try {
      const handoff = JSON.parse(raw) as AssessmentHandoff;
      return buildProfile(handoff.run);
    } catch {
      return null;
    }
  }, [raw]);

  const [step, setStep] = useState<'form' | 'done'>('form');

  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<GenderValue>('');
  const [consentProcess, setConsentProcess] = useState(false);
  const [consentGuardian, setConsentGuardian] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');

  const parentNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLSelectElement>(null);

  // Defensive guard: never render the form without a valid run — send the parent
  // back to the assessment. `raw === null` is the pre-hydration server snapshot
  // (do nothing); a resolved-but-absent/corrupt run (`raw` set, no profile) means
  // there is nothing to capture against → redirect. Mirrors ResultView's guard.
  const missing = raw !== null && profile === null;
  useEffect(() => {
    if (missing) router.replace('/test');
  }, [missing, router]);

  const submitting = status === 'submitting';

  if (!profile) return <div className="min-h-[60vh]" aria-hidden />;
  const safeProfile = profile;

  if (step === 'done') {
    // HANDOFF (3.09): the results reveal replaces this interstitial. It will read
    // the persisted run (`iqup.assessmentRun.v1`) + `iqup.leadContext.v2` and
    // recompute the profile CLIENT-SIDE — no server round-trip, no score in the URL.
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-secondary-tint">
          <Sparkles className="size-8 text-secondary-ink" aria-hidden />
        </span>
        <h1 className="font-brand text-2xl font-extrabold text-balance text-ink">
          {copy.interstitial.title}
        </h1>
        <p className="text-pretty text-ink-soft">{copy.interstitial.body}</p>
      </div>
    );
  }

  const ids = {
    parentName: `${uid}-parent`,
    parentNameErr: `${uid}-parent-err`,
    email: `${uid}-email`,
    emailErr: `${uid}-email-err`,
    phone: `${uid}-phone`,
    phoneErr: `${uid}-phone-err`,
    city: `${uid}-city`,
    cityErr: `${uid}-city-err`,
    gender: `${uid}-gender`,
    genderHint: `${uid}-gender-hint`,
    consentProcess: `${uid}-consent-process`,
    consentProcessErr: `${uid}-consent-process-err`,
    consentGuardian: `${uid}-consent-guardian`,
    consentGuardianErr: `${uid}-consent-guardian-err`,
    marketing: `${uid}-marketing`,
    honeypot: `${uid}-company`
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextName = parentName.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();
    const next: FieldErrors = {};

    if (!nextName) next.parentName = copy.parentName.errorRequired;
    if (!nextEmail) next.email = copy.email.errorRequired;
    else if (!EMAIL_RE.test(nextEmail)) next.email = copy.email.errorInvalid;
    if (!nextPhone) next.phone = copy.phone.errorRequired;
    if (!city) next.city = copy.city.errorRequired;
    if (!consentProcess) next.consentProcess = copy.consent.processError;
    if (!consentGuardian) next.consentGuardian = copy.consent.guardianError;

    setErrors(next);

    // Move focus to the first invalid field (in DOM order) on a failed submit.
    if (next.parentName) return parentNameRef.current?.focus();
    if (next.email) return emailRef.current?.focus();
    if (next.phone) return phoneRef.current?.focus();
    if (next.city) return cityRef.current?.focus();
    if (next.consentProcess)
      return document.getElementById(ids.consentProcess)?.focus();
    if (next.consentGuardian)
      return document.getElementById(ids.consentGuardian)?.focus();

    setStatus('submitting');

    const genderValue: ScoreGender | null = gender === '' ? null : gender;

    // Both payloads are built here, independently, sharing NO key. The anonymous
    // score carries only the derived numbers + coarse demographics (NO PII); the
    // lead carries the parent's contact (PII) but no score and no Store A id.
    const anonymous = buildAnonymousScore(safeProfile, {
      city,
      gender: genderValue,
      language: locale
    });

    try {
      const res = await submitAssessment({
        lead: {
          parentFirstName: nextName,
          email: nextEmail,
          phone: nextPhone,
          city,
          childAge: safeProfile.session.age,
          childGender: genderValue,
          locale,
          consentProcess: true,
          consentGuardian: true,
          marketingOptIn: marketing,
          topIndex: safeProfile.features.highestIndex
        },
        anonymous,
        honeypot
      });

      // Reveal results regardless of the write outcome — the parent is never
      // trapped. Persist the minimal 3.09 context, then land on the interstitial.
      writeLeadContextV2({
        parentFirstName: nextName,
        city,
        submittedAt: new Date().toISOString()
      });

      if (!res.ok) {
        // A hard server failure (rare — the action is non-trapping). The lead is
        // logged recoverably server-side; still reveal results to the parent.
        console.error('[ReportFlow] submitAssessment returned not-ok');
      }
      setStep('done');
    } catch {
      // Network / unexpected error. Results compute client-side, so still reveal —
      // never trap the parent. (Lead durability on this path: TODO(durability 3.16).)
      console.error('[ReportFlow] submitAssessment threw');
      writeLeadContextV2({
        parentFirstName: nextName,
        city,
        submittedAt: new Date().toISOString()
      });
      setStep('done');
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-tint px-3 py-1 text-xs font-bold tracking-wide text-secondary-ink uppercase">
          <Lock className="size-3.5" aria-hidden />
          {copy.forParent}
        </span>
        <h1 className="font-brand text-3xl font-extrabold text-balance text-ink">
          {copy.heading}
        </h1>
        <p className="text-pretty text-ink-soft">{copy.intro}</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          {/* Parent first name (no surname). */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.parentName} className="text-sm font-semibold text-ink">
              {copy.parentName.label}
            </Label>
            <Input
              ref={parentNameRef}
              id={ids.parentName}
              name="parentFirstName"
              type="text"
              autoComplete="given-name"
              maxLength={MAX_NAME}
              placeholder={copy.parentName.placeholder}
              value={parentName}
              onChange={(e) => {
                setParentName(e.target.value);
                if (errors.parentName)
                  setErrors((p) => ({...p, parentName: undefined}));
              }}
              aria-invalid={errors.parentName ? true : undefined}
              aria-describedby={errors.parentName ? ids.parentNameErr : undefined}
            />
            {errors.parentName ? (
              <p id={ids.parentNameErr} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.parentName}
              </p>
            ) : null}
          </div>

          {/* Parent email. */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.email} className="text-sm font-semibold text-ink">
              {copy.email.label}
            </Label>
            <Input
              ref={emailRef}
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={copy.email.placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({...p, email: undefined}));
              }}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? ids.emailErr : undefined}
            />
            {errors.email ? (
              <p id={ids.emailErr} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.email}
              </p>
            ) : null}
          </div>

          {/* Parent phone. */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.phone} className="text-sm font-semibold text-ink">
              {copy.phone.label}
            </Label>
            <Input
              ref={phoneRef}
              id={ids.phone}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={32}
              placeholder={copy.phone.placeholder}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((p) => ({...p, phone: undefined}));
              }}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? ids.phoneErr : undefined}
            />
            {errors.phone ? (
              <p id={ids.phoneErr} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.phone}
              </p>
            ) : null}
          </div>

          {/* City — required dropdown over the 10 centres. */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.city} className="text-sm font-semibold text-ink">
              {copy.city.label}
            </Label>
            <select
              ref={cityRef}
              id={ids.city}
              name="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((p) => ({...p, city: undefined}));
              }}
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? ids.cityErr : undefined}
              className="min-h-tap rounded-lg border border-input bg-background px-3 py-2 text-base text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <option value="" disabled>
                {copy.city.placeholder}
              </option>
              {CENTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.city[locale]}
                </option>
              ))}
            </select>
            {errors.city ? (
              <p id={ids.cityErr} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.city}
              </p>
            ) : null}
          </div>

          {/* Optional child gender — minimal value set. */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={ids.gender} className="text-sm font-semibold text-ink">
              {copy.gender.label}{' '}
              <span className="font-normal text-ink-faint">{copy.gender.optionalHint}</span>
            </Label>
            <select
              id={ids.gender}
              name="childGender"
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderValue)}
              className="min-h-tap rounded-lg border border-input bg-background px-3 py-2 text-base text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <option value="">{copy.gender.none}</option>
              <option value="female">{copy.gender.female}</option>
              <option value="male">{copy.gender.male}</option>
              <option value="unspecified">{copy.gender.unspecified}</option>
            </select>
          </div>

          {/* Consent 1 — service/report processing [required]. */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <Checkbox
                id={ids.consentProcess}
                checked={consentProcess}
                onCheckedChange={(v) => {
                  setConsentProcess(v === true);
                  if (errors.consentProcess)
                    setErrors((p) => ({...p, consentProcess: undefined}));
                }}
                aria-invalid={errors.consentProcess ? true : undefined}
                aria-describedby={
                  errors.consentProcess ? ids.consentProcessErr : undefined
                }
                className="mt-0.5"
              />
              <Label
                htmlFor={ids.consentProcess}
                className="text-sm leading-relaxed text-ink-soft"
              >
                {copy.consent.process} {copy.consent.privacyPrefix}
                <Link
                  href="/privacy"
                  className="font-semibold text-secondary-ink underline underline-offset-2 hover:text-secondary"
                >
                  {copy.consent.privacyLink}
                </Link>
                {copy.consent.privacySuffix}
              </Label>
            </div>
            {errors.consentProcess ? (
              <p
                id={ids.consentProcessErr}
                className="text-sm font-medium text-[var(--error-ink)]"
              >
                {errors.consentProcess}
              </p>
            ) : null}
          </div>

          {/* Consent 2 — parent/guardian confirmation [required]. */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <Checkbox
                id={ids.consentGuardian}
                checked={consentGuardian}
                onCheckedChange={(v) => {
                  setConsentGuardian(v === true);
                  if (errors.consentGuardian)
                    setErrors((p) => ({...p, consentGuardian: undefined}));
                }}
                aria-invalid={errors.consentGuardian ? true : undefined}
                aria-describedby={
                  errors.consentGuardian ? ids.consentGuardianErr : undefined
                }
                className="mt-0.5"
              />
              <Label
                htmlFor={ids.consentGuardian}
                className="text-sm leading-relaxed text-ink-soft"
              >
                {copy.consent.guardian}
              </Label>
            </div>
            {errors.consentGuardian ? (
              <p
                id={ids.consentGuardianErr}
                className="text-sm font-medium text-[var(--error-ink)]"
              >
                {errors.consentGuardian}
              </p>
            ) : null}
          </div>

          {/* Consent 3 — marketing [optional], unchecked by default. */}
          <div className="flex items-start gap-3">
            <Checkbox
              id={ids.marketing}
              checked={marketing}
              onCheckedChange={(v) => setMarketing(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor={ids.marketing} className="text-sm leading-relaxed text-ink-soft">
              {copy.consent.marketing}
            </Label>
          </div>

          {/* Honeypot — off-screen; a filled value is treated as spam (no writes). */}
          <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor={ids.honeypot}>{copy.honeypotLabel}</label>
            <input
              id={ids.honeypot}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-14 w-full rounded-xl bg-hero px-8 font-brand text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {copy.submitting}
            </>
          ) : (
            copy.submit
          )}
        </Button>

        <p className="text-center text-xs text-ink-soft">{copy.privacyNote}</p>
      </form>
    </div>
  );
}
