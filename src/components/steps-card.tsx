import { useEffect, useState } from "react";
import { Footprints, Check, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDailyLog } from "@/hooks/use-app-data";
import { STEP_GOAL, stepStats } from "@/lib/daily-log";

export function StepsCard() {
  const { getByDate, todayISO, setSteps, hydrated } = useDailyLog();
  const record = getByDate(todayISO);
  const steps = record?.steps ?? 0;
  const { percent, completed, remaining, barPercent } = stepStats(steps);

  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (hydrated) setDraft(steps ? String(steps) : "");
  }, [hydrated, steps]);

  return (
    <Card className={`card-elevated ${completed ? "border-primary/40" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-primary" />
            Steps
          </span>
          {completed && (
            <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
              <Check className="h-3 w-3" />
              Completed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold tabular-nums">
            {steps.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {STEP_GOAL.toLocaleString()}
            </span>
          </p>
          <p className="text-sm font-semibold text-primary tabular-nums">{percent}%</p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${barPercent}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {completed ? "Goal completed" : `${remaining.toLocaleString()} remaining`}
        </p>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSteps(todayISO, Number(draft));
            }}
            placeholder="Enter today's steps"
            aria-label="Today's step count"
            className="h-9"
          />
          <Button size="sm" variant="outline" onClick={() => setSteps(todayISO, Number(draft))}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyStepsCard() {
  const { records, todayISO } = useDailyLog();

  const start = new Date(`${todayISO}T12:00:00`);
  start.setDate(start.getDate() - 6);
  const week = records.filter((r) => {
    const d = new Date(`${r.date}T12:00:00`);
    return d >= start && r.date <= todayISO;
  });

  const total = week.reduce((sum, r) => sum + (r.steps || 0), 0);
  const average = week.length ? Math.round(total / 7) : 0;
  const goalDays = week.filter((r) => (r.steps || 0) >= STEP_GOAL).length;
  const best = week.reduce<{ steps: number; date: string; programDay: number } | null>(
    (acc, r) => (!acc || r.steps > acc.steps ? { steps: r.steps, date: r.date, programDay: r.programDay } : acc),
    null,
  );

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Weekly Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Stat label="Total" value={total.toLocaleString()} />
        <Stat label="Daily average" value={average.toLocaleString()} />
        <Stat label="Goal days" value={`${goalDays} / 7`} />
        <Stat
          label="Best day"
          value={best && best.steps > 0 ? `${best.steps.toLocaleString()} (Day ${best.programDay})` : "—"}
        />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
