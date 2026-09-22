'use client';

import { useEffect, useState } from 'react';

import { useDict } from '../state/DashboardProvider';
import { formatNumber, template } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';

/** Re-renders every 15s so "2 min ago" does not go stale while the page sits open. */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useTimeAgo(locale: Locale) {
  const dict = useDict();

  return (timestamp: number, now: number): string => {
    const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
    if (seconds < 10) return dict.live.justNow;
    if (seconds < 60) {
      return template(dict.live.secondsAgo, { n: formatNumber(seconds, locale) });
    }
    return template(dict.live.minutesAgo, { n: formatNumber(Math.floor(seconds / 60), locale) });
  };
}
