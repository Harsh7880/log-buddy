import { createFileRoute } from "@tanstack/react-router";
import { User, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUserSettings,
  useWorkouts,
  useNutrition,
  useMeasurements,
  useProgressPhotos,
  useProgram,
} from "@/hooks/use-app-data";
import { PHASES } from "@/lib/program";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Manage your 100 Day Bollywood Body Tracker settings and data." },
      { property: "og:title", content: "Profile — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Manage your 100 Day Bollywood Body Tracker settings and data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [settings, setSettings] = useUserSettings();
  const { currentDay, phase, setPhaseStartDate } = useProgram();
  const [, setWorkouts] = useWorkouts();
  const [, setNutrition] = useNutrition();
  const [, setMeasurements] = useMeasurements();
  const [, setPhotos] = useProgressPhotos();

  const clearAllData = () => {
    if (confirm("Are you sure you want to reset the program and delete all app data? This cannot be undone.")) {
      setWorkouts([]);
      setNutrition([]);
      setMeasurements([]);
      setPhotos([]);
      setSettings((prev) => ({ ...prev, completedRestDays: [] }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">
            Day {currentDay} of 100 · Phase {phase.number}: {phase.name}
          </p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Body Weight (kg)</Label>
            <Input
              type="number"
              value={settings.bodyWeight}
              onChange={(e) => setSettings((prev) => ({ ...prev, bodyWeight: Number(e.target.value) }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Unit System</Label>
            <Select
              value={settings.unitSystem}
              onValueChange={(v) => setSettings((prev) => ({ ...prev, unitSystem: v as "metric" | "imperial" }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <p className="text-sm font-semibold">Phase Start Dates</p>
              <p className="text-xs text-muted-foreground">
                Set when a phase began. Your overall day, current phase and today&apos;s workout are
                calculated from these dates. Changing them never deletes logged workouts.
              </p>
            </div>
            {PHASES.map((p) => (
              <div key={p.number} className="flex items-center gap-3">
                <Label className="w-40 shrink-0 text-sm text-muted-foreground">
                  Phase {p.number} — {p.name}
                </Label>
                <Input
                  type="date"
                  value={settings.phaseStartDates[String(p.number)] ?? ""}
                  onChange={(e) => setPhaseStartDate(p.number, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={clearAllData} className="w-full">
            Reset Program & Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
