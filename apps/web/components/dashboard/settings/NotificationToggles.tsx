'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useSettings } from '../state/SettingsProvider';
import type { NotificationKey } from '../state/SettingsProvider';
import { Switch } from '../ui/Switch';

const KEYS: NotificationKey[] = [
  'newRequests',
  'criticalAlerts',
  'weeklySummary',
  'maintenanceUpdates',
];

export function NotificationToggles() {
  const { dict } = useDashboard();
  const { notifications, toggleNotification } = useSettings();

  const label: Record<NotificationKey, string> = {
    newRequests: dict.settingsPage.notifications.newRequests,
    criticalAlerts: dict.settingsPage.notifications.criticalAlerts,
    weeklySummary: dict.settingsPage.notifications.weeklySummary,
    maintenanceUpdates: dict.settingsPage.notifications.maintenanceUpdates,
  };

  return (
    <ul className="space-y-3">
      {KEYS.map((key) => (
        <li key={key} className="flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">{label[key]}</span>
          <Switch checked={notifications[key]} onChange={() => toggleNotification(key)} label={label[key]} />
        </li>
      ))}
    </ul>
  );
}
