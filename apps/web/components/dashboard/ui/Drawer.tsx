'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useDashboard } from '../state/DashboardProvider';
import { useMotionOK } from '@/lib/motion';
import { CloseIcon } from './Icons';

/**
 * Generic slide-in panel: inline-end edge on desktop, a bottom sheet on
 * mobile. Esc closes it, and focus moves into the panel on open. Shared by
 * `AlertDrawer` and `RequestDetailsDrawer` so the RTL slide-direction logic
 * lives in exactly one place.
 */
export function Drawer({
  open,
  onClose,
  ariaLabel,
  header,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { dict, rtl } = useDashboard();
  const motionOK = useMotionOK();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const offscreen = rtl ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="scrim"
            initial={motionOK ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionOK ? 0.2 : 0 }}
            onClick={onClose}
            className="no-print fixed inset-0 z-50 bg-black/40"
          />

          <motion.div
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={motionOK ? { x: offscreen } : false}
            animate={{ x: 0 }}
            exit={motionOK ? { x: offscreen } : { opacity: 0 }}
            transition={{ type: 'tween', duration: motionOK ? 0.28 : 0 }}
            className="no-print fixed inset-y-0 z-50 flex w-full max-w-sm flex-col border-hairline bg-surface-raised p-5 shadow-2xl outline-none end-0 max-sm:inset-x-0 max-sm:top-auto max-sm:max-h-[85dvh] max-sm:max-w-none max-sm:rounded-t-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">{header}</div>
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.common.close}
                className="-me-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pe-1">{children}</div>

            {footer ? <div className="pt-4">{footer}</div> : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
