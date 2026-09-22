'use client';

import { useMemo, useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import type { RequestRow, RequestStatus } from '@/types/dashboard';
import { useTableState } from '@/lib/tableState';
import { buildBaseTimeline, actionEvent, type RequestOverride } from '@/lib/requestsTimeline';
import { findDistrict } from '@/lib/selectors';
import { template } from '@/lib/format';
import { Card, CardHeader } from '../ui/Card';
import { Pagination } from '../ui/Pagination';
import {
  RequestsFilterBar,
  EMPTY_REQUEST_FILTERS,
  type RequestFilters,
} from './RequestsFilterBar';
import { RequestsDataTable } from './RequestsDataTable';
import { RequestDetailsDrawer } from './RequestDetailsDrawer';

const PRIORITY_RANK = { low: 0, medium: 1, high: 2 } as const;
const STATUS_RANK = { open: 0, 'in-progress': 1, resolved: 2 } as const;

export function RequestsPageContent() {
  const { dict, data, locale, selectedDistrict } = useDashboard();

  // Seeded from the global selection once — after that this page's filter is
  // independent, so browsing Requests never fights the map's own selection.
  const [filters, setFilters] = useState<RequestFilters>(() => ({
    ...EMPTY_REQUEST_FILTERS,
    districtId: selectedDistrict ?? 'all',
  }));
  const [overrides, setOverrides] = useState<Record<string, RequestOverride>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  // Approve / Request documents / Reject mutate this map only — the
  // underlying data.requests row is never touched.
  const displayRows: RequestRow[] = useMemo(
    () =>
      data.requests.map((row) => {
        const override = overrides[row.id];
        return override ? { ...row, status: override.status } : row;
      }),
    [data.requests, overrides],
  );

  const filteredRows = useMemo(
    () =>
      displayRows.filter((row) => {
        if (filters.status !== 'all' && row.status !== filters.status) return false;
        if (filters.category !== 'all' && row.category !== filters.category) return false;
        if (filters.districtId !== 'all' && row.districtId !== filters.districtId) return false;
        if (filters.priority !== 'all' && row.priority !== filters.priority) return false;
        if (filters.dateFrom && row.submittedAt < filters.dateFrom) return false;
        if (filters.dateTo && row.submittedAt > filters.dateTo) return false;
        return true;
      }),
    [displayRows, filters],
  );

  const table = useTableState(filteredRows, {
    searchFields: (row) => [row.id, row.service[locale], row.applicant[locale], row.categoryLabel[locale]],
    sortValue: (row, key) => {
      switch (key) {
        case 'id':
          return row.id;
        case 'district':
          return findDistrict(data, row.districtId)?.name[locale] ?? '';
        case 'status':
          return STATUS_RANK[row.status];
        case 'priority':
          return PRIORITY_RANK[row.priority];
        case 'date':
          return row.submittedAt;
        default:
          return '';
      }
    },
    pageSize: 8,
    initialSort: { key: 'date', direction: 'desc' },
  });

  const openRow = openId ? (displayRows.find((row) => row.id === openId) ?? null) : null;

  const timeline = useMemo(() => {
    if (!openId) return [];
    const original = data.requests.find((row) => row.id === openId);
    if (!original) return [];
    return [...buildBaseTimeline(original), ...(overrides[openId]?.extraEvents ?? [])];
  }, [openId, overrides, data.requests]);

  function applyAction(id: string, decision: 'approved' | 'documentsRequested' | 'rejected') {
    setOverrides((current) => {
      const nextStatus: RequestStatus = decision === 'documentsRequested' ? 'in-progress' : 'resolved';
      return {
        ...current,
        [id]: {
          status: nextStatus,
          extraEvents: [...(current[id]?.extraEvents ?? []), actionEvent(id, decision)],
        },
      };
    });
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader
          title={dict.requestsPage.title}
          subtitle={template(dict.table.subtitle, { n: table.total })}
        />
        <div className="mt-3">
          <RequestsFilterBar
            search={table.search}
            onSearch={table.setSearch}
            filters={filters}
            onFilters={setFilters}
          />
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4 sm:p-5">
          <RequestsDataTable
            rows={table.rows}
            sortKey={table.sortKey}
            sortDirection={table.sortDirection}
            onSort={table.toggleSort}
            onRowClick={(row) => setOpenId(row.id)}
          />
          <Pagination page={table.page} pageCount={table.pageCount} onChange={table.setPage} />
        </div>
      </Card>

      <RequestDetailsDrawer
        row={openRow}
        timeline={timeline}
        onClose={() => setOpenId(null)}
        onApprove={() => openId && applyAction(openId, 'approved')}
        onRequestDocuments={() => openId && applyAction(openId, 'documentsRequested')}
        onReject={() => openId && applyAction(openId, 'rejected')}
      />
    </div>
  );
}
