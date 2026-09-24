'use client';

import type { ReactElement, SVGProps } from 'react';

import type { ReportDef } from '@/lib/reports';
import { useDashboard } from '../state/DashboardProvider';

export function ReportCard({
  report,
  Icon,
  selected,
  onSelect,
}: {
  report: ReportDef;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  selected: boolean;
  onSelect: () => void;
}) {
  const { dict } = useDashboard();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-colors',
        selected
          ? 'border-city-emerald bg-city-emerald/8'
          : 'border-hairline bg-surface-raised hover:bg-surface-sunken',
      ].join(' ')}
    >
      <span className="bg-gold-gradient grid size-9 shrink-0 place-items-center rounded-lg text-city-emerald">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink">{report.title(dict)}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-subtle">
          {report.description(dict)}
        </span>
      </span>
    </button>
  );
}
