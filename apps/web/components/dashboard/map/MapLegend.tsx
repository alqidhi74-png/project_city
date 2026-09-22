'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { layerSwatches, LAYER_METRIC, LAYER_PRECISION } from '@/lib/layers';
import { metricRange } from '@/lib/selectors';
import { formatCompact } from '@/lib/format';

/** Ramp scale for the active layer, with the real min/max of the selected year. */
export function MapLegend() {
  const { dict, data, activeLayer, selectedYear } = useDashboard();
  const { mode } = useTheme();

  const swatches = layerSwatches(activeLayer, mode);
  const range = metricRange(data, LAYER_METRIC[activeLayer], selectedYear);
  const precision = LAYER_PRECISION[activeLayer];

  return (
    <div className="flex items-center gap-2 text-[11px] text-ink-subtle">
      <span className="tnum">
        {dict.map.low} · {formatCompact(Number(range.min.toFixed(precision)))}
      </span>
      <span className="flex overflow-hidden rounded-full ring-1 ring-hairline" aria-hidden>
        {swatches.map((color) => (
          <span key={color} className="h-2.5 w-6" style={{ backgroundColor: color }} />
        ))}
      </span>
      <span className="tnum">
        {formatCompact(Number(range.max.toFixed(precision)))} · {dict.map.high}
      </span>
    </div>
  );
}
