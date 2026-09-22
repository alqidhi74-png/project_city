'use client';

import { useCallback, useEffect, useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import { FIRST_YEAR, LAST_YEAR, YEARS, type Year } from '@/types/dashboard';
import { Card } from '../ui/Card';
import { PauseIcon, PlayIcon } from '../ui/Icons';

const STEP_MS = 900;

export function TimeSlider() {
  const { dict, rtl, selectedYear, setYear } = useDashboard();
  const [playing, setPlaying] = useState(false);

  // Advance on a timer, stopping at the last year.
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (selectedYear >= LAST_YEAR) {
        setPlaying(false);
        return;
      }
      setYear((selectedYear + 1) as Year);
    }, STEP_MS);
    return () => clearTimeout(id);
  }, [playing, selectedYear, setYear]);

  const toggle = useCallback(() => {
    setPlaying((current) => {
      // Restarting from the end replays the whole timeline.
      if (!current && selectedYear >= LAST_YEAR) setYear(FIRST_YEAR);
      return !current;
    });
  }, [selectedYear, setYear]);

  const label = playing ? dict.time.pause : dict.time.play;
  const progress = ((selectedYear - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR)) * 100;

  return (
    <Card data-story-anchor="time-slider">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          title={label}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-city-emerald text-white transition-opacity hover:opacity-90"
        >
          {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-ink-subtle">{dict.time.title}</span>
            <span className="tnum text-sm font-semibold text-ink">{selectedYear}</span>
          </div>

          <input
            type="range"
            min={FIRST_YEAR}
            max={LAST_YEAR}
            step={1}
            value={selectedYear}
            onChange={(event) => setYear(Number(event.target.value) as Year)}
            aria-label={dict.time.year}
            aria-valuetext={String(selectedYear)}
            className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-city-emerald"
            style={{
              // The native slider flips under dir=rtl, so the fill must flip too.
              background: `linear-gradient(to ${rtl ? 'left' : 'right'}, var(--color-gold-dark) ${progress}%, var(--surface-sunken) ${progress}%)`,
            }}
          />

          <div className="mt-1 flex justify-between text-[10px] text-ink-subtle">
            <span className="tnum">{FIRST_YEAR}</span>
            <span className="hidden sm:inline">{dict.time.hint}</span>
            <span className="tnum">{LAST_YEAR}</span>
          </div>
        </div>
      </div>

      {/* Tick marks double as jump targets. */}
      <div className="mt-2 hidden justify-between gap-1 sm:flex">
        {YEARS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setYear(year)}
            aria-label={String(year)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              year <= selectedYear ? 'bg-gold-dark' : 'bg-surface-sunken'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}
