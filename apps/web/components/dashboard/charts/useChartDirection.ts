'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { CHART_CHROME } from '@/lib/theme';

/**
 * Recharts is not RTL-aware. In Arabic the category axis runs right-to-left and
 * the value axis moves to the right edge; everything else is shared chrome.
 */
export function useChartDirection() {
  const { rtl } = useDashboard();
  const { mode } = useTheme();
  const chrome = CHART_CHROME[mode];

  return {
    rtl,
    chrome,
    /** Spread onto a category XAxis. */
    xAxisProps: {
      reversed: rtl,
      tickLine: false,
      axisLine: { stroke: chrome.grid },
      tick: { fill: chrome.axis, fontSize: 11 },
      dy: 4,
    },
    /** Spread onto a value YAxis. */
    yAxisProps: {
      orientation: (rtl ? 'right' : 'left') as 'right' | 'left',
      tickLine: false,
      axisLine: false,
      tick: { fill: chrome.axis, fontSize: 11 },
      width: 46,
    },
    gridProps: {
      stroke: chrome.grid,
      strokeDasharray: '3 3',
      vertical: false,
    },
  };
}
