'use client';

import { useDashboard } from '../state/DashboardProvider';
import { filteredRequests, findDistrict } from '@/lib/selectors';
import { formatDate, template } from '@/lib/format';
import { Card, CardHeader } from '../ui/Card';
import { PriorityLabel, StatusBadge } from '../ui/Badges';

export function RequestsTable() {
  const { dict, data, locale, selection } = useDashboard();
  const rows = filteredRequests(data, selection);

  return (
    <Card padded={false} data-story-anchor="requests-table">
      <div className="p-4 pb-3 sm:p-5 sm:pb-3">
        <CardHeader
          title={dict.table.title}
          subtitle={template(dict.table.subtitle, { n: rows.length })}
        />
      </div>

      {rows.length === 0 ? (
        <p className="px-4 pb-6 text-center text-xs text-ink-subtle sm:px-5">
          {dict.table.empty}
        </p>
      ) : (
        /* The only element allowed to scroll sideways — the page body never does. */
        <div className="overflow-x-auto px-4 pb-4 sm:px-5 sm:pb-5">
          <table className="w-full min-w-[46rem] border-collapse text-start text-xs">
            <thead>
              <tr className="border-b border-hairline text-ink-subtle">
                <th className="px-2 py-2 text-start font-medium">{dict.table.id}</th>
                <th className="px-2 py-2 text-start font-medium">{dict.table.district}</th>
                <th className="px-2 py-2 text-start font-medium">{dict.table.service}</th>
                <th className="px-2 py-2 text-start font-medium">{dict.table.applicant}</th>
                <th className="px-2 py-2 text-start font-medium">{dict.table.status}</th>
                <th className="px-2 py-2 text-start font-medium">{dict.table.priority}</th>
                <th className="px-2 py-2 text-start font-medium">{dict.table.date}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const district = findDistrict(data, row.districtId);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-hairline/60 last:border-0 hover:bg-surface-sunken/60"
                  >
                    <td className="tnum whitespace-nowrap px-2 py-2.5 text-ink-subtle">
                      {row.id}
                    </td>
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
      )}
    </Card>
  );
}
