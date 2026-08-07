import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Zap, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CardioTimerProps {
  defaultSeconds?: number;
  mode?: "sprint" | "liss";
  onComplete?: (seconds: number) => void;
}

export function CardioTimer({ defaultSeconds = 0, mode = "liss", onComplete }: CardioTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const format = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const presets = mode === "sprint" ? [30, 60, 90, 120] : [600, 1200, 1800, 2700];
  const [customValue, setCustomValue] = useState("");
  const unitLabel = mode === "sprint" ? "seconds" : "minutes";

  const applyCustom = () => {
    const n = Number(customValue);
    if (!Number.isFinite(n) || n <= 0) return;
    setSeconds(mode === "sprint" ? Math.round(n) : Math.round(n * 60));
    setRunning(false);
  };

  return (
    <Card className="card-elevated border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {mode === "sprint" ? <Zap className="h-5 w-5 text-primary" /> : <Wind className="h-5 w-5 text-primary" />}
          {mode === "sprint" ? "Sprint Timer" : "LISS Timer"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid place-items-center py-4">
          <div className="text-5xl font-bold tabular-nums tracking-tight">{format(seconds)}</div>
        </div>

        <div className="flex justify-center gap-2">
          <Button variant={running ? "secondary" : "default"} size="sm" onClick={() => setRunning(!running)}>
            {running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSeconds(0)}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          {onComplete && (
            <Button variant="outline" size="sm" onClick={() => onComplete(seconds)} disabled={seconds === 0}>
              Log
            </Button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setSeconds(p)}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/80"
            >
              {mode === "sprint" ? `${p}s` : `${p / 60}m`}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCustom();
            }}
            placeholder={`Custom ${unitLabel}`}
            className="h-9 max-w-[10rem]"
            aria-label={`Custom timer ${unitLabel}`}
          />
          <Button variant="outline" size="sm" onClick={applyCustom} disabled={!customValue}>
            Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
