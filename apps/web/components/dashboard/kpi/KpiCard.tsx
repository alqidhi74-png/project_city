'use client';

import { motion } from 'framer-motion';

import type { KpiDef } from '@/types/dashboard';
import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { useMotionOK, staggered } from '@/lib/motion';
import { metricColor } from '@/lib/theme';
import { YEARS } from '@/types/dashboard';
import {
  kpiPrevious,
  kpiSparkline,
  kpiValue,
  percentChange,
} from '@/lib/selectors';
import { formatSignedPercent } from '@/lib/format';
import { Card } from '../ui/Card';
import { CountUp } from '../ui/CountUp';
import { Sparkline } from './Sparkline';

export function KpiCard({ kpi, index }: { kpi: KpiDef; index: number }) {
  const { data, dict, locale, selection, highlight } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();

  const value = kpiValue(data, kpi, selection);
  const previous = kpiPrevious(data, kpi, selection);
  const change = percentChange(value, previous);
  const spark = kpiSparkline(data, kpi, selection);
  const color = metricColor(kpi.metric, mode);

  const isHighlighted = highlight?.kind === 'kpi' && highlight.id === kpi.id;

  // "Good" depends on the metric: more residents is good, more water is not.
  const changeTone =
    change === null || change === 0
      ? 'text-ink-subtle'
      : (change > 0) === (kpi.goodWhen === 'up')
        ? 'text-[#2f6b3f] dark:text-[#66b27c]'
        : 'text-[#b4531a] dark:text-[#e5904a]';

  return (
    <motion.div {...staggered(index, motionOK)} data-story-anchor={`kpi-${kpi.id}`}>
      <Card highlighted={isHighlighted} className="h-full">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-ink-muted">{kpi.label[locale]}</p>
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        </div>

        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-ink sm:text-[1.75rem]">
            <CountUp value={value} locale={locale} precision={kpi.precision} />
          </span>
          <span className="text-[11px] text-ink-subtle">{kpi.unit[locale]}</span>
        </p>

        <div className="mt-2">
          <Sparkline
            values={spark}
            color={color}
            markerIndex={YEARS.indexOf(selection.year)}
          />
        </div>

        <p className={`mt-1 text-[11px] ${changeTone}`}>
          {change === null ? '—' : formatSignedPercent(change, locale)}{' '}
          <span className="text-ink-subtle">{dict.kpi.vsPrevious}</span>
        </p>
      </Card>
    </motion.div>
  );
}
