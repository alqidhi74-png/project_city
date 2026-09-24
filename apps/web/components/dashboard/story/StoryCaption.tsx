'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useDashboard } from '../state/DashboardProvider';
import { useStory } from '../state/StoryProvider';
import { useMotionOK } from '@/lib/motion';
import { template } from '@/lib/format';
import { CloseIcon } from '../ui/Icons';

type Box = { top: number; left: number; width: number; height: number };

/**
 * A caption bubble pinned under whatever the current step points at, plus a
 * cut-out ring around it. Positions are measured from the live DOM so the
 * bubble tracks the element through scrolling and resizing.
 */
export function StoryCaption() {
  const { dict } = useDashboard();
  const { running, step, stepIndex, total, next, stop } = useStory();
  const motionOK = useMotionOK();
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!running || !step) {
      setBox(null);
      return;
    }

    const measure = () => {
      const target = document.querySelector(`[data-story-anchor="${step.anchor}"]`);
      if (!target) {
        setBox(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };

    measure();
    // Bring the target into view before the caption lands on it.
    document
      .querySelector(`[data-story-anchor="${step.anchor}"]`)
      ?.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'center' });

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const id = setInterval(measure, 400);

    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      clearInterval(id);
    };
  }, [running, step, motionOK]);

  if (!running || !step) return null;

  // Below the target, unless that would run off the bottom.
  const bubbleTop = box
    ? box.top + box.height + 12 > window.innerHeight - 160
      ? Math.max(12, box.top - 150)
      : box.top + box.height + 12
    : 80;

  return (
    <div className="no-print pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {box ? (
          <motion.div
            key="ring"
            initial={motionOK ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionOK ? 0.3 : 0 }}
            className="absolute rounded-2xl ring-2 ring-sunburst"
            style={{
              top: box.top - 6,
              left: box.left - 6,
              width: box.width + 12,
              height: box.height + 12,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.42)',
            }}
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        key={step.id}
        initial={motionOK ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionOK ? 0.28 : 0 }}
        className="pointer-events-auto absolute inset-x-4 mx-auto w-auto max-w-sm rounded-2xl bg-city-emerald p-4 text-white shadow-2xl sm:inset-x-auto sm:w-80"
        style={
          box
            ? { top: bubbleTop, left: Math.max(16, Math.min(box.left, window.innerWidth - 336)) }
            : { top: 80, left: 16 }
        }
        role="status"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="tnum text-[10px] font-semibold tracking-wide text-white/60">
            {template(dict.story.stepOf, { current: stepIndex + 1, total })}
          </span>
          <button
            type="button"
            onClick={stop}
            aria-label={dict.story.stop}
            className="-me-1 -mt-1 grid size-6 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>

        <p className="mt-1.5 text-sm leading-relaxed">{step.caption(dict)}</p>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/25"
          >
            {dict.story.next}
          </button>
          <button
            type="button"
            onClick={stop}
            className="rounded-lg px-2 py-1.5 text-xs text-white/70 transition-colors hover:text-white"
          >
            {dict.story.skip}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
