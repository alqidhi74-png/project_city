'use client';

import { useDashboard } from '../state/DashboardProvider';
import { LAYERS, type LayerId } from '@/types/dashboard';
import { LAYER_RAMPS } from '@/lib/layers';
import { useTheme } from '../state/ThemeProvider';

/** Five chips. The swatch previews the ramp the map is about to switch to. */
export function LayerToggle() {
  const { dict, activeLayer, setLayer } = useDashboard();
  const { mode } = useTheme();

  const labels: Record<LayerId, string> = {
    energy: dict.map.layers.energy,
    water: dict.map.layers.water,
    air: dict.map.layers.air,
    population: dict.map.layers.population,
    requests: dict.map.layers.requests,
  };

  return (
    <div
      role="group"
      aria-label={dict.map.layer}
      className="flex flex-wrap items-center gap-1.5"
    >
      {LAYERS.map((layer) => {
        const isActive = layer === activeLayer;
        const ramp = LAYER_RAMPS[layer][mode];
        return (
          <button
            key={layer}
            type="button"
            aria-pressed={isActive}
            onClick={() => setLayer(layer)}
            className={[
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors',
              isActive
                ? 'border-city-emerald bg-city-emerald text-white'
                : 'border-hairline bg-surface-raised text-ink-muted hover:bg-surface-sunken hover:text-ink',
            ].join(' ')}
          >
            <span
              aria-hidden
              className="size-2.5 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: ramp[3] }}
            />
            {labels[layer]}
          </button>
        );
      })}
    </div>
  );
}
