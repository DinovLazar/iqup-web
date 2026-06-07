import {cn} from '@/lib/utils';

/**
 * Temporary "IQ UP!" wordmark stand-in, styled with brand tokens.
 *
 * STAND-IN — the official IqUp logo SVG was not in the repo when this was built.
 * Drop the real logo in here (and in the header/footer/OG) when it lands.
 * The exclamation mark is an integral part of the IqUp wordmark.
 */
export function Wordmark({
  className,
  tone = 'light'
}: {
  className?: string;
  /** `light` for use on light surfaces, `dark` for use on dark surfaces. */
  tone?: 'light' | 'dark';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 font-display text-xl font-extrabold tracking-tight',
        className
      )}
    >
      <span className={tone === 'dark' ? 'text-white' : 'text-ink'}>IQ</span>
      <span className="rounded-md bg-hero px-1.5 text-hero-ink">UP!</span>
    </span>
  );
}
