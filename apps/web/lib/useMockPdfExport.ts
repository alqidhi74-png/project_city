'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The mock-export pattern: show a toast, then hand off to the browser's print
 * dialog. Shared by the global `ExportPdfButton` in the top bar and the
 * per-report "Download PDF" button on the Reports page.
 */
export function useMockPdfExport() {
  const [toast, setToast] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function trigger() {
    setToast(true);
    timers.current.push(setTimeout(() => setToast(false), 2600));
    timers.current.push(setTimeout(() => window.print(), 700));
  }

  return { toast, trigger };
}
