'use client';

import { useDict } from '../state/DashboardProvider';
import { useMockPdfExport } from '@/lib/useMockPdfExport';
import { DownloadIcon } from '../ui/Icons';
import { ExportToast } from '../ui/ExportToast';

/** Mock export — announces itself, then hands off to the browser's print dialog. */
export function ExportPdfButton() {
  const dict = useDict();
  const { toast, trigger } = useMockPdfExport();

  return (
    <>
      <button
        type="button"
        onClick={trigger}
        className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface-raised px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <DownloadIcon className="size-4" />
        <span className="hidden sm:inline">{dict.topbar.exportPdf}</span>
      </button>

      <ExportToast show={toast} message={dict.topbar.exportToast} />
    </>
  );
}
