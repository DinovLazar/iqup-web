import type {ReactNode} from 'react';

import {requireAdminUser} from '@/lib/admin/auth/server';
import {AdminShell} from '@/components/admin/AdminShell';

// Reads the session cookie + gates server-side → always dynamic.
export const dynamic = 'force-dynamic';

/**
 * The gated admin layout — the per-route half of the auth gate (defense in depth
 * with the proxy). Every page under this group is behind `requireAdminUser()`:
 * an unauthenticated request is redirected to `/admin/login`.
 */
export default async function AuthedAdminLayout({children}: {children: ReactNode}) {
  const user = await requireAdminUser();
  return <AdminShell email={user.email ?? 'Signed in'}>{children}</AdminShell>;
}
