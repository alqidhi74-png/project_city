'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { chartAnimation, useMotionOK } from '@/lib/motion';
import { metricColor } from '@/lib/theme';
import { requestsSeries } from '@/lib/selectors';
import { formatCompact } from '@/lib/format';
import { ChartCard } from './ChartCard';
import { renderChartTooltip } from './ChartTooltip';
import { useChartDirection } from './useChartDirection';

/** Single series, so no legend box — the card title names it. */
export function RequestsLineChart() {
  const { dict, data, locale, selection } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();
  const { xAxisProps, yAxisProps, gridProps, chrome } = useChartDirection();

  const points = requestsSeries(data, selection);
  const color = metricColor('requests', mode);
  const current = points.find((point) => point.year === selection.year);

  return (
    <ChartCard
      id="requests"
      title={dict.charts.requestsTitle}
      subtitle={dict.charts.requestsSubtitle}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          // Re-keying replays the draw-on animation when a filter changes.
          key={`${selection.district ?? 'all'}-${selection.period}`}
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
        >
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...xAxisProps} />
          <YAxis {...yAxisProps} tickFormatter={formatCompact} />
          <Tooltip
            cursor={{ stroke: chrome.grid, strokeWidth: 1 }}
            content={(props: unknown) =>
              renderChartTooltip(props, { locale, unit: dict.map.tooltipRequests })
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            name={dict.map.layers.requests}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: chrome.surface }}
            {...chartAnimation(motionOK)}
          />
          {current ? (
            <ReferenceDot
              x={current.label}
              y={current.value}
              r={5}
              fill={color}
              stroke={chrome.surface}
              strokeWidth={2}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
