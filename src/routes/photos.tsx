import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Trash2, Images, X, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDailyLog, useProgram } from "@/hooks/use-app-data";
import {
  ANGLE_LABELS,
  OPTIONAL_ANGLES,
  PRIMARY_ANGLES,
  PHOTO_ANGLES,
  fileToCompressedDataUrl,
  type PhotoAngle,
} from "@/lib/daily-log";

export const Route = createFileRoute("/photos")({
  head: () => ({
    meta: [
      { title: "Progress Photos — 100 Day Bollywood Body Tracker" },
      { name: "description", content: "Upload daily progress photos and compare any two program days side by side." },
      { property: "og:title", content: "Progress Photos — 100 Day Bollywood Body Tracker" },
      { property: "og:description", content: "Upload daily progress photos and compare any two program days side by side." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhotosPage,
});

function prettyDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PhotosPage() {
  const { currentDay } = useProgram();
  const { records, todayISO, getByDate, setPhoto, removePhoto, dateForDay, hydrated } = useDailyLog();
  const [viewer, setViewer] = useState<string | null>(null);

  const today = getByDate(todayISO);
  const history = records
    .filter((r) => Object.keys(r.photos ?? {}).length > 0)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading your photos…</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Progress Photos</h2>
        <p className="text-muted-foreground">
          Optional — skipping photos never affects your daily score.
        </p>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-primary" />
            Day {currentDay} · {prettyDate(todayISO)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Primary angles</Label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {PRIMARY_ANGLES.map((angle) => (
                <PhotoSlot
                  key={angle}
                  angle={angle}
                  src={today?.photos?.[angle]}
                  onPick={(url) => setPhoto(todayISO, angle, url)}
                  onRemove={() => removePhoto(todayISO, angle)}
                  onView={setViewer}
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Optional</Label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {OPTIONAL_ANGLES.map((angle) => (
                <PhotoSlot
                  key={angle}
                  angle={angle}
                  src={today?.photos?.[angle]}
                  onPick={(url) => setPhoto(todayISO, angle, url)}
                  onRemove={() => removePhoto(todayISO, angle)}
                  onView={setViewer}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Comparison currentDay={currentDay} dateForDay={dateForDay} getByDate={getByDate} onView={setViewer} />

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Images className="h-5 w-5 text-primary" />
            Photo History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">No photos yet. Upload your first angles above.</p>
          )}
          {history.map((r) => (
            <div key={r.date} className="rounded-lg border border-border p-3">
              <p className="font-semibold">Day {r.programDay}</p>
              <p className="text-xs text-muted-foreground">
                {prettyDate(r.date)} · Phase {r.phase}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {PHOTO_ANGLES.filter((a) => r.photos?.[a]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setViewer(r.photos![a]!)}
                    className="space-y-1 text-left"
                  >
                    <img
                      src={r.photos![a]!}
                      alt={`${ANGLE_LABELS[a]} photo from day ${r.programDay}`}
                      className="h-24 w-20 rounded-md object-cover"
                      loading="lazy"
                    />
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      {ANGLE_LABELS[a]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {viewer && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-4"
          onClick={() => setViewer(null)}
        >
          <img src={viewer} alt="Progress photo full screen" className="max-h-full max-w-full rounded-lg object-contain" />
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setViewer(null)}
            aria-label="Close photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PhotoSlot({
  angle,
  src,
  onPick,
  onRemove,
  onView,
}: {
  angle: PhotoAngle;
  src?: string | undefined;
  onPick: (dataUrl: string) => void;
  onRemove: () => void;
  onView: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onPick(await fileToCompressedDataUrl(file));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      {src ? (
        <button
          onClick={() => onView(src)}
          className="block w-full overflow-hidden rounded-lg border border-border"
        >
          <img src={src} alt={`${ANGLE_LABELS[angle]} progress photo`} className="aspect-[3/4] w-full object-cover" />
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="grid aspect-[3/4] w-full place-items-center rounded-lg border border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-primary/50"
        >
          <Camera className="h-6 w-6" />
        </button>
      )}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium">{ANGLE_LABELS[angle]}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {src ? "Replace" : "Upload"}
          </Button>
          {src && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove} aria-label={`Delete ${ANGLE_LABELS[angle]} photo`}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Comparison({
  currentDay,
  dateForDay,
  getByDate,
  onView,
}: {
  currentDay: number;
  dateForDay: (day: number) => string | null;
  getByDate: (iso: string) => { photos?: Partial<Record<PhotoAngle, string>>; programDay: number } | undefined;
  onView: (dataUrl: string) => void;
}) {
  const [left, setLeft] = useState(1);
  const [right, setRight] = useState(currentDay);

  const photosFor = (day: number) => {
    const iso = dateForDay(day);
    return iso ? (getByDate(iso)?.photos ?? {}) : {};
  };
  const leftPhotos = photosFor(left);
  const rightPhotos = photosFor(right);

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          Before / After
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DaySelect label="Day A" value={left} onChange={setLeft} />
          <DaySelect label="Day B" value={right} onChange={setRight} />
        </div>
        <div className="space-y-4">
          {PRIMARY_ANGLES.map((angle) => (
            <div key={angle}>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{ANGLE_LABELS[angle]}</p>
              <div className="grid grid-cols-2 gap-3">
                <CompareCell day={left} src={leftPhotos[angle]} angle={angle} onView={onView} />
                <CompareCell day={right} src={rightPhotos[angle]} angle={angle} onView={onView} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DaySelect({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2 text-sm"
      >
        {Array.from({ length: 100 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            Day {d}
          </option>
        ))}
      </select>
    </div>
  );
}

function CompareCell({
  day,
  src,
  angle,
  onView,
}: {
  day: number;
  src?: string | undefined;
  angle: PhotoAngle;
  onView: (dataUrl: string) => void;
}) {
  return (
    <div className="space-y-1">
      {src ? (
        <button onClick={() => onView(src)} className="block w-full overflow-hidden rounded-lg border border-border">
          <img src={src} alt={`${ANGLE_LABELS[angle]} photo day ${day}`} className="aspect-[3/4] w-full object-cover" />
        </button>
      ) : (
        <div className="grid aspect-[3/4] w-full place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
          No photo
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">Day {day}</p>
    </div>
  );
}
