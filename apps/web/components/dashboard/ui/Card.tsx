'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Draws the gold attention ring — used by Ask-the-City and story mode. */
  highlighted?: boolean;
  padded?: boolean;
  /** Declared explicitly so story mode can target this card by name. */
  'data-story-anchor'?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { highlighted = false, padded = true, className = '', children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        'rounded-card border border-hairline bg-surface-raised shadow-sm transition-shadow',
        padded ? 'p-4 sm:p-5' : '',
        highlighted ? 'ring-2 ring-sunburst ring-offset-2 ring-offset-surface shadow-md' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
});

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-ink-subtle">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
