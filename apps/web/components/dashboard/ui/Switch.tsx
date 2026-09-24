'use client';

/** Boolean toggle switch, RTL-safe (the knob position follows `dir`, not `left`/`right`). */
export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-city-emerald' : 'bg-surface-sunken',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'inline-block size-4.5 transform rounded-full bg-white shadow transition-transform',
          // Logical inset via ms-* would be cleaner, but the knob's travel
          // distance must flip with direction, which only a transform does.
          checked ? 'translate-x-[1.375rem] rtl:-translate-x-[1.375rem]' : 'translate-x-0.5 rtl:-translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}
