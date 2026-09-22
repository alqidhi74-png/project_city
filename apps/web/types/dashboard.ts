/** Shared vocabulary for the City Pulse dashboard. Everything else imports from here. */

export const YEARS = [
  2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
] as const;

export type Year = (typeof YEARS)[number];

export const FIRST_YEAR = YEARS[0];
export const LAST_YEAR = YEARS[YEARS.length - 1];

export const LAYERS = ['energy', 'water', 'air', 'population', 'requests'] as const;
export type LayerId = (typeof LAYERS)[number];

export const PERIODS = ['today', 'week', 'month', 'year'] as const;
export type Period = (typeof PERIODS)[number];

export type Bilingual = { ar: string; en: string };

/** The five metrics every district carries, for every year 2024–2035. */
export type DistrictMetrics = {
  /** Residents. */
  population: number;
  /** Annual electricity demand, MWh. */
  energy: number;
  /** Annual water demand, thousands of m³. */
  water: number;
  /** Air quality index, 0–100 — higher is cleaner. */
  air: number;
  /** Service requests raised that year. */
  requests: number;
};

export type MetricKey = keyof DistrictMetrics;

export type District = {
  id: string;
  name: Bilingual;
  /** Path data on the 0 0 800 600 viewBox used by CityMap. */
  svgPath: string;
  /** Label anchor inside the shape, same viewBox. */
  centroid: [number, number];
  /** Before this year the district is not built yet and renders faded. */
  establishedYear: Year;
  /** Keyed by year as a string, because it comes from JSON. */
  byYear: Record<string, DistrictMetrics>;
};

export type KpiDef = {
  id: string;
  label: Bilingual;
  unit: Bilingual;
  /** Which district metric this KPI aggregates. */
  metric: MetricKey;
  /** Sum across districts, or average them (air quality averages). */
  aggregate: 'sum' | 'avg';
  /** Scales the yearly figure down to the selected period. */
  periodFactor: Record<Period, number>;
  /** Decimal places when rendered. */
  precision: number;
  /** Rough direction of travel, used for the delta chip. */
  goodWhen: 'up' | 'down';
};

export type RequestStatus = 'open' | 'in-progress' | 'resolved';
export type RequestPriority = 'low' | 'medium' | 'high';

export type RequestRow = {
  id: string;
  districtId: string;
  service: Bilingual;
  /** Groups the donut chart. */
  category: string;
  categoryLabel: Bilingual;
  status: RequestStatus;
  priority: RequestPriority;
  /** ISO date. */
  submittedAt: string;
  applicant: Bilingual;
  year: Year;
};

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertCategory = 'traffic' | 'air' | 'energy' | 'water' | 'security';

export type AlertTemplate = {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: Bilingual;
  message: Bilingual;
  /** District ids this alert can fire in. */
  districts: string[];
};

/** An alert template once it has actually fired in the live feed. */
export type LiveAlert = {
  /** Unique per firing — templates repeat. */
  key: string;
  templateId: string;
  districtId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: Bilingual;
  message: Bilingual;
  /** Epoch ms. */
  at: number;
  resolved: boolean;
};

/** Named computations Ask-the-City can run against the current selection. */
export type AskCompute =
  | 'highestWater'
  | 'lowestWater'
  | 'highestEnergy'
  | 'requestsThisPeriod'
  | 'openRequests'
  | 'airToday'
  | 'bestAir'
  | 'largestDistrict'
  | 'totalPopulation'
  | 'busiestService';

export type AskEntry = {
  id: string;
  compute: AskCompute;
  /** Match terms, already lowercase. Arabic terms are matched after normalisation. */
  keywords: { ar: string[]; en: string[] };
  /** Supports {district} and {value} placeholders. */
  answer: Bilingual;
  /** Shown as a clickable suggestion chip. */
  suggestion: Bilingual;
  highlight: Highlight;
};

/** What Ask-the-City or story mode is currently pointing at. */
export type Highlight =
  | { kind: 'chart'; id: ChartId }
  | { kind: 'district'; id: string }
  | { kind: 'kpi'; id: string }
  | null;

export type ChartId = 'requests' | 'services' | 'energy' | 'water';

export type PropertyType = 'residential' | 'commercial' | 'land';
export type PropertyStatus = 'available' | 'reserved' | 'sold';

export type PropertyUnit = {
  id: string;
  districtId: string;
  type: PropertyType;
  typeLabel: Bilingual;
  status: PropertyStatus;
  unitLabel: Bilingual;
  /** OMR. */
  price: number;
  areaSqm: number;
  /** Residential units only. */
  bedrooms?: number;
  /** ISO date. */
  listedDate: string;
  /** ISO date — present only when status is 'sold'. */
  saleDate?: string;
  /** Present when status is 'reserved' or 'sold'. */
  buyer?: Bilingual;
};

/** The whole mock dataset, loaded once on the server. */
export type CityData = {
  districts: District[];
  kpis: KpiDef[];
  requests: RequestRow[];
  alerts: AlertTemplate[];
  ask: AskEntry[];
  properties: PropertyUnit[];
};

/** The filter state every component reads. */
export type Selection = {
  district: string | null;
  year: Year;
  period: Period;
};
