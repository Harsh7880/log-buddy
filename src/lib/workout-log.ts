import type { WorkoutSession, LoggedExercise, ExerciseSet } from "./workout-data";

export function isWeightedSet(set: ExerciseSet): boolean {
  return (set.weight ?? 0) > 0 && (set.reps ?? 0) > 0;
}

export function setVolume(set: ExerciseSet): number {
  let v = isWeightedSet(set) ? set.weight * set.reps : 0;
  if ((set.dropWeight ?? 0) > 0 && (set.dropReps ?? 0) > 0) {
    v += (set.dropWeight ?? 0) * (set.dropReps ?? 0);
  }
  return v;
}

export function exerciseVolume(ex: LoggedExercise): number {
  return ex.sets.filter((s) => s.completed).reduce((t, s) => t + setVolume(s), 0);
}

export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((t, ex) => t + exerciseVolume(ex), 0);
}

export function completedSetCount(session: WorkoutSession): number {
  return session.exercises.reduce((t, ex) => t + ex.sets.filter((s) => s.completed).length, 0);
}

export function completedExerciseCount(session: WorkoutSession): number {
  return session.exercises.filter((e) => e.completed).length;
}

export interface PreviousPerformance {
  date: string;
  dayNumber: number;
  equipment: string;
  sets: ExerciseSet[];
}

/** Most recent logged performance of an exercise, excluding the current day. */
export function getPreviousPerformance(
  workouts: WorkoutSession[],
  exerciseId: string,
  excludeDayNumber: number,
): PreviousPerformance | null {
  const candidates = workouts
    .filter((w) => w.dayNumber !== excludeDayNumber)
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId && e.sets.some((s) => s.completed || s.reps > 0 || (s.durationSeconds ?? 0) > 0)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.dayNumber - a.dayNumber));

  const latest = candidates[0];
  if (!latest) return null;
  const ex = latest.exercises.find((e) => e.exerciseId === exerciseId)!;
  return {
    date: latest.date,
    dayNumber: latest.dayNumber,
    equipment: ex.equipment,
    sets: ex.sets.filter((s) => s.completed || s.reps > 0 || (s.durationSeconds ?? 0) > 0),
  };
}

export function bestSet(sets: ExerciseSet[]): ExerciseSet | null {
  let best: ExerciseSet | null = null;
  for (const s of sets) {
    if (!isWeightedSet(s)) continue;
    if (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) best = s;
  }
  return best;
}

export interface ProgressDelta {
  kind: "weight" | "reps" | "same" | "none";
  text: string;
}

/** Compare today's best set against the previous best set. */
export function progressDelta(prev: ExerciseSet[], today: ExerciseSet[]): ProgressDelta {
  const p = bestSet(prev);
  const t = bestSet(today.filter((s) => s.completed));
  if (!p || !t) return { kind: "none", text: "" };
  const dw = Math.round((t.weight - p.weight) * 100) / 100;
  if (dw > 0) return { kind: "weight", text: `+${dw} kg` };
  if (dw === 0 && t.reps > p.reps) return { kind: "reps", text: `+${t.reps - p.reps} reps` };
  if (dw === 0 && t.reps === p.reps) return { kind: "same", text: "Matched" };
  return { kind: "none", text: dw < 0 ? `${dw} kg` : "" };
}

/** Last equipment/machine used for an exercise across all history. */
export function getRememberedEquipment(workouts: WorkoutSession[], exerciseId: string): string {
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const w of sorted) {
    const ex = w.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex?.equipment) return ex.equipment;
  }
  return "";
}

export function formatSet(s: ExerciseSet): string {
  if ((s.durationSeconds ?? 0) > 0) return `${s.durationSeconds}s`;
  if (isWeightedSet(s)) return `${s.weight} kg × ${s.reps}`;
  if (s.reps > 0) return `BW × ${s.reps}`;
  return "—";
}

export function formatDuration(session: WorkoutSession): string {
  const mins =
    session.durationMinutes ||
    (session.startedAt && session.endedAt
      ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000))
      : 0);
  return mins > 0 ? `${mins} min` : "—";
}
