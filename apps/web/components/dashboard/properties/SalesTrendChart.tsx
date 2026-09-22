'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { seriesColor } from '@/lib/theme';
import { salesTrend } from '@/lib/properties';
import { Card, CardHeader } from '../ui/Card';
import { MiniLineChart } from '../charts/MiniLineChart';

const COLOR_SLOT = 2;

export function SalesTrendChart() {
  const { dict, data, locale, selection } = useDashboard();
  const { mode } = useTheme();
  const points = salesTrend(data, selection, locale);

  return (
    <Card>
      <CardHeader
        title={dict.propertiesPage.salesTrendTitle}
        subtitle={dict.propertiesPage.salesTrendSubtitle}
      />
      <MiniLineChart
        points={points}
        color={seriesColor(COLOR_SLOT, mode)}
        unit={dict.propertiesPage.unitsSoldLabel}
        seriesName={dict.propertiesPage.salesTrendTitle}
      />
    </Card>
  );
}
