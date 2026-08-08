export const PHOTO_ANGLES = ["front", "side", "back", "relaxed", "flexed"] as const;
export type PhotoAngle = (typeof PHOTO_ANGLES)[number];

export const PRIMARY_ANGLES: PhotoAngle[] = ["front", "side", "back"];
export const OPTIONAL_ANGLES: PhotoAngle[] = ["relaxed", "flexed"];

export const ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  relaxed: "Relaxed",
  flexed: "Flexed",
};

export const STEP_GOAL = 10000;

/** Free-form extra photo for a date (Gym, Abs, custom pose, …). */
export interface ExtraPhoto {
  id: string;
  label: string;
  url: string;
}

export interface DailyRecord {
  /** ISO calendar date (YYYY-MM-DD) — the primary key of the record. */
  date: string;
  programDay: number;
  phase: number;
  steps: number;
  photos: Partial<Record<PhotoAngle, string>>;
  extras?: ExtraPhoto[];
}

export function emptyRecord(date: string, programDay: number, phase: number): DailyRecord {
  return { date, programDay, phase, steps: 0, photos: {}, extras: [] };
}

export function stepStats(steps: number) {
  const percent = Math.round((steps / STEP_GOAL) * 1000) / 10;
  return {
    percent,
    completed: steps >= STEP_GOAL,
    remaining: Math.max(0, STEP_GOAL - steps),
    barPercent: Math.min(100, percent),
  };
}

/** Downscale + compress an image file to a data URL so it fits in local storage. */
export function fileToCompressedDataUrl(file: File, maxSize = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
