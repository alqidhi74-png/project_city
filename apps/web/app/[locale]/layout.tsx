import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { notFound } from 'next/navigation';

import '../globals.css';
import { dirOf, isLocale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { ThemeProvider } from '@/components/dashboard/state/ThemeProvider';

/** Carries both Arabic and Latin glyphs, so one family covers both locales. */
const appSans = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-app-sans',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.meta.title, description: dict.meta.description };
}

/**
 * Runs before first paint so a night-mode reader never sees a light flash.
 * Kept inline and dependency-free on purpose. `shc-theme` is 'light', 'dark',
 * 'auto', or absent — only an explicit 'light' should force light; 'dark',
 * 'auto' and "nothing stored yet" all defer to the OS setting.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('shc-theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dirOf(locale)} className={appSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
