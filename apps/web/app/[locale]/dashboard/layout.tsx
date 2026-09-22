import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getCityData } from '@/lib/data';
import { DashboardChrome } from '@/components/dashboard/DashboardChrome';

/**
 * Every /dashboard/* route shares this layout, which is what keeps
 * DashboardChrome's provider tree (selection state, the live feed, story
 * mode, settings) mounted across client-side navigation between pages — see
 * DashboardChrome.tsx. The mock dataset is read here, once per locale, and
 * handed down as a prop rather than imported inside client components.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <DashboardChrome data={getCityData()} locale={locale} dict={getDictionary(locale)}>
      {children}
    </DashboardChrome>
  );
}
