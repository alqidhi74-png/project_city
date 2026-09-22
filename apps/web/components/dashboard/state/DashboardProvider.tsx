'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  CityData,
  Highlight,
  LayerId,
  Period,
  Selection,
  Year,
} from '@/types/dashboard';
import { FIRST_YEAR } from '@/types/dashboard';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

export type DashboardContextValue = {
  /** The mock dataset, loaded once on the server. */
  data: CityData;
  locale: Locale;
  dict: Dictionary;
  /** True in Arabic — components that offset along x flip their sign. */
  rtl: boolean;

  selectedDistrict: string | null;
  selectedYear: Year;
  activeLayer: LayerId;
  period: Period;
  highlight: Highlight;

  /** The three filters bundled, so selectors take one argument. */
  selection: Selection;

  /** Selecting the district that is already selected clears the filter. */
  toggleDistrict: (id: string) => void;
  selectDistrict: (id: string | null) => void;
  setYear: (year: Year) => void;
  setLayer: (layer: LayerId) => void;
  setPeriod: (period: Period) => void;
  setHighlight: (highlight: Highlight) => void;
  reset: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export type DashboardInitialState = {
  district?: string | null;
  year?: Year;
  layer?: LayerId;
  period?: Period;
};

export function DashboardProvider({
  data,
  locale,
  dict,
  initial,
  children,
}: {
  data: CityData;
  locale: Locale;
  dict: Dictionary;
  initial?: DashboardInitialState;
  children: ReactNode;
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    initial?.district ?? null,
  );
  const [selectedYear, setSelectedYear] = useState<Year>(initial?.year ?? FIRST_YEAR);
  const [activeLayer, setActiveLayer] = useState<LayerId>(initial?.layer ?? 'population');
  const [period, setPeriod] = useState<Period>(initial?.period ?? 'year');
  const [highlight, setHighlight] = useState<Highlight>(null);

  const toggleDistrict = useCallback((id: string) => {
    setSelectedDistrict((current) => (current === id ? null : id));
    setHighlight(null);
  }, []);

  const selectDistrict = useCallback((id: string | null) => {
    setSelectedDistrict(id);
  }, []);

  const setYear = useCallback((year: Year) => {
    setSelectedYear(year);
  }, []);

  const setLayer = useCallback((layer: LayerId) => {
    setActiveLayer(layer);
  }, []);

  const reset = useCallback(() => {
    setSelectedDistrict(null);
    setSelectedYear(FIRST_YEAR);
    setActiveLayer('population');
    setPeriod('year');
    setHighlight(null);
  }, []);

  const selection = useMemo<Selection>(
    () => ({ district: selectedDistrict, year: selectedYear, period }),
    [selectedDistrict, selectedYear, period],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      data,
      locale,
      dict,
      rtl: locale === 'ar',
      selectedDistrict,
      selectedYear,
      activeLayer,
      period,
      highlight,
      selection,
      toggleDistrict,
      selectDistrict,
      setYear,
      setLayer,
      setPeriod,
      setHighlight,
      reset,
    }),
    [
      data,
      locale,
      dict,
      selectedDistrict,
      selectedYear,
      activeLayer,
      period,
      highlight,
      selection,
      toggleDistrict,
      selectDistrict,
      setYear,
      setLayer,
      reset,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used inside DashboardProvider');
  return context;
}

/** Convenience for components that only need copy. */
export function useDict(): Dictionary {
  return useDashboard().dict;
}
