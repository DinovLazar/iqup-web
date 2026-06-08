'use client';

import {Link} from '@/i18n/navigation';
import {BANDS, type BandKey} from '@/lib/bands';
import {cn} from '@/lib/utils';

/**
 * Development-only control bar (§4.8): jump to any band and auto-complete the run
 * so all three bands + the computed result can be checked without answering 36
 * questions by hand. Rendered only when the `dev` flag is on, which is forced
 * false in production by the server shell — so it is a no-op / stripped in prod.
 */
export function DevBar({
  band,
  onAutoFill
}: {
  band: BandKey;
  onAutoFill: (variant: 'correct' | 'mixed' | 'wrong') => void;
}) {
  // One representative age per band for the jump links.
  const jumpAge: Record<BandKey, number> = {'3-5': 4, '6-9': 8, '10-13': 12};

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-300 bg-amber-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs">
        <span className="font-bold tracking-wide text-amber-700 uppercase">dev</span>

        <span className="flex items-center gap-1.5">
          <span className="text-amber-700">band:</span>
          {BANDS.map((b) => (
            <Link
              key={b.key}
              href={{pathname: '/test', query: {age: String(jumpAge[b.key]), dev: '1'}}}
              className={cn(
                'rounded-md px-2 py-1 font-mono font-semibold',
                b.key === band
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              )}
            >
              {b.key}
            </Link>
          ))}
        </span>

        <span className="flex items-center gap-1.5">
          <span className="text-amber-700">auto-finish:</span>
          {(['correct', 'mixed', 'wrong'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onAutoFill(v)}
              className="rounded-md bg-amber-100 px-2 py-1 font-mono font-semibold text-amber-800 hover:bg-amber-200"
            >
              {v}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}
