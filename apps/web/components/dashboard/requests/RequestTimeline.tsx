'use client';

import { useDashboard } from '../state/DashboardProvider';
import type { TimelineEvent, TimelineStageId } from '@/lib/requestsTimeline';
import { formatDate } from '@/lib/format';
import { CheckIcon } from '../ui/Icons';

const STAGE_TONE: Record<TimelineStageId, 'default' | 'good' | 'bad'> = {
  submitted: 'default',
  underReview: 'default',
  documentsRequested: 'default',
  approved: 'good',
  resolved: 'good',
  rejected: 'bad',
};

/** Vertical stepper — base history from the row, plus any local actions appended after it. */
export function RequestTimeline({ events }: { events: TimelineEvent[] }) {
  const { dict, locale } = useDashboard();

  const stageLabel: Record<TimelineStageId, string> = {
    submitted: dict.requestsPage.timeline.submitted,
    underReview: dict.requestsPage.timeline.underReview,
    documentsRequested: dict.requestsPage.timeline.documentsRequested,
    approved: dict.requestsPage.timeline.approved,
    rejected: dict.requestsPage.timeline.rejected,
    resolved: dict.requestsPage.timeline.resolved,
  };

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const tone = STAGE_TONE[event.stage];
        const isLast = index === events.length - 1;
        const dotClass =
          tone === 'good'
            ? 'bg-evergreen/15 text-[#2f6b3f] dark:text-[#66b27c]'
            : tone === 'bad'
              ? 'bg-vermilion/15 text-[#b4301a] dark:text-[#f0714f]'
              : 'bg-surface-sunken text-ink-muted';

        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`grid size-6 shrink-0 place-items-center rounded-full ${dotClass}`}>
                {tone === 'good' ? <CheckIcon className="size-3.5" /> : null}
              </span>
              {!isLast ? <span className="w-px flex-1 bg-hairline" aria-hidden /> : null}
            </div>
            <div className="pb-4">
              <p className="text-xs font-medium text-ink">{stageLabel[event.stage]}</p>
              <p className="tnum mt-0.5 text-[11px] text-ink-subtle">
                {formatDate(event.at, locale)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
