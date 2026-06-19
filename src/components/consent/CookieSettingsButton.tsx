'use client';

import {useConsent} from '@/lib/consent/ConsentProvider';
import {cn} from '@/lib/utils';

/**
 * Re-opens the "Manage preferences" dialog from anywhere inside the consent
 * provider (the footer and the /privacy page). Withdrawal / change of consent is
 * always one click away (guardrail §2.1 / DoD). Label is passed in so server
 * parents can supply the localized string.
 */
export function CookieSettingsButton({
  label,
  className
}: {
  label: string;
  className?: string;
}) {
  const {openManage} = useConsent();
  return (
    <button
      type="button"
      onClick={openManage}
      className={cn(
        'rounded-sm font-semibold text-secondary-ink underline-offset-4 transition-colors hover:underline',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className
      )}
    >
      {label}
    </button>
  );
}
