'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useLiveFeed } from '../state/LiveFeedProvider';
import { Card, CardHeader } from '../ui/Card';
import { CityMap } from '../map/CityMap';
import { LiveMetricsGrid } from './LiveMetricsGrid';
import { FullAlertsList } from './FullAlertsList';

/**
 * The full-screen counterpart to the Overview's compact live panel. `CityMap`
 * already owns its own layer toggle, legend and Card chrome — placed here
 * without the Overview's side columns, it simply renders larger.
 */
export function CityLivePageContent() {
  const { dict } = useDashboard();
  const { pulsingDistrictId } = useLiveFeed();

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader title={dict.livePage.title} subtitle={dict.livePage.subtitle} />
      </Card>

      <CityMap pulsingDistrictId={pulsingDistrictId} />
      <LiveMetricsGrid />
      <FullAlertsList />
    </div>
  );
}
