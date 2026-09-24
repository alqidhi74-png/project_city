'use client';

import { useEffect, useState } from 'react';

import { useMotionOK } from '@/lib/motion';
import { formatNumber } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';

/**
 * Flashes once per tick. The flash is decoration only — the value is already
 * readable, so under reduced motion the row simply updates in place.
 */
export function LiveMetric({
  label,
  value,
  unit,
  color,
  tick,
  locale,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  tick: number;
  locale: Locale;
}) {
  const motionOK = useMotionOK();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!motionOK || tick === 0) return;
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 900);
    return () => clearTimeout(id);
  }, [tick, motionOK]);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${flash ? 'animate-tick-flash' : ''}`}
    >
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0 flex-1 truncate text-xs text-ink-muted">{label}</span>
      <span className="tnum shrink-0 text-sm font-semibold text-ink" aria-live="off">
        {formatNumber(value, locale, 0)}
        <span className="ms-1 text-[10px] font-normal text-ink-subtle">{unit}</span>
      </span>
    </div>
  );
}
