import { useEffect, useRef, useState } from "react";
import { Timer, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Simple countdown rest timer. Never blocks the user from continuing. */
export function RestTimer({ defaultSeconds }: { defaultSeconds: number }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const start = () => {
    setRemaining(seconds);
    setRunning(true);
  };

  const mm = Math.floor(remaining / 60);
  const ss = `${remaining % 60}`.padStart(2, "0");

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-2">
      <Timer className="h-4 w-4 text-primary" />
      <span className="text-xs text-muted-foreground">Rest</span>
      <Input
        type="number"
        min={5}
        step={5}
        value={seconds}
        onChange={(e) => setSeconds(Math.max(5, Number(e.target.value) || 0))}
        className="h-8 w-20"
        aria-label="Rest seconds"
      />
      <span className="text-xs text-muted-foreground">sec</span>
      {running || remaining > 0 ? (
        <>
          <span className="font-mono text-sm font-semibold">
            {mm}:{ss}
          </span>
          <Button size="sm" variant="outline" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRunning(false);
              setRemaining(0);
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Skip
          </Button>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={start}>
          <Play className="mr-1 h-3 w-3" />
          Start rest
        </Button>
      )}
    </div>
  );
}
