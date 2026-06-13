import type {SVGProps} from 'react';
import type {StrengthCode} from '@/content/strengths';

/**
 * One small line-glyph per strength, shared by the results constellation and the
 * certificate. Inline SVG (not an icon font / external sprite) so it survives the
 * certificate's flat html-to-image raster capture. Colour comes from
 * `currentColor` — the parent sets the strength colour. Paths are from the 1.09
 * mockups; they pair with the strength taxonomy in `@/content/strengths`.
 */
const PATHS: Record<StrengthCode, React.ReactNode> = {
  pattern: (
    <>
      <circle cx="6.5" cy="6.5" r="3" />
      <rect x="14" y="3.5" width="6" height="6" rx="1.6" />
      <path d="M6.5 14l3 5.5h-6z" />
      <rect x="14" y="14" width="6" height="6" rx="1.6" />
    </>
  ),
  logic: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5.5" cy="19" r="2.5" />
      <circle cx="18.5" cy="19" r="2.5" />
      <path d="M12 7.5v2.2c0 1.5-1 2.3-2.4 3.1C8 13.8 5.5 14.5 5.5 16.5M12 9.7c0 1.5 1 2.3 2.4 3.1 1.6.9 4.1 1.6 4.1 3.7" />
    </>
  ),
  memory: (
    <>
      <path d="M4 12a8 8 0 1 1 2.5 5.8" />
      <polyline points="3 18.5 3.5 13.5 8.5 14" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
  spatial: (
    <>
      <path d="M21 8.2l-9-5-9 5v7.6l9 5 9-5V8.2z" />
      <path d="M3 8.2l9 5 9-5M12 13.2v8" />
    </>
  ),
  numeracy: (
    <>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10.5" y1="3.5" x2="8.5" y2="20.5" />
      <line x1="15.5" y1="3.5" x2="13.5" y2="20.5" />
    </>
  ),
  words_obs: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  )
};

export function StrengthGlyph({
  code,
  ...props
}: {code: StrengthCode} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[code]}
    </svg>
  );
}
