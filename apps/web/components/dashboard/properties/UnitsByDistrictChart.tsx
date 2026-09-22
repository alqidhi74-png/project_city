'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { seriesColor } from '@/lib/theme';
import { unitsByDistrict } from '@/lib/properties';
import { Card, CardHeader } from '../ui/Card';
import { MiniBarChart } from '../charts/MiniBarChart';

/** Orchid is Properties' page identity colour — a single nominal series, no legend needed. */
const COLOR_SLOT = 2;

export function UnitsByDistrictChart() {
  const { dict, data, locale, selection, toggleDistrict } = useDashboard();
  const { mode } = useTheme();
  const points = unitsByDistrict(data, selection, locale);

  return (
    <Card>
      <CardHeader
        title={dict.propertiesPage.unitsByDistrictTitle}
        subtitle={dict.propertiesPage.unitsByDistrictSubtitle}
      />
      <MiniBarChart
        points={points}
        color={seriesColor(COLOR_SLOT, mode)}
        unit={dict.propertiesPage.unitsLabel}
        seriesName={dict.propertiesPage.unitsByDistrictTitle}
        onBarClick={toggleDistrict}
      />
    </Card>
  );
}
