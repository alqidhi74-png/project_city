import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';

export default async function LocaleIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/dashboard`);
}
