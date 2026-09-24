'use client';

import { AnimatePresence } from 'framer-motion';

import { useDashboard } from '../state/DashboardProvider';
import { useLiveFeed } from '../state/LiveFeedProvider';
import { useTheme } from '../state/ThemeProvider';
import { metricColor } from '@/lib/theme';
import { Card, CardHeader } from '../ui/Card';
import { LiveMetric } from './LiveMetric';
import { AlertItem } from './AlertItem';
import { useNow, useTimeAgo } from './useTimeAgo';

export function LiveFeedPanel() {
  const { dict, locale } = useDashboard();
  const { metrics, tick, alerts, selectAlert } = useLiveFeed();
  const { mode } = useTheme();
  const now = useNow();
  const timeAgo = useTimeAgo(locale);

  return (
    <Card className="flex h-full flex-col" data-story-anchor="live-feed">
      <CardHeader
        title={dict.live.title}
        subtitle={dict.live.subtitle}
        action={
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-vermilion" />
            <span className="relative inline-flex size-2.5 rounded-full bg-vermilion" />
          </span>
        }
      />

      <div className="-mx-1 space-y-0.5 border-b border-hairline pb-3">
        <LiveMetric
          label={dict.live.traffic}
          value={metrics.traffic}
          unit={dict.live.trafficUnit}
          color={metricColor('requests', mode)}
          tick={tick}
          locale={locale}
        />
        <LiveMetric
          label={dict.live.air}
          value={metrics.air}
          unit={dict.live.airUnit}
          color={metricColor('air', mode)}
          tick={tick}
          locale={locale}
        />
        <LiveMetric
          label={dict.live.energy}
          value={metrics.energy}
          unit={dict.live.energyUnit}
          color={metricColor('energy', mode)}
          tick={tick}
          locale={locale}
        />
      </div>

      <p className="mt-3 mb-2 text-[11px] font-semibold text-ink-muted">{dict.live.alerts}</p>

      {alerts.length === 0 ? (
        <p className="py-6 text-center text-xs text-ink-subtle">{dict.live.noAlerts}</p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto pe-1 lg:max-h-none lg:flex-1">
          <AnimatePresence initial={false}>
            {alerts.map((alert) => (
              <AlertItem
                key={alert.key}
                alert={alert}
                timeAgo={timeAgo(alert.at, now)}
                onSelect={selectAlert}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  );
}
