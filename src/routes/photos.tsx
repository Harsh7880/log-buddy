import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Camera,
  Trash2,
  Images,
  X,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDailyLog, useProgram } from "@/hooks/use-app-data";
import { getPhaseForDay, toISODate } from "@/lib/program";
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
      { title: "Progress Photo Journal — 100 Day Bollywood Body Tracker" },
      {
        name: "description",
        content:
          "Browse a monthly photo calendar, upload progress photos for any past date, and compare program days side by side.",
      },
      { property: "og:title", content: "Progress Photo Journal — 100 Day Bollywood Body Tracker" },
      {
        property: "og:description",
        content:
          "Browse a monthly photo calendar, upload progress photos for any past date, and compare program days side by side.",
      },
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

function longDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function coverPhoto(photos: Partial<Record<PhotoAngle, string>> | undefined) {
  if (!photos) return undefined;
  for (const a of PHOTO_ANGLES) if (photos[a]) return photos[a];
  return undefined;
}

function PhotosPage() {
  const { currentDay } = useProgram();
  const { records, todayISO, getByDate, setPhoto, removePhoto, dateForDay, dayForDate, hydrated } =
    useDailyLog();

  const [selected, setSelected] = useState(todayISO);
  const [month, setMonth] = useState(() => {
    const d = new Date(`${todayISO}T12:00:00`);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [viewer, setViewer] = useState<{ list: string[]; index: number } | null>(null);

  const record = getByDate(selected);
  const selectedDay = dayForDate(selected);
  const selectedPhase = selectedDay ? getPhaseForDay(selectedDay) : null;

  const selectedPhotoList = PHOTO_ANGLES.filter((a) => record?.photos?.[a]).map(
    (a) => record!.photos![a]!,
  );

  const openViewer = (src: string, list: string[] = selectedPhotoList) => {
    const pool = list.length ? list : [src];
    setViewer({ list: pool, index: Math.max(0, pool.indexOf(src)) });
  };

  const history = records
    .filter((r) => Object.keys(r.photos ?? {}).length > 0)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const photosByDate = useMemo(() => {
    const map = new Map<string, Partial<Record<PhotoAngle, string>>>();
    for (const r of records) if (Object.keys(r.photos ?? {}).length) map.set(r.date, r.photos);
    return map;
  }, [records]);

  const cells = useMemo(() => {
    const first = new Date(month.year, month.month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
    const out: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) out.push(toISODate(new Date(month.year, month.month, d)));
    return out;
  }, [month]);

  const monthLabel = new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const shiftMonth = (delta: number) =>
    setMonth((m) => {
      const d = new Date(m.year, m.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToDate = (iso: string) => {
    setSelected(iso);
    const d = new Date(`${iso}T12:00:00`);
    setMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

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

      {/* Calendar */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <Button variant="ghost" size="icon" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{monthLabel}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => goToDate(todayISO)}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => shiftMonth(1)} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((iso, i) => {
              if (!iso) return <div key={`e${i}`} />;
              const photos = photosByDate.get(iso);
              const cover = coverPhoto(photos);
              const count = photos ? Object.keys(photos).length : 0;
              const isToday = iso === todayISO;
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={`relative aspect-square overflow-hidden rounded-md border text-xs transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/15"
                      : isToday
                        ? "border-primary/50"
                        : "border-border hover:border-primary/40"
                  }`}
                  aria-label={`${prettyDate(iso)}${count ? `, ${count} photos` : ""}`}
                >
                  {cover && (
                    <img
                      src={cover}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                      loading="lazy"
                    />
                  )}
                  <span
                    className={`absolute left-1 top-0.5 font-semibold ${cover ? "text-foreground drop-shadow" : ""}`}
                  >
                    {Number(iso.slice(8))}
                  </span>
                  {isToday && (
                    <span className="absolute inset-x-0 bottom-0.5 text-[8px] uppercase tracking-wider text-primary">
                      Today
                    </span>
                  )}
                  {count > 0 && !isToday && (
                    <span className="absolute bottom-0.5 right-1 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-5 w-5 text-primary" />
            {longDate(selected)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {selectedDay
              ? `Day ${selectedDay} · Phase ${selectedPhase!.number} — ${selectedPhase!.name}`
              : "Outside the program timeline"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPhotoList.length === 0 && (
            <p className="text-sm text-muted-foreground">No progress photos for this day.</p>
          )}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Primary angles</Label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {PRIMARY_ANGLES.map((angle) => (
                <PhotoSlot
                  key={angle}
                  angle={angle}
                  src={record?.photos?.[angle]}
                  onPick={(url) => setPhoto(selected, angle, url)}
                  onRemove={() => removePhoto(selected, angle)}
                  onView={(src) => openViewer(src)}
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
                  src={record?.photos?.[angle]}
                  onPick={(url) => setPhoto(selected, angle, url)}
                  onRemove={() => removePhoto(selected, angle)}
                  onView={(src) => openViewer(src)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Comparison
        currentDay={currentDay}
        dateForDay={dateForDay}
        getByDate={getByDate}
        onView={(src, list) => openViewer(src, list)}
      />

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
          {history.map((r) => {
            const list = PHOTO_ANGLES.filter((a) => r.photos?.[a]).map((a) => r.photos![a]!);
            return (
              <div key={r.date} className="rounded-lg border border-border p-3">
                <button onClick={() => goToDate(r.date)} className="text-left">
                  <p className="font-semibold">Day {r.programDay}</p>
                  <p className="text-xs text-muted-foreground">
                    {prettyDate(r.date)} · Phase {r.phase} · {list.length} photo{list.length === 1 ? "" : "s"}
                  </p>
                </button>
                <div className="mt-3 flex flex-wrap gap-3">
                  {PHOTO_ANGLES.filter((a) => r.photos?.[a]).map((a) => (
                    <button key={a} onClick={() => openViewer(r.photos![a]!, list)} className="space-y-1 text-left">
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
            );
          })}
        </CardContent>
      </Card>

      {viewer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-4">
          <img
            src={viewer.list[viewer.index]}
            alt="Progress photo full screen"
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setViewer(null)}
            aria-label="Close photo"
          >
            <X className="h-4 w-4" />
          </Button>
          {viewer.list.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2"
                onClick={() =>
                  setViewer((v) => v && { ...v, index: (v.index - 1 + v.list.length) % v.list.length })
                }
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2"
                onClick={() => setViewer((v) => v && { ...v, index: (v.index + 1) % v.list.length })}
                aria-label="Next photo"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
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
  onView: (dataUrl: string, list: string[]) => void;
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
          <DaySelect label="Day A" value={left} onChange={setLeft} dateForDay={dateForDay} />
          <DaySelect label="Day B" value={right} onChange={setRight} dateForDay={dateForDay} />
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

function DaySelect({
  label,
  value,
  onChange,
  dateForDay,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  dateForDay: (day: number) => string | null;
}) {
  const iso = dateForDay(value);
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
      {iso && <p className="mt-1 text-[10px] text-muted-foreground">{prettyDate(iso)}</p>}
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
  onView: (dataUrl: string, list: string[]) => void;
}) {
  return (
    <div className="space-y-1">
      {src ? (
        <button onClick={() => onView(src, [src])} className="block w-full overflow-hidden rounded-lg border border-border">
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
