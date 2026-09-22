import type { ReactElement, SVGProps } from 'react';
import type { LiveMetricKey } from '@/components/dashboard/state/LiveFeedProvider';
import type { Thresholds } from '@/components/dashboard/state/SettingsProvider';
import type { Dictionary } from './i18n/get-dictionary';
import {
  BoltIcon,
  CityLiveIcon,
  CloudIcon,
  DropletIcon,
  LightbulbIcon,
  SunIcon,
  TrashIcon,
} from '@/components/dashboard/ui/Icons';

export const LIVE_METRIC_ORDER: LiveMetricKey[] = [
  'traffic',
  'air',
  'energy',
  'water',
  'lighting',
  'waste',
  'weather',
];

/**
 * Colour follows the entity: traffic/air/energy/water reuse the exact slots
 * `metricColor` assigns them everywhere else in the app (see lib/theme.ts's
 * METRIC_SLOT). Lighting/waste/weather have no city-wide metric equivalent,
 * so they reuse a slot decoratively — each is its own card with an icon and
 * label, never compared side-by-side as chart series, so hue reuse here
 * carries no ambiguity.
 */
export const LIVE_METRIC_COLOR_SLOT: Record<LiveMetricKey, number> = {
  air: 0, // evergreen
  traffic: 1, // vermilion
  lighting: 2, // orchid
  energy: 3, // sunburst
  water: 4, // emerald
  waste: 0, // evergreen (reused)
  weather: 1, // vermilion (reused)
};

export const LIVE_METRIC_ICON: Record<LiveMetricKey, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  traffic: CityLiveIcon,
  air: CloudIcon,
  energy: BoltIcon,
  water: DropletIcon,
  lighting: LightbulbIcon,
  waste: TrashIcon,
  weather: SunIcon,
};

export function liveMetricLabel(key: LiveMetricKey, dict: Dictionary): string {
  switch (key) {
    case 'traffic':
      return dict.live.traffic;
    case 'air':
      return dict.live.air;
    case 'energy':
      return dict.live.energy;
    case 'water':
      return dict.livePage.water;
    case 'lighting':
      return dict.livePage.lighting;
    case 'waste':
      return dict.livePage.waste;
    case 'weather':
      return dict.livePage.weather;
  }
}

export function liveMetricUnit(key: LiveMetricKey, dict: Dictionary): string {
  switch (key) {
    case 'traffic':
      return dict.live.trafficUnit;
    case 'air':
      return dict.live.airUnit;
    case 'energy':
      return dict.live.energyUnit;
    case 'water':
      return dict.livePage.waterUnit;
    case 'lighting':
      return dict.livePage.lightingUnit;
    case 'waste':
      return dict.livePage.wasteUnit;
    case 'weather':
      return dict.livePage.weatherUnit;
  }
}

export type ThresholdDirection = 'max' | 'min';

/** Only the three metrics Settings exposes sliders for can be flagged. */
export const THRESHOLD_DIRECTION: Partial<Record<LiveMetricKey, ThresholdDirection>> = {
  traffic: 'max',
  air: 'min',
  energy: 'max',
};

/** True when the metric has crossed its configured threshold (traffic/energy: above; air: below — higher is cleaner). */
export function isOverThreshold(
  key: LiveMetricKey,
  value: number,
  thresholds: Thresholds,
): boolean {
  const direction = THRESHOLD_DIRECTION[key];
  if (!direction) return false;
  const limit = thresholds[key as keyof Thresholds];
  return direction === 'max' ? value >= limit : value <= limit;
}
