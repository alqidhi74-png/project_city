'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme, type ThemePreference } from '../state/ThemeProvider';
import { SegmentedControl } from '../ui/SegmentedControl';

export function ThemeSwitch() {
  const { dict } = useDashboard();
  const { preference, setPreference } = useTheme();

  const options: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: dict.settingsPage.theme.light },
    { value: 'dark', label: dict.settingsPage.theme.dark },
    { value: 'auto', label: dict.settingsPage.theme.auto },
  ];

  return (
    <SegmentedControl
      ariaLabel={dict.settingsPage.theme.title}
      value={preference}
      onChange={setPreference}
      options={options}
    />
  );
}
