'use client';

import { useMemo, useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import { useTableState } from '@/lib/tableState';
import { findDistrict } from '@/lib/selectors';
import { template } from '@/lib/format';
import { Card, CardHeader } from '../ui/Card';
import { Pagination } from '../ui/Pagination';
import { PropertyKpiRow } from './PropertyKpiRow';
import { UnitsByDistrictChart } from './UnitsByDistrictChart';
import { SalesTrendChart } from './SalesTrendChart';
import {
  PropertiesFilterBar,
  EMPTY_PROPERTIES_FILTERS,
  type PropertiesFilters,
} from './PropertiesFilterBar';
import { PropertiesTable } from './PropertiesTable';

const STATUS_RANK = { available: 0, reserved: 1, sold: 2 } as const;
const TYPE_RANK = { residential: 0, commercial: 1, land: 2 } as const;

export function PropertiesPageContent() {
  const { dict, data, locale, selectedDistrict } = useDashboard();

  const [filters, setFilters] = useState<PropertiesFilters>(() => ({
    ...EMPTY_PROPERTIES_FILTERS,
    districtId: selectedDistrict ?? 'all',
  }));

  const filteredRows = useMemo(
    () =>
      data.properties.filter((unit) => {
        if (filters.status !== 'all' && unit.status !== filters.status) return false;
        if (filters.type !== 'all' && unit.type !== filters.type) return false;
        if (filters.districtId !== 'all' && unit.districtId !== filters.districtId) return false;
        return true;
      }),
    [data.properties, filters],
  );

  const table = useTableState(filteredRows, {
    searchFields: (unit) => [unit.id, unit.unitLabel[locale], unit.typeLabel[locale]],
    sortValue: (unit, key) => {
      switch (key) {
        case 'unit':
          return unit.unitLabel[locale];
        case 'district':
          return findDistrict(data, unit.districtId)?.name[locale] ?? '';
        case 'type':
          return TYPE_RANK[unit.type];
        case 'price':
          return unit.price;
        case 'status':
          return STATUS_RANK[unit.status];
        default:
          return '';
      }
    },
    pageSize: 8,
    initialSort: { key: 'price', direction: 'desc' },
  });

  return (
    <div className="space-y-3">
      <PropertyKpiRow />

      <div className="grid gap-3 lg:grid-cols-2">
        <UnitsByDistrictChart />
        <SalesTrendChart />
      </div>

      <Card>
        <CardHeader
          title={dict.propertiesPage.title}
          subtitle={template(dict.table.subtitle, { n: table.total })}
        />
        <div className="mt-3">
          <PropertiesFilterBar
            search={table.search}
            onSearch={table.setSearch}
            filters={filters}
            onFilters={setFilters}
          />
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4 sm:p-5">
          <PropertiesTable
            rows={table.rows}
            sortKey={table.sortKey}
            sortDirection={table.sortDirection}
            onSort={table.toggleSort}
          />
          <Pagination page={table.page} pageCount={table.pageCount} onChange={table.setPage} />
        </div>
      </Card>
    </div>
  );
}
