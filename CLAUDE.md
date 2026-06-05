# LiftOff — Obsidian Plugin

Mobile-first gym workout tracker. Logs workouts as plain markdown files in the vault (YAML frontmatter + rendered body). This is a personal fork of `hpasic/obsidian-liftoff`.

## Build & test

```bash
npm install
npm run build       # tsc type-check + esbuild production bundle → main.js
npm run dev         # esbuild watch mode (no type-check, faster iteration)
npm test            # vitest (unit tests only, no Obsidian runtime needed)
npm run test:watch  # vitest watch
npm run lint        # eslint src/
```

Node version: 25 (see `.nvmrc`). TypeScript 5, ESNext modules, bundled to CJS by esbuild.

## Deploying to a test vault

Copy three files to `.obsidian/plugins/liftoff/` in the test vault:
- `main.js`
- `manifest.json`
- `styles.css`

Reload: toggle the plugin off/on in Community Plugins, or use **Reload app without saving**.

## Hard constraints

- **Mobile-safe**: no Node-only APIs (`fs`, `path`, `child_process`). Use Obsidian vault/metadata APIs only.
- **`isDesktopOnly: false`** in `manifest.json` — do not change.
- **No external services**: all data stays as markdown in the vault.

## Architecture

```
src/
  main.ts                  Plugin entry point, settings, active-workout persistence
  types.ts                 All shared TypeScript types
  views/
    home-view.ts           Home screen (templates, recent workouts)
    workout-view.ts        Active workout logging screen
    timer-view.ts          Rest timer modal
  components/
    exercise-card.ts       One card per exercise in the workout view
    exercise-picker.ts     Modal: search/create exercises during a workout
    exercise-library.ts    Modal: manage the exercise library
    set-row.ts             Single weight×reps input row
    timer-block.ts         Interval timer widget (for "timer" exercises)
    cardio-block.ts        Count-up stopwatch widget (for "cardio" exercises)
    timer-display.ts       Rest timer countdown widget
    modals.ts              Reusable confirm/text-input modals
    template-editor.ts     Template editor modal
  storage/
    workout-store.ts       Read/write workout markdown files
    template-store.ts      Read/write template markdown files
  utils/
    frontmatter.ts         Serialize/deserialize workout ↔ markdown
    duration.ts            formatDuration(seconds) / parseDuration("mm:ss")
    filename.ts            Workout filename generation
    history.ts             Look up last exercise data from recent workouts
tests/
  utils/                   Pure unit tests (no Obsidian runtime)
  mocks/obsidian.ts        Minimal Obsidian API mock for tests
```

## Data model

Every workout is a markdown file: YAML frontmatter (source of truth for data) + a rendered body (display only — never parsed back).

**Exercise types** (`ExerciseType = "weight" | "timer" | "cardio"`):

| Type | Frontmatter fields | Body render |
|------|-------------------|-------------|
| `weight` | `sets: [{weight, reps, unit}]` | table: Set / Weight / Reps |
| `timer` | `exerciseType: timer`, `workSeconds`, `restSeconds`, `intervals` | `Intervals: N × m:ss work / m:ss rest` |
| `cardio` | `exerciseType: cardio`, `duration: "mm:ss"` | `Duration: mm:ss` |

**Duration format**: `mm:ss` strings everywhere on disk and in UI (e.g. `5:00`, `75:00`). Internal runtime representation is whole seconds (integer). Helpers: `formatDuration` / `parseDuration` in `src/utils/duration.ts`.

## Key flows

- **Add exercise** → `ExercisePickerModal` → `WorkoutView.addExercise()` → pushes `Exercise` onto `workout.exercises` → `renderWorkout()`
- **Log set** (weight) → `SetRow` checkbox → `onSetCompleted` → rest timer starts
- **Log cardio** → `CardioBlock` start/stop stopwatch → `onChanged` callback → sets `exercise.duration`
- **Finish workout** → `finishWorkout()` filters out exercises with no completed sets (weight/timer) or no duration (cardio) → `workoutStore.saveWorkout()` → `workoutToFullMarkdown()`
- **Parse workout** → `workout-store.ts parseWorkoutFile()` reads `metadataCache` (YAML only)

## Exercise library

Stored in `plugin.settings.exerciseLibrary: ExerciseLibraryEntry[]` (Obsidian plugin settings, not in vault files). Entries are created on first use and can be edited via the Exercise Library modal.
