import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Year } from '@/types/dashboard';

export type StoryAction = {
  /** Selects this district, or clears the selection when null. */
  district?: string | null;
  year?: Year;
  /** Starts the timeline running from `year` up to `playTo`. */
  playTo?: Year;
  /** Fires one alert into the live feed. */
  fireAlert?: boolean;
  /** Restores everything to the pre-tour state. */
  reset?: boolean;
};

export type StoryStep = {
  id: string;
  /** Matches a `data-story-anchor` attribute; the caption bubble points at it. */
  anchor: string;
  caption: (dict: Dictionary) => string;
  durationMs: number;
  action?: StoryAction;
};

/**
 * The tour touches each feature in turn and then puts the dashboard back where
 * it found it. Durations are the auto-advance delay; the reader can always step
 * manually or leave.
 */
export const STORY_STEPS: StoryStep[] = [
  {
    id: 'intro',
    anchor: 'kpi-grid',
    caption: (d) => d.story.captions.intro,
    durationMs: 3200,
    action: { reset: true },
  },
  {
    id: 'kpis',
    anchor: 'kpi-grid',
    caption: (d) => d.story.captions.kpis,
    durationMs: 3800,
  },
  {
    id: 'district',
    anchor: 'city-map',
    caption: (d) => d.story.captions.district,
    durationMs: 4200,
    action: { district: 'rimal' },
  },
  {
    id: 'timeline',
    anchor: 'time-slider',
    caption: (d) => d.story.captions.timeline,
    durationMs: 9000,
    action: { district: null, year: 2024, playTo: 2035 },
  },
  {
    id: 'alert',
    anchor: 'live-feed',
    caption: (d) => d.story.captions.alert,
    durationMs: 4200,
    action: { fireAlert: true },
  },
  {
    id: 'reset',
    anchor: 'kpi-grid',
    caption: (d) => d.story.captions.reset,
    durationMs: 2800,
    action: { reset: true },
  },
];
