import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dumbbell,
  Check,
  Plus,
  Trophy,
  ArrowLeft,
  Lock,
  History as HistoryIcon,
  Info,
  Zap,
  Layers,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useProgram, useWorkouts, useNutrition, useDailyLog } from "@/hooks/use-app-data";
import { CardioTimer } from "@/components/cardio-timer";
import { RestTimer } from "@/components/rest-timer";
import { getPhaseForDay, isDayUnlocked } from "@/lib/program";
import { STEP_GOAL } from "@/lib/daily-log";
import {
  getPlanForDay,
  planExercises,
  REST_DAY_TIPS,
  type PlanExercise,
  type PlanGroup,
  type WorkoutPlan,
} from "@/lib/workout-plan";
import {
  getPreviousPerformance,
  getRememberedEquipment,
  progressDelta,
  sessionVolume,
  completedSetCount,
  formatSet,
  type PreviousPerformance,
} from "@/lib/workout-log";
import {
  getWorkoutTypeForDay,
  generateId,
  formatDate,
  type LoggedExercise,
  type ExerciseSet,
  type WorkoutType,
  type WorkoutSession,
} from "@/lib/workout-data";

export const Route = createFileRoute("/workout")({
  validateSearch: (search: Record<string, unknown>): { day?: number } => {
    const raw = Number(search["day"]);
    return Number.isFinite(raw) && raw >= 1 && raw <= 100 ? { day: Math.floor(raw) } : {};
  },
  head: () => ({
    meta: [
      { title: "Workout — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Log your daily workout sets, reps, and weights." },
      { property: "og:title", content: "Workout — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Log your daily workout sets, reps, and weights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkoutPage,
});

function WorkoutPage() {
  const { day: searchDay } = Route.useSearch();
  const navigate = useNavigate();
  const { currentDay, completedDays, markRestDayComplete } = useProgram();
  const [workouts, setWorkouts, hydrated] = useWorkouts();
  const { dateForDay } = useDailyLog();
  const [summary, setSummary] = useState<WorkoutSession | null>(null);

  const dayNumber = searchDay ?? currentDay;
  const phase = getPhaseForDay(dayNumber);
  const unlocked = isDayUnlocked(dayNumber, currentDay);

  const type = getWorkoutTypeForDay(dayNumber);
  const plan = getPlanForDay(dayNumber);
  const existing = workouts.find((w) => w.dayNumber === dayNumber);
  const dateISO = existing?.date || dateForDay(dayNumber) || formatDate(new Date());

  const header = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/program">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Program
        </Link>
      </Button>
      <span>
        Phase {phase.number} · {phase.name}
      </span>
    </div>
  );

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {header}
        <p className="text-sm text-muted-foreground">Loading your saved log…</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="space-y-6 animate-fade-in text-center">
        {header}
        <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Day {dayNumber} is locked</h2>
        <p className="text-muted-foreground">
          Complete Day {currentDay} first to unlock the rest of the program.
        </p>
        <Button asChild>
          <Link to="/workout" search={{ day: currentDay }}>
            Go to Day {currentDay}
          </Link>
        </Button>
      </div>
    );
  }

  if (type === "Rest" || !plan) {
    const done = completedDays.has(dayNumber);
    return (
      <div className="space-y-6 animate-fade-in">
        {header}
        <Card className="card-elevated">
          <CardContent className="space-y-4 p-6 text-center">
            <Moon className="mx-auto h-10 w-10 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Rest Day</h2>
              <p className="text-muted-foreground">
                Day {dayNumber} · {dateISO} · Recovery Day
              </p>
            </div>
            <ul className="mx-auto max-w-sm space-y-1 text-left text-sm text-muted-foreground">
              {REST_DAY_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-primary" />
                  {tip}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              This is a programmed rest day — no workout is expected. Next up:{" "}
              {getWorkoutTypeForDay(dayNumber + 1)} on Day {dayNumber + 1}.
            </p>
            {done ? (
              <p className="font-semibold text-primary">Rest day completed</p>
            ) : (
              <Button
                className="press-scale"
                onClick={() => {
                  markRestDayComplete(dayNumber);
                  navigate({ to: "/program" });
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark Rest Day Complete
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="space-y-4">
        {header}
        <WorkoutSummary session={summary} onClose={() => setSummary(null)} />
      </div>
    );
  }

  const save = (session: WorkoutSession) =>
    setWorkouts((prev) => {
      const filtered = prev.filter((w) => w.id !== session.id && w.dayNumber !== session.dayNumber);
      return [...filtered, session];
    });

  return (
    <div className="space-y-4">
      {header}
      <WorkoutLogger
        key={dayNumber}
        dayNumber={dayNumber}
        dateISO={dateISO}
        phaseNumber={phase.number}
        type={type}
        plan={plan}
        history={workouts}
        existing={existing}
        onSave={save}
        onFinish={(session) => {
          save(session);
          setSummary(session);
        }}
      />
    </div>
  );
}

/* ---------- Logger ---------- */

function buildExercise(pe: PlanExercise, remembered: string): LoggedExercise {
  const sets: ExerciseSet[] = Array.from({ length: pe.targetSets }, (_, i) => ({
    weight: 0,
    reps: 0,
    completed: false,
    ...(pe.durationBased ? { durationSeconds: 0 } : {}),
    ...(pe.toFailure ? { toFailure: true } : {}),
    ...(pe.dropSetLastSet && i === pe.targetSets - 1 ? { dropWeight: 0, dropReps: 0 } : {}),
  }));
  return {
    exerciseId: pe.id,
    name: pe.name,
    muscleGroup: pe.muscleGroup,
    equipment: remembered || "",
    notes: "",
    sets,
    rpe: 7,
    pr: false,
    completed: false,
  };
}

function WorkoutLogger({
  dayNumber,
  dateISO,
  phaseNumber,
  type,
  plan,
  history,
  existing,
  onFinish,
  onSave,
}: {
  dayNumber: number;
  dateISO: string;
  phaseNumber: number;
  type: WorkoutType;
  plan: WorkoutPlan;
  history: WorkoutSession[];
  existing?: WorkoutSession | undefined;
  onFinish: (session: WorkoutSession) => void;
  onSave: (session: WorkoutSession) => void;
}) {
  const [sessionId] = useState(() => existing?.id || generateId());
  const [startedAt, setStartedAt] = useState<number | undefined>(existing?.startedAt);
  const [now, setNow] = useState(Date.now());
  const [cardioMinutes, setCardioMinutes] = useState(existing?.cardioMinutes || 0);

  const [exerciseState, setExerciseState] = useState<LoggedExercise[]>(() => {
    const planned = planExercises(plan);
    return planned.map((pe) => {
      const saved = existing?.exercises.find((e) => e.exerciseId === pe.id);
      if (saved) return { ...saved, name: pe.name, muscleGroup: pe.muscleGroup };
      return buildExercise(pe, getRememberedEquipment(history, pe.id));
    });
  });

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);

  const build = (completed: boolean, endedAt?: number): WorkoutSession => ({
    id: sessionId,
    date: dateISO,
    dayNumber,
    phase: phaseNumber,
    type,
    exercises: exerciseState,
    durationMinutes:
      startedAt && endedAt
        ? Math.max(1, Math.round((endedAt - startedAt) / 60000))
        : existing?.durationMinutes || 0,
    cardioMinutes,
    completed,
    ...(startedAt ? { startedAt } : {}),
    ...(endedAt ? { endedAt } : {}),
  });

  const allCompleted = exerciseState.every((e) => e.completed);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => onSave(build(existing?.completed ?? false)), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseState, cardioMinutes, startedAt]);

  const patchExercise = (id: string, patch: (ex: LoggedExercise) => LoggedExercise) =>
    setExerciseState((prev) => prev.map((e) => (e.exerciseId === id ? patch(e) : e)));

  const elapsedMin = startedAt ? Math.max(0, Math.floor((now - startedAt) / 60000)) : 0;
  const elapsedSec = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000) % 60) : 0;

  const volume = sessionVolume(build(false));
  const setsDone = completedSetCount(build(false));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{type}</h2>
          <p className="text-muted-foreground">
            Day {dayNumber} · {plan.focus}
          </p>
          <p className="text-xs text-muted-foreground">{dateISO}</p>
        </div>
        <div className="flex items-center gap-2">
          {startedAt ? (
            <span className="rounded-md bg-muted px-3 py-2 font-mono text-sm font-semibold">
              {elapsedMin}:{`${elapsedSec}`.padStart(2, "0")}
            </span>
          ) : (
            <Button variant="outline" onClick={() => setStartedAt(Date.now())} className="press-scale">
              <Dumbbell className="mr-2 h-4 w-4" />
              Start Workout
            </Button>
          )}
          <Button onClick={() => onFinish(build(allCompleted, Date.now()))} className="press-scale">
            <Check className="mr-2 h-4 w-4" />
            Finish Workout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <StatBox label="Sets done" value={`${setsDone}`} />
        <StatBox label="Volume" value={`${Math.round(volume).toLocaleString()} kg`} />
        <StatBox label="Cardio" value={`${cardioMinutes} min`} />
      </div>

      <Card className="card-elevated">
        <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold">Cardio: {plan.cardio.label}</span>
          <span className="text-muted-foreground">{plan.cardio.detail}</span>
          {plan.cardio.options && (
            <span className="text-xs text-muted-foreground">({plan.cardio.options.join(" · ")})</span>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <CardioTimer mode="sprint" onComplete={(s) => setCardioMinutes((m) => m + Math.round(s / 60))} />
        <CardioTimer mode="liss" onComplete={(s) => setCardioMinutes((m) => m + Math.round(s / 60))} />
      </div>

      <div className="space-y-6">
        {plan.groups.map((group) => (
          <GroupBlock
            key={group.id}
            group={group}
            state={exerciseState}
            history={history}
            dayNumber={dayNumber}
            onPatch={patchExercise}
          />
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function GroupBlock({
  group,
  state,
  history,
  dayNumber,
  onPatch,
}: {
  group: PlanGroup;
  state: LoggedExercise[];
  history: WorkoutSession[];
  dayNumber: number;
  onPatch: (id: string, patch: (ex: LoggedExercise) => LoggedExercise) => void;
}) {
  const grouped = group.kind !== "straight";
  return (
    <section className={grouped ? "rounded-xl border border-primary/40 bg-primary/5 p-3" : ""}>
      {grouped && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            {group.label ?? (group.kind === "giant" ? "Giant Set" : "Superset")}
          </span>
          <span className="text-xs text-muted-foreground">
            {group.exercises.map((_, i) => (group.kind === "giant" ? `${i + 1}` : `${i + 1}`)).join(" → ")} · no rest
            between · rest {group.restSeconds}s after all
          </span>
        </div>
      )}
      <div className="space-y-4">
        {group.exercises.map((pe) => {
          const ex = state.find((e) => e.exerciseId === pe.id);
          if (!ex) return null;
          return (
            <ExerciseCard
              key={pe.id}
              plan={pe}
              ex={ex}
              group={group}
              previous={getPreviousPerformance(history, pe.id, dayNumber)}
              onPatch={(patch) => onPatch(pe.id, patch)}
            />
          );
        })}
      </div>
      <div className="mt-3">
        <RestTimer defaultSeconds={group.restSeconds} />
      </div>
    </section>
  );
}

function ExerciseCard({
  plan,
  ex,
  group,
  previous,
  onPatch,
}: {
  plan: PlanExercise;
  ex: LoggedExercise;
  group: PlanGroup;
  previous: PreviousPerformance | null;
  onPatch: (patch: (ex: LoggedExercise) => LoggedExercise) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const delta = useMemo(
    () => (previous ? progressDelta(previous.sets, ex.sets) : { kind: "none" as const, text: "" }),
    [previous, ex.sets],
  );

  const updateSet = (index: number, patch: Partial<ExerciseSet>) =>
    onPatch((e) => {
      const sets = e.sets.map((s, i) => (i === index ? { ...s, ...patch } : s));
      const requiredDone = sets.slice(0, plan.targetSets).every((s) => s.completed);
      return { ...e, sets, completed: requiredDone };
    });

  const addSet = () =>
    onPatch((e) => ({ ...e, sets: [...e.sets, { weight: 0, reps: 0, completed: false }] }));

  return (
    <Card className={`card-elevated ${ex.completed ? "border-primary/50" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            {plan.name}
            {ex.pr && <Trophy className="h-4 w-4 text-yellow-500" />}
            {ex.completed && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                ✓ Complete
              </span>
            )}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            Target: {plan.targetSets} × {plan.targetReps}
          </span>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{plan.muscleGroup}</span>
          {plan.dropSetLastSet && (
            <span className="rounded bg-primary/15 px-2 py-0.5 font-semibold text-primary">Drop set</span>
          )}
          {group.kind !== "straight" && (
            <span className="rounded bg-muted px-2 py-0.5">
              {group.kind === "giant" ? "Giant set" : "Superset"}
            </span>
          )}
          {plan.notes && (
            <button
              type="button"
              onClick={() => setShowNotes((v) => !v)}
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
            >
              <Info className="h-3 w-3" />
              {showNotes ? "Hide notes" : "Notes"}
            </button>
          )}
        </div>
        {showNotes && plan.notes && (
          <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">{plan.notes}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {previous && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
            <p className="mb-1 flex items-center gap-1 font-semibold uppercase tracking-wide text-muted-foreground">
              <HistoryIcon className="h-3 w-3" /> Last performance · Day {previous.dayNumber} · {previous.date}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {previous.sets.map((s, i) => (
                <span key={i} className="font-mono">
                  {formatSet(s)}
                </span>
              ))}
            </div>
            {previous.equipment && (
              <p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                Machine: <span className="text-foreground">{previous.equipment}</span>
                {previous.equipment !== ex.equipment && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => onPatch((e) => ({ ...e, equipment: previous.equipment }))}
                  >
                    Use previous
                  </Button>
                )}
              </p>
            )}
            {delta.text && (
              <p className="mt-1 font-semibold text-primary">Progress today: {delta.text}</p>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <Label className="text-xs text-muted-foreground">Equipment / Machine</Label>
            <Input
              value={ex.equipment}
              onChange={(e) => onPatch((p) => ({ ...p, equipment: e.target.value }))}
              placeholder={plan.defaultEquipment ? `e.g. ${plan.defaultEquipment} — Life Fitness` : "Machine used"}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">RPE</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={ex.rpe}
              onChange={(e) => onPatch((p) => ({ ...p, rpe: Number(e.target.value) }))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          {ex.sets.map((set, i) => {
            const isDrop = plan.dropSetLastSet && i === plan.targetSets - 1;
            return (
              <div key={i} className="rounded-lg border border-border/60 p-2">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold">
                    Set {i + 1}
                    {isDrop && <span className="ml-2 text-primary">— DROP SET</span>}
                    {plan.toFailure && <span className="ml-2 text-primary">— To failure</span>}
                  </span>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={!!set.completed}
                      onCheckedChange={(v) => updateSet(i, { completed: !!v })}
                    />
                    Complete
                  </label>
                </div>
                {plan.durationBased ? (
                  <Input
                    type="number"
                    placeholder="Duration (sec)"
                    value={set.durationSeconds || ""}
                    onChange={(e) => updateSet(i, { durationSeconds: Number(e.target.value) })}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={plan.bodyweight ? "Added weight (kg)" : "Weight (kg)"}
                      value={set.weight || ""}
                      onChange={(e) => updateSet(i, { weight: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder={plan.toFailure ? "Reps (failure)" : "Reps"}
                      value={set.reps || ""}
                      onChange={(e) => updateSet(i, { reps: Number(e.target.value) })}
                    />
                  </div>
                )}
                {isDrop && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Drop weight (kg)"
                      value={set.dropWeight || ""}
                      onChange={(e) => updateSet(i, { dropWeight: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Drop reps"
                      value={set.dropReps || ""}
                      onChange={(e) => updateSet(i, { dropReps: Number(e.target.value) })}
                    />
                  </div>
                )}
                <Input
                  value={set.note ?? ""}
                  onChange={(e) => updateSet(i, { note: e.target.value })}
                  placeholder="Set note (optional)"
                  className="mt-2 h-8 text-xs"
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={addSet}>
            <Plus className="mr-1 h-3 w-3" />
            Add Set
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPatch((p) => ({ ...p, pr: !p.pr }))}
          >
            <Trophy className="mr-1 h-3 w-3" />
            {ex.pr ? "Unmark PR" : "Mark PR"}
          </Button>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Exercise notes</Label>
          <Input
            value={ex.notes}
            onChange={(e) => onPatch((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Form cues, pain, etc."
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Summary ---------- */

function WorkoutSummary({ session, onClose }: { session: WorkoutSession; onClose: () => void }) {
  const [nutrition] = useNutrition();
  const { getByDate } = useDailyLog();
  const phase = getPhaseForDay(session.dayNumber);
  const n = nutrition.find((e) => e.date === session.date);
  const record = getByDate(session.date);
  const steps = record?.steps ?? 0;

  const habits = [
    { label: "Steps", value: `${steps.toLocaleString()} / ${STEP_GOAL.toLocaleString()}`, done: steps >= STEP_GOAL },
    { label: "Water", value: `${n?.water ?? 0} L`, done: (n?.water ?? 0) >= 4 },
    { label: "Protein", value: `${n?.protein ?? 0} g`, done: (n?.protein ?? 0) > 0 },
    { label: "Calories", value: `${n?.calories ?? 0} kcal`, done: (n?.calories ?? 0) > 0 },
    { label: "Sleep", value: `${n?.sleep ?? 0} h`, done: (n?.sleep ?? 0) >= 7 },
    { label: "Workout", value: session.completed ? "Complete" : "Partial", done: session.completed },
    { label: "Cardio", value: `${session.cardioMinutes} min`, done: session.cardioMinutes > 0 },
  ];
  const doneCount = habits.filter((h) => h.done).length;
  const score = Math.round((doneCount / habits.length) * 100);
  const remaining = habits.filter((h) => !h.done);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Workout Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SummaryItem label="Workout" value={session.type} />
          <SummaryItem label="Program Day" value={`${session.dayNumber}`} />
          <SummaryItem label="Phase" value={`${phase.number} — ${phase.name}`} />
          <SummaryItem label="Duration" value={session.durationMinutes ? `${session.durationMinutes} min` : "—"} />
          <SummaryItem
            label="Exercises"
            value={`${session.exercises.filter((e) => e.completed).length} / ${session.exercises.length}`}
          />
          <SummaryItem label="Sets" value={`${completedSetCount(session)} completed`} />
          <SummaryItem label="Total Volume" value={`${Math.round(sessionVolume(session)).toLocaleString()} kg`} />
          <SummaryItem label="Cardio" value={`${session.cardioMinutes} min`} />
          <SummaryItem label="Date" value={session.date} />
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Daily Score — {doneCount} / {habits.length} habits complete · {score}%
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {habits.map((h) => (
              <div
                key={h.label}
                className={`rounded-lg border p-3 ${h.done ? "border-primary/50 bg-primary/5" : "border-border/60"}`}
              >
                <p className="text-xs text-muted-foreground">{h.label}</p>
                <p className="text-sm font-semibold">{h.value}</p>
              </div>
            ))}
          </div>
          {remaining.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Remaining goals: {remaining.map((r) => r.label).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onClose}>
          Back to Logger
        </Button>
        <Button asChild>
          <Link to="/program">Back to Program</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/history">Open History</Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
