import type { CityData, Selection } from '@/types/dashboard';
import { districtsInScope, metricsAt } from './selectors';

export type WhatIfInputs = {
  /** Extra homes built on top of the current plan. */
  housingUnits: number;
  /** Share of rooftops carrying panels, 0–100. */
  solarCoverage: number;
  /** Additional bus routes in service. */
  busRoutes: number;
};

export const WHATIF_DEFAULTS: WhatIfInputs = {
  housingUnits: 0,
  solarCoverage: 20,
  busRoutes: 6,
};

export const WHATIF_LIMITS = {
  housingUnits: { min: 0, max: 20_000, step: 500 },
  solarCoverage: { min: 0, max: 100, step: 5 },
  busRoutes: { min: 0, max: 40, step: 1 },
} as const;

export type WhatIfOutputs = {
  /** MWh per year. */
  energy: number;
  /** Tonnes of CO₂ per year. */
  emissions: number;
  /** Congestion index, 0–100. */
  traffic: number;
};

export type WhatIfResult = {
  before: WhatIfOutputs;
  after: WhatIfOutputs;
};

/** Rough coefficients — plausible, and stated openly as a mock model. */
const MWH_PER_HOME = 0.0042; // MWh per home per year, at this file's scale
const CO2_PER_MWH = 0.41; // tonnes per MWh on the current generation mix
const BUS_RELIEF = 0.55; // index points removed per route
const SOLAR_OFFSET = 0.0055; // share of demand met per coverage point
const CONGESTION_PER_RESIDENT = 0.00012; // index points per resident
const RESIDENTS_PER_HOME = 3.1; // average household size
const BASE_CONGESTION = 28; // index with no residents and no routes

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function simulate(
  data: CityData,
  selection: Selection,
  inputs: WhatIfInputs,
): WhatIfResult {
  const scope = districtsInScope(data, selection);

  const baseEnergy = scope.reduce((sum, d) => sum + metricsAt(d, selection.year).energy, 0);
  const basePopulation = scope.reduce(
    (sum, d) => sum + metricsAt(d, selection.year).population,
    0,
  );

  // A congestion index that scales with population and eases with the routes
  // already running, so the "before" bar reacts to the district filter too.
  const congestion = (residents: number, routes: number) =>
    clamp(
      BASE_CONGESTION + residents * CONGESTION_PER_RESIDENT - routes * BUS_RELIEF,
      5,
      100,
    );

  const baseTraffic = congestion(basePopulation, WHATIF_DEFAULTS.busRoutes);
  const baseEmissions = baseEnergy * CO2_PER_MWH;

  const addedEnergy = inputs.housingUnits * MWH_PER_HOME;
  const grossEnergy = baseEnergy + addedEnergy;
  const solarShare = clamp(inputs.solarCoverage * SOLAR_OFFSET, 0, 0.55);
  const afterEnergy = grossEnergy * (1 - solarShare);

  const afterTraffic = congestion(
    basePopulation + inputs.housingUnits * RESIDENTS_PER_HOME,
    inputs.busRoutes,
  );

  return {
    before: {
      energy: baseEnergy,
      emissions: baseEmissions,
      traffic: baseTraffic,
    },
    after: {
      energy: afterEnergy,
      emissions: afterEnergy * CO2_PER_MWH,
      traffic: afterTraffic,
    },
  };
}

export function percentDelta(before: number, after: number): number {
  if (before === 0) return 0;
  return ((after - before) / before) * 100;
}
