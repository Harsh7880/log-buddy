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
  getDateForDayAbsolute,
  getProgramDayForDate,

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

/**
 * Per-calendar-date records holding steps and progress photos.
 * Each date is stored independently; updating one never touches another.
 */
export function useDailyLog() {
  const [settings] = useUserSettings();
  const [records, setRecords, hydrated] = useLocalStorage<DailyRecord[]>("bbb-daily", []);

  const todayISO = toISODate(new Date());

  const dayForDate = (iso: string) =>
    getProgramDayForDate(settings.phaseStartDates, new Date(`${iso}T12:00:00`)) ??
    getCurrentDayFromDates(settings.phaseStartDates, new Date(`${iso}T12:00:00`));

  const dateForDay = (day: number) =>
    getDateForDayAbsolute(settings.phaseStartDates, day) ??
    getDateForDay(settings.phaseStartDates, day);


  const getByDate = (iso: string) => records.find((r) => r.date === iso);
  const getByDay = (day: number) => {
    const iso = dateForDay(day);
    return iso ? getByDate(iso) : undefined;
  };

  const upsert = (iso: string, patch: (prev: DailyRecord) => DailyRecord) => {
    setRecords((prev) => {
      const day = dayForDate(iso) ?? 0;
      const phase = getPhaseForDay(day).number;
      const existing = prev.find((r) => r.date === iso);
      const base: DailyRecord = existing ?? { date: iso, programDay: day, phase, steps: 0, photos: {} };
      const next = patch({ ...base, programDay: day || base.programDay, phase });
      return existing ? prev.map((r) => (r.date === iso ? next : r)) : [...prev, next];
    });
  };

  const setSteps = (iso: string, steps: number) =>
    upsert(iso, (r) => ({ ...r, steps: Math.max(0, Math.round(steps || 0)) }));

  const setPhoto = (iso: string, angle: PhotoAngle, dataUrl: string) =>
    upsert(iso, (r) => ({ ...r, photos: { ...r.photos, [angle]: dataUrl } }));

  const removePhoto = (iso: string, angle: PhotoAngle) =>
    upsert(iso, (r) => {
      const photos = { ...r.photos };
      delete photos[angle];
      return { ...r, photos };
    });

  return {
    records,
    hydrated,
    todayISO,
    getByDate,
    getByDay,
    dateForDay,
    dayForDate,
    setSteps,
    setPhoto,
    removePhoto,
  };
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
