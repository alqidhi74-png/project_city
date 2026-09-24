'use client';

import { useDashboard } from '../state/DashboardProvider';
import { YEARS, type Year } from '@/types/dashboard';

export function ReportFilters({
  districtId,
  onDistrict,
  fromYear,
  toYear,
  onFromYear,
  onToYear,
}: {
  districtId: string | 'all';
  onDistrict: (value: string) => void;
  fromYear: Year;
  toYear: Year;
  onFromYear: (year: Year) => void;
  onToYear: (year: Year) => void;
}) {
  const { dict, data, locale } = useDashboard();
  const selectClass =
    'rounded-xl border border-hairline bg-surface-raised px-2.5 py-2 text-xs text-ink outline-none transition-colors focus:border-city-emerald';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={districtId}
        onChange={(event) => onDistrict(event.target.value)}
        aria-label={dict.table.district}
        className={selectClass}
      >
        <option value="all">{dict.common.cityWide}</option>
        {data.districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name[locale]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <select
          value={fromYear}
          onChange={(event) => onFromYear(Number(event.target.value) as Year)}
          aria-label={dict.reportsPage.fromYear}
          className={`${selectClass} tnum`}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <span className="text-ink-subtle">–</span>
        <select
          value={toYear}
          onChange={(event) => onToYear(Number(event.target.value) as Year)}
          aria-label={dict.reportsPage.toYear}
          className={`${selectClass} tnum`}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
