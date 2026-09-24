'use client';

/** Bare trend line — no axes, no labels; the KPI value carries the magnitude. */
export function Sparkline({
  values,
  color,
  markerIndex,
}: {
  values: number[];
  color: string;
  markerIndex: number;
}) {
  if (values.length < 2) return null;

  const width = 100;
  const height = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => height - ((v - min) / span) * (height - 4) - 2;

  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const safeIndex = Math.min(values.length - 1, Math.max(0, markerIndex));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-7 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={path} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <circle cx={x(safeIndex)} cy={y(values[safeIndex])} r={2.8} fill={color} />
    </svg>
  );
}
