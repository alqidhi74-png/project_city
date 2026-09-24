'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * Single gate for every JS-driven animation on the dashboard. When the reader
 * asks for reduced motion, features stay fully usable — counters land on their
 * final value, charts render complete, pulses hold still. Only the motion goes.
 */
export function useMotionOK(): boolean {
  return !useReducedMotion();
}

/** Recharts animation props, gated. */
export function chartAnimation(motionOK: boolean, duration = 650) {
  return {
    isAnimationActive: motionOK,
    animationDuration: motionOK ? duration : 0,
  } as const;
}

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/** Stagger children by index without re-declaring the transition each time. */
export function staggered(index: number, motionOK: boolean) {
  return {
    initial: motionOK ? 'hidden' : false,
    animate: 'visible',
    variants: fadeUp,
    transition: { duration: motionOK ? 0.35 : 0, delay: motionOK ? index * 0.06 : 0 },
  } as const;
}
