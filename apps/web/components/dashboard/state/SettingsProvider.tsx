'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Profile = { name: string; email: string; role: string };

export type NotificationKey =
  | 'newRequests'
  | 'criticalAlerts'
  | 'weeklySummary'
  | 'maintenanceUpdates';

export type Thresholds = { traffic: number; air: number; energy: number };

type SettingsContextValue = {
  profile: Profile;
  updateProfile: (profile: Profile) => void;
  notifications: Record<NotificationKey, boolean>;
  toggleNotification: (key: NotificationKey) => void;
  /** Alert thresholds — City Live's metric tiles read these to flag a crossed value. */
  thresholds: Thresholds;
  setThreshold: (key: keyof Thresholds, value: number) => void;
  resetThresholds: () => void;
};

const DEFAULT_PROFILE: Profile = {
  name: 'Israa AlWahaibi',
  email: 'israa.alwahaibi@shc.gov.om',
  role: 'Operations Manager',
};

const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = {
  newRequests: true,
  criticalAlerts: true,
  weeklySummary: false,
  maintenanceUpdates: true,
};

/** Traffic/energy: alert above this. Air quality: alert below this (higher = cleaner). */
export const DEFAULT_THRESHOLDS: Thresholds = { traffic: 80, air: 55, energy: 750 };

export const THRESHOLD_LIMITS = {
  traffic: { min: 40, max: 100, step: 5 },
  air: { min: 20, max: 90, step: 5 },
  energy: { min: 300, max: 950, step: 25 },
} as const;

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Layout-level, alongside the other providers: profile, notification
 * preferences and alert thresholds are in-memory only (no persistence), which
 * is what "saved in local state" means here. Thresholds are read by City
 * Live's metric tiles, which is the point of sharing this via context instead
 * of keeping it local to the Settings page.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [notifications, setNotifications] =
    useState<Record<NotificationKey, boolean>>(DEFAULT_NOTIFICATIONS);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);

  const updateProfile = useCallback((next: Profile) => setProfile(next), []);

  const toggleNotification = useCallback((key: NotificationKey) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const setThreshold = useCallback((key: keyof Thresholds, value: number) => {
    setThresholds((current) => ({ ...current, [key]: value }));
  }, []);

  const resetThresholds = useCallback(() => setThresholds(DEFAULT_THRESHOLDS), []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      profile,
      updateProfile,
      notifications,
      toggleNotification,
      thresholds,
      setThreshold,
      resetThresholds,
    }),
    [profile, updateProfile, notifications, toggleNotification, thresholds, setThreshold, resetThresholds],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
