import type {Metadata} from 'next';
import {redirect} from 'next/navigation';

import {getAdminUser} from '@/lib/admin/auth/server';
import {isAdminAuthConfigured, ADMIN_HOME_PATH} from '@/lib/admin/auth/env';
import {AdminLoginForm} from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Sign in · IqUp Admin',
  robots: {index: false, follow: false}
};

// Reads the session cookie → always dynamic.
export const dynamic = 'force-dynamic';

/**
 * The admin login screen. If already signed in, skip straight to the admin home.
 * Otherwise render the invite-only login form (or a clean "not configured" state
 * when the public Supabase env is unset).
 */
export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect(ADMIN_HOME_PATH);

  const configured = isAdminAuthConfigured();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--iq-violet)]">
          IqUp
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Admin sign-in</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Internal back-office. Access is invite-only.
        </p>
      </div>
      <AdminLoginForm configured={configured} />
    </main>
  );
}
