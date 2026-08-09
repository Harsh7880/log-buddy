import { getWorkoutTypeForDay, type WorkoutType } from "./workout-data";

/** A single prescribed exercise in the Phase 3 plan. */
export interface PlanExercise {
  /** Stable id — used to match previous performance across days. */
  id: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  notes?: string;
  defaultEquipment?: string;
  /** Reps are "to failure" — no rep target enforced. */
  toFailure?: boolean;
  /** Last set is a drop set (normal + drop portion). */
  dropSetLastSet?: boolean;
  /** Logged as duration (seconds) instead of weight × reps. */
  durationBased?: boolean;
  /** Bodyweight — excluded from weighted volume unless weight entered. */
  bodyweight?: boolean;
}

export type GroupKind = "straight" | "superset" | "giant";

export interface PlanGroup {
  id: string;
  kind: GroupKind;
  label?: string;
  /** Rounds for supersets / giant sets. */
  rounds?: number;
  /** Default rest timer after the group / set, in seconds. */
  restSeconds: number;
  exercises: PlanExercise[];
}

export interface CardioPlan {
  label: string;
  detail: string;
  options?: string[];
  mode: "liss" | "sprint";
}

export interface WorkoutPlan {
  type: Exclude<WorkoutType, "Rest">;
  focus: string;
  cardio: CardioPlan;
  groups: PlanGroup[];
}

const LISS: CardioPlan = {
  label: "LISS",
  detail: "15 min",
  options: ["Treadmill walk", "Cycling", "Cross trainer"],
  mode: "liss",
};

const SPRINTS: CardioPlan = {
  label: "Sprints",
  detail: "4–6 × 100–150m",
  mode: "sprint",
};

export const PHASE3_PLANS: Record<Exclude<WorkoutType, "Rest">, WorkoutPlan> = {
  Push: {
    type: "Push",
    focus: "Chest • Shoulders • Triceps",
    cardio: LISS,
    groups: [
      {
        id: "push-g1",
        kind: "straight",
        restSeconds: 90,
        exercises: [
          {
            id: "push-1",
            name: "Incline Barbell Press",
            muscleGroup: "Chest",
            targetSets: 4,
            targetReps: "8–10",
            notes: "30–45° incline, control down",
            defaultEquipment: "Barbell",
          },
          {
            id: "push-2",
            name: "Flat Dumbbell Press",
            muscleGroup: "Chest",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Full stretch at bottom",
            defaultEquipment: "Dumbbell",
          },
        ],
      },
      {
        id: "push-g2",
        kind: "superset",
        label: "Superset A",
        rounds: 3,
        restSeconds: 60,
        exercises: [
          {
            id: "push-3",
            name: "Cable Fly (Low to High)",
            muscleGroup: "Chest",
            targetSets: 3,
            targetReps: "12–15",
            notes: "Superset with Push-Ups",
            defaultEquipment: "Cable",
          },
          {
            id: "push-4",
            name: "Push-Ups",
            muscleGroup: "Chest",
            targetSets: 3,
            targetReps: "Failure",
            notes: "Immediately after Cable Fly",
            toFailure: true,
            bodyweight: true,
            defaultEquipment: "Bodyweight",
          },
        ],
      },
      {
        id: "push-g3",
        kind: "straight",
        restSeconds: 60,
        exercises: [
          {
            id: "push-5",
            name: "Seated DB Shoulder Press",
            muscleGroup: "Shoulders",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Don't lock elbows at top",
            defaultEquipment: "Dumbbell",
          },
          {
            id: "push-6",
            name: "Lateral Raises",
            muscleGroup: "Shoulders",
            targetSets: 3,
            targetReps: "15",
            notes: "Drop set on LAST set only",
            dropSetLastSet: true,
            defaultEquipment: "Dumbbell",
          },
          {
            id: "push-7",
            name: "Tricep Rope Pushdown",
            muscleGroup: "Triceps",
            targetSets: 3,
            targetReps: "12",
            notes: "Drop set on LAST set only",
            dropSetLastSet: true,
            defaultEquipment: "Cable",
          },
        ],
      },
    ],
  },

  Pull: {
    type: "Pull",
    focus: "Back • Rear Delts • Biceps",
    cardio: SPRINTS,
    groups: [
      {
        id: "pull-g1",
        kind: "straight",
        restSeconds: 90,
        exercises: [
          {
            id: "pull-1",
            name: "Deadlift",
            muscleGroup: "Back",
            targetSets: 4,
            targetReps: "6–8",
            notes: "Flat back, drive through mid-foot",
            defaultEquipment: "Barbell",
          },
          {
            id: "pull-2",
            name: "Lat Pulldown",
            muscleGroup: "Back",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Pull to upper chest, squeeze lats",
            defaultEquipment: "Machine",
          },
          {
            id: "pull-3",
            name: "T Bar Row",
            muscleGroup: "Back",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Chest supported, no jerking",
            defaultEquipment: "Barbell",
          },
          {
            id: "pull-4",
            name: "Seated Cable Row",
            muscleGroup: "Back",
            targetSets: 3,
            targetReps: "12",
            notes: "Full stretch, elbows tight",
            defaultEquipment: "Cable",
          },
          {
            id: "pull-5",
            name: "Face Pull",
            muscleGroup: "Rear Delts",
            targetSets: 3,
            targetReps: "15",
            notes: "High elbows, pause at the face",
            defaultEquipment: "Cable",
          },
        ],
      },
      {
        id: "pull-g2",
        kind: "superset",
        label: "Superset A",
        rounds: 3,
        restSeconds: 60,
        exercises: [
          {
            id: "pull-6",
            name: "Barbell Curl",
            muscleGroup: "Biceps",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Superset with Hammer Curls",
            defaultEquipment: "Barbell",
          },
          {
            id: "pull-7",
            name: "Hammer Curl",
            muscleGroup: "Biceps",
            targetSets: 3,
            targetReps: "12",
            notes: "Drop set on LAST round",
            dropSetLastSet: true,
            defaultEquipment: "Dumbbell",
          },
        ],
      },
    ],
  },

  Legs: {
    type: "Legs",
    focus: "Quads • Hamstrings • Calves • Core",
    cardio: LISS,
    groups: [
      {
        id: "legs-g1",
        kind: "straight",
        restSeconds: 90,
        exercises: [
          {
            id: "legs-1",
            name: "Barbell Squats",
            muscleGroup: "Quads",
            targetSets: 4,
            targetReps: "8–10",
            notes: "Depth over load, brace the core",
            defaultEquipment: "Barbell",
          },
          {
            id: "legs-2",
            name: "Romanian Deadlifts (RDL)",
            muscleGroup: "Hamstrings",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Hinge at hips, slight knee bend",
            defaultEquipment: "Barbell",
          },
          {
            id: "legs-3",
            name: "Leg Press",
            muscleGroup: "Quads",
            targetSets: 3,
            targetReps: "12",
            notes: "Drop set on LAST set only. Don't lock knees at top, control descent",
            dropSetLastSet: true,
            defaultEquipment: "Machine",
          },
          {
            id: "legs-4",
            name: "Walking Lunges",
            muscleGroup: "Quads",
            targetSets: 3,
            targetReps: "12 each",
            notes: "Long stride, upright torso",
            defaultEquipment: "Dumbbell",
          },
        ],
      },
      {
        id: "legs-g2",
        kind: "superset",
        label: "Superset A",
        rounds: 3,
        restSeconds: 60,
        exercises: [
          {
            id: "legs-5",
            name: "Leg Extension",
            muscleGroup: "Quads",
            targetSets: 3,
            targetReps: "15",
            notes: "Superset with Leg Curls",
            defaultEquipment: "Machine",
          },
          {
            id: "legs-6",
            name: "Leg Curls",
            muscleGroup: "Hamstrings",
            targetSets: 3,
            targetReps: "15",
            notes: "Squeeze at peak contraction",
            defaultEquipment: "Machine",
          },
        ],
      },
      {
        id: "legs-g3",
        kind: "straight",
        restSeconds: 60,
        exercises: [
          {
            id: "legs-7",
            name: "Calf Raises",
            muscleGroup: "Calves",
            targetSets: 4,
            targetReps: "15–20",
            notes: "Drop set on LAST set only. Pause at the top",
            dropSetLastSet: true,
            defaultEquipment: "Machine",
          },
          {
            id: "legs-8",
            name: "Plank",
            muscleGroup: "Core",
            targetSets: 3,
            targetReps: "60 sec",
            notes: "Squeeze glutes, neutral spine",
            durationBased: true,
            bodyweight: true,
            defaultEquipment: "Bodyweight",
          },
        ],
      },
    ],
  },

  "Chest + Back": {
    type: "Chest + Back",
    focus: "Chest • Back — giant sets",
    cardio: SPRINTS,
    groups: [
      {
        id: "cb-A",
        kind: "giant",
        label: "Giant Set A — 3 Rounds",
        rounds: 3,
        restSeconds: 90,
        exercises: [
          {
            id: "cb-a1",
            name: "A1 Incline Dumbbell Press",
            muscleGroup: "Chest",
            targetSets: 3,
            targetReps: "10–12",
            notes: "No rest into A2",
            defaultEquipment: "Dumbbell",
          },
          {
            id: "cb-a2",
            name: "A2 Lat Pulldown",
            muscleGroup: "Back",
            targetSets: 3,
            targetReps: "10–12",
            notes: "No rest into A3",
            defaultEquipment: "Machine",
          },
          {
            id: "cb-a3",
            name: "A3 Dumbbell Pullovers",
            muscleGroup: "Back",
            targetSets: 3,
            targetReps: "12–15",
            notes: "Rest 90 sec after all three",
            defaultEquipment: "Dumbbell",
          },
        ],
      },
      {
        id: "cb-B",
        kind: "giant",
        label: "Giant Set B — 3 Rounds",
        rounds: 3,
        restSeconds: 90,
        exercises: [
          {
            id: "cb-b1",
            name: "B1 Pec Deck Fly / Cable Fly",
            muscleGroup: "Chest",
            targetSets: 3,
            targetReps: "12–15",
            notes: "No rest into B2",
            defaultEquipment: "Machine",
          },
          {
            id: "cb-b2",
            name: "B2 Seated Cable Row",
            muscleGroup: "Back",
            targetSets: 3,
            targetReps: "10–12",
            notes: "No rest into B3",
            defaultEquipment: "Cable",
          },
          {
            id: "cb-b3",
            name: "B3 Push-Ups",
            muscleGroup: "Chest",
            targetSets: 3,
            targetReps: "Failure",
            notes: "Rest 90 sec after all three",
            toFailure: true,
            bodyweight: true,
            defaultEquipment: "Bodyweight",
          },
        ],
      },
    ],
  },

  "Arms & Delts": {
    type: "Arms & Delts",
    focus: "Biceps • Triceps • Shoulders",
    cardio: LISS,
    groups: [
      {
        id: "arms-A",
        kind: "superset",
        label: "Superset A — 3 Rounds",
        rounds: 3,
        restSeconds: 60,
        exercises: [
          {
            id: "arms-1",
            name: "A1 Barbell Curl",
            muscleGroup: "Biceps",
            targetSets: 3,
            targetReps: "10–12",
            notes: "No rest into A2",
            defaultEquipment: "Barbell",
          },
          {
            id: "arms-2",
            name: "A2 Skull Crushers",
            muscleGroup: "Triceps",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Rest 60 sec after both",
            defaultEquipment: "Barbell",
          },
        ],
      },
      {
        id: "arms-B",
        kind: "superset",
        label: "Superset B — 3 Rounds",
        rounds: 3,
        restSeconds: 60,
        exercises: [
          {
            id: "arms-3",
            name: "B1 Preacher Curls",
            muscleGroup: "Biceps",
            targetSets: 3,
            targetReps: "12",
            notes: "No rest into B2",
            defaultEquipment: "Machine",
          },
          {
            id: "arms-4",
            name: "B2 Tricep Rope Pushdown",
            muscleGroup: "Triceps",
            targetSets: 3,
            targetReps: "12",
            notes: "Rest 60 sec after both",
            defaultEquipment: "Cable",
          },
        ],
      },
      {
        id: "arms-C",
        kind: "superset",
        label: "Superset C — 3 Rounds",
        rounds: 3,
        restSeconds: 60,
        exercises: [
          {
            id: "arms-5",
            name: "C1 Hammer Curls",
            muscleGroup: "Biceps",
            targetSets: 3,
            targetReps: "12",
            notes: "Drop set on LAST round",
            dropSetLastSet: true,
            defaultEquipment: "Dumbbell",
          },
          {
            id: "arms-6",
            name: "C2 Overhead Tricep Extension",
            muscleGroup: "Triceps",
            targetSets: 3,
            targetReps: "12",
            notes: "Drop set on LAST round. Rest 60 sec after both",
            dropSetLastSet: true,
            defaultEquipment: "Dumbbell",
          },
        ],
      },
      {
        id: "arms-D",
        kind: "straight",
        label: "Shoulders",
        restSeconds: 60,
        exercises: [
          {
            id: "arms-7",
            name: "Seated DB Shoulder Press",
            muscleGroup: "Shoulders",
            targetSets: 3,
            targetReps: "10–12",
            notes: "Don't lock elbows at top",
            defaultEquipment: "Dumbbell",
          },
          {
            id: "arms-8",
            name: "Lateral Raises",
            muscleGroup: "Shoulders",
            targetSets: 3,
            targetReps: "15",
            notes: "Drop set on last set",
            dropSetLastSet: true,
            defaultEquipment: "Dumbbell",
          },
          {
            id: "arms-9",
            name: "Rear Delt Fly / Face Pulls",
            muscleGroup: "Rear Delts",
            targetSets: 3,
            targetReps: "15",
            notes: "Slow negative, no momentum",
            defaultEquipment: "Machine",
          },
        ],
      },
    ],
  },
};

export function getPlanForType(type: WorkoutType): WorkoutPlan | null {
  if (type === "Rest") return null;
  return PHASE3_PLANS[type];
}

export function getPlanForDay(day: number): WorkoutPlan | null {
  return getPlanForType(getWorkoutTypeForDay(day));
}

export function planExercises(plan: WorkoutPlan): PlanExercise[] {
  return plan.groups.flatMap((g) => g.exercises);
}

export function findPlanExercise(id: string): PlanExercise | undefined {
  for (const plan of Object.values(PHASE3_PLANS)) {
    const found = planExercises(plan).find((e) => e.id === id);
    if (found) return found;
  }
  return undefined;
}

export const REST_DAY_TIPS = [
  "Sleep 7–8 hours",
  "Hit protein target",
  "4+ liters water",
  "10–15 min light stretching",
  "Optional 20–30 min easy walk",
];
