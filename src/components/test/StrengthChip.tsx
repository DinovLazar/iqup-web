import type {Locale} from '@/content/locale';
import {STRENGTHS, type StrengthCode} from '@/content/strengths';

/**
 * Small colour-coded chip naming the strength a question exercises (handover §D).
 * Conveys meaning by an icon dot + colour + text label — never colour alone.
 */
export function StrengthChip({
  code,
  locale
}: {
  code: StrengthCode;
  locale: Locale;
}) {
  const strength = STRENGTHS[code];
  const token = strength.token;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase"
      style={{
        backgroundColor: `var(--strength-${token}-tint)`,
        color: `var(--strength-${token}-ink)`
      }}
    >
      <span
        aria-hidden
        className="size-2 rounded-full"
        style={{backgroundColor: `var(--strength-${token})`}}
      />
      {strength.name[locale]}
    </span>
  );
}
