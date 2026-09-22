'use client';

import { motion } from 'framer-motion';

import type { District } from '@/types/dashboard';
import { BRAND } from '@/lib/theme';

type Props = {
  district: District;
  /** Ramp colour for the active layer, or the unbuilt grey. */
  fill: string;
  built: boolean;
  selected: boolean;
  hovered: boolean;
  /** An alert is live in this district. */
  pulsing: boolean;
  /** Something else is selected, so this shape recedes. */
  dimmed: boolean;
  label: string;
  motionOK: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

export function DistrictShape({
  district,
  fill,
  built,
  selected,
  hovered,
  pulsing,
  dimmed,
  label,
  motionOK,
  onHover,
  onSelect,
}: Props) {
  const stroke = pulsing
    ? BRAND.vermilion
    : selected
      ? BRAND.goldDark
      : hovered
        ? BRAND.goldDark
        : 'rgba(0,0,0,0.22)';

  const strokeWidth = pulsing ? 4 : selected ? 3.5 : hovered ? 3 : 1.25;
  const opacity = !built ? 0.32 : dimmed ? 0.45 : 1;

  return (
    <g
      role="button"
      tabIndex={built ? 0 : -1}
      aria-pressed={selected}
      aria-disabled={!built}
      aria-label={label}
      className={built ? 'cursor-pointer outline-none' : 'cursor-default'}
      onMouseEnter={() => onHover(district.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(district.id)}
      onBlur={() => onHover(null)}
      onClick={() => built && onSelect(district.id)}
      onKeyDown={(event) => {
        if (!built) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(district.id);
        }
      }}
    >
      {/* Vermilion pulse ring for a live alert, drawn beneath the shape. */}
      {pulsing && built ? (
        <path
          d={district.svgPath}
          fill="none"
          stroke={BRAND.vermilion}
          strokeWidth={3}
          className={motionOK ? 'animate-pulse-ring' : ''}
          style={{ transformOrigin: `${district.centroid[0]}px ${district.centroid[1]}px` }}
          opacity={motionOK ? undefined : 0.5}
        />
      ) : null}

      <motion.path
        d={district.svgPath}
        initial={false}
        animate={{ fill, opacity, stroke, strokeWidth }}
        transition={{ duration: motionOK ? 0.55 : 0, ease: 'easeInOut' }}
        filter={hovered && built ? 'url(#goldGlow)' : undefined}
      />
    </g>
  );
}
