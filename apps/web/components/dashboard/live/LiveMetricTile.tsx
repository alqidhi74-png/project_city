'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useLiveFeed, type LiveMetricKey } from '../state/LiveFeedProvider';
import { useTheme } from '../state/ThemeProvider';
import { useSettings } from '../state/SettingsProvider';
import { seriesColor } from '@/lib/theme';
import {
  LIVE_METRIC_COLOR_SLOT,
  LIVE_METRIC_ICON,
  liveMetricLabel,
  liveMetricUnit,
  isOverThreshold,
} from '@/lib/liveMetrics';
import { formatNumber } from '@/lib/format';
import { Card } from '../ui/Card';
import { Sparkline } from '../kpi/Sparkline';

export function LiveMetricTile({ metricKey }: { metricKey: LiveMetricKey }) {
  const { dict, locale } = useDashboard();
  const { metrics, history } = useLiveFeed();
  const { mode } = useTheme();
  const { thresholds } = useSettings();

  const value = metrics[metricKey];
  const series = history[metricKey];
  const color = seriesColor(LIVE_METRIC_COLOR_SLOT[metricKey], mode);
  const Icon = LIVE_METRIC_ICON[metricKey];
  const over = isOverThreshold(metricKey, value, thresholds);

  return (
    <Card className={over ? 'ring-1 ring-vermilion/50' : ''}>
      <div className="flex items-center gap-2">
        <span
          className="grid size-7 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
        >
          <Icon className="size-4" />
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-ink-muted">
          {liveMetricLabel(metricKey, dict)}
        </p>
      </div>

      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="tnum text-2xl font-semibold text-ink">{formatNumber(value, locale)}</span>
        <span className="text-[11px] text-ink-subtle">{liveMetricUnit(metricKey, dict)}</span>
      </p>

      <div className="mt-2">
        <Sparkline values={series} color={color} markerIndex={series.length - 1} />
      </div>

      {over ? (
        <p className="mt-1.5 text-[10px] font-medium text-[#b4301a] dark:text-[#f0714f]">
          {dict.livePage.overThreshold}
        </p>
      ) : null}
    </Card>
  );
}
