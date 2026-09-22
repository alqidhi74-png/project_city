'use client';

import { useDashboard } from '../state/DashboardProvider';
import type { RequestRow } from '@/types/dashboard';
import type { SortDirection } from '@/lib/tableState';
import { findDistrict } from '@/lib/selectors';
import { formatDate } from '@/lib/format';
import { StatusBadge, PriorityLabel } from '../ui/Badges';
import { SortableHeader } from '../ui/SortableHeader';

/** `row.status` already reflects any local override — the caller merges it before handing rows here. */
export function RequestsDataTable({
  rows,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
}: {
  rows: RequestRow[];
  sortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
  onRowClick: (row: RequestRow) => void;
}) {
  const { dict, data, locale } = useDashboard();

  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-ink-subtle">{dict.table.empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[50rem] border-collapse text-start text-xs">
        <thead>
          <tr className="border-b border-hairline text-ink-subtle">
            <SortableHeader
              label={dict.table.id}
              sortKey="id"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label={dict.table.district}
              sortKey="district"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <th className="px-2 py-2 text-start font-medium">{dict.table.service}</th>
            <th className="px-2 py-2 text-start font-medium">{dict.table.applicant}</th>
            <SortableHeader
              label={dict.table.status}
              sortKey="status"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label={dict.table.priority}
              sortKey="priority"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
            <SortableHeader
              label={dict.table.date}
              sortKey="date"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const district = findDistrict(data, row.districtId);
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick(row)}
                className="cursor-pointer border-b border-hairline/60 transition-colors last:border-0 hover:bg-surface-sunken/60"
              >
                <td className="tnum whitespace-nowrap px-2 py-2.5 text-ink-subtle">{row.id}</td>
                <td className="whitespace-nowrap px-2 py-2.5 text-ink-muted">
                  {district ? district.name[locale] : '—'}
                </td>
                <td className="px-2 py-2.5 font-medium text-ink">{row.service[locale]}</td>
                <td className="whitespace-nowrap px-2 py-2.5 text-ink-muted">
                  {row.applicant[locale]}
                </td>
                <td className="px-2 py-2.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-2 py-2.5">
                  <PriorityLabel priority={row.priority} />
                </td>
                <td className="tnum whitespace-nowrap px-2 py-2.5 text-ink-subtle">
                  {formatDate(row.submittedAt, locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
