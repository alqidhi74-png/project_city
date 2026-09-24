'use client';

import { motion } from 'framer-motion';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { useMotionOK } from '@/lib/motion';
import { seriesColor } from '@/lib/theme';
import { formatCompact, formatSignedPercent } from '@/lib/format';
import { percentDelta } from '@/lib/whatif';

/**
 * A paired bar per metric rather than a Recharts grouped chart: two values on
 * one scale, with the numbers printed, is all this comparison needs.
 */
export function BeforeAfterBars({
  rows,
}: {
  rows: { key: string; label: string; unit: string; before: number; after: number; goodWhen: 'up' | 'down' }[];
}) {
  const { dict, locale } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();

  const beforeColor = mode === 'dark' ? '#758783' : '#9aa3a0';
  const afterColor = seriesColor(0, mode);

  return (
    <div className="space-y-3.5">
      {rows.map((row) => {
        const scale = Math.max(row.before, row.after, 1);
        const delta = percentDelta(row.before, row.after);
        const improved = delta === 0 ? null : (delta > 0) === (row.goodWhen === 'up');

        return (
          <div key={row.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-ink-muted">{row.label}</span>
              <span
                className={`tnum text-[11px] font-semibold ${
                  improved === null
                    ? 'text-ink-subtle'
                    : improved
                      ? 'text-[#2f6b3f] dark:text-[#66b27c]'
                      : 'text-[#b4531a] dark:text-[#e5904a]'
                }`}
              >
                {formatSignedPercent(delta, locale)}
              </span>
            </div>

            <div className="mt-1.5 space-y-1">
              {(
                [
                  { name: dict.whatif.before, value: row.before, color: beforeColor },
                  { name: dict.whatif.after, value: row.after, color: afterColor },
                ] as const
              ).map((bar) => (
                <div key={bar.name} className="flex items-center gap-2">
                  <span className="w-8 shrink-0 text-[10px] text-ink-subtle">{bar.name}</span>
                  <span className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ backgroundColor: bar.color }}
                      initial={false}
                      animate={{ width: `${(bar.value / scale) * 100}%` }}
                      transition={{ duration: motionOK ? 0.4 : 0, ease: 'easeOut' }}
                    />
                  </span>
                  <span className="tnum w-14 shrink-0 text-end text-[10px] text-ink-muted">
                    {formatCompact(bar.value)}
                    <span className="ms-0.5 text-ink-subtle">{row.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
