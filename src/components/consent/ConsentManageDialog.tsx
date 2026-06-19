'use client';

import {useId, useState} from 'react';
import {Dialog} from 'radix-ui';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {useConsent} from '@/lib/consent/ConsentProvider';
import {cn} from '@/lib/utils';
import type {ConsentCopy} from './copy';

/**
 * "Manage preferences" dialog (Phase 2.04). A focus-trapping Radix modal driven
 * by the provider's `manageOpen`. Per-category toggles are deny-by-default: on a
 * first-ever (undecided) open both Analytics + Marketing start OFF; on a re-open
 * they re-seed from the stored `consent`. Nothing is persisted until Save.
 */
export function ConsentManageDialog({copy}: {copy: ConsentCopy}) {
  const {consent, manageOpen, savePreferences, closeManage} = useConsent();

  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Re-seed the local toggles from stored consent each time the dialog opens,
  // using React's "adjust state while rendering" pattern (no effect → no
  // cascading render). We track the previous `manageOpen` and re-seed only on
  // the closed→open transition. Deny-by-default: when undecided, `consent` is
  // already all-false, so both start OFF and nothing is pre-ticked.
  const [wasOpen, setWasOpen] = useState(false);
  if (manageOpen !== wasOpen) {
    setWasOpen(manageOpen);
    if (manageOpen) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }

  const analyticsId = useId();
  const marketingId = useId();

  return (
    <Dialog.Root
      open={manageOpen}
      onOpenChange={(open) => {
        if (!open) closeManage();
      }}
    >
      <Dialog.Portal>
        {/* Dimmed backdrop. Overlay click closes (Radix); ESC closes (Radix). */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgb(36_31_54_/_0.45)] motion-safe:data-[state=open]:animate-[consent-overlay-in_180ms_ease-out]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'flex max-h-[85vh] flex-col rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-lg)]',
            'focus-visible:outline-none',
            'motion-safe:data-[state=open]:animate-[consent-content-in_200ms_ease-out]'
          )}
        >
          <div className="flex items-start justify-between gap-4 p-6 pb-3">
            <div className="flex flex-col gap-1.5">
              <Dialog.Title className="text-lg font-semibold text-ink">
                {copy.manage.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm leading-relaxed text-ink-soft">
                {copy.manage.intro}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={copy.manage.close}
                className="size-9 shrink-0"
              >
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Category rows — scrollable on short screens. */}
          <div className="flex flex-col gap-3 overflow-y-auto px-6 py-1">
            {/* Necessary — always on, no toggle. */}
            <div className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-canvas p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-semibold text-ink">
                  {copy.manage.necessary.title}
                </span>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {copy.manage.necessary.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary-tint px-3 py-1 text-xs font-semibold text-secondary-ink">
                {copy.manage.alwaysOn}
              </span>
            </div>

            {/* Analytics — working, un-pre-ticked toggle. */}
            <div className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <Label
                  htmlFor={analyticsId}
                  className="text-sm font-semibold text-ink"
                >
                  {copy.manage.analytics.title}
                </Label>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {copy.manage.analytics.description}
                </p>
              </div>
              <Checkbox
                id={analyticsId}
                checked={analytics}
                onCheckedChange={(v) => setAnalytics(v === true)}
                className="mt-0.5 shrink-0"
              />
            </div>

            {/* Marketing — working, un-pre-ticked toggle. */}
            <div className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-4">
              <div className="flex min-w-0 flex-col gap-1">
                <Label
                  htmlFor={marketingId}
                  className="text-sm font-semibold text-ink"
                >
                  {copy.manage.marketing.title}
                </Label>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {copy.manage.marketing.description}
                </p>
              </div>
              <Checkbox
                id={marketingId}
                checked={marketing}
                onCheckedChange={(v) => setMarketing(v === true)}
                className="mt-0.5 shrink-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 p-6 pt-3">
            <p className="text-xs leading-relaxed text-ink-faint">
              {copy.manage.note}
            </p>
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 min-h-11 px-5 text-sm font-medium"
                >
                  {copy.manage.cancel}
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={() => savePreferences({analytics, marketing})}
                className="h-11 min-h-11 bg-hero px-5 text-sm font-semibold text-hero-ink shadow-[var(--shadow-hero)] hover:bg-hero-strong"
              >
                {copy.manage.save}
              </Button>
            </div>
          </div>

          {/* Scoped keyframes for the motion-safe enter animations only. */}
          <style>{`
            @keyframes consent-overlay-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes consent-content-in {
              from { opacity: 0; transform: translate(-50%, calc(-50% + 0.5rem)) scale(0.98); }
              to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ConsentManageDialog;
