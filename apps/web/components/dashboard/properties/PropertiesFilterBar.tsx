'use client';

import { useDashboard } from '../state/DashboardProvider';
import type { PropertyStatus, PropertyType } from '@/types/dashboard';
import { SearchIcon } from '../ui/Icons';

export type PropertiesFilters = {
  status: PropertyStatus | 'all';
  type: PropertyType | 'all';
  districtId: string | 'all';
};

export const EMPTY_PROPERTIES_FILTERS: Omit<PropertiesFilters, 'districtId'> = {
  status: 'all',
  type: 'all',
};

export function PropertiesFilterBar({
  search,
  onSearch,
  filters,
  onFilters,
}: {
  search: string;
  onSearch: (value: string) => void;
  filters: PropertiesFilters;
  onFilters: (filters: PropertiesFilters) => void;
}) {
  const { dict, data, locale } = useDashboard();

  const set = <K extends keyof PropertiesFilters>(key: K, value: PropertiesFilters[K]) =>
    onFilters({ ...filters, [key]: value });

  const selectClass =
    'rounded-xl border border-hairline bg-surface-raised px-2.5 py-2 text-xs text-ink outline-none transition-colors focus:border-city-emerald';

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex min-w-[10rem] flex-1 items-center gap-2 rounded-xl border border-hairline bg-surface-raised px-3 py-2 sm:max-w-xs">
        <SearchIcon className="size-4 shrink-0 text-ink-subtle" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={dict.propertiesPage.searchPlaceholder}
          aria-label={dict.propertiesPage.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-subtle"
        />
      </div>

      <select
        value={filters.status}
        onChange={(event) => set('status', event.target.value as PropertiesFilters['status'])}
        aria-label={dict.propertiesPage.status}
        className={selectClass}
      >
        <option value="all">{dict.requestsPage.allStatuses}</option>
        <option value="available">{dict.propertiesPage.statusAvailable}</option>
        <option value="reserved">{dict.propertiesPage.statusReserved}</option>
        <option value="sold">{dict.propertiesPage.statusSold}</option>
      </select>

      <select
        value={filters.type}
        onChange={(event) => set('type', event.target.value as PropertiesFilters['type'])}
        aria-label={dict.propertiesPage.type}
        className={selectClass}
      >
        <option value="all">{dict.propertiesPage.allTypes}</option>
        <option value="residential">{dict.propertiesPage.typeResidential}</option>
        <option value="commercial">{dict.propertiesPage.typeCommercial}</option>
        <option value="land">{dict.propertiesPage.typeLand}</option>
      </select>

      <select
        value={filters.districtId}
        onChange={(event) => set('districtId', event.target.value)}
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

      {filters.status !== 'all' || filters.type !== 'all' || filters.districtId !== 'all' || search ? (
        <button
          type="button"
          onClick={() => {
            onSearch('');
            onFilters({ ...EMPTY_PROPERTIES_FILTERS, districtId: 'all' });
          }}
          className="rounded-xl px-2.5 py-2 text-xs font-medium text-ink-subtle transition-colors hover:text-ink"
        >
          {dict.requestsPage.clearFilters}
        </button>
      ) : null}
    </div>
  );
}
