'use client';

import { useDashboard } from '../state/DashboardProvider';
import { KpiCard } from './KpiCard';

export function KpiGrid() {
  const { data } = useDashboard();

  return (
    <div
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      data-story-anchor="kpi-grid"
    >
      {data.kpis.map((kpi, index) => (
        <KpiCard key={kpi.id} kpi={kpi} index={index} />
      ))}
    </div>
  );
}
