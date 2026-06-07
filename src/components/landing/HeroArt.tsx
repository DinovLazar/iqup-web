/**
 * Decorative hero visual — purely abstract, on-brand shapes (the "magic-spark"
 * motif + puzzle-like forms). It is NOT a character.
 *
 * PLACEHOLDER for licensed Bibi art: the licensed character assets were not in
 * `public/bibi/` when this was built. Per the project rules we never generate or
 * redraw the Bibi characters, so this abstract piece stands in. Swap in the
 * official Bibi art here when it is available.
 */
export function HeroArt() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-md">
      {/* soft squircle backdrop */}
      <div className="absolute inset-2 rounded-[2.75rem] bg-gradient-to-br from-hero-tint to-secondary-tint" />
      <div className="absolute inset-2 rounded-[2.75rem] ring-1 ring-hero/40" />

      {/* big friendly circle */}
      <div className="absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-[var(--shadow-md)]" />

      {/* puzzle-ish shapes floating around */}
      <div className="absolute left-10 top-10 size-12 rotate-12 rounded-2xl bg-secondary" />
      <div className="absolute right-9 top-16 size-10 rounded-full bg-accent-coral" />
      <div className="absolute bottom-12 left-14 size-9 rounded-lg bg-accent-grape" />
      <div className="absolute right-12 bottom-14 size-14 rounded-full bg-hero" />

      {/* sparkles */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 34c1.6 6.2 4.8 9.4 11 11-6.2 1.6-9.4 4.8-11 11-1.6-6.2-4.8-9.4-11-11 6.2-1.6 9.4-4.8 11-11z"
          fill="var(--accent-grape)"
        />
        <path
          d="M27 50c.9 3.5 2.7 5.3 6.2 6.2-3.5.9-5.3 2.7-6.2 6.2-.9-3.5-2.7-5.3-6.2-6.2 3.5-.9 5.3-2.7 6.2-6.2z"
          fill="var(--hero-strong)"
        />
        <path
          d="M74 24c.7 2.7 2.1 4.1 4.8 4.8-2.7.7-4.1 2.1-4.8 4.8-.7-2.7-2.1-4.1-4.8-4.8 2.7-.7 4.1-2.1 4.8-4.8z"
          fill="var(--brand-blue)"
        />
      </svg>
    </div>
  );
}
