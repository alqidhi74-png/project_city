import type { Year } from '@/types/dashboard';
import type { Dictionary } from './i18n/get-dictionary';

export type ReportId = 'monthly-services' | 'energy-water' | 'sustainability' | 'real-estate';

export type ReportDef = {
  id: ReportId;
  title: (dict: Dictionary) => string;
  description: (dict: Dictionary) => string;
};

export const REPORT_DEFS: ReportDef[] = [
  {
    id: 'monthly-services',
    title: (d) => d.reportsPage.reports.monthlyServices.title,
    description: (d) => d.reportsPage.reports.monthlyServices.description,
  },
  {
    id: 'energy-water',
    title: (d) => d.reportsPage.reports.energyWater.title,
    description: (d) => d.reportsPage.reports.energyWater.description,
  },
  {
    id: 'sustainability',
    title: (d) => d.reportsPage.reports.sustainability.title,
    description: (d) => d.reportsPage.reports.sustainability.description,
  },
  {
    id: 'real-estate',
    title: (d) => d.reportsPage.reports.realEstate.title,
    description: (d) => d.reportsPage.reports.realEstate.description,
  },
];

/** Restricts a year-keyed series to [from, to] inclusive — the Reports date-range filter. */
export function sliceYears<T extends { year: Year }>(series: T[], from: Year, to: Year): T[] {
  return series.filter((point) => point.year >= from && point.year <= to);
}
