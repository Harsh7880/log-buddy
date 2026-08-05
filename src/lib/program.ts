import { getWorkoutTypeForDay, type WorkoutType, type WorkoutSession } from "./workout-data";

export interface Phase {
  number: number;
  name: string;
  startDay: number;
  endDay: number;
}

export const PROGRAM_LENGTH = 100;

export const PHASES: Phase[] = [
  { number: 1, name: "Foundation Week", startDay: 1, endDay: 7 },
  { number: 2, name: "Building the Base", startDay: 8, endDay: 35 },
  { number: 3, name: "Muscle Building Mode", startDay: 36, endDay: 63 },
  { number: 4, name: "Shredding Phase", startDay: 64, endDay: 91 },
  { number: 5, name: "Peak Week", startDay: 92, endDay: 100 },
];

export interface ProgramDay {
  day: number;
  type: WorkoutType;
}

export function getPhaseForDay(day: number): Phase {
  return PHASES.find((p) => day >= p.startDay && day <= p.endDay) ?? PHASES[PHASES.length - 1]!;
}

export function getPhaseDays(phase: Phase): ProgramDay[] {
  const days: ProgramDay[] = [];
  for (let d = phase.startDay; d <= phase.endDay; d++) {
    days.push({ day: d, type: getWorkoutTypeForDay(d) });
  }
  return days;
}

/** Set of program days that count as complete. */
export function getCompletedDays(
  workouts: Pick<WorkoutSession, "dayNumber" | "completed">[],
  completedRestDays: number[],
): Set<number> {
  const set = new Set<number>();
  for (const w of workouts) if (w.completed) set.add(w.dayNumber);
  for (const d of completedRestDays) set.add(d);
  return set;
}

/** The first day of the program that is not yet complete. */
export function getCurrentDay(completed: Set<number>): number {
  for (let d = 1; d <= PROGRAM_LENGTH; d++) {
    if (!completed.has(d)) return d;
  }
  return PROGRAM_LENGTH;
}

export type PhaseStatus = "completed" | "current" | "locked";

export function getPhaseStatus(phase: Phase, currentDay: number): PhaseStatus {
  if (currentDay > phase.endDay) return "completed";
  if (currentDay >= phase.startDay) return "current";
  return "locked";
}

export function getPhaseCompletion(
  phase: Phase,
  completed: Set<number>,
): { done: number; total: number; percent: number } {
  const total = phase.endDay - phase.startDay + 1;
  let done = 0;
  for (let d = phase.startDay; d <= phase.endDay; d++) if (completed.has(d)) done++;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function isDayUnlocked(day: number, currentDay: number): boolean {
  return day <= currentDay;
}
