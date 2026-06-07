'use client';

import type {ReactNode} from 'react';
import {m, useReducedMotion} from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
};

/**
 * Light, reduced-motion-safe entrance wrapper. A gentle fade + slide as the
 * element scrolls into view (once). When the user prefers reduced motion it
 * renders the content in its end-state with no animation.
 *
 * Kept off the LCP path: the hero headline + explainer render statically and are
 * NOT wrapped in Reveal, so first paint of the largest text is never delayed.
 */
export function Reveal({children, className, delay = 0, y = 14}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{opacity: 0, y}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.3}}
      transition={{duration: 0.5, delay, ease: [0.22, 1, 0.36, 1]}}
    >
      {children}
    </m.div>
  );
}
