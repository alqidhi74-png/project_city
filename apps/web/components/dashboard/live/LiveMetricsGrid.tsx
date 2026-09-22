'use client';

import { LIVE_METRIC_ORDER } from '@/lib/liveMetrics';
import { LiveMetricTile } from './LiveMetricTile';

export function LiveMetricsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {LIVE_METRIC_ORDER.map((key) => (
        <LiveMetricTile key={key} metricKey={key} />
      ))}
    </div>
  );
}
