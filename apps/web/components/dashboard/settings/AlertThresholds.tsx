'use client';

import { useDashboard } from '../state/DashboardProvider';
import { useSettings, THRESHOLD_LIMITS } from '../state/SettingsProvider';
import { WhatIfSlider } from '../whatif/WhatIfSlider';
import { ResetIcon, ThresholdIcon } from '../ui/Icons';

/** City Live's metric tiles flag a value once it crosses these — see lib/liveMetrics.ts. */
export function AlertThresholds() {
  const { dict } = useDashboard();
  const { thresholds, setThreshold, resetThresholds } = useSettings();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
          <ThresholdIcon className="size-3.5" />
          {dict.settingsPage.thresholds.title}
        </p>
        <button
          type="button"
          onClick={resetThresholds}
          aria-label={dict.whatif.reset}
          title={dict.whatif.reset}
          className="grid size-7 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <ResetIcon className="size-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        <WhatIfSlider
          label={dict.settingsPage.thresholds.traffic}
          unit={dict.live.trafficUnit}
          value={thresholds.traffic}
          {...THRESHOLD_LIMITS.traffic}
          onChange={(value) => setThreshold('traffic', value)}
        />
        <WhatIfSlider
          label={dict.settingsPage.thresholds.air}
          unit={dict.live.airUnit}
          value={thresholds.air}
          {...THRESHOLD_LIMITS.air}
          onChange={(value) => setThreshold('air', value)}
        />
        <WhatIfSlider
          label={dict.settingsPage.thresholds.energy}
          unit={dict.live.energyUnit}
          value={thresholds.energy}
          {...THRESHOLD_LIMITS.energy}
          onChange={(value) => setThreshold('energy', value)}
        />
      </div>
    </div>
  );
}
