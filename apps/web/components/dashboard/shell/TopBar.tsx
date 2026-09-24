'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { useDashboard } from '../state/DashboardProvider';
import { districtName } from '@/lib/selectors';
import { template } from '@/lib/format';
import { PeriodFilter } from './PeriodFilter';
import { ExportPdfButton } from './ExportPdfButton';
import { ThemeToggle } from './ThemeToggle';
import { StoryModeButton } from '../story/StoryModeButton';

function greetingKey(hour: number): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
  if (hour < 12) return 'greetingMorning';
  if (hour < 17) return 'greetingAfternoon';
  return 'greetingEvening';
}

export function TopBar() {
  const { dict, data, locale, selectedDistrict } = useDashboard();
  const pathname = usePathname();
  // Story mode's steps target Overview-only anchors (kpi-grid, city-map, …),
  // so the button only makes sense on that route.
  const isOverview = pathname === `/${locale}/dashboard`;

  // Resolved after mount so the server and first client render agree.
  const [key, setKey] = useState<ReturnType<typeof greetingKey>>('greetingMorning');
  useEffect(() => setKey(greetingKey(new Date().getHours())), []);

  const scopeName = districtName(data, selectedDistrict, locale);
  const scope = scopeName
    ? template(dict.kpi.inDistrict, { district: scopeName })
    : dict.kpi.cityWide;

  return (
    <header className="no-print flex flex-col gap-3 border-b border-hairline bg-surface/85 px-4 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-ink sm:text-xl">
          {dict.topbar[key]}
        </h1>
        <p className="mt-0.5 truncate text-xs text-ink-subtle sm:text-sm">
          {dict.topbar.subtitle} · <span className="text-ink-muted">{scope}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodFilter />
        {isOverview ? <StoryModeButton /> : null}
        <ExportPdfButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
