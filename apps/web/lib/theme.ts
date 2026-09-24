/**
 * Colour tokens in TypeScript, for the places CSS classes can't reach:
 * Recharts props and SVG attributes both need literal values.
 */

/** The literal brand palette. Used for UI chrome — sidebar, buttons, badges, map base. */
export const BRAND = {
  velvet: '#49111D',
  evergreen: '#3D4E1E',
  emerald: '#143534',
  vermilion: '#F8633E',
  orchid: '#AC6492',
  sunburst: '#F1BB4D',
  goldLight: '#F9EDB8',
  goldDark: '#B39157',
} as const;

/**
 * Chart series colours.
 *
 * These are the *same brand hues* in the same order (evergreen, vermilion,
 * orchid, sunburst, emerald), re-stepped in lightness so they work as series
 * fills. The literal brand values fail as a categorical palette: evergreen
 * (#3D4E1E) and emerald (#143534) are both near-black and low-chroma, so they
 * read as grey and sit only ΔE 11.6 apart under normal vision — indistinguishable
 * side by side in a donut. Holding each hue fixed and moving only its lightness
 * into the legible band clears the separation gates in both modes.
 *
 * Chrome keeps the exact brand hex; only series marks use these.
 */
export const CHART_COLORS_LIGHT = [
  '#435d00', // evergreen
  '#ff582d', // vermilion
  '#cd3ba2', // orchid
  '#e2a503', // sunburst
  '#069391', // emerald
] as const;

export const CHART_COLORS_DARK = [
  '#79a300', // evergreen
  '#c33202', // vermilion
  '#cd3ba2', // orchid
  '#bb8800', // sunburst
  '#069391', // emerald
] as const;

export type ThemeMode = 'light' | 'dark';

export function chartColors(mode: ThemeMode): readonly string[] {
  return mode === 'dark' ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
}

/** Series colour by fixed slot — never cycled past the end. */
export function seriesColor(index: number, mode: ThemeMode): string {
  const palette = chartColors(mode);
  return palette[index % palette.length];
}

/**
 * Colour follows the entity, not its rank: each city metric owns one slot and
 * wears it everywhere — the map ramp, its KPI card and its chart. Energy is
 * gold in all three places, water is teal in all three, and a filter that
 * changes which districts survive never repaints them.
 */
export const METRIC_SLOT = {
  air: 0, // evergreen
  requests: 1, // vermilion
  population: 2, // orchid
  energy: 3, // sunburst
  water: 4, // emerald
} as const;

export function metricColor(metric: keyof typeof METRIC_SLOT, mode: ThemeMode): string {
  return seriesColor(METRIC_SLOT[metric], mode);
}

/** Recessive grid / axis / surface values per mode. */
export const CHART_CHROME = {
  light: {
    grid: '#e2e2d8',
    axis: '#77807d',
    surface: '#fcfcfb',
    tooltipBg: '#ffffff',
    tooltipBorder: '#dcdcd2',
    ink: '#1b2220',
  },
  dark: {
    grid: '#1e332f',
    axis: '#758783',
    surface: '#0f1f1e',
    tooltipBg: '#132726',
    tooltipBorder: '#24403b',
    ink: '#eef3f1',
  },
} as const;

/** Status colours, reserved — never reused as a series colour. */
export const STATUS = {
  open: { light: '#b4531a', dark: '#e5904a' },
  'in-progress': { light: '#8a6d00', dark: '#d8b13c' },
  resolved: { light: '#2f6b3f', dark: '#66b27c' },
} as const;

export const SEVERITY = {
  info: { light: '#2f6b3f', dark: '#66b27c' },
  warning: { light: '#8a6d00', dark: '#d8b13c' },
  critical: { light: '#b4301a', dark: '#f0714f' },
} as const;
