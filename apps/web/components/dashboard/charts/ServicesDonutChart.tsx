'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { chartAnimation, useMotionOK } from '@/lib/motion';
import { chartColors } from '@/lib/theme';
import { requestCategoryOrder, serviceBreakdown } from '@/lib/selectors';
import { formatNumber } from '@/lib/format';
import { ChartCard, ChartLegend } from './ChartCard';
import { renderChartTooltip } from './ChartTooltip';
import { useChartDirection } from './useChartDirection';

/**
 * The only genuinely multi-series chart, so it takes the full categorical
 * order. Categories are assigned a slot in sequence and keep it — a district
 * filter that removes a category never repaints the survivors.
 */
export function ServicesDonutChart() {
  const { dict, data, locale, selection } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();
  const { chrome } = useChartDirection();

  const palette = chartColors(mode);
  const points = serviceBreakdown(data, selection, locale);
  const total = points.reduce((sum, point) => sum + point.value, 0);

  // Slot is pinned to the category key's position in the full dataset, so it is
  // stable across filters rather than depending on this chart's sort order.
  const order = requestCategoryOrder(data);
  const colorFor = (key: string) => {
    const slot = order.indexOf(key);
    return palette[(slot < 0 ? 0 : slot) % palette.length];
  };

  const legendItems = points.map((point) => ({
    key: point.key,
    label: point.label,
    color: colorFor(point.key),
    value: formatNumber(point.value, locale),
  }));

  return (
    <ChartCard
      id="services"
      title={dict.charts.servicesTitle}
      subtitle={dict.charts.servicesSubtitle}
      legend={points.length > 0 ? <ChartLegend items={legendItems} /> : undefined}
    >
      {points.length === 0 ? (
        <p className="grid h-[200px] place-items-center text-xs text-ink-subtle">
          {dict.charts.noData}
        </p>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart key={selection.district ?? 'all'}>
              <Tooltip
                content={(props: unknown) =>
                  renderChartTooltip(props, { locale, unit: dict.map.tooltipRequests })
                }
              />
              <Pie
                data={points}
                dataKey="value"
                nameKey="label"
                innerRadius={54}
                outerRadius={82}
                paddingAngle={2}
                stroke={chrome.surface}
                strokeWidth={2}
                {...chartAnimation(motionOK)}
              >
                {points.map((point) => (
                  <Cell key={point.key} fill={colorFor(point.key)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="tnum text-xl font-semibold text-ink">
                {formatNumber(total, locale)}
              </p>
              <p className="text-[10px] text-ink-subtle">{dict.map.tooltipRequests}</p>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
