'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useLiveFeed } from '../state/LiveFeedProvider';
import type { LiveAlert } from '@/types/dashboard';
import { findDistrict } from '@/lib/selectors';
import { SeverityBadge } from '../ui/Badges';
import { CheckIcon } from '../ui/Icons';

export function FullAlertRow({ alert, timeAgo }: { alert: LiveAlert; timeAgo: string }) {
  const { data, dict, locale } = useDashboard();
  const { selectAlert, resolveAlert } = useLiveFeed();
  const district = findDistrict(data, alert.districtId);

  return (
    <li
      className={`flex items-center gap-2 rounded-xl border border-hairline p-2.5 ${
        alert.resolved ? 'opacity-55' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => selectAlert(alert)}
        className="flex min-w-0 flex-1 items-center gap-3 text-start"
      >
        <SeverityBadge severity={alert.severity} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink">{alert.title[locale]}</p>
          <p className="truncate text-[11px] text-ink-subtle">
            {district ? district.name[locale] : ''} · {timeAgo}
          </p>
        </div>
      </button>

      {alert.resolved ? (
        <span className="shrink-0 px-1 text-[10px] font-medium text-[#2f6b3f] dark:text-[#66b27c]">
          {dict.live.resolved}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => resolveAlert(alert.key)}
          aria-label={dict.live.markResolved}
          title={dict.live.markResolved}
          className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-evergreen/12 hover:text-[#2f6b3f] dark:hover:text-[#66b27c]"
        >
          <CheckIcon className="size-4" />
        </button>
      )}
    </li>
  );
}
