'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { waterSeries } from '@/lib/selectors';
import { formatCompact } from '@/lib/format';
import { ChartCard } from './ChartCard';
import { renderChartTooltip } from './ChartTooltip';
import { useChartDirection } from './useChartDirection';

export function WaterAreaChart() {
  const { dict, data, locale, selection } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();
  const { xAxisProps, yAxisProps, gridProps, chrome } = useChartDirection();

  const points = waterSeries(data, selection);
  const color = metricColor('water', mode);
  const current = points.find((point) => point.year === selection.year);

  return (
    <ChartCard id="water" title={dict.charts.waterTitle} subtitle={dict.charts.waterSubtitle}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          key={`${selection.district ?? 'all'}-${selection.period}`}
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.42} />
              <stop offset="100%" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...xAxisProps} />
          <YAxis {...yAxisProps} tickFormatter={formatCompact} />
          <Tooltip
            cursor={{ stroke: chrome.grid, strokeWidth: 1 }}
            content={(props: unknown) =>
              renderChartTooltip(props, { locale, precision: 1, unit: dict.charts.valueLabel })
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            name={dict.map.layers.water}
            stroke={color}
            strokeWidth={2}
            fill="url(#waterFill)"
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
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
