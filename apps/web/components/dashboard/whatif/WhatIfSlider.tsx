'use client';

import { useDashboard } from '../state/DashboardProvider';
import { formatNumber } from '@/lib/format';

export function WhatIfSlider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const { locale, rtl } = useDashboard();
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-ink-muted">{label}</span>
        <span className="tnum text-xs font-semibold text-ink">
          {formatNumber(value, locale)}
          <span className="ms-1 text-[10px] font-normal text-ink-subtle">{unit}</span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-city-emerald"
        style={{
          background: `linear-gradient(to ${rtl ? 'left' : 'right'}, var(--color-gold-dark) ${progress}%, var(--surface-sunken) ${progress}%)`,
        }}
      />
    </label>
  );
}
