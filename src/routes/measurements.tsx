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
  const [photos, setPhotos] = useProgressPhotos();
  const fileRef = useRef<HTMLInputElement>(null);
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

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos((prev) => [
        ...prev,
        { id: crypto.randomUUID(), date: today, dataUrl: reader.result as string },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const weightChartData = measurements
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({ label: m.date.slice(5), value: m.weight }));

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

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weight Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart data={weightChartData} color="#ef4444" valueLabel="kg" />
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-primary" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Photo
          </Button>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.slice().reverse().map((photo) => (
                <div key={photo.id} className="relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={photo.dataUrl}
                    alt={`Progress photo from ${photo.date}`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
                    {photo.date}
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
