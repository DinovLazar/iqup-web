'use client';

import type {ReactNode} from 'react';
import {LazyMotion, domAnimation} from 'framer-motion';

/**
 * Loads only the lightweight `domAnimation` feature set for Framer Motion (the
 * ~4.6 KB `m` API instead of the full `motion` bundle), keeping entrance
 * animation within the performance budget. `strict` forbids the heavy `motion`
 * component so only `m.*` is used. Server-rendered children pass straight
 * through.
 */
export function MotionProvider({children}: {children: ReactNode}) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
