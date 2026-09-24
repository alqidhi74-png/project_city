import type { ReactElement, SVGProps } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import {
  CityLiveIcon,
  OverviewIcon,
  PropertiesIcon,
  ReportsIcon,
  RequestsIcon,
  SettingsIcon,
} from '../ui/Icons';

export type NavItem = {
  id: string;
  label: (dict: Dictionary) => string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  /** Path segment under /dashboard — '' for the Overview route itself. */
  segment: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: (d) => d.nav.overview, Icon: OverviewIcon, segment: '' },
  { id: 'requests', label: (d) => d.nav.requests, Icon: RequestsIcon, segment: 'requests' },
  { id: 'properties', label: (d) => d.nav.properties, Icon: PropertiesIcon, segment: 'properties' },
  { id: 'city-live', label: (d) => d.nav.cityLive, Icon: CityLiveIcon, segment: 'live' },
  { id: 'reports', label: (d) => d.nav.reports, Icon: ReportsIcon, segment: 'reports' },
  { id: 'settings', label: (d) => d.nav.settings, Icon: SettingsIcon, segment: 'settings' },
];

export function hrefFor(item: NavItem, locale: Locale): string {
  return item.segment ? `/${locale}/dashboard/${item.segment}` : `/${locale}/dashboard`;
}

/** Overview matches exactly; every other item matches by prefix. */
export function isNavItemActive(item: NavItem, pathname: string, locale: Locale): boolean {
  const href = hrefFor(item, locale);
  return item.segment === '' ? pathname === href : pathname.startsWith(href);
}
