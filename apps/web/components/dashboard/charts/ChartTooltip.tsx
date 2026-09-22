'use client';

import type { ReactNode } from 'react';

import type { Locale } from '@/lib/i18n/config';
import { formatNumber } from '@/lib/format';

type Row = { name: string; value: number; color: string };

/**
 * Recharts types its `content` prop against its own generic payload shape,
 * which is awkward to satisfy from outside. Taking `unknown` and narrowing here
 * is always assignable and keeps us off `any`.
 */
function readRows(input: unknown): { active: boolean; label: string; rows: Row[] } {
  const empty = { active: false, label: '', rows: [] as Row[] };
  if (typeof input !== 'object' || input === null) return empty;

  const source = input as {
    active?: boolean;
    label?: unknown;
    payload?: unknown;
  };
  if (!source.active || !Array.isArray(source.payload)) return empty;

  const rows: Row[] = [];
  for (const entry of source.payload) {
    if (typeof entry !== 'object' || entry === null) continue;
    const item = entry as { name?: unknown; value?: unknown; color?: unknown; fill?: unknown };
    const value = typeof item.value === 'number' ? item.value : Number(item.value);
    if (!Number.isFinite(value)) continue;
    rows.push({
      name: typeof item.name === 'string' ? item.name : '',
      value,
      color:
        typeof item.color === 'string'
          ? item.color
          : typeof item.fill === 'string'
            ? item.fill
            : 'currentColor',
    });
  }

  const label =
    typeof source.label === 'string' || typeof source.label === 'number'
      ? String(source.label)
      : '';

  return { active: rows.length > 0, label, rows };
}

export type TooltipOptions = {
  locale: Locale;
  unit?: string;
  precision?: number;
  /** Overrides the header, which is otherwise the category/axis label. */
  title?: string;
};

export function renderChartTooltip(input: unknown, options: TooltipOptions): ReactNode {
  const { active, label, rows } = readRows(input);
  if (!active) return null;

  const heading = options.title ?? label;

  return (
    <div className="pointer-events-none rounded-xl border border-hairline bg-surface-raised px-3 py-2 shadow-lg">
      {heading ? (
        <p className="mb-1 text-[11px] font-semibold text-ink">{heading}</p>
      ) : null}
      <ul className="space-y-0.5">
        {rows.map((row, index) => (
          <li
            key={`${row.name}-${index}`}
            className="flex items-center gap-2 text-[11px] text-ink-muted"
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            {row.name ? <span className="truncate">{row.name}</span> : null}
            <span className="tnum ms-auto font-semibold text-ink">
              {formatNumber(row.value, options.locale, options.precision ?? 0)}
              {options.unit ? <span className="text-ink-subtle"> {options.unit}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
