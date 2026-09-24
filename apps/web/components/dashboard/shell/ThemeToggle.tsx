'use client';

import { useTheme } from '../state/ThemeProvider';
import { useDict } from '../state/DashboardProvider';
import { MoonIcon, SunIcon } from '../ui/Icons';

export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const dict = useDict();
  const label = mode === 'dark' ? dict.topbar.themeToLight : dict.topbar.themeToDark;

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="grid size-9 place-items-center rounded-xl border border-hairline bg-surface-raised text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
    >
      {mode === 'dark' ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
    </button>
  );
}
