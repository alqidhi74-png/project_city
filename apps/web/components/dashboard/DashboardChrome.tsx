'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import type { CityData } from '@/types/dashboard';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

import { DashboardProvider } from './state/DashboardProvider';
import { LiveFeedProvider } from './state/LiveFeedProvider';
import { StoryProvider } from './state/StoryProvider';
import { SettingsProvider } from './state/SettingsProvider';

import { Sidebar } from './shell/Sidebar';
import { MobileTabBar } from './shell/MobileTabBar';
import { TopBar } from './shell/TopBar';
import { AlertDrawer } from './live/AlertDrawer';
import { StoryCaption } from './story/StoryCaption';
import { NAV_ITEMS, isNavItemActive } from './shell/navItems';

/**
 * The shell every dashboard route shares. Lives in `app/[locale]/dashboard/layout.tsx`,
 * so its provider tree mounts once per locale and stays mounted across
 * client-side navigation between routes — that's what makes selectedDistrict,
 * selectedYear and the live alert feed genuinely shared state, not something
 * re-fetched per page.
 */
export function DashboardChrome({
  data,
  locale,
  dict,
  children,
}: {
  data: CityData;
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => isNavItemActive(item, pathname, locale));
  const mainLabel = activeItem ? activeItem.label(dict) : dict.nav.overview;

  return (
    <DashboardProvider data={data} locale={locale} dict={dict}>
      <LiveFeedProvider>
        <StoryProvider>
          <SettingsProvider>
            <div className="flex min-h-dvh bg-surface">
              <Sidebar />

              <div className="flex min-w-0 flex-1 flex-col">
                <TopBar />

                {/* Bottom padding clears the mobile tab bar. */}
                <main
                  id="main"
                  aria-label={mainLabel}
                  className="flex-1 space-y-3 px-4 pb-24 pt-4 sm:px-6 md:pb-8"
                >
                  {children}
                </main>
              </div>

              <MobileTabBar />
              <AlertDrawer />
              <StoryCaption />
            </div>
          </SettingsProvider>
        </StoryProvider>
      </LiveFeedProvider>
    </DashboardProvider>
  );
}
