import {Reveal} from '@/components/landing/Reveal';

/**
 * The band 10–13 close (calm zone) — a distinct, fully-resolved "curious mind"
 * ending. No program exists for this age, so the page ends warmly (spec §6B
 * closing) rather than showing an awkward empty trial slot. NO trial block here.
 */
export function CuriousMindEnding({
  heading,
  body,
  signoff
}: {
  heading: string;
  body: string;
  signoff: string;
}) {
  return (
    <Reveal>
      <div className="mx-auto max-w-xl py-6 text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-5 grid size-[84px] place-items-center rounded-full bg-gradient-to-br from-hero-tint to-secondary-tint text-hero-strong"
        >
          <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l2.5 5.7 6.2.6-4.7 4.1 1.4 6.1L12 16.9 6.6 19.5 8 13.4 3.3 9.3l6.2-.6z" />
          </svg>
        </span>
        <h2 className="mb-4 font-display text-2xl font-extrabold text-balance text-ink">
          {heading}
        </h2>
        <p className="mx-auto mb-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft text-pretty">
          {body}
        </p>
        <span className="inline-flex items-center gap-2.5 rounded-full bg-secondary-tint px-[18px] py-2.5 text-sm font-bold text-secondary-ink">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.4 6.9H22l-6 4.4 2.3 7L12 16l-6.3 4.3 2.3-7-6-4.4h7.6z" />
          </svg>
          {signoff}
        </span>
      </div>
    </Reveal>
  );
}
