import type { CityData, PropertyUnit, Selection } from '@/types/dashboard';
import type { Locale } from './i18n/config';
import { findDistrict } from './selectors';

/** The portal's "now" — matches TODAY in lib/selectors.ts. */
const TODAY = new Date('2026-09-21T00:00:00Z');

/** Properties scoped by the district filter. Like requests, this is a "now" snapshot, not a projection — there's no year slider here. */
export function propertiesInScope(data: CityData, selection: Selection): PropertyUnit[] {
  if (!selection.district) return data.properties;
  return data.properties.filter((unit) => unit.districtId === selection.district);
}

export type PropertyCounts = { total: number; available: number; reserved: number; sold: number };

export function propertyCounts(data: CityData, selection: Selection): PropertyCounts {
  const scope = propertiesInScope(data, selection);
  return {
    total: scope.length,
    available: scope.filter((unit) => unit.status === 'available').length,
    reserved: scope.filter((unit) => unit.status === 'reserved').length,
    sold: scope.filter((unit) => unit.status === 'sold').length,
  };
}

export type DistrictCountPoint = { id: string; label: string; value: number; selected: boolean };

/** Units per district — every district with listings, selection dims the rest (never recolours). */
export function unitsByDistrict(
  data: CityData,
  selection: Selection,
  locale: Locale,
): DistrictCountPoint[] {
  const counts = new Map<string, number>();
  for (const unit of data.properties) {
    counts.set(unit.districtId, (counts.get(unit.districtId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([districtId, value]) => {
      const district = findDistrict(data, districtId);
      return {
        id: districtId,
        label: district ? district.name[locale] : districtId,
        value,
        selected: selection.district === districtId,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export type MonthPoint = { label: string; value: number };

/**
 * Completed sales over the trailing 12 months. Properties don't have a
 * 2024–2035 projection like the district metrics do — this is a real history
 * of `saleDate`s, so a rolling window suits it better than the year slider.
 */
export function salesTrend(data: CityData, selection: Selection, locale: Locale): MonthPoint[] {
  const scope = propertiesInScope(data, selection);
  const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-OM' : 'en-GB', {
    month: 'short',
  });

  const months: MonthPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const cursor = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth() - i, 1));
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
    const value = scope.filter((unit) => unit.saleDate?.startsWith(key)).length;
    months.push({ label: formatter.format(cursor), value });
  }
  return months;
}
