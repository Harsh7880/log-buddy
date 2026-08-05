import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  Lock,
  Check,
  Dumbbell,
  Moon,
  CircleDot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProgram } from "@/hooks/use-app-data";
import {
  PHASES,
  getPhaseDays,
  getPhaseStatus,
  getPhaseCompletion,
  isDayUnlocked,
  type Phase,
} from "@/lib/program";

export const Route = createFileRoute("/program")({
  head: () => ({
    meta: [
      { title: "Program — 100 Day Bollywood Body Tracker" },
      {
        name: "description",
        content:
          "Follow the guided 100-day Bollywood Body program phase by phase, unlocking each training day as you complete it.",
      },
      { property: "og:title", content: "Program — 100 Day Bollywood Body Tracker" },
      {
        property: "og:description",
        content: "Guided 100-day training program with five phases and day-by-day unlocking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgramPage,
});

function ProgramPage() {
  const { currentDay, completedDays, phase } = useProgram();
  const [open, setOpen] = useState<number | null>(phase.number);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">100 Day Program</h2>
        <p className="text-muted-foreground">
          Day {currentDay} of 100 · Phase {phase.number}: {phase.name}
        </p>
      </div>

      <div className="space-y-3">
        {PHASES.map((p) => (
          <PhaseCard
            key={p.number}
            phase={p}
            currentDay={currentDay}
            completedDays={completedDays}
            expanded={open === p.number}
            onToggle={() => setOpen(open === p.number ? null : p.number)}
          />
        ))}
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  currentDay,
  completedDays,
  expanded,
  onToggle,
}: {
  phase: Phase;
  currentDay: number;
  completedDays: Set<number>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = getPhaseStatus(phase, currentDay);
  const { percent, done, total } = getPhaseCompletion(phase, completedDays);
  const locked = status === "locked";
  const days = getPhaseDays(phase);

  return (
    <Card className={`card-elevated overflow-hidden ${status === "current" ? "border-primary/40" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/40"
      >
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${
            status === "completed"
              ? "bg-primary text-primary-foreground"
              : status === "current"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {status === "completed" ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : phase.number}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">
              Phase {phase.number} — {phase.name}
            </p>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-muted-foreground">
            Days {phase.startDay}–{phase.endDay} · {done}/{total} days · {percent}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <CardContent className="border-t border-border p-0">
          <ul className="divide-y divide-border">
            {days.map(({ day, type }) => {
              const complete = completedDays.has(day);
              const unlocked = isDayUnlocked(day, currentDay);
              const isCurrent = day === currentDay;
              const rest = type === "Rest";

              const inner = (
                <div className="flex items-center gap-3 px-5 py-3">
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      complete
                        ? "bg-primary/15 text-primary"
                        : unlocked
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/50 text-muted-foreground/60"
                    }`}
                  >
                    {complete ? (
                      <Check className="h-4 w-4" />
                    ) : !unlocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : rest ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Dumbbell className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${unlocked ? "" : "text-muted-foreground/70"}`}>
                      Day {day} — {type}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <CircleDot className="h-3 w-3" />
                      Today
                    </span>
                  )}
                </div>
              );

              return (
                <li key={day}>
                  {unlocked ? (
                    <Link
                      to="/workout"
                      search={{ day }}
                      className="block transition-colors hover:bg-muted/40"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed opacity-60">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: "completed" | "current" | "locked" }) {
  const map = {
    completed: { label: "Completed", cls: "bg-primary/15 text-primary" },
    current: { label: "Current", cls: "bg-primary text-primary-foreground" },
    locked: { label: "Locked", cls: "bg-muted text-muted-foreground" },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}
