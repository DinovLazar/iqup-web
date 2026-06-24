'use client';

/**
 * Admin login (Phase 3.13) — invite-only, email + password, MFA-compatible.
 *
 * No public signup, no password-reset-creates-account, no open registration: staff
 * accounts are provisioned out-of-band (Supabase dashboard). When the account has a
 * TOTP factor enrolled, this completes the second-factor challenge before the
 * session is fully established — so the login does not break when MFA is on.
 *
 * With the blank-env template (`configured === false`) it renders a clean, disabled
 * "not configured" state and never tries to sign in (no console errors).
 */
import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';

import {createAdminBrowserClient} from '@/lib/admin/auth/client';
import {ADMIN_HOME_PATH} from '@/lib/admin/auth/env';

type Step = 'credentials' | 'mfa';

const fieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-ink ' +
  'placeholder:text-ink-soft/70 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-[var(--iq-violet)] disabled:opacity-60';

const buttonClass =
  'inline-flex min-h-tap w-full items-center justify-center rounded-lg ' +
  'bg-[var(--iq-violet)] px-4 py-2.5 font-semibold text-white transition-colors ' +
  'hover:bg-[var(--iq-violet)]/90 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-[var(--iq-violet)] focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export function AdminLoginForm({configured}: {configured: boolean}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div
        role="note"
        className="rounded-lg border border-border bg-white p-4 text-sm text-ink-soft"
      >
        <p className="font-semibold text-ink">Admin sign-in is not configured.</p>
        <p className="mt-1">
          Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in the
          environment, then create staff accounts (invite-only) in the Supabase
          dashboard.
        </p>
      </div>
    );
  }

  async function onCredentials(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createAdminBrowserClient();
      const {error: signInError} = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        setError('Invalid email or password.');
        return;
      }

      // MFA: if a TOTP factor is enrolled, the assurance level needs to step up.
      const {data: aal, error: aalError} =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        !aalError &&
        aal &&
        aal.nextLevel === 'aal2' &&
        aal.nextLevel !== aal.currentLevel
      ) {
        const {data: factors} = await supabase.auth.mfa.listFactors();
        const totp =
          factors?.totp?.find((f) => f.status === 'verified') ?? factors?.totp?.[0];
        if (totp) {
          setFactorId(totp.id);
          setStep('mfa');
          return;
        }
      }

      router.push(ADMIN_HOME_PATH);
      router.refresh();
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(event: FormEvent) {
    event.preventDefault();
    if (!factorId) return;
    setError(null);
    setBusy(true);
    try {
      const supabase = createAdminBrowserClient();
      const {data: challenge, error: challengeError} =
        await supabase.auth.mfa.challenge({factorId});
      if (challengeError || !challenge) {
        setError('Could not start the verification challenge.');
        return;
      }
      const {error: verifyError} = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      });
      if (verifyError) {
        setError('Invalid verification code.');
        return;
      }
      router.push(ADMIN_HOME_PATH);
      router.refresh();
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={step === 'credentials' ? onCredentials : onVerify}
      className="space-y-4"
      noValidate
    >
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[var(--iq-magenta)]/40 bg-[var(--iq-magenta)]/5 px-3 py-2 text-sm text-ink"
        >
          {error}
        </p>
      ) : null}

      {step === 'credentials' ? (
        <>
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-sm font-semibold text-ink">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-sm font-semibold text-ink"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </>
      ) : (
        <>
          <div className="space-y-1.5">
            <label
              htmlFor="admin-mfa-code"
              className="block text-sm font-semibold text-ink"
            >
              Authentication code
            </label>
            <input
              id="admin-mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={fieldClass}
              aria-describedby="admin-mfa-help"
            />
            <p id="admin-mfa-help" className="text-sm text-ink-soft">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? 'Verifying…' : 'Verify'}
          </button>
        </>
      )}
    </form>
  );
}
