import { useLocalStorage } from "./use-local-storage";
import type {
  WorkoutSession,
  NutritionEntry,
  MeasurementEntry,
  ProgressPhoto,
  UserSettings,
} from "@/lib/workout-data";
import type { DailyRecord, PhotoAngle } from "@/lib/daily-log";
import {
  getCompletedDays,
  getCurrentDay,
  getCurrentDayFromDates,
  getImplicitCompletedDays,
  getPhaseForDay,
  getPhaseCompletion,
  getDateForDay,
  toISODate,
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

  const implicit = getImplicitCompletedDays(settings.phaseStartDates);
  const logged = getCompletedDays(workouts, settings.completedRestDays);
  const completedDays = new Set<number>([...implicit, ...logged]);
  const dateDay = getCurrentDayFromDates(settings.phaseStartDates);
  const currentDay = dateDay ?? getCurrentDay(completedDays);
  const phase = getPhaseForDay(currentDay);
  const phaseProgress = getPhaseCompletion(phase, completedDays);
  const dayInPhase = currentDay - phase.startDay + 1;
  const phaseLength = phase.endDay - phase.startDay + 1;
  const remainingDays = Math.max(0, PROGRAM_LENGTH - currentDay + 1);

  const markRestDayComplete = (day: number) => {
    setSettings((prev) => {
      const rest = prev.completedRestDays ?? [];
      if (rest.includes(day)) return prev;
      return { ...prev, completedRestDays: [...rest, day] };
    });
  };

  const setPhaseStartDate = (phaseNumber: number, isoDate: string) => {
    setSettings((prev) => ({
      ...prev,
      phaseStartDates: { ...(prev.phaseStartDates ?? {}), [String(phaseNumber)]: isoDate },
    }));
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
    setPhaseStartDate,
  };
}
