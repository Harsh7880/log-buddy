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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("100 Day Bollywood Body Tracker", 14, 20);
    doc.setFontSize(12);
    doc.text("Workout History", 14, 30);

    let y = 40;
    sorted.forEach((w) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.text(`${w.date} - Day ${w.dayNumber} - ${w.type}`, 14, y);
      y += 6;
      doc.setFontSize(9);
      w.exercises.forEach((ex) => {
        const sets = ex.sets.map((s) => `${s.weight}kg x ${s.reps}`).join(", ");
        doc.text(`  ${ex.name}: ${sets}`, 16, y);
        y += 5;
      });
      y += 4;
    });
    doc.save("bollywood-body-workouts.pdf");
  };

  const exportExcel = () => {
    const rows = sorted.flatMap((w) =>
      w.exercises.flatMap((ex) =>
        ex.sets.map((s, i) => ({
          Date: w.date,
          Day: w.dayNumber,
          Workout: w.type,
          Exercise: ex.name,
          Equipment: ex.equipment,
          Set: i + 1,
          Weight: s.weight,
          Reps: s.reps,
          RPE: ex.rpe,
          PR: ex.pr ? "Yes" : "No",
        }))
      )
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workouts");
    XLSX.writeFile(wb, "bollywood-body-workouts.xlsx");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workout History</h2>
          <p className="text-muted-foreground">{sorted.length} logged sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={sorted.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={sorted.length === 0}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
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
