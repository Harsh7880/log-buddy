import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Dumbbell, Check, RotateCcw, Trophy, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useProgram, useWorkouts } from "@/hooks/use-app-data";
import { CardioTimer } from "@/components/cardio-timer";
import { getPhaseForDay, isDayUnlocked } from "@/lib/program";
import {
  getWorkoutTypeForDay,
  getExercisesForDay,
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
  const [active, setActive] = useState(false);

  const dayNumber = searchDay ?? currentDay;
  const phase = getPhaseForDay(dayNumber);
  const unlocked = isDayUnlocked(dayNumber, currentDay);

  const type = getWorkoutTypeForDay(dayNumber);
  const exercises = getExercisesForDay(dayNumber);
  const existing = workouts.find((w) => w.dayNumber === dayNumber);

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

  if (type === "Rest") {
    const done = completedDays.has(dayNumber);
    return (
      <div className="space-y-6 animate-fade-in">
        {header}
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Day {dayNumber} — Rest Day</h2>
          <p className="text-muted-foreground">
            Recover today. Next up: {getWorkoutTypeForDay(dayNumber + 1)} on Day {dayNumber + 1}.
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
          <div>
            <Button variant="outline" asChild>
              <Link to="/program">Back to Program</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!active && !existing) {
    return (
      <div className="space-y-6 animate-fade-in">
        {header}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{type}</h2>
            <p className="text-muted-foreground">Day {dayNumber} · {exercises.length} exercises</p>
          </div>
          <Button onClick={() => setActive(true)} className="press-scale">
            <Dumbbell className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
        </div>
        <div className="grid gap-3">
          {exercises.map((ex) => (
            <Card key={ex.id} className="card-elevated">
              <CardContent className="p-4">
                <p className="font-semibold">{ex.name}</p>
                <p className="text-sm text-muted-foreground">{ex.muscleGroup} · {ex.defaultEquipment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}
      <WorkoutLogger
        key={dayNumber}
        dayNumber={dayNumber}
        type={type}
        exercises={exercises}
        existing={existing}
        onSave={(session) => {
          setWorkouts((prev) => {
            const filtered = prev.filter((w) => w.id !== session.id && w.dayNumber !== session.dayNumber);
            return [...filtered, session];
          });
        }}
        onComplete={(session) => {
          setWorkouts((prev) => {
            const filtered = prev.filter((w) => w.id !== session.id && w.dayNumber !== session.dayNumber);
            return [...filtered, session];
          });
          setActive(false);
          if (session.completed) navigate({ to: "/program" });
        }}
      />
    </div>
  );
}

function WorkoutLogger({
  dayNumber,
  type,
  exercises,
  existing,
  onComplete,
  onSave,
}: {
  dayNumber: number;
  type: WorkoutType;
  exercises: { id: string; name: string; muscleGroup: string; defaultEquipment?: string }[];
  existing?: WorkoutSession | undefined;
  onComplete: (session: WorkoutSession) => void;
  onSave: (session: WorkoutSession) => void;
}) {
  const [sessionId] = useState(() => existing?.id || generateId());
  const [exerciseState, setExerciseState] = useState<LoggedExercise[]>(() => {
    if (existing?.exercises?.length) return existing.exercises;
    return exercises.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.defaultEquipment || "",
      notes: "",
      sets: [{ weight: 0, reps: 0 }, { weight: 0, reps: 0 }, { weight: 0, reps: 0 }],
      rpe: 7,
      pr: false,
      completed: false,
    }));
  });
  const [cardioMinutes, setCardioMinutes] = useState(existing?.cardioMinutes || 0);

  const allCompleted = exerciseState.every((e) => e.completed);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      onSave({
        id: sessionId,
        date: existing?.date || formatDate(new Date()),
        dayNumber,
        type,
        exercises: exerciseState,
        durationMinutes: existing?.durationMinutes || 0,
        cardioMinutes,
        completed: existing?.completed ?? false,
      });
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseState, cardioMinutes]);


  const updateSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, value: number) => {
    setExerciseState((prev) => {
      const next = [...prev];
      const ex = { ...next[exIndex]! };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex]!, [field]: value };
      ex.sets = sets;
      next[exIndex] = ex;
      return next;
    });
  };

  const addSet = (exIndex: number) => {
    setExerciseState((prev) => {
      const next = [...prev];
      const ex = { ...next[exIndex]! };
      ex.sets = [...ex.sets, { weight: 0, reps: 0 }];
      next[exIndex] = ex;
      return next;
    });
  };

  const toggleComplete = (exIndex: number) => {
    setExerciseState((prev) => {
      const next = [...prev];
      next[exIndex] = { ...next[exIndex]!, completed: !next[exIndex]!.completed };
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{type}</h2>
          <p className="text-muted-foreground">Day {dayNumber}</p>
        </div>
        <Button
          onClick={() =>
            onComplete({
              id: existing?.id || generateId(),
              date: formatDate(new Date()),
              dayNumber,
              type,
              exercises: exerciseState,
              durationMinutes: existing?.durationMinutes || 0,
              cardioMinutes,
              completed: allCompleted,
            })
          }
          className="press-scale"
        >
          <Check className="mr-2 h-4 w-4" />
          {allCompleted ? "Finish" : "Save Workout"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CardioTimer mode="sprint" onComplete={(seconds) => setCardioMinutes((m) => m + Math.round(seconds / 60))} />
        <CardioTimer mode="liss" onComplete={(seconds) => setCardioMinutes((m) => m + Math.round(seconds / 60))} />
      </div>

      {cardioMinutes > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Cardio logged: <span className="font-semibold text-foreground">{cardioMinutes} min</span>
        </div>
      )}

      <div className="space-y-4">
        {exerciseState.map((ex, exIndex) => (
          <Card key={ex.exerciseId} className={`card-elevated ${ex.completed ? "border-primary/30" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  {ex.name}
                  {ex.pr && <Trophy className="h-4 w-4 text-yellow-500" />}
                </span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`complete-${exIndex}`}
                    checked={ex.completed}
                    onCheckedChange={() => toggleComplete(exIndex)}
                  />
                  <Label htmlFor={`complete-${exIndex}`} className="text-xs text-muted-foreground">
                    Done
                  </Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Equipment</Label>
                  <Input
                    value={ex.equipment}
                    onChange={(e) => {
                      setExerciseState((prev) => {
                        const next = [...prev];
                        next[exIndex] = { ...next[exIndex]!, equipment: e.target.value };
                        return next;
                      });
                    }}
                    placeholder="Barbell, Cable..."
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
                    onChange={(e) => {
                      setExerciseState((prev) => {
                        const next = [...prev];
                        next[exIndex] = { ...next[exIndex]!, rpe: Number(e.target.value) };
                        return next;
                      });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {ex.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      type="number"
                      placeholder="Weight"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(exIndex, setIndex, "weight", Number(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(exIndex, setIndex, "reps", Number(e.target.value))}
                    />
                    <span className="grid w-8 place-items-center text-xs text-muted-foreground">
                      S{setIndex + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => addSet(exIndex)}>
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Add Set
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExerciseState((prev) => {
                      const next = [...prev];
                      next[exIndex] = { ...next[exIndex]!, pr: !next[exIndex]!.pr };
                      return next;
                    });
                  }}
                >
                  <Trophy className="mr-1 h-3 w-3" />
                  {ex.pr ? "Unmark PR" : "Mark PR"}
                </Button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Input
                  value={ex.notes}
                  onChange={(e) => {
                    setExerciseState((prev) => {
                      const next = [...prev];
                      next[exIndex] = { ...next[exIndex]!, notes: e.target.value };
                      return next;
                    });
                  }}
                  placeholder="Form cues, pain, etc."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
