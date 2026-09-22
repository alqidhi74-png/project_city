import type { Bilingual } from '@/types/dashboard';
import type { Locale } from './i18n/config';

/**
 * Arabic UI text uses Arabic-Indic digits, but chart axes and table columns stay
 * on Latin digits: they need to line up in narrow columns, and `tabular-nums`
 * only behaves across the Latin set.
 */
const uiNumber = new Map<string, Intl.NumberFormat>();

function formatter(key: string, locale: string, options: Intl.NumberFormatOptions) {
  const cached = uiNumber.get(key);
  if (cached) return cached;
  const made = new Intl.NumberFormat(locale, options);
  uiNumber.set(key, made);
  return made;
}

/** Display number for prose and KPI values — localised digits. */
export function formatNumber(value: number, locale: Locale, precision = 0): string {
  return formatter(`${locale}-${precision}`, locale === 'ar' ? 'ar-OM' : 'en-GB', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/** Compact axis/table number — always Latin digits so columns align. */
export function formatAxis(value: number, precision = 0): string {
  return formatter(`axis-${precision}`, 'en-GB', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/** Short form for tight axes: 12.4k, 1.2M. */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return formatAxis(value);
}

export function formatPercent(value: number, locale: Locale, precision = 0): string {
  const n = formatNumber(Math.abs(value), locale, precision);
  return locale === 'ar' ? `${n}٪` : `${n}%`;
}

export function formatSignedPercent(value: number, locale: Locale, precision = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatPercent(value, locale, precision)}`;
}

/** Years stay Latin everywhere — they are identifiers, not quantities. */
export function formatYear(year: number): string {
  return String(year);
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-OM' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function pickText(value: Bilingual, locale: Locale): string {
  return value[locale];
}

/** Fills {name} placeholders in a dictionary string. */
export function template(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
