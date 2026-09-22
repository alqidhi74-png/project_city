import type { LayerId, MetricKey } from '@/types/dashboard';
import type { ThemeMode } from './theme';

/**
 * One sequential ramp per map layer: a single brand hue stepped light → dark so
 * the reader sees magnitude in the lightness, never a rainbow. Each ramp is
 * monotone in OKLCH lightness with ≥0.06 between adjacent steps, and its pale
 * end still clears ~2:1 against the card surface it sits on.
 */
export const LAYER_RAMPS: Record<LayerId, Record<ThemeMode, readonly string[]>> = {
  energy: {
    light: ['#bfb39c', '#b59c6d', '#ac8431', '#98700c', '#805d07'],
    dark: ['#604e2d', '#7d5e1c', '#976e0c', '#b28100', '#cb9611'],
  },
  water: {
    light: ['#9bbcba', '#69aeab', '#149f9c', '#138986', '#067371'],
    dark: ['#275b59', '#007270', '#008785', '#0d9f9c', '#15b7b4'],
  },
  air: {
    light: ['#afb9a1', '#94a878', '#7b9749', '#638509', '#527007'],
    dark: ['#4a5735', '#566c30', '#648224', '#739a15', '#89b03b'],
  },
  population: {
    light: ['#c5acba', '#bf8eac', '#b96f9e', '#b04e90', '#9f327e'],
    dark: ['#66455a', '#864e72', '#a6558a', '#c860a5', '#de77ba'],
  },
  requests: {
    light: ['#c9ada5', '#c79082', '#c4715c', '#bf4f34', '#ae3311'],
    dark: ['#6c463c', '#8f4f3f', '#b35740', '#d76245', '#ee795d'],
  },
};

/** Which district metric each layer paints. */
export const LAYER_METRIC: Record<LayerId, MetricKey> = {
  energy: 'energy',
  water: 'water',
  air: 'air',
  population: 'population',
  requests: 'requests',
};

/** Decimal places when a layer value is shown in a tooltip or legend. */
export const LAYER_PRECISION: Record<LayerId, number> = {
  energy: 0,
  water: 1,
  air: 0,
  population: 0,
  requests: 0,
};

const STEPS = 5;

/** Bucket a value into its ramp step. */
export function layerColor(
  layer: LayerId,
  value: number,
  range: { min: number; max: number },
  mode: ThemeMode,
): string {
  const ramp = LAYER_RAMPS[layer][mode];
  const span = range.max - range.min;
  const t = span <= 0 ? 0 : (value - range.min) / span;
  const index = Math.min(STEPS - 1, Math.max(0, Math.floor(t * STEPS)));
  return ramp[index];
}

/** The five swatches, for the legend. */
export function layerSwatches(layer: LayerId, mode: ThemeMode): readonly string[] {
  return LAYER_RAMPS[layer][mode];
}

/** Fill used for a district that does not exist yet in the selected year. */
export function unbuiltFill(mode: ThemeMode): string {
  return mode === 'dark' ? '#14231f' : '#e6e6dd';
}
