'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useDashboard } from '../state/DashboardProvider';
import { useTheme } from '../state/ThemeProvider';
import { useMotionOK } from '@/lib/motion';
import { LAYER_METRIC, layerColor, unbuiltFill } from '@/lib/layers';
import { isBuilt, metricRange, metricsAt } from '@/lib/selectors';
import { BRAND } from '@/lib/theme';
import { Card, CardHeader } from '../ui/Card';
import { DistrictShape } from './DistrictShape';
import { MapTooltip } from './MapTooltip';
import { LayerToggle } from './LayerToggle';
import { MapLegend } from './MapLegend';

/**
 * The map is geography, so it is never mirrored in RTL — only the surrounding
 * chrome flips. The wrapper is pinned to `dir="ltr"` to make that explicit.
 */
export function CityMap({ pulsingDistrictId = null }: { pulsingDistrictId?: string | null }) {
  const {
    dict,
    data,
    locale,
    activeLayer,
    selectedYear,
    selectedDistrict,
    highlight,
    toggleDistrict,
  } = useDashboard();
  const { mode } = useTheme();
  const motionOK = useMotionOK();
  const [hovered, setHovered] = useState<string | null>(null);

  const metric = LAYER_METRIC[activeLayer];
  const range = metricRange(data, metric, selectedYear);
  const hoveredDistrict = data.districts.find((d) => d.id === hovered) ?? null;

  const askHighlight = highlight?.kind === 'district' ? highlight.id : null;

  return (
    <Card
      padded={false}
      highlighted={highlight?.kind === 'district'}
      data-story-anchor="city-map"
    >
      <div className="p-4 pb-0 sm:p-5 sm:pb-0">
        <CardHeader
          title={dict.map.title}
          subtitle={selectedDistrict ? dict.map.selectedHint : dict.map.subtitle}
        />
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <LayerToggle />
          <MapLegend />
        </div>
      </div>

      <div className="relative px-2 pb-4 sm:px-3 sm:pb-5" dir="ltr">
        <svg
          viewBox="0 0 800 600"
          className="h-auto w-full"
          role="group"
          aria-label={dict.map.title}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={BRAND.goldLight} />
              <stop offset="100%" stopColor={BRAND.goldDark} />
            </linearGradient>
            <filter id="goldGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="9"
                floodColor={BRAND.goldDark}
                floodOpacity="0.75"
              />
            </filter>
          </defs>

          {data.districts.map((district) => {
            const built = isBuilt(district, selectedYear);
            const value = metricsAt(district, selectedYear)[metric];
            const fill = built ? layerColor(activeLayer, value, range, mode) : unbuiltFill(mode);
            const selected =
              selectedDistrict === district.id || askHighlight === district.id;

            return (
              <DistrictShape
                key={district.id}
                district={district}
                fill={fill}
                built={built}
                selected={selected}
                hovered={hovered === district.id}
                pulsing={pulsingDistrictId === district.id}
                dimmed={Boolean(selectedDistrict) && selectedDistrict !== district.id}
                label={`${dict.map.districtLabel} ${district.name[locale]}`}
                motionOK={motionOK}
                onHover={setHovered}
                onSelect={toggleDistrict}
              />
            );
          })}

          {/* District names sit above every shape so no label is overdrawn. */}
          {data.districts.map((district) => {
            const built = isBuilt(district, selectedYear);
            return (
              <text
                key={`${district.id}-label`}
                x={district.centroid[0]}
                y={district.centroid[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none text-[15px] font-semibold"
                fill={built ? 'rgba(255,255,255,0.95)' : 'currentColor'}
                opacity={built ? 1 : 0.35}
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.28)', strokeWidth: 3 }}
              >
                {district.name[locale]}
              </text>
            );
          })}
        </svg>

        <AnimatePresence>
          {hoveredDistrict ? (
            <MapTooltip
              key={hoveredDistrict.id}
              district={hoveredDistrict}
              layer={activeLayer}
              motionOK={motionOK}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </Card>
  );
}
