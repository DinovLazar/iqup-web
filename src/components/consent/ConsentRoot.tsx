'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import {usePathname} from '@/i18n/navigation';
import {ConsentProvider, useConsent} from '@/lib/consent/ConsentProvider';
import {syncTrackers} from '@/lib/analytics/sync';
import {track} from '@/lib/analytics/track';
import type {ConsentCopy} from './copy';

// Code-split the banner + Manage dialog (which pulls in Radix Dialog) out of
// every page's initial bundle: they are client-only and render post-hydration
// anyway, so deferring them keeps hydration — and the throttled mobile LCP —
// fast on JS-heavier pages like /test. (Decision #109.)
const ConsentBanner = dynamic(
  () => import('./ConsentBanner').then((m) => m.ConsentBanner),
  {ssr: false}
);
const ConsentManageDialog = dynamic(
  () => import('./ConsentManageDialog').then((m) => m.ConsentManageDialog),
  {ssr: false}
);

/**
 * The single client island that covers every page in both locales (mounted in
 * the locale layout). It wraps the app in the consent provider, signals the
 * trackers whenever consent changes, tracks client-side page views, and renders
 * the (post-hydration, client-only) banner + Manage dialog.
 *
 * It must NOT opt any page into dynamic rendering: it reads route changes via
 * `usePathname()` only — never `useSearchParams()` (Decision #73).
 */
export function ConsentRoot({
  copy,
  children
}: {
  copy: ConsentCopy;
  children: ReactNode;
}) {
  return (
    <ConsentProvider>
      <ConsentRuntime />
      {children}
      <ConsentBanner copy={copy} />
      <ConsentManageDialog copy={copy} />
    </ConsentProvider>
  );
}

/**
 * Side-effects that must live INSIDE the provider: (1) signal the tracker
 * loaders whenever the granted state changes — this is where the "load nothing
 * before consent" guarantee is enforced — and (2) emit a PII-free `page_view`
 * on client navigation (the initial load's page view is sent by the GA/Pixel
 * SDKs themselves, so the first pathname is skipped to avoid double-counting).
 */
function ConsentRuntime() {
  const {ready, consent} = useConsent();
  const pathname = usePathname();
  const firstPath = useRef(true);

  // Signal the loaders once the cookie has been read, then on every change.
  useEffect(() => {
    if (!ready) return;
    syncTrackers(consent);
  }, [ready, consent]);

  // Page view on SPA navigation (consent + env gating happen inside track()).
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    track('page_view', {path: pathname});
  }, [pathname]);

  return null;
}
