'use client';

import {useEffect, useId, useRef, useState, type FormEvent} from 'react';
import {Loader2, Lock} from 'lucide-react';
import type {Locale} from '@/content/locale';
import type {TestResult} from '@/lib/scoring';
import {useRouter} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {StrengthChip} from '@/components/test/StrengthChip';
import {submitLead} from '@/lib/leads/submit-lead';
import {
  LEAD_BAND_BY_KEY,
  toTopStrengths,
  type GateSubmission
} from '@/lib/leads/lead-mapping';
import {writeLeadContext} from '@/lib/leads/lead-context';
import type {GateCopy} from './copy';
import {fillName} from './copy';

/** Mirror of the schema's email rule for instant client feedback (server re-checks). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Matches `child_first_name: z.string().trim().min(1).max(60)`. */
const MAX_NAME = 60;

type FieldErrors = {email?: string; childName?: string; consent?: string};

/**
 * The email gate — the post-test "grown-up step" (Phase 1.08). Shown by the
 * runner after the last question and before results. Collects the parent's
 * email, the child's first name, and required consent (+ optional marketing),
 * then submits via the server action (which re-validates and inserts the
 * SUMMARY-only lead) and sends the parent on to `/result`.
 *
 * The strengths summary, band and locale are carried from the in-memory
 * `TestResult`; the exact `age` is carried from `/test`. None of that is shown
 * as an editable field, and none of it ever touches the URL.
 */
export function EmailGate({
  result,
  age,
  locale,
  copy,
  dev = false
}: {
  result: TestResult | null;
  age: number;
  locale: Locale;
  copy: GateCopy;
  dev?: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const emailId = `${uid}-email`;
  const emailErrId = `${uid}-email-err`;
  const nameId = `${uid}-name`;
  const nameErrId = `${uid}-name-err`;
  const consentId = `${uid}-consent`;
  const consentErrId = `${uid}-consent-err`;
  const marketingId = `${uid}-marketing`;
  const honeypotId = `${uid}-company`;

  const [email, setEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [submitFailed, setSubmitFailed] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Defensive guard: never render an empty form. If the runner ever shows the
  // gate without a valid result, send the parent back to the age picker.
  useEffect(() => {
    if (!result) router.replace('/test');
  }, [result, router]);
  if (!result) return null;
  const safeResult = result;

  const submitting = status === 'submitting';
  const trimmedName = childName.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextEmail = email.trim();
    const nextName = childName.trim();
    const next: FieldErrors = {};
    if (!nextEmail) next.email = copy.email.errorRequired;
    else if (!EMAIL_RE.test(nextEmail)) next.email = copy.email.errorInvalid;
    if (!nextName) next.childName = copy.childName.errorRequired;
    else if (nextName.length > MAX_NAME) next.childName = copy.childName.errorTooLong;
    if (!consent) next.consent = copy.consent.error;

    setErrors(next);
    setSubmitFailed(false);

    // Move focus to the first invalid field (in DOM order) on a failed submit.
    if (next.email) return emailRef.current?.focus();
    if (next.childName) return nameRef.current?.focus();
    if (next.consent) return document.getElementById(consentId)?.focus();

    setStatus('submitting');
    const submission: GateSubmission = {
      email: nextEmail,
      childFirstName: nextName,
      childAge: age,
      band: LEAD_BAND_BY_KEY[safeResult.band],
      locale: safeResult.locale,
      topStrengths: toTopStrengths(safeResult),
      consent,
      marketingOptIn: marketing,
      honeypot
    };

    try {
      const res = await submitLead(submission);
      if (res.ok) {
        // Persist the "gate completed" context, then go to the results screen.
        // Keep the submitting state through navigation so the button can't be
        // double-fired while the route transitions.
        writeLeadContext({
          childFirstName: nextName,
          age,
          submittedAt: new Date().toISOString()
        });
        router.push('/result');
        return;
      }
      failGracefully();
    } catch {
      // Network / unexpected error — the TestResult is untouched, fields kept.
      failGracefully();
    }
  }

  function failGracefully() {
    setStatus('idle');
    setSubmitFailed(true);
    requestAnimationFrame(() => bannerRef.current?.focus());
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-tint px-3 py-1 text-xs font-bold tracking-wide text-secondary-ink uppercase">
          <Lock className="size-3.5" aria-hidden />
          {copy.forParent}
        </span>
        <h1 className="font-display text-3xl font-extrabold text-balance text-ink">
          {copy.heading}
        </h1>
        <p className="text-pretty text-ink-soft">{copy.intro}</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {submitFailed ? (
          <div
            ref={bannerRef}
            role="alert"
            tabIndex={-1}
            className="rounded-xl border-2 border-[var(--error)] bg-[var(--error-tint)] px-4 py-3 text-sm font-semibold text-[var(--error-ink)] outline-none"
          >
            {copy.error}
          </div>
        ) : null}

        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          {/* Parent email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={emailId} className="text-sm font-semibold text-ink">
              {copy.email.label}
            </Label>
            <Input
              ref={emailRef}
              id={emailId}
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
              aria-describedby={errors.email ? emailErrId : undefined}
            />
            {errors.email ? (
              <p id={emailErrId} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.email}
              </p>
            ) : null}
          </div>

          {/* Child's first name (Cyrillic + Latin both allowed — schema caps length only) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={nameId} className="text-sm font-semibold text-ink">
              {copy.childName.label}
            </Label>
            <Input
              ref={nameRef}
              id={nameId}
              name="childFirstName"
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME}
              placeholder={copy.childName.placeholder}
              value={childName}
              onChange={(e) => {
                setChildName(e.target.value);
                if (errors.childName) setErrors((p) => ({...p, childName: undefined}));
              }}
              aria-invalid={errors.childName ? true : undefined}
              aria-describedby={errors.childName ? nameErrId : undefined}
            />
            {errors.childName ? (
              <p id={nameErrId} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.childName}
              </p>
            ) : null}
          </div>

          {/* Required consent. Whole label row is the ≥44px tap target. */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <Checkbox
                id={consentId}
                checked={consent}
                onCheckedChange={(v) => {
                  setConsent(v === true);
                  if (errors.consent) setErrors((p) => ({...p, consent: undefined}));
                }}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? consentErrId : undefined}
                className="mt-0.5"
              />
              {/* TODO(privacy-page): link the "Privacy Policy" phrase to
                  /[locale]/privacy once that page is built (Part 2). Plain text
                  for now — a documented cross-phase seam, not a dead link. */}
              <Label htmlFor={consentId} className="text-sm leading-relaxed text-ink-soft">
                {copy.consent.label}
              </Label>
            </div>
            {errors.consent ? (
              <p id={consentErrId} className="text-sm font-medium text-[var(--error-ink)]">
                {errors.consent}
              </p>
            ) : null}
          </div>

          {/* Optional marketing opt-in — unchecked by default, separate from consent. */}
          <div className="flex items-start gap-3">
            <Checkbox
              id={marketingId}
              checked={marketing}
              onCheckedChange={(v) => setMarketing(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor={marketingId} className="text-sm leading-relaxed text-ink-soft">
              {copy.marketing.label}
            </Label>
          </div>

          {/* Honeypot — off-screen, hidden from AT + keyboard. A filled value is
              treated as spam server-side (no insert, success-shaped return). */}
          <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor={honeypotId}>{copy.honeypotLabel}</label>
            <input
              id={honeypotId}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
        </div>

        {trimmedName ? (
          <p className="text-center text-sm font-semibold text-secondary-ink">
            {fillName(copy.preview, trimmedName)}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="h-14 w-full rounded-xl bg-hero px-8 font-display text-base font-bold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
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

      {/* Dev-only: a compact view of the computed strengths so the full flow can
          be verified without answering every question. Stripped in production. */}
      {dev ? (
        <div className="mt-2 w-full rounded-2xl border border-dashed border-input bg-canvas p-4 text-left">
          <p className="mb-3 text-xs font-bold tracking-wide text-ink-faint uppercase">
            dev · {safeResult.band} · {safeResult.locale} · age {age}
          </p>
          <ol className="flex flex-col gap-2">
            {safeResult.strengths.map((s) => (
              <li key={s.code} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-5 font-mono text-ink-faint">{s.rank}.</span>
                  <StrengthChip code={s.code} locale={locale} />
                </span>
                <span className="font-mono text-xs text-ink-soft">
                  {s.hits}/{s.total} ({s.ratio.toFixed(2)}) · {s.tier}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
