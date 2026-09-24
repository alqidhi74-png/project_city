'use client';

import { useMemo, useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import { useLiveFeed } from '../state/LiveFeedProvider';
import { Card, CardHeader } from '../ui/Card';
import { AlertsFilterBar, DEFAULT_ALERTS_FILTERS, type AlertsFilters } from './AlertsFilterBar';
import { FullAlertRow } from './FullAlertRow';
import { useNow, useTimeAgo } from './useTimeAgo';

export function FullAlertsList() {
  const { dict, locale } = useDashboard();
  const { alerts } = useLiveFeed();
  const [filters, setFilters] = useState<AlertsFilters>(DEFAULT_ALERTS_FILTERS);
  const now = useNow();
  const timeAgo = useTimeAgo(locale);

  const rows = useMemo(
    () =>
      alerts.filter((alert) => {
        if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
        if (filters.category !== 'all' && alert.category !== filters.category) return false;
        if (filters.onlyUnresolved && alert.resolved) return false;
        return true;
      }),
    [alerts, filters],
  );

  return (
    <Card>
      <CardHeader title={dict.live.alerts} subtitle={dict.livePage.alertsSubtitle} />
      <div className="mb-3">
        <AlertsFilterBar filters={filters} onFilters={setFilters} />
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-ink-subtle">{dict.live.noAlerts}</p>
      ) : (
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto pe-1">
          {rows.map((alert) => (
            <FullAlertRow key={alert.key} alert={alert} timeAgo={timeAgo(alert.at, now)} />
          ))}
        </ul>
      )}
    </Card>
  );
}
