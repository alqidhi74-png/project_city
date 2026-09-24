'use client';

import { useMemo, useState } from 'react';

import { useDashboard } from '../state/DashboardProvider';
import {
  simulate,
  WHATIF_DEFAULTS,
  WHATIF_LIMITS,
  type WhatIfInputs,
} from '@/lib/whatif';
import { Card, CardHeader } from '../ui/Card';
import { WhatIfSlider } from './WhatIfSlider';
import { BeforeAfterBars } from './BeforeAfterBars';
import { ResetIcon } from '../ui/Icons';

export function WhatIfPanel() {
  const { dict, data, selection } = useDashboard();
  const [inputs, setInputs] = useState<WhatIfInputs>(WHATIF_DEFAULTS);

  const result = useMemo(() => simulate(data, selection, inputs), [data, selection, inputs]);

  const set = <K extends keyof WhatIfInputs>(key: K) => (value: number) =>
    setInputs((current) => ({ ...current, [key]: value }));

  const rows = [
    {
      key: 'energy',
      label: dict.whatif.energy,
      unit: dict.whatif.energyUnit,
      before: result.before.energy,
      after: result.after.energy,
      goodWhen: 'down' as const,
    },
    {
      key: 'emissions',
      label: dict.whatif.emissions,
      unit: dict.whatif.emissionsUnit,
      before: result.before.emissions,
      after: result.after.emissions,
      goodWhen: 'down' as const,
    },
    {
      key: 'traffic',
      label: dict.whatif.traffic,
      unit: dict.whatif.trafficUnit,
      before: result.before.traffic,
      after: result.after.traffic,
      goodWhen: 'down' as const,
    },
  ];

  return (
    <Card className="flex h-full flex-col" data-story-anchor="what-if">
      <CardHeader
        title={dict.whatif.title}
        subtitle={dict.whatif.subtitle}
        action={
          <button
            type="button"
            onClick={() => setInputs(WHATIF_DEFAULTS)}
            aria-label={dict.whatif.reset}
            title={dict.whatif.reset}
            className="grid size-7 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <ResetIcon className="size-3.5" />
          </button>
        }
      />

      <div className="space-y-3">
        <WhatIfSlider
          label={dict.whatif.housing}
          unit={dict.whatif.unitHomes}
          value={inputs.housingUnits}
          {...WHATIF_LIMITS.housingUnits}
          onChange={set('housingUnits')}
        />
        <WhatIfSlider
          label={dict.whatif.solar}
          unit={dict.whatif.unitPercent}
          value={inputs.solarCoverage}
          {...WHATIF_LIMITS.solarCoverage}
          onChange={set('solarCoverage')}
        />
        <WhatIfSlider
          label={dict.whatif.buses}
          unit={dict.whatif.unitRoutes}
          value={inputs.busRoutes}
          {...WHATIF_LIMITS.busRoutes}
          onChange={set('busRoutes')}
        />
      </div>

      <div className="mt-4 border-t border-hairline pt-4">
        <BeforeAfterBars rows={rows} />
      </div>
    </Card>
  );
}
