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

/* ---------- Date-driven program timeline ---------- */

/** Phase number -> ISO start date (YYYY-MM-DD). */
export type PhaseStartDates = Record<string, string>;

export const DEFAULT_PHASE_START_DATES: PhaseStartDates = {
  "3": "2026-08-03",
};

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

/** The latest phase whose start date has already arrived. */
export function getActivePhaseStart(
  dates: PhaseStartDates,
  today: Date = new Date(),
): { phase: Phase; start: Date } | null {
  let best: { phase: Phase; start: Date } | null = null;
  for (const phase of PHASES) {
    const iso = dates[String(phase.number)];
    if (!iso) continue;
    const start = parseISODate(iso);
    if (daysBetween(start, today) < 0) continue;
    if (!best || start.getTime() >= best.start.getTime()) best = { phase, start };
  }
  return best;
}

/** Overall program day derived from the configured phase start dates. */
export function getCurrentDayFromDates(
  dates: PhaseStartDates,
  today: Date = new Date(),
): number | null {
  const active = getActivePhaseStart(dates, today);
  if (!active) return null;
  const day = active.phase.startDay + daysBetween(active.start, today);
  return Math.min(PROGRAM_LENGTH, Math.max(1, day));
}

/** Days before the active phase are historical and count as complete. */
export function getImplicitCompletedDays(
  dates: PhaseStartDates,
  today: Date = new Date(),
): Set<number> {
  const set = new Set<number>();
  const active = getActivePhaseStart(dates, today);
  if (!active) return set;
  for (let d = 1; d < active.phase.startDay; d++) set.add(d);
  return set;
}

/** Calendar date (ISO) for a given program day, derived from phase start dates. */
export function getDateForDay(
  dates: PhaseStartDates,
  day: number,
  today: Date = new Date(),
): string | null {
  const active = getActivePhaseStart(dates, today);
  if (!active) return null;
  const d = new Date(active.start);
  d.setDate(d.getDate() + (day - active.phase.startDay));
  return toISODate(d);
}

/** Anchor used to map any calendar date (past or future) to a program day. */
export function getAnchor(dates: PhaseStartDates): { phase: Phase; start: Date } | null {
  let best: { phase: Phase; start: Date } | null = null;
  for (const phase of PHASES) {
    const iso = dates[String(phase.number)];
    if (!iso) continue;
    const start = parseISODate(iso);
    if (!best || phase.startDay < best.phase.startDay) best = { phase, start };
  }
  return best;
}

/**
 * Program day for ANY calendar date (including dates before the active phase),
 * extrapolated from the configured phase start dates. Null when outside 1..100.
 */
export function getProgramDayForDate(dates: PhaseStartDates, date: Date): number | null {
  const anchor = getAnchor(dates);
  if (!anchor) return null;
  const day = anchor.phase.startDay + daysBetween(anchor.start, date);
  if (day < 1 || day > PROGRAM_LENGTH) return null;
  return day;
}

/** Calendar date (ISO) for a program day, extrapolated from the anchor phase. */
export function getDateForDayAbsolute(dates: PhaseStartDates, day: number): string | null {
  const anchor = getAnchor(dates);
  if (!anchor) return null;
  const d = new Date(anchor.start);
  d.setDate(d.getDate() + (day - anchor.phase.startDay));
  return toISODate(d);
}


