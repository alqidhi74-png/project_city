'use client';

import type { SortDirection } from '@/lib/tableState';
import { ChevronDownIcon, ChevronUpIcon, SortIcon } from './Icons';

export function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: string;
  activeKey: string | null;
  direction: SortDirection;
  onSort: (key: string) => void;
}) {
  const isActive = activeKey === sortKey;

  return (
    <th
      scope="col"
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-2 py-2 text-start font-medium"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 transition-colors hover:text-ink ${
          isActive ? 'text-ink' : 'text-ink-subtle'
        }`}
      >
        {label}
        {isActive ? (
          direction === 'asc' ? (
            <ChevronUpIcon className="size-3" />
          ) : (
            <ChevronDownIcon className="size-3" />
          )
        ) : (
          <SortIcon className="size-3 opacity-40" />
        )}
      </button>
    </th>
  );
}
