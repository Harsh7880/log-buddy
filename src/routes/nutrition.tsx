import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Utensils, Droplets, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNutrition } from "@/hooks/use-app-data";
import { formatDate } from "@/lib/workout-data";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Track daily calories, macros, water, and sleep." },
      { property: "og:title", content: "Nutrition — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Track daily calories, macros, water, and sleep." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NutritionPage,
});

function NutritionPage() {
  const [nutrition, setNutrition] = useNutrition();
  const today = formatDate(new Date());
  const todayEntry = nutrition.find((n) => n.date === today) || {
    date: today,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    sleep: 0,
  };

  const [values, setValues] = useState(todayEntry);

  const save = () => {
    setNutrition((prev) => {
      const filtered = prev.filter((n) => n.date !== today);
      return [...filtered, values];
    });
  };

  const update = (field: keyof typeof values, value: number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Nutrition</h2>
        <p className="text-muted-foreground">{today}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MacroCard icon={Utensils} label="Calories" value={values.calories} unit="kcal" onChange={(v) => update("calories", v)} />
        <MacroCard icon={Utensils} label="Protein" value={values.protein} unit="g" onChange={(v) => update("protein", v)} />
        <MacroCard icon={Utensils} label="Carbs" value={values.carbs} unit="g" onChange={(v) => update("carbs", v)} />
        <MacroCard icon={Utensils} label="Fat" value={values.fat} unit="g" onChange={(v) => update("fat", v)} />
        <MacroCard icon={Droplets} label="Water" value={values.water} unit="L" onChange={(v) => update("water", v)} />
        <MacroCard icon={Moon} label="Sleep" value={values.sleep} unit="h" onChange={(v) => update("sleep", v)} />
      </div>

      <Button onClick={save} className="w-full press-scale">
        Save Today&apos;s Nutrition
      </Button>
    </div>
  );
}

function MacroCard({
  icon: Icon,
  label,
  value,
  unit,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Update {label}</Label>
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
