import districtsJson from '@/data/districts.json';
import kpisJson from '@/data/kpis.json';
import requestsJson from '@/data/requests.json';
import alertsJson from '@/data/alerts.json';
import askJson from '@/data/ask-the-city.json';
import propertiesJson from '@/data/properties.json';

import type {
  AlertTemplate,
  AskEntry,
  CityData,
  District,
  KpiDef,
  PropertyUnit,
  RequestRow,
} from '@/types/dashboard';

/**
 * JSON imports widen to `string`/`number`, so the union and tuple types in
 * types/dashboard.ts have to be reasserted here. This is the only place the
 * mock data is cast — everything downstream is fully typed.
 */
export const cityData: CityData = {
  districts: districtsJson as unknown as District[],
  kpis: kpisJson as unknown as KpiDef[],
  requests: requestsJson as unknown as RequestRow[],
  alerts: alertsJson as unknown as AlertTemplate[],
  ask: askJson as unknown as AskEntry[],
  properties: propertiesJson as unknown as PropertyUnit[],
};

export function getCityData(): CityData {
  return cityData;
}
