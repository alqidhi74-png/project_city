import type { AskEntry, CityData, Highlight, Selection } from '@/types/dashboard';
import type { Locale } from './i18n/config';
import {
  builtDistricts,
  districtsInScope,
  filteredRequests,
  metricsAt,
  serviceBreakdown,
} from './selectors';
import { formatNumber, template } from './format';

/**
 * Arabic is written with optional diacritics and several interchangeable
 * letterforms, so both the query and the keyword lists are flattened to a
 * common shape before matching. Latin input is simply lowercased.
 */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '') // harakat and tatweel
    .replace(/[آأإ]/g, 'ا') // آ إ أ -> ا
    .replace(/ى/g, 'ي') // ى -> ي
    .replace(/ة/g, 'ه') // ة -> ه
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type AskResult = {
  entry: AskEntry;
  answer: string;
  highlight: Highlight;
};

/** Scores each entry by how many of its keywords the query contains. */
export function matchEntry(query: string, entries: AskEntry[], locale: Locale): AskEntry | null {
  const haystack = normalise(query);
  if (haystack.length < 2) return null;

  const words = new Set(haystack.split(' '));
  let best: { entry: AskEntry; score: number } | null = null;

  for (const entry of entries) {
    const keywords = entry.keywords[locale].map(normalise);
    let score = 0;
    for (const keyword of keywords) {
      if (!keyword) continue;
      // Whole-word hits count double; a substring hit still counts.
      if (words.has(keyword)) score += 2;
      else if (haystack.includes(keyword)) score += 1;
    }
    // Normalise by list length so a long keyword list isn't unfairly favoured.
    const normalised = score / Math.max(1, keywords.length);
    if (normalised > 0 && (!best || normalised > best.score)) {
      best = { entry, score: normalised };
    }
  }

  // Require a real signal, not a single incidental word.
  return best && best.score >= 0.5 ? best.entry : null;
}

type ResolvedValue = { value: string; subject: string; highlight?: Highlight };

/** Runs the entry's named computation against the current selection. */
function resolve(
  entry: AskEntry,
  data: CityData,
  selection: Selection,
  locale: Locale,
  cityWideLabel: string,
): ResolvedValue {
  const scope = districtsInScope(data, selection);
  const built = builtDistricts(data, selection.year);
  const scopeLabel =
    scope.length === 1 && selection.district ? scope[0].name[locale] : cityWideLabel;

  const extreme = (metric: 'water' | 'energy' | 'air' | 'population', pick: 'max' | 'min') => {
    const pool = built.length > 0 ? built : data.districts;
    const sorted = [...pool].sort(
      (a, b) => metricsAt(a, selection.year)[metric] - metricsAt(b, selection.year)[metric],
    );
    return pick === 'max' ? sorted[sorted.length - 1] : sorted[0];
  };

  switch (entry.compute) {
    case 'highestWater':
    case 'lowestWater': {
      const district = extreme('water', entry.compute === 'highestWater' ? 'max' : 'min');
      return {
        subject: district.name[locale],
        value: formatNumber(metricsAt(district, selection.year).water, locale, 1),
        highlight: { kind: 'chart', id: 'water' },
      };
    }
    case 'highestEnergy': {
      const district = extreme('energy', 'max');
      return {
        subject: district.name[locale],
        value: formatNumber(metricsAt(district, selection.year).energy, locale),
        highlight: { kind: 'chart', id: 'energy' },
      };
    }
    case 'bestAir': {
      const district = extreme('air', 'max');
      return {
        subject: district.name[locale],
        value: formatNumber(metricsAt(district, selection.year).air, locale),
        highlight: { kind: 'district', id: district.id },
      };
    }
    case 'largestDistrict': {
      const district = extreme('population', 'max');
      return {
        subject: district.name[locale],
        value: formatNumber(metricsAt(district, selection.year).population, locale),
        highlight: { kind: 'district', id: district.id },
      };
    }
    case 'airToday': {
      const values = scope.map((d) => metricsAt(d, selection.year).air).filter((v) => v > 0);
      const average = values.length
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : 0;
      return { subject: scopeLabel, value: formatNumber(average, locale) };
    }
    case 'totalPopulation': {
      const total = scope.reduce((sum, d) => sum + metricsAt(d, selection.year).population, 0);
      return { subject: scopeLabel, value: formatNumber(total, locale) };
    }
    case 'requestsThisPeriod': {
      const total = scope.reduce((sum, d) => sum + metricsAt(d, selection.year).requests, 0);
      return { subject: scopeLabel, value: formatNumber(Math.round(total), locale) };
    }
    case 'openRequests': {
      const open = filteredRequests(data, selection).filter((row) => row.status !== 'resolved');
      return { subject: scopeLabel, value: formatNumber(open.length, locale) };
    }
    case 'busiestService': {
      const breakdown = serviceBreakdown(data, selection, locale);
      if (breakdown.length === 0) return { subject: scopeLabel, value: formatNumber(0, locale) };
      return {
        subject: breakdown[0].label,
        value: formatNumber(breakdown[0].value, locale),
        highlight: { kind: 'chart', id: 'services' },
      };
    }
    default:
      return { subject: scopeLabel, value: '—' };
  }
}

export function ask(
  query: string,
  data: CityData,
  selection: Selection,
  locale: Locale,
  cityWideLabel: string,
): AskResult | null {
  const entry = matchEntry(query, data.ask, locale);
  if (!entry) return null;

  const resolved = resolve(entry, data, selection, locale, cityWideLabel);

  return {
    entry,
    answer: template(entry.answer[locale], {
      district: resolved.subject,
      value: resolved.value,
    }),
    // A computed target (the actual winning district) beats the static one.
    highlight: resolved.highlight ?? entry.highlight,
  };
}
