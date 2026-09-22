'use client';

import type { AlertSeverity, PropertyStatus, RequestPriority, RequestStatus } from '@/types/dashboard';
import { useDict } from '../state/DashboardProvider';

/**
 * Status and severity never travel as colour alone — each badge carries its
 * label, and the dot is a second, redundant channel.
 */

const STATUS_CLASS: Record<RequestStatus, string> = {
  open: 'bg-vermilion/12 text-[#b4531a] dark:text-[#e5904a]',
  'in-progress': 'bg-sunburst/15 text-[#8a6d00] dark:text-[#d8b13c]',
  resolved: 'bg-evergreen/12 text-[#2f6b3f] dark:text-[#66b27c]',
};

const STATUS_DOT: Record<RequestStatus, string> = {
  open: 'bg-[#b4531a] dark:bg-[#e5904a]',
  'in-progress': 'bg-[#8a6d00] dark:bg-[#d8b13c]',
  resolved: 'bg-[#2f6b3f] dark:bg-[#66b27c]',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const dict = useDict();
  const label =
    status === 'open'
      ? dict.table.statusOpen
      : status === 'in-progress'
        ? dict.table.statusInProgress
        : dict.table.statusResolved;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
      {label}
    </span>
  );
}

const PRIORITY_CLASS: Record<RequestPriority, string> = {
  low: 'text-ink-subtle',
  medium: 'text-ink-muted font-medium',
  high: 'text-[#b4301a] dark:text-[#f0714f] font-semibold',
};

export function PriorityLabel({ priority }: { priority: RequestPriority }) {
  const dict = useDict();
  const label =
    priority === 'low'
      ? dict.table.priorityLow
      : priority === 'medium'
        ? dict.table.priorityMedium
        : dict.table.priorityHigh;
  return <span className={`text-xs ${PRIORITY_CLASS[priority]}`}>{label}</span>;
}

const PROPERTY_STATUS_CLASS: Record<PropertyStatus, string> = {
  available: 'bg-evergreen/12 text-[#2f6b3f] dark:text-[#66b27c]',
  reserved: 'bg-sunburst/15 text-[#8a6d00] dark:text-[#d8b13c]',
  sold: 'bg-orchid/15 text-[#8a3d6c] dark:text-[#d18ab8]',
};

const PROPERTY_STATUS_DOT: Record<PropertyStatus, string> = {
  available: 'bg-[#2f6b3f] dark:bg-[#66b27c]',
  reserved: 'bg-[#8a6d00] dark:bg-[#d8b13c]',
  sold: 'bg-[#8a3d6c] dark:bg-[#d18ab8]',
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const dict = useDict();
  const label =
    status === 'available'
      ? dict.propertiesPage.statusAvailable
      : status === 'reserved'
        ? dict.propertiesPage.statusReserved
        : dict.propertiesPage.statusSold;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${PROPERTY_STATUS_CLASS[status]}`}
    >
      <span className={`size-1.5 rounded-full ${PROPERTY_STATUS_DOT[status]}`} aria-hidden />
      {label}
    </span>
  );
}

const SEVERITY_CLASS: Record<AlertSeverity, string> = {
  info: 'bg-evergreen/12 text-[#2f6b3f] dark:text-[#66b27c]',
  warning: 'bg-sunburst/18 text-[#8a6d00] dark:text-[#d8b13c]',
  critical: 'bg-vermilion/15 text-[#b4301a] dark:text-[#f0714f]',
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const dict = useDict();
  const label =
    severity === 'info'
      ? dict.live.severityInfo
      : severity === 'warning'
        ? dict.live.severityWarning
        : dict.live.severityCritical;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_CLASS[severity]}`}
    >
      {label}
    </span>
  );
}
