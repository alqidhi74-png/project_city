'use client';

import { useDashboard } from '../state/DashboardProvider';
import { Card, CardHeader } from '../ui/Card';
import { ProfileCard } from './ProfileCard';
import { LanguageSwitch } from './LanguageSwitch';
import { ThemeSwitch } from './ThemeSwitch';
import { NotificationToggles } from './NotificationToggles';
import { AlertThresholds } from './AlertThresholds';

export function SettingsPageContent() {
  const { dict } = useDashboard();

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="space-y-3">
        <ProfileCard />

        <Card>
          <CardHeader title={dict.settingsPage.preferences} />
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[11px] text-ink-subtle">{dict.settingsPage.language.title}</p>
              <LanguageSwitch />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] text-ink-subtle">{dict.settingsPage.theme.title}</p>
              <ThemeSwitch />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <Card>
          <CardHeader title={dict.settingsPage.notifications.title} />
          <NotificationToggles />
        </Card>

        <Card>
          <AlertThresholds />
        </Card>
      </div>
    </div>
  );
}
