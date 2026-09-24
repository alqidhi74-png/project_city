'use client';

import { useDashboard } from '../state/DashboardProvider';
import type { RequestRow } from '@/types/dashboard';
import type { TimelineEvent } from '@/lib/requestsTimeline';
import { findDistrict } from '@/lib/selectors';
import { formatDate } from '@/lib/format';
import { Drawer } from '../ui/Drawer';
import { StatusBadge, PriorityLabel } from '../ui/Badges';
import { CheckIcon, DocumentIcon, CloseIcon } from '../ui/Icons';
import { RequestTimeline } from './RequestTimeline';

/** `row.status` already reflects any local override — the caller merges it before passing the row in. */
export function RequestDetailsDrawer({
  row,
  timeline,
  onClose,
  onApprove,
  onRequestDocuments,
  onReject,
}: {
  row: RequestRow | null;
  timeline: TimelineEvent[];
  onClose: () => void;
  onApprove: () => void;
  onRequestDocuments: () => void;
  onReject: () => void;
}) {
  const { dict, data, locale } = useDashboard();
  const district = row ? findDistrict(data, row.districtId) : null;
  const isResolved = row?.status === 'resolved';

  return (
    <Drawer
      open={Boolean(row)}
      onClose={onClose}
      ariaLabel={dict.requestsPage.details}
      header={
        row ? (
          <>
            <p className="tnum text-[11px] text-ink-subtle">{row.id}</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{row.service[locale]}</p>
          </>
        ) : null
      }
      footer={
        row ? (
          isResolved ? (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-evergreen/12 py-2.5 text-xs font-medium text-[#2f6b3f] dark:text-[#66b27c]">
              <CheckIcon className="size-4" />
              {dict.table.statusResolved}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={onApprove}
                className="flex flex-col items-center gap-1 rounded-xl bg-city-emerald py-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <CheckIcon className="size-4" />
                {dict.requestsPage.actions.approve}
              </button>
              <button
                type="button"
                onClick={onRequestDocuments}
                className="flex flex-col items-center gap-1 rounded-xl border border-hairline py-2 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <DocumentIcon className="size-4" />
                {dict.requestsPage.actions.requestDocuments}
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex flex-col items-center gap-1 rounded-xl border border-vermilion/30 py-2 text-[11px] font-medium text-[#b4301a] transition-colors hover:bg-vermilion/10 dark:text-[#f0714f]"
              >
                <CloseIcon className="size-4" />
                {dict.requestsPage.actions.reject}
              </button>
            </div>
          )
        ) : null
      }
    >
      {row ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={row.status} />
            <PriorityLabel priority={row.priority} />
          </div>

          <dl className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-subtle">{dict.table.district}</dt>
              <dd className="text-ink-muted">{district ? district.name[locale] : '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-subtle">{dict.table.applicant}</dt>
              <dd className="text-ink-muted">{row.applicant[locale]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-subtle">{dict.requestsPage.service}</dt>
              <dd className="text-ink-muted">{row.categoryLabel[locale]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-subtle">{dict.table.date}</dt>
              <dd className="tnum text-ink-muted">{formatDate(row.submittedAt, locale)}</dd>
            </div>
          </dl>

          <p className="mt-5 mb-2 text-[11px] font-semibold text-ink-muted">
            {dict.requestsPage.timelineTitle}
          </p>
          <RequestTimeline events={timeline} />
        </>
      ) : null}
    </Drawer>
  );
}
