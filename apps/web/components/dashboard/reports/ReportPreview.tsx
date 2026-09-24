'use client';

import type { ReactNode } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { useMockPdfExport } from '@/lib/useMockPdfExport';
import { metricColor, seriesColor, chartColors } from '@/lib/theme';
import type { ReportId } from '@/lib/reports';
import { sliceYears } from '@/lib/reports';
import {
  requestsSeries,
  waterSeries,
  energySeries,
  airQualityTrend,
  serviceBreakdown,
  requestCategoryOrder,
} from '@/lib/selectors';
import { unitsByDistrict, salesTrend } from '@/lib/properties';
import type { Selection, Year } from '@/types/dashboard';
import { template } from '@/lib/format';
import { CardHeader } from '../ui/Card';
import { ExportToast } from '../ui/ExportToast';
import { DownloadIcon } from '../ui/Icons';
import { MiniLineChart } from '../charts/MiniLineChart';
import { MiniBarChart } from '../charts/MiniBarChart';

/** Properties has no 2024–2035 projection — its charts run off their own "now" snapshot, so the date range doesn't slice them (noted under the chart). */
const PROJECTION_REPORTS: ReportId[] = ['monthly-services', 'energy-water', 'sustainability'];

export function ReportPreview({
  reportId,
  title,
  districtId,
  fromYear,
  toYear,
}: {
  reportId: ReportId;
  title: string;
  districtId: string | 'all';
  fromYear: Year;
  toYear: Year;
}) {
  const { dict, data, locale } = useDashboard();
  const { mode } = useTheme();
  const { toast, trigger } = useMockPdfExport();

  const selection: Selection = { district: districtId === 'all' ? null : districtId, year: toYear, period: 'year' };
  const rangeLabel = template(dict.reportsPage.periodLabel, { from: fromYear, to: toYear });

  let content: ReactNode;

  if (reportId === 'monthly-services') {
    const requests = sliceYears(requestsSeries(data, selection), fromYear, toYear);
    const breakdown = serviceBreakdown(data, selection, locale);
    const order = requestCategoryOrder(data);
    const palette = chartColors(mode);
    const colorFor = (key: string) => palette[Math.max(0, order.indexOf(key)) % palette.length];

    content = (
      <>
        <PreviewChart title={dict.charts.requestsTitle}>
          <MiniLineChart
            points={requests}
            color={metricColor('requests', mode)}
            unit={dict.map.tooltipRequests}
            seriesName={dict.charts.requestsTitle}
          />
        </PreviewChart>
        <PreviewChart title={dict.charts.servicesTitle}>
          <MiniBarChart
            points={breakdown.map((point) => ({ id: point.key, label: point.label, value: point.value }))}
            color={palette[0]}
            colorForPoint={(point) => colorFor(point.id)}
            unit={dict.map.tooltipRequests}
            seriesName={dict.charts.servicesTitle}
          />
        </PreviewChart>
      </>
    );
  } else if (reportId === 'energy-water') {
    const energy = sliceYears(energySeries(data, selection), fromYear, toYear);
    const water = sliceYears(waterSeries(data, selection), fromYear, toYear);

    content = (
      <>
        <PreviewChart title={dict.charts.energyTitle}>
          <MiniLineChart
            points={energy}
            color={metricColor('energy', mode)}
            unit={dict.whatif.energyUnit}
            seriesName={dict.charts.energyTitle}
          />
        </PreviewChart>
        <PreviewChart title={dict.charts.waterTitle}>
          <MiniLineChart
            points={water}
            color={metricColor('water', mode)}
            unit={dict.charts.valueLabel}
            precision={1}
            seriesName={dict.charts.waterTitle}
          />
        </PreviewChart>
      </>
    );
  } else if (reportId === 'sustainability') {
    const air = sliceYears(airQualityTrend(data, selection), fromYear, toYear);
    const energy = sliceYears(energySeries(data, selection), fromYear, toYear);

    content = (
      <>
        <PreviewChart title={dict.reportsPage.airQualityTitle}>
          <MiniLineChart
            points={air}
            color={metricColor('air', mode)}
            unit={dict.live.airUnit}
            seriesName={dict.reportsPage.airQualityTitle}
          />
        </PreviewChart>
        <PreviewChart title={dict.charts.energyTitle}>
          <MiniLineChart
            points={energy}
            color={metricColor('energy', mode)}
            unit={dict.whatif.energyUnit}
            seriesName={dict.charts.energyTitle}
          />
        </PreviewChart>
      </>
    );
  } else {
    const units = unitsByDistrict(data, selection, locale);
    const sales = salesTrend(data, selection, locale);

    content = (
      <>
        <PreviewChart title={dict.propertiesPage.unitsByDistrictTitle}>
          <MiniBarChart
            points={units}
            color={seriesColor(2, mode)}
            unit={dict.propertiesPage.unitsLabel}
            seriesName={dict.propertiesPage.unitsByDistrictTitle}
          />
        </PreviewChart>
        <PreviewChart title={dict.propertiesPage.salesTrendTitle}>
          <MiniLineChart
            points={sales}
            color={seriesColor(2, mode)}
            unit={dict.propertiesPage.unitsSoldLabel}
            seriesName={dict.propertiesPage.salesTrendTitle}
          />
        </PreviewChart>
      </>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CardHeader
        title={title}
        subtitle={
          PROJECTION_REPORTS.includes(reportId) ? rangeLabel : dict.reportsPage.snapshotNote
        }
        action={
          <button
            type="button"
            onClick={trigger}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-raised px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <DownloadIcon className="size-3.5" />
            {dict.reportsPage.downloadPdf}
          </button>
        }
      />

      <div className="grid flex-1 gap-3 sm:grid-cols-2">{content}</div>

      <ExportToast show={toast} message={dict.topbar.exportToast} />
    </div>
  );
}

function PreviewChart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline p-3">
      <p className="mb-2 text-[11px] font-semibold text-ink-muted">{title}</p>
      {children}
    </div>
  );
}
