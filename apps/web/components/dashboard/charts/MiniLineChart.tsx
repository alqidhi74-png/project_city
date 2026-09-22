'use client';

import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useDashboard } from '../state/DashboardProvider';
import { chartAnimation, useMotionOK } from '@/lib/motion';
import { formatCompact } from '@/lib/format';
import { renderChartTooltip } from './ChartTooltip';
import { useChartDirection } from './useChartDirection';

export type MiniLinePoint = { label: string; value: number };

/**
 * Presentational line chart with no `ChartCard`/highlight coupling — callers
 * wrap it in a plain `Card`. Reused by Properties' sales trend and every
 * Reports preview, so the RTL axis handling and tooltip only exist once.
 */
export function MiniLineChart({
  points,
  color,
  unit,
  precision = 0,
  seriesName,
  markLabel,
  height = 180,
}: {
  points: MiniLinePoint[];
  color: string;
  unit: string;
  precision?: number;
  seriesName: string;
  /** Draws a highlighted dot on this point's label, e.g. the selected year. */
  markLabel?: string;
  height?: number;
}) {
  const { dict, locale } = useDashboard();
  const motionOK = useMotionOK();
  const { xAxisProps, yAxisProps, gridProps, chrome } = useChartDirection();
  const marked = markLabel ? points.find((point) => point.label === markLabel) : undefined;

  if (points.length === 0) {
    return (
      <p className="grid place-items-center text-xs text-ink-subtle" style={{ height }}>
        {dict.charts.noData}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...xAxisProps} />
        <YAxis {...yAxisProps} tickFormatter={formatCompact} />
        <Tooltip
          cursor={{ stroke: chrome.grid, strokeWidth: 1 }}
          content={(props: unknown) => renderChartTooltip(props, { locale, unit, precision })}
        />
        <Line
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: chrome.surface }}
          {...chartAnimation(motionOK)}
        />
        {marked ? (
          <ReferenceDot
            x={marked.label}
            y={marked.value}
            r={5}
            fill={color}
            stroke={chrome.surface}
            strokeWidth={2}
          />
        ) : null}
      </LineChart>
    </ResponsiveContainer>
  );
}
