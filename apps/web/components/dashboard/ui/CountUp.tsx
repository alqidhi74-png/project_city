'use client';

import { useEffect, useRef, useState } from 'react';

import { useMotionOK } from '@/lib/motion';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Ramps from the previously displayed value to the new one, so the number also
 * animates when a filter changes, not only on first mount. Under reduced motion
 * it simply renders the final value.
 */
export function CountUp({
  value,
  locale,
  precision = 0,
  duration = 850,
}: {
  value: number;
  locale: Locale;
  precision?: number;
  duration?: number;
}) {
  const motionOK = useMotionOK();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const displayRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!motionOK) {
      fromRef.current = value;
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;

    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = from + delta * easeOut(t);
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      // Whatever is on screen becomes the start of the next ramp, so rapid
      // filter changes keep moving instead of snapping back.
      fromRef.current = displayRef.current;
    };
  }, [value, duration, motionOK]);

  return <span className="tnum">{formatNumber(display, locale, precision)}</span>;
}
