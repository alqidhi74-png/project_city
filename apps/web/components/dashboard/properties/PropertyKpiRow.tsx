'use client';

import { useDashboard } from '../state/DashboardProvider';
import { propertyCounts } from '@/lib/properties';
import { Card } from '../ui/Card';
import { CountUp } from '../ui/CountUp';

const TONE_CLASS = {
  default: 'text-ink',
  good: 'text-[#2f6b3f] dark:text-[#66b27c]',
  warn: 'text-[#8a6d00] dark:text-[#d8b13c]',
} as const;

export function PropertyKpiRow() {
  const { dict, data, locale, selection } = useDashboard();
  const counts = propertyCounts(data, selection);

  const cards = [
    { key: 'total', label: dict.propertiesPage.kpiTotal, value: counts.total, tone: 'default' },
    { key: 'available', label: dict.propertiesPage.kpiAvailable, value: counts.available, tone: 'good' },
    { key: 'reserved', label: dict.propertiesPage.kpiReserved, value: counts.reserved, tone: 'warn' },
    { key: 'sold', label: dict.propertiesPage.kpiSold, value: counts.sold, tone: 'default' },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <p className="text-xs font-medium text-ink-muted">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold sm:text-[1.75rem] ${TONE_CLASS[card.tone]}`}>
            <CountUp value={card.value} locale={locale} />
          </p>
        </Card>
      ))}
    </div>
  );
}
