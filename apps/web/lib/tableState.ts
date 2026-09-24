'use client';

import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export type TableState<T> = {
  /** Current page of rows, already searched, sorted and sliced. */
  rows: T[];
  /** Total rows after search/filter, before pagination. */
  total: number;
  search: string;
  setSearch: (value: string) => void;
  sortKey: string | null;
  sortDirection: SortDirection;
  /** Clicking the active column flips direction; a new column starts ascending. */
  toggleSort: (key: string) => void;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
};

export type UseTableStateOptions<T> = {
  /** Extracts the text fields the search box matches against. */
  searchFields: (row: T) => string[];
  /** Extracts the comparable value for a given sort key. */
  sortValue?: (row: T, key: string) => string | number;
  pageSize?: number;
  initialSort?: { key: string; direction: SortDirection };
};

/**
 * Search + sort + pagination over an in-memory row set. Both the Requests and
 * Properties tables are built on this, so the interaction model — and its
 * edge cases (page clamping when the filtered set shrinks) — only exist once.
 */
export function useTableState<T>(
  data: T[],
  { searchFields, sortValue, pageSize = 8, initialSort }: UseTableStateOptions<T>,
): TableState<T> {
  const [search, setSearchRaw] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSort?.direction ?? 'asc',
  );
  const [page, setPageRaw] = useState(1);

  const setSearch = (value: string) => {
    setSearchRaw(value);
    setPageRaw(1);
  };

  const toggleSort = (key: string) => {
    setSortKey((current) => {
      if (current !== key) {
        setSortDirection('asc');
        return key;
      }
      setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return key;
    });
    setPageRaw(1);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((row) =>
      searchFields(row).some((field) => field.toLowerCase().includes(query)),
    );
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortValue) return filtered;
    const withKeys = filtered.map((row) => ({ row, value: sortValue(row, sortKey) }));
    withKeys.sort((a, b) => {
      if (typeof a.value === 'number' && typeof b.value === 'number') {
        return a.value - b.value;
      }
      return String(a.value).localeCompare(String(b.value));
    });
    if (sortDirection === 'desc') withKeys.reverse();
    return withKeys.map((entry) => entry.row);
  }, [filtered, sortKey, sortValue, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const rows = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  const setPage = (next: number) => setPageRaw(Math.min(pageCount, Math.max(1, next)));

  return {
    rows,
    total: sorted.length,
    search,
    setSearch,
    sortKey,
    sortDirection,
    toggleSort,
    page: safePage,
    pageCount,
    setPage,
  };
}
