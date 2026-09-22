'use client';

import { motion } from 'framer-motion';

import type { District, LayerId } from '@/types/dashboard';
import { useDashboard } from '../state/DashboardProvider';
import { LAYER_METRIC, LAYER_PRECISION } from '@/lib/layers';
import { metricsAt } from '@/lib/selectors';
import { formatNumber, template } from '@/lib/format';

/**
 * Anchored to the district centroid rather than the pointer, so it also appears
 * when a district is reached by keyboard.
 */
export function MapTooltip({
  district,
  layer,
  motionOK,
}: {
  district: District;
  layer: LayerId;
  motionOK: boolean;
}) {
  const { dict, locale, selectedYear } = useDashboard();
  const built = district.establishedYear <= selectedYear;
  const metrics = metricsAt(district, selectedYear);
  const metric = LAYER_METRIC[layer];

  const layerLabel = dict.map.layers[layer];
  const left = (district.centroid[0] / 800) * 100;
  const top = (district.centroid[1] / 600) * 100;

  return (
    <motion.div
      initial={motionOK ? { opacity: 0, scale: 0.94 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: motionOK ? 0.15 : 0 }}
      className="pointer-events-none absolute z-20 w-44 -translate-x-1/2 -translate-y-[115%] rounded-xl border border-hairline bg-surface-raised p-3 shadow-lg"
      style={{ left: `${left}%`, top: `${top}%` }}
      role="tooltip"
    >
      <p className="text-xs font-semibold text-ink">{district.name[locale]}</p>

      {built ? (
        <>
          <p className="mt-1.5 flex items-baseline justify-between gap-2 text-[11px] text-ink-subtle">
            <span>{layerLabel}</span>
            <span className="tnum font-semibold text-ink">
              {formatNumber(metrics[metric], locale, LAYER_PRECISION[layer])}
            </span>
          </p>
          <p className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px] text-ink-subtle">
            <span>{dict.map.tooltipRequests}</span>
            <span className="tnum font-medium text-ink-muted">
              {formatNumber(metrics.requests, locale)}
            </span>
          </p>
        </>
      ) : (
        <p className="mt-1.5 text-[11px] text-ink-subtle">
          {dict.map.notBuilt} ·{' '}
          {template(dict.map.establishedIn, { year: district.establishedYear })}
        </p>
      )}
    </motion.div>
  );
}
