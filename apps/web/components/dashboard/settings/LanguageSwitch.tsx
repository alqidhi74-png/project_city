'use client';

import { useRouter, usePathname } from 'next/navigation';

import { useDashboard } from '../state/DashboardProvider';
import { locales, type Locale } from '@/lib/i18n/config';
import { SegmentedControl } from '../ui/SegmentedControl';

/** Locale lives in the URL, so switching it navigates — the rest of the path is preserved. */
export function LanguageSwitch() {
  const { dict, locale } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();

  function setLocale(next: Locale) {
    if (next === locale) return;
    const segments = pathname.split('/');
    segments[1] = next; // pathname is always '/<locale>/...'
    router.push(segments.join('/'));
  }

  return (
    <SegmentedControl
      ariaLabel={dict.settingsPage.language.title}
      value={locale}
      onChange={setLocale}
      options={locales.map((value) => ({
        value,
        label: value === 'ar' ? dict.settingsPage.language.ar : dict.settingsPage.language.en,
      }))}
    />
  );
}
