'use client';

import { useDashboard } from '../state/DashboardProvider';
import { PERIODS, type Period } from '@/types/dashboard';

/** Segmented control. Sits in one row above the charts, as filters should. */
export function PeriodFilter() {
  const { dict, period, setPeriod } = useDashboard();

  const labels: Record<Period, string> = {
    today: dict.topbar.today,
    week: dict.topbar.week,
    month: dict.topbar.month,
    year: dict.topbar.year,
  };

  return (
    <div
      role="group"
      aria-label={dict.topbar.period}
      className="inline-flex rounded-xl border border-hairline bg-surface-raised p-0.5"
    >
      {PERIODS.map((value) => {
        const isActive = value === period;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setPeriod(value)}
            className={[
              'rounded-[0.6rem] px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3',
              isActive
                ? 'bg-city-emerald text-white'
                : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
            ].join(' ')}
          >
            {labels[value]}
          </button>
        );
      })}
    </div>
  );
}
