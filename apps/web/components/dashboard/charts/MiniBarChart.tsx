'use client';

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useDashboard } from '../state/DashboardProvider';
import { chartAnimation, useMotionOK } from '@/lib/motion';
import { formatCompact } from '@/lib/format';
import { renderChartTooltip } from './ChartTooltip';
import { useChartDirection } from './useChartDirection';

export type MiniBarPoint = { id: string; label: string; value: number; selected?: boolean };

/**
 * Presentational bar chart, the same nominal-category pattern as
 * `EnergyBarChart` (every bar shares one hue, selection dims the rest,
 * values are printed above each bar) but without the `ChartCard`/highlight
 * coupling. Reused by Properties' units-by-district chart and Reports.
 */
export function MiniBarChart({
  points,
  color,
  colorForPoint,
  unit,
  seriesName,
  onBarClick,
  height = 180,
}: {
  points: MiniBarPoint[];
  /** Flat fallback fill — ignored for a point where `colorForPoint` returns one. */
  color: string;
  /** Per-bar identity colour, for a nominal-categorical series (e.g. request category). */
  colorForPoint?: (point: MiniBarPoint) => string;
  unit: string;
  seriesName: string;
  onBarClick?: (id: string) => void;
  height?: number;
}) {
  const { dict, locale } = useDashboard();
  const motionOK = useMotionOK();
  const { xAxisProps, yAxisProps, gridProps, chrome } = useChartDirection();

  const withLabels = points.map((point) => ({ ...point, labelText: formatCompact(point.value) }));
  const anySelected = points.some((point) => point.selected);

  if (points.length === 0) {
    return (
      <p className="grid place-items-center text-xs text-ink-subtle" style={{ height }}>
        {dict.charts.noData}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={withLabels}
        margin={{ top: 18, right: 8, bottom: 0, left: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} interval={0} />
        <YAxis {...yAxisProps} tickFormatter={formatCompact} />
        <Tooltip
          cursor={{ fill: chrome.grid, fillOpacity: 0.28 }}
          content={(props: unknown) => renderChartTooltip(props, { locale, unit })}
        />
        <Bar
          dataKey="value"
          name={seriesName}
          radius={[4, 4, 0, 0]}
          stroke={chrome.surface}
          strokeWidth={2}
          {...chartAnimation(motionOK)}
          onClick={(entry: unknown) => {
            const point = entry as { id?: unknown } | null;
            if (onBarClick && point && typeof point.id === 'string') onBarClick(point.id);
          }}
          className={onBarClick ? 'cursor-pointer' : undefined}
        >
          {withLabels.map((point) => (
            <Cell
              key={point.id}
              fill={colorForPoint ? colorForPoint(point) : color}
              fillOpacity={!anySelected || point.selected ? 1 : 0.32}
            />
          ))}
          <LabelList dataKey="labelText" position="top" fill={chrome.ink} fontSize={10} offset={6} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
