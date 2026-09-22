'use client';

import { motion } from 'framer-motion';

import type { LiveAlert } from '@/types/dashboard';
import { useDashboard } from '../state/DashboardProvider';
import { useMotionOK } from '@/lib/motion';
import { findDistrict } from '@/lib/selectors';
import { SeverityBadge } from '../ui/Badges';
import { CheckIcon } from '../ui/Icons';

export function AlertItem({
  alert,
  timeAgo,
  onSelect,
}: {
  alert: LiveAlert;
  timeAgo: string;
  onSelect: (alert: LiveAlert) => void;
}) {
  const { data, dict, locale, rtl } = useDashboard();
  const motionOK = useMotionOK();
  const district = findDistrict(data, alert.districtId);

  // Slides in from the inline-start edge, which flips with the writing direction.
  const enterX = rtl ? 24 : -24;

  return (
    <motion.li
      layout={motionOK}
      initial={motionOK ? { opacity: 0, x: enterX } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={motionOK ? { opacity: 0, x: enterX } : { opacity: 0 }}
      transition={{ duration: motionOK ? 0.3 : 0 }}
    >
      <button
        type="button"
        onClick={() => onSelect(alert)}
        className={`w-full rounded-xl border border-hairline p-2.5 text-start transition-colors hover:bg-surface-sunken ${
          alert.resolved ? 'opacity-55' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <span className="truncate text-[11px] text-ink-subtle">
            {district ? district.name[locale] : ''}
          </span>
          <span className="tnum ms-auto shrink-0 text-[10px] text-ink-subtle">{timeAgo}</span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-xs font-medium text-ink">
          {alert.title[locale]}
        </p>

        {alert.resolved ? (
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#2f6b3f] dark:text-[#66b27c]">
            <CheckIcon className="size-3" />
            {dict.live.resolved}
          </span>
        ) : null}
      </button>
    </motion.li>
  );
}
