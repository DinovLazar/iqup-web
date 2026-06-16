/**
 * Phase 2.03 — `welcome-general`: the warm welcome for the GENERAL track (children
 * age ≥ 10 — the 10–13 band, no program). Thank-you + certificate reminder, framed
 * as "we'll share new things as they come" — and NO trial CTA (just a quiet
 * "explore IqUp" link). Takes only `locale`.
 */
import * as React from 'react';
import type {Locale} from '@/content/locale';
import {NurtureBody} from './NurtureBody';

export function WelcomeGeneral({locale}: {locale: Locale}): React.JSX.Element {
  return <NurtureBody emailKey="welcome-general" locale={locale} />;
}

export default WelcomeGeneral;
