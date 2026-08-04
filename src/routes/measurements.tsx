import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Ruler, TrendingUp, Camera, ImageIcon, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurements, useUserSettings, useProgressPhotos } from "@/hooks/use-app-data";
import { formatDate } from "@/lib/workout-data";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";

export const Route = createFileRoute("/measurements")({
  head: () => ({
    meta: [
      { title: "Measurements — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Log body measurements, weight, and progress photos." },
      { property: "og:title", content: "Measurements — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Log body measurements, weight, and progress photos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeasurementsPage,
});

function MeasurementsPage() {
  const [measurements, setMeasurements] = useMeasurements();
  const [settings, setSettings] = useUserSettings();
  const today = formatDate(new Date());
  const latest = measurements[measurements.length - 1];

  const [values, setValues] = useState({
    chest: latest?.chest || 0,
    waist: latest?.waist || 0,
    arms: latest?.arms || 0,
    thighs: latest?.thighs || 0,
    calves: latest?.calves || 0,
    weight: settings.bodyWeight,
  });

  const save = () => {
    setMeasurements((prev) => [...prev, { date: today, ...values }]);
    setSettings((prev) => ({ ...prev, bodyWeight: values.weight }));
  };

  const update = (field: keyof typeof values, value: number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Body Measurements</h2>
        <p className="text-muted-foreground">Track inches and weight over time</p>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Current Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{settings.bodyWeight}</span>
            <span className="text-muted-foreground">kg</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <MeasurementInput label="Chest" value={values.chest} onChange={(v) => update("chest", v)} />
        <MeasurementInput label="Waist" value={values.waist} onChange={(v) => update("waist", v)} />
        <MeasurementInput label="Arms" value={values.arms} onChange={(v) => update("arms", v)} />
        <MeasurementInput label="Thighs" value={values.thighs} onChange={(v) => update("thighs", v)} />
        <MeasurementInput label="Calves" value={values.calves} onChange={(v) => update("calves", v)} />
        <MeasurementInput label="Weight" value={values.weight} onChange={(v) => update("weight", v)} />
      </div>

      <Button onClick={save} className="w-full press-scale">
        Save Measurements
      </Button>

      {measurements.length > 0 && (
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ruler className="h-5 w-5 text-primary" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {measurements.slice(-5).reverse().map((m) => (
              <div key={m.date} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span className="text-sm text-muted-foreground">{m.date}</span>
                <span className="font-medium">{m.weight} kg</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MeasurementInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1"
      />
    </div>
  );
}
