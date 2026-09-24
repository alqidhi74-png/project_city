'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useMotionOK } from '@/lib/motion';

export function ExportToast({ show, message }: { show: boolean; message: string }) {
  const motionOK = useMotionOK();

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          role="status"
          initial={motionOK ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={motionOK ? { opacity: 0, y: 12 } : { opacity: 0 }}
          transition={{ duration: motionOK ? 0.22 : 0 }}
          className="no-print fixed inset-x-4 bottom-20 z-50 mx-auto w-fit max-w-[90vw] rounded-xl bg-city-emerald px-4 py-2.5 text-xs text-white shadow-lg sm:bottom-6"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
