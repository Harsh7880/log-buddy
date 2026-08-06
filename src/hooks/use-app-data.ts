import { useLocalStorage } from "./use-local-storage";
import type {
  WorkoutSession,
  NutritionEntry,
  MeasurementEntry,
  ProgressPhoto,
  UserSettings,
} from "@/lib/workout-data";
import {
  getCompletedDays,
  getCurrentDay,
  getCurrentDayFromDates,
  getImplicitCompletedDays,
  getPhaseForDay,
  getPhaseCompletion,
  DEFAULT_PHASE_START_DATES,
  PROGRAM_LENGTH,
} from "@/lib/program";

const defaultSettings: UserSettings = {
  startDate: new Date().toISOString().split("T")[0]!,
  unitSystem: "metric",
  bodyWeight: 75,
  completedRestDays: [],
  phaseStartDates: DEFAULT_PHASE_START_DATES,
};

export function useUserSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>("bbb-settings", defaultSettings);
  const normalized: UserSettings = {
    ...defaultSettings,
    ...settings,
    completedRestDays: settings.completedRestDays ?? [],
    phaseStartDates: { ...DEFAULT_PHASE_START_DATES, ...(settings.phaseStartDates ?? {}) },
  };
  return [normalized, setSettings] as const;
}

export function useWorkouts() {
  return useLocalStorage<WorkoutSession[]>("bbb-workouts", []);
}

export function useNutrition() {
  return useLocalStorage<NutritionEntry[]>("bbb-nutrition", []);
}

export function useMeasurements() {
  return useLocalStorage<MeasurementEntry[]>("bbb-measurements", []);
}

export function useProgressPhotos() {
  return useLocalStorage<ProgressPhoto[]>("bbb-photos", []);
}

/** Derived program progress — no manual day/phase selection. */
export function useProgram() {
  const [settings, setSettings] = useUserSettings();
  const [workouts] = useWorkouts();

  const completedDays = getCompletedDays(workouts, settings.completedRestDays);
  const currentDay = getCurrentDay(completedDays);
  const phase = getPhaseForDay(currentDay);
  const phaseProgress = getPhaseCompletion(phase, completedDays);
  const dayInPhase = currentDay - phase.startDay + 1;
  const phaseLength = phase.endDay - phase.startDay + 1;
  const remainingDays = PROGRAM_LENGTH - completedDays.size;

  const markRestDayComplete = (day: number) => {
    setSettings((prev) => {
      const rest = prev.completedRestDays ?? [];
      if (rest.includes(day)) return prev;
      return { ...prev, completedRestDays: [...rest, day] };
    });
  };

  return {
    settings,
    setSettings,
    workouts,
    completedDays,
    currentDay,
    phase,
    phaseProgress,
    dayInPhase,
    phaseLength,
    remainingDays,
    markRestDayComplete,
  };
}
