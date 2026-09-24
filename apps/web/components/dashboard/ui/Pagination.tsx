'use client';

import { useDashboard } from '../state/DashboardProvider';
import { formatNumber, template } from '@/lib/format';
import { ChevronForwardIcon } from './Icons';

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const { dict, locale, rtl } = useDashboard();
  if (pageCount <= 1) return null;

  // "Previous" points back along the reading direction, so it flips in RTL.
  const prevFlip = rtl ? '' : 'scale-x-[-1]';
  const nextFlip = rtl ? 'scale-x-[-1]' : '';

  return (
    <nav aria-label={dict.table.pagination} className="flex items-center justify-between gap-3 pt-3">
      <p className="tnum text-[11px] text-ink-subtle">
        {template(dict.table.pageOf, {
          page: formatNumber(page, locale),
          total: formatNumber(pageCount, locale),
        })}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label={dict.table.prevPage}
          className="grid size-7 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronForwardIcon className={`size-4 ${prevFlip}`} />
        </button>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          aria-label={dict.table.nextPage}
          className="grid size-7 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronForwardIcon className={`size-4 ${nextFlip}`} />
        </button>
      </div>
    </nav>
  );
}
