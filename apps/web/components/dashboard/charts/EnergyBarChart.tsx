'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { chartAnimation, useMotionOK } from '@/lib/motion';
import { metricColor } from '@/lib/theme';
import { energyByDistrict } from '@/lib/selectors';
import { formatCompact } from '@/lib/format';
import { ChartCard } from './ChartCard';
import { renderChartTooltip } from './ChartTooltip';
import { useChartDirection } from './useChartDirection';

/**
 * District names are nominal, so every bar wears the same energy hue — bar
 * length already encodes the value. Selection is shown by dimming the others,
 * never by recolouring. Values are printed above each bar: the energy hue sits
 * below 3:1 on the light surface, so it needs that readable second channel.
 */
export function EnergyBarChart() {
  const { dict, data, locale, selection, toggleDistrict } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();
  const { xAxisProps, yAxisProps, gridProps, chrome } = useChartDirection();

  const color = metricColor('energy', mode);
  const points = energyByDistrict(data, selection, locale).map((point) => ({
    ...point,
    labelText: formatCompact(point.value),
  }));

  const anySelected = Boolean(selection.district);

  return (
    <ChartCard id="energy" title={dict.charts.energyTitle} subtitle={dict.charts.energySubtitle}>
      {points.length === 0 ? (
        <p className="grid h-[200px] place-items-center text-xs text-ink-subtle">
          {dict.charts.noData}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            key={`${selection.year}-${selection.district ?? 'all'}`}
            data={points}
            margin={{ top: 18, right: 8, bottom: 0, left: 8 }}
            barCategoryGap="28%"
          >
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...xAxisProps} interval={0} />
            <YAxis {...yAxisProps} tickFormatter={formatCompact} />
            <Tooltip
              cursor={{ fill: chrome.grid, fillOpacity: 0.28 }}
              content={(props: unknown) =>
                renderChartTooltip(props, { locale, unit: dict.whatif.energyUnit })
              }
            />
            <Bar
              dataKey="value"
              name={dict.map.layers.energy}
              radius={[4, 4, 0, 0]}
              stroke={chrome.surface}
              strokeWidth={2}
              {...chartAnimation(motionOK)}
              onClick={(entry: unknown) => {
                const point = entry as { id?: unknown } | null;
                if (point && typeof point.id === 'string') toggleDistrict(point.id);
              }}
              className="cursor-pointer"
            >
              {points.map((point) => (
                <Cell
                  key={point.id}
                  fill={color}
                  fillOpacity={!anySelected || point.selected ? 1 : 0.32}
                />
              ))}
              <LabelList
                dataKey="labelText"
                position="top"
                fill={chrome.ink}
                fontSize={10}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
