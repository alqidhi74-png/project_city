'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { AlertTemplate, LiveAlert } from '@/types/dashboard';
import { useDashboard } from './DashboardProvider';
import { builtDistricts, metricsAt } from '@/lib/selectors';

const METRIC_TICK_MS = 4_000;
const ALERT_MIN_MS = 12_000;
const ALERT_MAX_MS = 18_000;
const MAX_ALERTS = 12;
/** How many past ticks each metric keeps, for the City Live page's sparklines. */
const HISTORY_LENGTH = 24;

export type LiveMetrics = {
  traffic: number;
  air: number;
  energy: number;
  water: number;
  lighting: number;
  waste: number;
  /** Ambient temperature, °C. */
  weather: number;
};

export type LiveMetricKey = keyof LiveMetrics;

const INITIAL_METRICS: LiveMetrics = {
  traffic: 42,
  air: 76,
  energy: 318,
  water: 68,
  lighting: 92,
  waste: 54,
  weather: 31,
};

type LiveFeedContextValue = {
  metrics: LiveMetrics;
  /** Trailing values per metric, oldest first, capped at HISTORY_LENGTH. */
  history: Record<LiveMetricKey, number[]>;
  /** Bumped on every tick so the metric rows can flash. */
  tick: number;
  alerts: LiveAlert[];
  /** The most recent unresolved alert's district — it pulses on the map. */
  pulsingDistrictId: string | null;
  openAlert: LiveAlert | null;
  selectAlert: (alert: LiveAlert) => void;
  closeAlert: () => void;
  resolveAlert: (key: string) => void;
  /** Story mode fires an alert on demand. */
  pushAlert: () => void;
  paused: boolean;
  setPaused: (paused: boolean) => void;
};

const LiveFeedContext = createContext<LiveFeedContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function metricKeys(metrics: LiveMetrics): LiveMetricKey[] {
  return Object.keys(metrics) as LiveMetricKey[];
}

export function LiveFeedProvider({ children }: { children: ReactNode }) {
  const { data, selectedYear, selectDistrict } = useDashboard();

  const [metrics, setMetrics] = useState<LiveMetrics>(INITIAL_METRICS);
  const [history, setHistory] = useState<Record<LiveMetricKey, number[]>>(() =>
    Object.fromEntries(metricKeys(INITIAL_METRICS).map((key) => [key, [INITIAL_METRICS[key]]])) as Record<
      LiveMetricKey,
      number[]
    >,
  );
  const [tick, setTick] = useState(0);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  // Kept in a ref so the alert timer never has to re-subscribe when the year moves.
  const eligibleRef = useRef<string[]>([]);
  useEffect(() => {
    eligibleRef.current = builtDistricts(data, selectedYear).map((district) => district.id);
  }, [data, selectedYear]);

  const seedRef = useRef(1);
  const random = useCallback(() => {
    seedRef.current = (seedRef.current * 1103515245 + 12345) % 2147483648;
    return seedRef.current / 2147483648;
  }, []);

  /** Nudges every live value, flashes the rows, and appends to each metric's history. */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setMetrics((current) => {
        const built = builtDistricts(data, selectedYear);
        const airBase =
          built.length > 0
            ? built.reduce((sum, d) => sum + metricsAt(d, selectedYear).air, 0) / built.length
            : 70;

        const next: LiveMetrics = {
          traffic: clamp(current.traffic + (random() - 0.5) * 9, 12, 95),
          // Drifts toward the modelled average for the selected year.
          air: clamp(current.air + (airBase - current.air) * 0.25 + (random() - 0.5) * 4, 30, 99),
          energy: clamp(current.energy + (random() - 0.5) * 26, 120, 900),
          water: clamp(current.water + (random() - 0.5) * 4, 35, 98),
          lighting: clamp(current.lighting + (random() - 0.5) * 3, 55, 100),
          waste: clamp(current.waste + (random() - 0.5) * 5, 15, 95),
          weather: clamp(current.weather + (random() - 0.5) * 0.7, 22, 43),
        };

        setHistory((currentHistory) =>
          Object.fromEntries(
            metricKeys(next).map((key) => [
              key,
              [...currentHistory[key], next[key]].slice(-HISTORY_LENGTH),
            ]),
          ) as Record<LiveMetricKey, number[]>,
        );

        return next;
      });
      setTick((value) => value + 1);
    }, METRIC_TICK_MS);
    return () => clearInterval(id);
  }, [paused, random, data, selectedYear]);

  const pushAlert = useCallback(() => {
    const pool: AlertTemplate[] = data.alerts;
    if (pool.length === 0) return;
    const eligible = eligibleRef.current;
    if (eligible.length === 0) return;

    const template = pool[Math.floor(random() * pool.length)];
    const allowed = template.districts.filter((id) => eligible.includes(id));
    const districtId =
      allowed.length > 0
        ? allowed[Math.floor(random() * allowed.length)]
        : eligible[Math.floor(random() * eligible.length)];

    const alert: LiveAlert = {
      key: `${template.id}-${Date.now()}-${Math.floor(random() * 1000)}`,
      templateId: template.id,
      districtId,
      category: template.category,
      severity: template.severity,
      title: template.title,
      message: template.message,
      at: Date.now(),
      resolved: false,
    };

    setAlerts((current) => [alert, ...current].slice(0, MAX_ALERTS));
  }, [data.alerts, random]);

  /** Roughly every 15 seconds, with a little jitter so it never feels metronomic. */
  useEffect(() => {
    if (paused) return;
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = ALERT_MIN_MS + random() * (ALERT_MAX_MS - ALERT_MIN_MS);
      timeout = setTimeout(() => {
        pushAlert();
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timeout);
  }, [paused, pushAlert, random]);

  const resolveAlert = useCallback((key: string) => {
    setAlerts((current) =>
      current.map((alert) => (alert.key === key ? { ...alert, resolved: true } : alert)),
    );
  }, []);

  const selectAlert = useCallback(
    (alert: LiveAlert) => {
      selectDistrict(alert.districtId);
      setOpenKey(alert.key);
    },
    [selectDistrict],
  );

  const closeAlert = useCallback(() => setOpenKey(null), []);

  const openAlert = useMemo(
    () => alerts.find((alert) => alert.key === openKey) ?? null,
    [alerts, openKey],
  );

  const pulsingDistrictId = useMemo(() => {
    const live = alerts.find((alert) => !alert.resolved);
    return live ? live.districtId : null;
  }, [alerts]);

  const value = useMemo<LiveFeedContextValue>(
    () => ({
      metrics,
      history,
      tick,
      alerts,
      pulsingDistrictId,
      openAlert,
      selectAlert,
      closeAlert,
      resolveAlert,
      pushAlert,
      paused,
      setPaused,
    }),
    [
      metrics,
      history,
      tick,
      alerts,
      pulsingDistrictId,
      openAlert,
      selectAlert,
      closeAlert,
      resolveAlert,
      pushAlert,
      paused,
    ],
  );

  return <LiveFeedContext.Provider value={value}>{children}</LiveFeedContext.Provider>;
}

export function useLiveFeed(): LiveFeedContextValue {
  const context = useContext(LiveFeedContext);
  if (!context) throw new Error('useLiveFeed must be used inside LiveFeedProvider');
  return context;
}
