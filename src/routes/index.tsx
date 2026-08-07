import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Dumbbell,
  Flame,
  TrendingUp,
  Droplets,
  Moon,
  Timer,
  ChevronRight,
  Calendar,
  Activity,
  Weight,
  Camera,
} from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { useUserSettings, useWorkouts, useNutrition, useMeasurements, useProgram } from "@/hooks/use-app-data";
import {
  getWorkoutTypeForDay,
  getExercisesForDay,
  formatDate,
} from "@/lib/workout-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepsCard, WeeklyStepsCard } from "@/components/steps-card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Track your Bollywood Body transformation with workouts, nutrition, and progress." },
      { property: "og:title", content: "Dashboard — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Track your Bollywood Body transformation with workouts, nutrition, and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [settings] = useUserSettings();
  const { currentDay, phase, phaseProgress, dayInPhase, phaseLength, remainingDays, completedDays } =
    useProgram();
  const [workouts] = useWorkouts();
  const [nutrition] = useNutrition();
  const [measurements] = useMeasurements();

  const today = formatDate(new Date());
  const todayWorkout = workouts.find((w) => w.dayNumber === currentDay);
  const todayNutrition = nutrition.find((n) => n.date === today);

  const currentType = getWorkoutTypeForDay(currentDay);
  const todayExercises = getExercisesForDay(currentDay);
  const progress = completedDays.size / 100;

  const streak = computeStreak(workouts);

  const weeklyCompletion = Array.from({ length: 7 }, (_, i) => {
    const day = currentDay - 6 + i;
    if (day < 1) return false;
    return completedDays.has(day);
  });

  const weightChartData = measurements
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({ label: m.date.slice(5), value: m.weight }));

  const volumeChartData = workouts
    .filter((w) => w.completed)
    .slice()
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((w) => ({
      label: `D${w.dayNumber}`,
      value: w.exercises.reduce((total, ex) => {
        return (
          total +
          ex.sets.reduce((setTotal, set) => setTotal + (set.weight ?? 0) * (set.reps ?? 0), 0)
        );
      }, 0),
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h2 className="text-2xl font-bold">Day {currentDay} of 100</h2>
          <p className="text-muted-foreground">
            Phase {phase.number}: {phase.name} · {currentType === "Rest" ? "Rest Day" : currentType}
          </p>
          <p className="text-sm text-muted-foreground">
            Day {dayInPhase} of {phaseLength} in this phase · {phaseProgress.percent}% complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Weight</p>
            <p className="text-xl font-bold">
              {settings.bodyWeight} <span className="text-sm font-normal text-muted-foreground">kg</span>
            </p>
          </div>
          <ProgressRing progress={progress} label={`${currentDay}`} sublabel="of 100" size={120} strokeWidth={10} />
        </div>
      </section>

      {currentType !== "Rest" ? (
        <Card className="card-elevated hover-lift overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="h-5 w-5 text-primary" />
              Today&apos;s Workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{currentType}</p>
                <p className="text-sm text-muted-foreground">{todayExercises.length} exercises</p>
              </div>
              <Button asChild className="press-scale">
                <Link to="/workout" search={{ day: currentDay }}>
                  {todayWorkout?.completed ? "View Log" : "Start Workout"}
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {todayExercises.slice(0, 5).map((ex) => (
                <span key={ex.id} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {ex.name}
                </span>
              ))}
              {todayExercises.length > 5 && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  +{todayExercises.length - 5}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-elevated">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-lg font-semibold">Rest Day</p>
              <p className="text-sm text-muted-foreground">Recover and come back stronger.</p>
            </div>
            <Button asChild variant="outline" className="press-scale">
              <Link to="/workout" search={{ day: currentDay }}>Open Day</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Today&apos;s Progress</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StepsCard />
          <WeeklyStepsCard />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard
            icon={Dumbbell}
            label="Workout"
            value={currentType === "Rest" ? "Rest" : todayWorkout?.completed ? "Done" : "Pending"}
          />
          <MetricCard icon={Droplets} label="Water" value={`${todayNutrition?.water ?? 0} L`} />
          <MetricCard icon={Flame} label="Calories" value={`${todayNutrition?.calories ?? 0}`} />
          <MetricCard icon={Activity} label="Protein" value={`${todayNutrition?.protein ?? 0} g`} />
          <MetricCard icon={Moon} label="Sleep" value={`${todayNutrition?.sleep ?? 0} h`} />
          <MetricCard icon={Weight} label="Morning Weight" value={`${settings.bodyWeight} kg`} />
        </div>
        <Card className="card-elevated hover-lift">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Progress Photos
              </p>
              <p className="text-sm text-muted-foreground">Optional — front, side, back for Day {currentDay}.</p>
            </div>
            <Button asChild variant="outline" className="press-scale">
              <Link to="/photos">Open</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <MetricCard icon={Flame} label="Streak" value={`${streak} days`} />
        <MetricCard icon={TrendingUp} label="Remaining" value={`${remainingDays} days`} />
      </div>



      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {weeklyCompletion.map((done, i) => {
              const day = currentDay - 6 + i;
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const label = ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
              const type = day >= 1 ? getWorkoutTypeForDay(day) : null;
              const rest = type === "Rest";
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <div
                    className={`grid h-10 w-full place-items-center rounded-lg text-xs font-semibold ${
                      rest
                        ? "bg-muted text-muted-foreground"
                        : done
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {day >= 1 ? day : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Weight className="h-5 w-5 text-primary" />
              Body Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={weightChartData} color="#ef4444" valueLabel="kg" />
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Workout Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={volumeChartData} color="#22c55e" valueLabel="kg" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="card-elevated hover-lift">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-2xl font-bold">{todayNutrition?.calories ?? 0}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/nutrition">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="card-elevated hover-lift">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-2xl font-bold">{todayNutrition?.protein ?? 0}g</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/nutrition">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="card-elevated hover-lift">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Cardio</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <Timer className="h-4 w-4 text-primary" />
                {todayWorkout?.cardioMinutes ?? 0}m
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/workout">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="card-elevated hover-lift">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Next Workout</p>
              <p className="text-lg font-bold">
                {getWorkoutTypeForDay(currentDay + 1)}
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/program">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="card-elevated">
      <CardContent className="flex flex-col items-start gap-2 p-4">
        <Icon className="h-5 w-5 text-primary" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function computeStreak(workouts: { date: string; completed: boolean }[]): number {
  const dates = workouts.filter((w) => w.completed).map((w) => w.date).sort();
  if (dates.length === 0) return 0;
  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i]!);
    const prev = new Date(dates[i - 1]!);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
