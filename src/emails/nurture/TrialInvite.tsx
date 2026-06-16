/**
 * Phase 2.03 — `trial-invite` (TRIAL track only): the heart of the sequence. What
 * an IqUp class looks like — the Bibi/Bobi/Oliver-led, hands-on, story → discovery
 * → create lesson (brand.md §2) — and the trial CTA. Warm, specific, no pressure.
 * Takes only `locale`.
 */
import * as React from 'react';
import type {Locale} from '@/content/locale';
import {NurtureBody} from './NurtureBody';

export function TrialInvite({locale}: {locale: Locale}): React.JSX.Element {
  return <NurtureBody emailKey="trial-invite" locale={locale} />;
}

export default TrialInvite;
