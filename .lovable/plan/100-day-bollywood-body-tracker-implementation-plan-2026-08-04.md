# 100 Day Bollywood Body Tracker — Implementation Plan

## Goal
Build a premium, mobile-first workout tracker web app called **100 Day Bollywood Body Tracker** with a dark UI (black + red), smooth animations, local-storage persistence, and PWA installability.

## Design Direction
- **Theme:** Modern dark, black backgrounds, red accent, high contrast.
- **Typography:** Clean sans-serif, mobile-first sizing.
- **Motion:** Subtle page fades, card hover lifts, progress-ring animations, button press feedback.
- **Layout:** Dashboard grid, bottom tab bar on mobile, sidebar on desktop.

## Phase 1 — Foundation & Shell
1. Update `src/styles.css` with custom black/red tokens, animations, and dark-mode defaults.
2. Replace `src/routes/index.tsx` with the dashboard home page.
3. Add app routes: `/workout`, `/history`, `/nutrition`, `/measurements`, `/profile`.
4. Create shared layout with header, mobile bottom nav, and desktop sidebar.
5. Add PWA manifest and icons for installability.
6. Set up local-storage schema and hooks for workouts, nutrition, measurements, and settings.

## Phase 2 — Dashboard
1. Show current phase, current day (36–63), and today's workout.
2. Display workout streak, weight progress, and a circular progress ring for days 36–63.
3. Add macro tiles: calories, protein, water, sleep, cardio minutes.
4. Build weekly completion calendar.
5. Pre-load the 28-day split (Push/Pull/Legs/Rest/Chest+Back/Arms&Delts/Rest, repeating).

## Phase 3 — Workout Logger
1. Build workout start flow from the dashboard.
2. Load the correct exercises for the current day.
3. For each exercise capture: equipment, notes, 3 required sets (weight/reps), optional 4th set, RPE, PR flag, completed flag.
4. Support superset/drop-set/giant-set markers and progressive-overload hints from previous sessions.
5. Store completed workouts in local storage.

## Phase 4 — Analytics & Charts
1. Body-weight line chart.
2. Workout-volume chart over time.
3. Strength progression per exercise.
4. Weekly dashboard summary charts.

## Phase 5 — Nutrition, Cardio & Measurements
1. Nutrition logger: calories, protein, carbs, fat, water, sleep.
2. Cardio timers: sprint (interval) and LISS (steady-state) timers.
3. Measurements logger: chest, waist, arms, thighs, calves.
4. Progress-photo upload with local preview/storage.

## Phase 6 — Export & Polish
1. Export workout history and measurements to PDF.
2. Export data to Excel/CSV.
3. Final responsive pass, animation polish, and performance check.

## Tech Stack
- TanStack Start + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Recharts for charts
- jsPDF + xlsx for export
- Local Storage for persistence
- PWA manifest for installability

## Out of Scope for This Plan
- Backend/Supabase integration
- Real user authentication
- Cloud sync or social features
