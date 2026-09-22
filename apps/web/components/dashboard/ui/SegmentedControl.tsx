'use client';

/**
 * Generic 2-to-4-way segmented control, the same visual pattern as
 * `shell/PeriodFilter.tsx` but parameterised over any value type, so the
 * theme (3-way) and language (2-way) switches on Settings reuse it instead of
 * hand-rolling their own button rows.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-xl border border-hairline bg-surface-raised p-0.5"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'rounded-[0.6rem] px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-city-emerald text-white'
                : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
