'use client';

import { useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import { REPORT_DEFS, type ReportId } from '@/lib/reports';
import { LAST_YEAR, type Year } from '@/types/dashboard';
import { Card, CardHeader } from '../ui/Card';
import { BoltIcon, BuildingIcon, CloudIcon, DocumentIcon } from '../ui/Icons';
import { ReportCard } from './ReportCard';
import { ReportFilters } from './ReportFilters';
import { ReportPreview } from './ReportPreview';

const ICON = {
  'monthly-services': DocumentIcon,
  'energy-water': BoltIcon,
  sustainability: CloudIcon,
  'real-estate': BuildingIcon,
} as const;

export function ReportsPageContent() {
  const { dict, selectedDistrict } = useDashboard();

  const [reportId, setReportId] = useState<ReportId>('monthly-services');
  const [districtId, setDistrictId] = useState<string>(selectedDistrict ?? 'all');
  const [fromYear, setFromYear] = useState<Year>((LAST_YEAR - 2) as Year);
  const [toYear, setToYear] = useState<Year>(LAST_YEAR);

  const selected = REPORT_DEFS.find((report) => report.id === reportId)!;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader title={dict.reportsPage.title} subtitle={dict.reportsPage.subtitle} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {REPORT_DEFS.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              Icon={ICON[report.id]}
              selected={report.id === reportId}
              onSelect={() => setReportId(report.id)}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <ReportFilters
            districtId={districtId}
            onDistrict={setDistrictId}
            fromYear={fromYear}
            toYear={toYear}
            onFromYear={(year) => {
              setFromYear(year);
              if (year > toYear) setToYear(year);
            }}
            onToYear={(year) => {
              setToYear(year);
              if (year < fromYear) setFromYear(year);
            }}
          />
        </div>

        <ReportPreview
          reportId={reportId}
          title={selected.title(dict)}
          districtId={districtId}
          fromYear={fromYear}
          toYear={toYear}
        />
      </Card>
    </div>
  );
}
