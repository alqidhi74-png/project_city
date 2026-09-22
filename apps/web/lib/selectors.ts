import type {
  CityData,
  District,
  DistrictMetrics,
  KpiDef,
  MetricKey,
  RequestRow,
  Selection,
  Year,
} from '@/types/dashboard';
import { FIRST_YEAR, YEARS } from '@/types/dashboard';
import type { Locale } from './i18n/config';

const EMPTY: DistrictMetrics = { population: 0, energy: 0, water: 0, air: 0, requests: 0 };

/** The portal's "today" — the operational request queue is dated against it. */
export const TODAY = new Date('2026-09-21T00:00:00Z');

export function metricsAt(district: District, year: Year): DistrictMetrics {
  return district.byYear[String(year)] ?? EMPTY;
}

export function isBuilt(district: District, year: Year): boolean {
  return district.establishedYear <= year;
}

/** Districts that exist in the given year — the rest are not built yet. */
export function builtDistricts(data: CityData, year: Year): District[] {
  return data.districts.filter((d) => isBuilt(d, year));
}

/** The districts a selection covers: one, or every built district. */
export function districtsInScope(data: CityData, selection: Selection): District[] {
  const built = builtDistricts(data, selection.year);
  if (!selection.district) return built;
  return built.filter((d) => d.id === selection.district);
}

export function findDistrict(data: CityData, id: string | null): District | null {
  if (!id) return null;
  return data.districts.find((d) => d.id === id) ?? null;
}

function aggregate(values: number[], mode: KpiDef['aggregate']): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, v) => sum + v, 0);
  return mode === 'avg' ? total / values.length : total;
}

/** Raw annual figure for a metric across the districts in scope. */
export function annualMetric(
  data: CityData,
  selection: Selection,
  metric: MetricKey,
  mode: KpiDef['aggregate'] = 'sum',
): number {
  const scope = districtsInScope(data, selection);
  return aggregate(
    scope.map((d) => metricsAt(d, selection.year)[metric]),
    mode,
  );
}

/** KPI value, scaled from the annual figure down to the selected period. */
export function kpiValue(data: CityData, kpi: KpiDef, selection: Selection): number {
  const annual = annualMetric(data, selection, kpi.metric, kpi.aggregate);
  return annual * kpi.periodFactor[selection.period];
}

/** Same KPI one year earlier, for the delta chip. */
export function kpiPrevious(data: CityData, kpi: KpiDef, selection: Selection): number | null {
  if (selection.year <= FIRST_YEAR) return null;
  const prevYear = (selection.year - 1) as Year;
  const previous = kpiValue(data, kpi, { ...selection, year: prevYear });
  return previous === 0 ? null : previous;
}

export function percentChange(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Sparkline: the KPI's metric across every year, for the districts in scope. */
export function kpiSparkline(data: CityData, kpi: KpiDef, selection: Selection): number[] {
  return YEARS.map((year) =>
    annualMetric(data, { ...selection, year }, kpi.metric, kpi.aggregate),
  );
}

export type YearPoint = { year: Year; label: string; value: number };

function seriesOf(data: CityData, selection: Selection, metric: MetricKey): YearPoint[] {
  return YEARS.map((year) => ({
    year,
    label: String(year),
    value: annualMetric(data, { ...selection, year }, metric, 'sum'),
  }));
}

/** Line chart — requests per year. */
export function requestsSeries(data: CityData, selection: Selection): YearPoint[] {
  return seriesOf(data, selection, 'requests');
}

/** Area chart — water per year. */
export function waterSeries(data: CityData, selection: Selection): YearPoint[] {
  return seriesOf(data, selection, 'water');
}

/** Reports' energy-water preview — energy per year, the district-snapshot bar's year-series counterpart. */
export function energySeries(data: CityData, selection: Selection): YearPoint[] {
  return seriesOf(data, selection, 'energy');
}

/** Sustainability report — average air quality index per year across the districts in scope. */
export function airQualityTrend(data: CityData, selection: Selection): YearPoint[] {
  return YEARS.map((year) => ({
    year,
    label: String(year),
    value: annualMetric(data, { ...selection, year }, 'air', 'avg'),
  }));
}

export type DistrictPoint = {
  id: string;
  label: string;
  value: number;
  selected: boolean;
};

/** Bar chart — energy per district in the selected year. */
export function energyByDistrict(
  data: CityData,
  selection: Selection,
  locale: Locale,
): DistrictPoint[] {
  return builtDistricts(data, selection.year)
    .map((d) => ({
      id: d.id,
      label: d.name[locale],
      value: metricsAt(d, selection.year).energy,
      selected: selection.district === d.id,
    }))
    .sort((a, b) => b.value - a.value);
}

/** Fixed first-seen order of request categories — the colour slot every category-coloured chart shares (ServicesDonutChart, Reports' monthly-services preview). */
export function requestCategoryOrder(data: CityData): string[] {
  return [...new Set(data.requests.map((row) => row.category))];
}

export type CategoryPoint = {
  key: string;
  label: string;
  value: number;
};

/**
 * Donut — the mix of the live request queue. The queue is operational and sits
 * in the portal's "now", so it responds to the district filter but not to the
 * projection year.
 */
export function serviceBreakdown(
  data: CityData,
  selection: Selection,
  locale: Locale,
): CategoryPoint[] {
  const rows = filteredRequests(data, selection);
  const byKey = new Map<string, CategoryPoint>();
  for (const row of rows) {
    const existing = byKey.get(row.category);
    if (existing) existing.value += 1;
    else byKey.set(row.category, { key: row.category, label: row.categoryLabel[locale], value: 1 });
  }
  return [...byKey.values()].sort((a, b) => b.value - a.value);
}

const PERIOD_DAYS: Record<Selection['period'], number> = {
  today: 1,
  week: 7,
  month: 31,
  year: 366,
};

/** Table rows — filtered by district and by how far back the period reaches. */
export function filteredRequests(data: CityData, selection: Selection): RequestRow[] {
  const cutoff = TODAY.getTime() - PERIOD_DAYS[selection.period] * 86_400_000;
  return data.requests.filter((row) => {
    if (selection.district && row.districtId !== selection.district) return false;
    return new Date(`${row.submittedAt}T00:00:00Z`).getTime() >= cutoff;
  });
}

export function districtName(data: CityData, id: string | null, locale: Locale): string | null {
  const district = findDistrict(data, id);
  return district ? district.name[locale] : null;
}

/** Min/max of a metric across built districts — drives the map colour scale. */
export function metricRange(
  data: CityData,
  metric: MetricKey,
  year: Year,
): { min: number; max: number } {
  const values = builtDistricts(data, year).map((d) => metricsAt(d, year)[metric]);
  if (values.length === 0) return { min: 0, max: 1 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max: max === min ? min + 1 : max };
}
