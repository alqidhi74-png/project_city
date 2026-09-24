'use client';

import { useMemo } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import type { RequestPriority, RequestStatus } from '@/types/dashboard';
import { SearchIcon } from '../ui/Icons';

export type RequestFilters = {
  status: RequestStatus | 'all';
  category: string | 'all';
  districtId: string | 'all';
  priority: RequestPriority | 'all';
  dateFrom: string;
  dateTo: string;
};

export const EMPTY_REQUEST_FILTERS: Omit<RequestFilters, 'districtId'> = {
  status: 'all',
  category: 'all',
  priority: 'all',
  dateFrom: '',
  dateTo: '',
};

export function RequestsFilterBar({
  search,
  onSearch,
  filters,
  onFilters,
}: {
  search: string;
  onSearch: (value: string) => void;
  filters: RequestFilters;
  onFilters: (filters: RequestFilters) => void;
}) {
  const { dict, data, locale } = useDashboard();

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of data.requests) {
      if (!seen.has(row.category)) seen.set(row.category, row.categoryLabel[locale]);
    }
    return [...seen.entries()];
  }, [data.requests, locale]);

  const set = <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) =>
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
          placeholder={dict.requestsPage.searchPlaceholder}
          aria-label={dict.requestsPage.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-subtle"
        />
      </div>

      <select
        value={filters.status}
        onChange={(event) => set('status', event.target.value as RequestFilters['status'])}
        aria-label={dict.table.status}
        className={selectClass}
      >
        <option value="all">{dict.requestsPage.allStatuses}</option>
        <option value="open">{dict.table.statusOpen}</option>
        <option value="in-progress">{dict.table.statusInProgress}</option>
        <option value="resolved">{dict.table.statusResolved}</option>
      </select>

      <select
        value={filters.category}
        onChange={(event) => set('category', event.target.value)}
        aria-label={dict.requestsPage.service}
        className={selectClass}
      >
        <option value="all">{dict.requestsPage.allServices}</option>
        {categories.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
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

      <select
        value={filters.priority}
        onChange={(event) => set('priority', event.target.value as RequestFilters['priority'])}
        aria-label={dict.table.priority}
        className={selectClass}
      >
        <option value="all">{dict.requestsPage.allPriorities}</option>
        <option value="low">{dict.table.priorityLow}</option>
        <option value="medium">{dict.table.priorityMedium}</option>
        <option value="high">{dict.table.priorityHigh}</option>
      </select>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => set('dateFrom', event.target.value)}
          aria-label={dict.requestsPage.dateFrom}
          className={`${selectClass} tnum`}
        />
        <span className="text-ink-subtle">–</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => set('dateTo', event.target.value)}
          aria-label={dict.requestsPage.dateTo}
          className={`${selectClass} tnum`}
        />
      </div>

      {filters.status !== 'all' ||
      filters.category !== 'all' ||
      filters.districtId !== 'all' ||
      filters.priority !== 'all' ||
      filters.dateFrom ||
      filters.dateTo ||
      search ? (
        <button
          type="button"
          onClick={() => {
            onSearch('');
            onFilters({ ...EMPTY_REQUEST_FILTERS, districtId: 'all' });
          }}
          className="rounded-xl px-2.5 py-2 text-xs font-medium text-ink-subtle transition-colors hover:text-ink"
        >
          {dict.requestsPage.clearFilters}
        </button>
      ) : null}
    </div>
  );
}
