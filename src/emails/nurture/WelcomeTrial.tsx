/**
 * Phase 2.03 — `welcome-trial`: the warm welcome for the TRIAL track (children
 * age ≤ 9 — the 3–5 and 6–9 bands). Thank-you + a reminder the strengths profile
 * & certificate are already in the inbox (the 2.01 email) + a soft trial mention.
 * Takes only `locale` — all content + personalisation is data + merge tags.
 */
import * as React from 'react';
import type {Locale} from '@/content/locale';
import {NurtureBody} from './NurtureBody';

export function WelcomeTrial({locale}: {locale: Locale}): React.JSX.Element {
  return <NurtureBody emailKey="welcome-trial" locale={locale} />;
}

export default WelcomeTrial;
