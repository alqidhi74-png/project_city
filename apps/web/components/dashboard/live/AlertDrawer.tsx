'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useLiveFeed } from '../state/LiveFeedProvider';
import { findDistrict } from '@/lib/selectors';
import { formatDate } from '@/lib/format';
import { SeverityBadge } from '../ui/Badges';
import { CheckIcon } from '../ui/Icons';
import { Drawer } from '../ui/Drawer';

export function AlertDrawer() {
  const { dict, data, locale } = useDashboard();
  const { openAlert, closeAlert, resolveAlert } = useLiveFeed();

  const district = openAlert ? findDistrict(data, openAlert.districtId) : null;

  const categoryLabel = openAlert
    ? {
        traffic: dict.live.categoryTraffic,
        air: dict.live.categoryAir,
        energy: dict.live.categoryEnergy,
        water: dict.live.categoryWater,
        security: dict.live.categorySecurity,
      }[openAlert.category]
    : '';

  return (
    <Drawer
      open={Boolean(openAlert)}
      onClose={closeAlert}
      ariaLabel={dict.live.details}
      header={
        <>
          <p className="text-sm font-semibold text-ink">{dict.live.details}</p>
          <p className="mt-0.5 text-[11px] text-ink-subtle">
            {categoryLabel}
            {district ? ` · ${district.name[locale]}` : ''}
          </p>
        </>
      }
      footer={
        openAlert ? (
          openAlert.resolved ? (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-evergreen/12 py-2.5 text-xs font-medium text-[#2f6b3f] dark:text-[#66b27c]">
              <CheckIcon className="size-4" />
              {dict.live.resolved}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => resolveAlert(openAlert.key)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-city-emerald py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <CheckIcon className="size-4" />
              {dict.live.markResolved}
            </button>
          )
        ) : null
      }
    >
      {openAlert ? (
        <>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={openAlert.severity} />
            <span className="tnum text-[11px] text-ink-subtle">
              {formatDate(new Date(openAlert.at).toISOString().slice(0, 10), locale)}
            </span>
          </div>

          <h2 className="mt-3 text-base font-semibold text-ink">{openAlert.title[locale]}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{openAlert.message[locale]}</p>
        </>
      ) : null}
    </Drawer>
  );
}
