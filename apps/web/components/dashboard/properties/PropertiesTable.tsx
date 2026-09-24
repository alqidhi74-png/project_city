'use client';

import { useDashboard } from '../state/DashboardProvider';
import type { PropertyUnit } from '@/types/dashboard';
import type { SortDirection } from '@/lib/tableState';
import { findDistrict } from '@/lib/selectors';
import { formatNumber } from '@/lib/format';
import { PropertyStatusBadge } from '../ui/Badges';
import { SortableHeader } from '../ui/SortableHeader';

export function PropertiesTable({
  rows,
  sortKey,
  sortDirection,
  onSort,
}: {
  rows: PropertyUnit[];
  sortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
}) {
  const { dict, data, locale } = useDashboard();

  if (rows.length === 0) {
    return <p className="py-8 text-center text-xs text-ink-subtle">{dict.table.empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse text-start text-xs">
        <thead>
          <tr className="border-b border-hairline text-ink-subtle">
            <SortableHeader label={dict.propertiesPage.unit} sortKey="unit" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
            <SortableHeader label={dict.table.district} sortKey="district" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
            <SortableHeader label={dict.propertiesPage.type} sortKey="type" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
            <th className="px-2 py-2 text-start font-medium">{dict.propertiesPage.area}</th>
            <SortableHeader label={dict.propertiesPage.price} sortKey="price" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
            <SortableHeader label={dict.propertiesPage.status} sortKey="status" activeKey={sortKey} direction={sortDirection} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {rows.map((unit) => {
            const district = findDistrict(data, unit.districtId);
            return (
              <tr key={unit.id} className="border-b border-hairline/60 last:border-0 hover:bg-surface-sunken/60">
                <td className="whitespace-nowrap px-2 py-2.5 font-medium text-ink">
                  {unit.unitLabel[locale]}
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-ink-muted">
                  {district ? district.name[locale] : '—'}
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-ink-muted">
                  {unit.typeLabel[locale]}
                </td>
                <td className="tnum whitespace-nowrap px-2 py-2.5 text-ink-subtle">
                  {formatNumber(unit.areaSqm, locale)} {dict.propertiesPage.sqm}
                  {unit.bedrooms ? ` · ${formatNumber(unit.bedrooms, locale)}${dict.propertiesPage.bedroomsShort}` : ''}
                </td>
                <td className="tnum whitespace-nowrap px-2 py-2.5 text-ink">
                  {formatNumber(unit.price, locale)} {dict.propertiesPage.currency}
                </td>
                <td className="px-2 py-2.5">
                  <PropertyStatusBadge status={unit.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
