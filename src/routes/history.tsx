import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, FileDown, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkouts } from "@/hooks/use-app-data";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Review your completed workouts and progress." },
      { property: "og:title", content: "History — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Review your completed workouts and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [workouts] = useWorkouts();
  const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Workout History</h2>
        <p className="text-muted-foreground">{sorted.length} logged sessions</p>
      </div>

      {sorted.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No workouts logged yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((workout) => (
            <Card key={workout.id} className="card-elevated hover-lift">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{workout.type}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    Day {workout.dayNumber} · {workout.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{workout.exercises.length}</p>
                  <p className="text-xs text-muted-foreground">exercises</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
