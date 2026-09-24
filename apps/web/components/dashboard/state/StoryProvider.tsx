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

import { useDashboard } from './DashboardProvider';
import { useLiveFeed } from './LiveFeedProvider';
import { STORY_STEPS, type StoryStep } from '../story/storySteps';
import type { LayerId, Period, Year } from '@/types/dashboard';

type StoryContextValue = {
  running: boolean;
  stepIndex: number;
  step: StoryStep | null;
  total: number;
  start: () => void;
  stop: () => void;
  next: () => void;
};

const StoryContext = createContext<StoryContextValue | null>(null);

const PLAY_STEP_MS = 620;

type Snapshot = {
  district: string | null;
  year: Year;
  layer: LayerId;
  period: Period;
};

export function StoryProvider({ children }: { children: ReactNode }) {
  const {
    selectedDistrict,
    selectedYear,
    activeLayer,
    period,
    selectDistrict,
    setYear,
    setLayer,
    setPeriod,
    reset,
  } = useDashboard();
  const { pushAlert, setPaused } = useLiveFeed();

  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  /** What the dashboard looked like before the tour, restored on exit. */
  const snapshot = useRef<Snapshot | null>(null);

  const step = running ? (STORY_STEPS[stepIndex] ?? null) : null;

  const stop = useCallback(() => {
    setRunning(false);
    setStepIndex(0);
    setPaused(false);

    const saved = snapshot.current;
    if (saved) {
      selectDistrict(saved.district);
      setYear(saved.year);
      setLayer(saved.layer);
      setPeriod(saved.period);
      snapshot.current = null;
    }
  }, [selectDistrict, setYear, setLayer, setPeriod, setPaused]);

  const start = useCallback(() => {
    snapshot.current = {
      district: selectedDistrict,
      year: selectedYear,
      layer: activeLayer,
      period,
    };
    // The live feed pauses so its own alerts don't collide with the tour's.
    setPaused(true);
    setStepIndex(0);
    setRunning(true);
  }, [selectedDistrict, selectedYear, activeLayer, period, setPaused]);

  const next = useCallback(() => {
    setStepIndex((current) => Math.min(current + 1, STORY_STEPS.length - 1));
  }, []);

  /**
   * Applies the step's action once, when the step becomes active. It depends on
   * the step index rather than on the action's callbacks so that re-rendering
   * mid-step never re-fires an alert or re-selects a district.
   */
  useEffect(() => {
    if (!running) return;
    const action = STORY_STEPS[stepIndex]?.action;
    if (!action) return;

    if (action.reset) reset();
    if (action.district !== undefined) selectDistrict(action.district);
    if (action.year !== undefined) setYear(action.year);
    if (action.fireAlert) pushAlert();
    // `playTo` is driven by the timeline effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, stepIndex]);

  /** Walks the year forward while a step asks for it. */
  useEffect(() => {
    if (!running) return;
    const target = step?.action?.playTo;
    if (!target || selectedYear >= target) return;

    const id = setTimeout(() => setYear((selectedYear + 1) as Year), PLAY_STEP_MS);
    return () => clearTimeout(id);
  }, [running, step, selectedYear, setYear]);

  /** Auto-advance, ending the tour after the last step. */
  useEffect(() => {
    if (!running || !step) return;

    const id = setTimeout(() => {
      if (stepIndex + 1 >= STORY_STEPS.length) stop();
      else setStepIndex(stepIndex + 1);
    }, step.durationMs);

    return () => clearTimeout(id);
  }, [running, step, stepIndex, stop]);

  /** Esc leaves the tour. */
  useEffect(() => {
    if (!running) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [running, stop]);

  const value = useMemo<StoryContextValue>(
    () => ({ running, stepIndex, step, total: STORY_STEPS.length, start, stop, next }),
    [running, stepIndex, step, start, stop, next],
  );

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStory(): StoryContextValue {
  const context = useContext(StoryContext);
  if (!context) throw new Error('useStory must be used inside StoryProvider');
  return context;
}
