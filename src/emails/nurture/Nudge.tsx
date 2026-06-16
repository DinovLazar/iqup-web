/**
 * Phase 2.03 — `nudge` (TRIAL track only): a light, no-pressure final note —
 * gentle reassurance + the trial CTA once more. Takes only `locale`.
 */
import * as React from 'react';
import type {Locale} from '@/content/locale';
import {NurtureBody} from './NurtureBody';

export function Nudge({locale}: {locale: Locale}): React.JSX.Element {
  return <NurtureBody emailKey="nudge" locale={locale} />;
}

export default Nudge;
