import type {ReactNode} from 'react';

import {AdminNav} from './AdminNav';

/**
 * The authenticated admin chrome (Phase 3.13): a header with the signed-in user +
 * a working sign-out, and navigation between Contacts and Statistics. Plain and
 * functional — an internal tool, not a marketing surface — styled from the v2
 * brand tokens. WCAG 2.2 AA: a skip link, landmarks, focus-visible, AA contrast.
 */
export function AdminShell({email, children}: {email: string; children: ReactNode}) {
  return (
    <div className="min-h-screen">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--iq-violet)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-[var(--iq-violet)]">IqUp Admin</span>
            <AdminNav />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-soft" title={email}>
              {email}
            </span>
            <form action="/admin/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="admin-main" className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
