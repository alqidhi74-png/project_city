'use client';

import { useDashboard } from '../state/DashboardProvider';
import type { AlertCategory, AlertSeverity } from '@/types/dashboard';

export type AlertsFilters = {
  severity: AlertSeverity | 'all';
  category: AlertCategory | 'all';
  onlyUnresolved: boolean;
};

export const DEFAULT_ALERTS_FILTERS: AlertsFilters = {
  severity: 'all',
  category: 'all',
  onlyUnresolved: false,
};

export function AlertsFilterBar({
  filters,
  onFilters,
}: {
  filters: AlertsFilters;
  onFilters: (filters: AlertsFilters) => void;
}) {
  const { dict } = useDashboard();
  const set = <K extends keyof AlertsFilters>(key: K, value: AlertsFilters[K]) =>
    onFilters({ ...filters, [key]: value });

  const selectClass =
    'rounded-xl border border-hairline bg-surface-raised px-2.5 py-2 text-xs text-ink outline-none transition-colors focus:border-city-emerald';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.severity}
        onChange={(event) => set('severity', event.target.value as AlertsFilters['severity'])}
        aria-label={dict.livePage.severity}
        className={selectClass}
      >
        <option value="all">{dict.livePage.allSeverities}</option>
        <option value="info">{dict.live.severityInfo}</option>
        <option value="warning">{dict.live.severityWarning}</option>
        <option value="critical">{dict.live.severityCritical}</option>
      </select>

      <select
        value={filters.category}
        onChange={(event) => set('category', event.target.value as AlertsFilters['category'])}
        aria-label={dict.livePage.category}
        className={selectClass}
      >
        <option value="all">{dict.livePage.allCategories}</option>
        <option value="traffic">{dict.live.categoryTraffic}</option>
        <option value="air">{dict.live.categoryAir}</option>
        <option value="energy">{dict.live.categoryEnergy}</option>
        <option value="water">{dict.live.categoryWater}</option>
        <option value="security">{dict.live.categorySecurity}</option>
      </select>

      <label className="flex items-center gap-1.5 text-xs text-ink-muted">
        <input
          type="checkbox"
          checked={filters.onlyUnresolved}
          onChange={(event) => set('onlyUnresolved', event.target.checked)}
          className="accent-city-emerald"
        />
        {dict.livePage.onlyUnresolved}
      </label>
    </div>
  );
}
