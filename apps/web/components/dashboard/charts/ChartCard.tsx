'use client';

import type { ReactNode } from 'react';

import type { ChartId } from '@/types/dashboard';
import { useDashboard } from '../state/DashboardProvider';
import { Card, CardHeader } from '../ui/Card';

/**
 * Shared frame for the four charts. Owns the highlight ring so Ask-the-City and
 * story mode can point at a chart without each chart reimplementing it.
 */
export function ChartCard({
  id,
  title,
  subtitle,
  legend,
  children,
}: {
  id: ChartId;
  title: string;
  subtitle: string;
  legend?: ReactNode;
  children: ReactNode;
}) {
  const { highlight } = useDashboard();
  const highlighted = highlight?.kind === 'chart' && highlight.id === id;

  return (
    <Card highlighted={highlighted} className="flex h-full flex-col" data-story-anchor={`chart-${id}`}>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="min-h-0 flex-1">{children}</div>
      {legend ? <div className="mt-3">{legend}</div> : null}
    </Card>
  );
}

/** Swatch + name + value. Doubles as the direct labels for the donut. */
export function ChartLegend({
  items,
}: {
  items: { key: string; label: string; color: string; value?: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="truncate">{item.label}</span>
          {item.value ? <span className="tnum font-semibold text-ink">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}
