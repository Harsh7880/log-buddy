export type WorkoutType =
  | "Push"
  | "Pull"
  | "Legs"
  | "Rest"
  | "Chest + Back"
  | "Arms & Delts";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultEquipment?: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface LoggedExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  notes: string;
  sets: ExerciseSet[];
  rpe: number;
  pr: boolean;
  completed: boolean;
  superset?: boolean;
  dropSet?: boolean;
  giantSet?: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  dayNumber: number;
  type: WorkoutType;
  exercises: LoggedExercise[];
  durationMinutes: number;
  cardioMinutes: number;
  completed: boolean;
}

export interface NutritionEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  sleep: number;
}

export interface MeasurementEntry {
  date: string;
  chest: number;
  waist: number;
  arms: number;
  thighs: number;
  calves: number;
  weight: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  dataUrl: string;
}

export interface UserSettings {
  startDate: string;
  currentPhase: number;
  currentDay: number;
  unitSystem: "metric" | "imperial";
  bodyWeight: number;
}

export const WORKOUT_SPLIT: WorkoutType[] = [
  "Push",
  "Pull",
  "Legs",
  "Rest",
  "Chest + Back",
  "Arms & Delts",
  "Rest",
];

export const EXERCISES: Exercise[] = [
  // Push
  { id: "push-1", name: "Incline Barbell Press", muscleGroup: "Chest", defaultEquipment: "Barbell" },
  { id: "push-2", name: "Flat Dumbbell Press", muscleGroup: "Chest", defaultEquipment: "Dumbbell" },
  { id: "push-3", name: "Cable Fly", muscleGroup: "Chest", defaultEquipment: "Cable" },
  { id: "push-4", name: "Pushups", muscleGroup: "Chest", defaultEquipment: "Bodyweight" },
  { id: "push-5", name: "Seated DB Shoulder Press", muscleGroup: "Shoulders", defaultEquipment: "Dumbbell" },
  { id: "push-6", name: "Lateral Raises", muscleGroup: "Shoulders", defaultEquipment: "Dumbbell" },
  { id: "push-7", name: "Tricep Rope Pushdown", muscleGroup: "Triceps", defaultEquipment: "Cable" },

  // Pull
  { id: "pull-1", name: "Deadlift", muscleGroup: "Back", defaultEquipment: "Barbell" },
  { id: "pull-2", name: "Lat Pulldown", muscleGroup: "Back", defaultEquipment: "Machine" },
  { id: "pull-3", name: "T Bar Row", muscleGroup: "Back", defaultEquipment: "Barbell" },
  { id: "pull-4", name: "Seated Cable Row", muscleGroup: "Back", defaultEquipment: "Cable" },
  { id: "pull-5", name: "Face Pull", muscleGroup: "Rear Delts", defaultEquipment: "Cable" },
  { id: "pull-6", name: "Barbell Curl", muscleGroup: "Biceps", defaultEquipment: "Barbell" },
  { id: "pull-7", name: "Hammer Curl", muscleGroup: "Biceps", defaultEquipment: "Dumbbell" },

  // Legs
  { id: "legs-1", name: "Barbell Squats", muscleGroup: "Quads", defaultEquipment: "Barbell" },
  { id: "legs-2", name: "Romanian Deadlift", muscleGroup: "Hamstrings", defaultEquipment: "Barbell" },
  { id: "legs-3", name: "Leg Press", muscleGroup: "Quads", defaultEquipment: "Machine" },
  { id: "legs-4", name: "Walking Lunges", muscleGroup: "Quads", defaultEquipment: "Dumbbell" },
  { id: "legs-5", name: "Leg Extension", muscleGroup: "Quads", defaultEquipment: "Machine" },
  { id: "legs-6", name: "Leg Curl", muscleGroup: "Hamstrings", defaultEquipment: "Machine" },
  { id: "legs-7", name: "Calf Raises", muscleGroup: "Calves", defaultEquipment: "Machine" },
  { id: "legs-8", name: "Plank", muscleGroup: "Core", defaultEquipment: "Bodyweight" },

  // Chest + Back
  { id: "cb-a1", name: "Incline DB Press", muscleGroup: "Chest", defaultEquipment: "Dumbbell" },
  { id: "cb-a2", name: "Lat Pulldown", muscleGroup: "Back", defaultEquipment: "Machine" },
  { id: "cb-a3", name: "DB Pullover", muscleGroup: "Back", defaultEquipment: "Dumbbell" },
  { id: "cb-b1", name: "Cable Fly", muscleGroup: "Chest", defaultEquipment: "Cable" },
  { id: "cb-b2", name: "Seated Cable Row", muscleGroup: "Back", defaultEquipment: "Cable" },
  { id: "cb-b3", name: "Pushups", muscleGroup: "Chest", defaultEquipment: "Bodyweight" },

  // Arms & Delts
  { id: "arms-1", name: "Barbell Curl", muscleGroup: "Biceps", defaultEquipment: "Barbell" },
  { id: "arms-2", name: "Skull Crushers", muscleGroup: "Triceps", defaultEquipment: "Barbell" },
  { id: "arms-3", name: "Preacher Curl", muscleGroup: "Biceps", defaultEquipment: "Machine" },
  { id: "arms-4", name: "Rope Pushdown", muscleGroup: "Triceps", defaultEquipment: "Cable" },
  { id: "arms-5", name: "Hammer Curl", muscleGroup: "Biceps", defaultEquipment: "Dumbbell" },
  { id: "arms-6", name: "Overhead Extension", muscleGroup: "Triceps", defaultEquipment: "Dumbbell" },
  { id: "arms-7", name: "Seated Shoulder Press", muscleGroup: "Shoulders", defaultEquipment: "Dumbbell" },
  { id: "arms-8", name: "Lateral Raise", muscleGroup: "Shoulders", defaultEquipment: "Dumbbell" },
  { id: "arms-9", name: "Rear Delt Fly", muscleGroup: "Rear Delts", defaultEquipment: "Machine" },
];

export const WORKOUT_EXERCISES: Record<Exclude<WorkoutType, "Rest">, string[]> = {
  Push: ["push-1", "push-2", "push-3", "push-4", "push-5", "push-6", "push-7"],
  Pull: ["pull-1", "pull-2", "pull-3", "pull-4", "pull-5", "pull-6", "pull-7"],
  Legs: ["legs-1", "legs-2", "legs-3", "legs-4", "legs-5", "legs-6", "legs-7", "legs-8"],
  "Chest + Back": ["cb-a1", "cb-a2", "cb-a3", "cb-b1", "cb-b2", "cb-b3"],
  "Arms & Delts": ["arms-1", "arms-2", "arms-3", "arms-4", "arms-5", "arms-6", "arms-7", "arms-8", "arms-9"],
};

export function getWorkoutTypeForDay(dayNumber: number): WorkoutType {
  const index = ((dayNumber - 1) % WORKOUT_SPLIT.length + WORKOUT_SPLIT.length) % WORKOUT_SPLIT.length;
  return WORKOUT_SPLIT[index]!;
}

export function getExercisesForDay(dayNumber: number): Exercise[] {
  const type = getWorkoutTypeForDay(dayNumber);
  if (type === "Rest") return [];
  const ids = WORKOUT_EXERCISES[type];
  return ids.map((id) => EXERCISES.find((e) => e.id === id)!).filter(Boolean);
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}
