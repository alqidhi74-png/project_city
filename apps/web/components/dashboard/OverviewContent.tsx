'use client';

import { useLiveFeed } from './state/LiveFeedProvider';

import { KpiGrid } from './kpi/KpiGrid';
import { CityMap } from './map/CityMap';
import { TimeSlider } from './time/TimeSlider';
import { RequestsLineChart } from './charts/RequestsLineChart';
import { WaterAreaChart } from './charts/WaterAreaChart';
import { ServicesDonutChart } from './charts/ServicesDonutChart';
import { EnergyBarChart } from './charts/EnergyBarChart';
import { LiveFeedPanel } from './live/LiveFeedPanel';
import { RequestsTable } from './table/RequestsTable';
import { AskTheCity } from './ask/AskTheCity';
import { WhatIfPanel } from './whatif/WhatIfPanel';

/** The Overview route's content — everything that used to be the whole page. */
export function OverviewContent() {
  const { pulsingDistrictId } = useLiveFeed();

  return (
    <>
      <KpiGrid />

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="order-2 space-y-3 lg:order-1 lg:col-span-3">
          <RequestsLineChart />
          <WaterAreaChart />
        </div>

        <div className="order-1 space-y-3 lg:order-2 lg:col-span-6">
          <CityMap pulsingDistrictId={pulsingDistrictId} />
          <TimeSlider />
        </div>

        <div className="order-3 lg:col-span-3">
          <LiveFeedPanel />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <ServicesDonutChart />
        <EnergyBarChart />
        <AskTheCity />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WhatIfPanel />
        </div>
        <div className="lg:col-span-2">
          <RequestsTable />
        </div>
      </div>
    </>
  );
}
