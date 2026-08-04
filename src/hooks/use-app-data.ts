import { useLocalStorage } from "./use-local-storage";
import type {
  WorkoutSession,
  NutritionEntry,
  MeasurementEntry,
  ProgressPhoto,
  UserSettings,
} from "@/lib/workout-data";

const defaultSettings: UserSettings = {
  startDate: new Date().toISOString().split("T")[0]!,
  currentPhase: 2,
  currentDay: 36,
  unitSystem: "metric",
  bodyWeight: 75,
};

export function useUserSettings() {
  return useLocalStorage<UserSettings>("bbb-settings", defaultSettings);
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
