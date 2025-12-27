# Gym Tracker - Project Brain

> PWA for tracking gym workouts with progressive overload

## Project Summary

A Progressive Web App for iOS/Android that helps track gym workouts with:
- Training program management (supersets, tempo, rest timers)
- Progressive overload suggestions (auto-suggest weight increases)
- Workout session logging with audio feedback
- Stats and progress visualization
- Shareable via URL (no app store required)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Storage | IndexedDB (Dexie.js) |
| PWA | @ducanh2912/next-pwa |
| Charts | Recharts |
| Audio | Web Audio API |
| Hosting | Vercel |

## Design System

### Colors (Dark-first)
- Background: `#0A0A0A` (primary), `#1A1A1A` (cards), `#2A2A2A` (inputs)
- Accent: `#CDFF00` (lime/yellow) - CTAs, timers, highlights
- Text: `#FFFFFF` (primary), `#A0A0A0` (secondary), `#666666` (muted)
- Success: `#22C55E` | Warning: `#F59E0B` | Error: `#EF4444`

### Typography
- Font: Inter (system fallback)
- H1: 32px Bold | H2: 24px Semibold | H3: 18px Medium
- Body: 16px | Caption: 14px | Small: 12px

### Touch Targets
- Minimum: 44x44px
- Large CTAs: 56px height
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px

## Data Model

### Core Entities
- **Exercise**: id, name, videoUrl, muscleGroups, equipment
- **TrainingDay**: id, name, supersets[], warmup[], finisher[]
- **Superset**: id, label (A/B/C), exercises[]
- **SupersetExercise**: exerciseId, sets, reps, tempo, restSeconds
- **WorkoutLog**: id, date, dayId, sets[], duration, notes
- **SetLog**: exerciseId, setNumber, weight, reps, rpe

### Tempo Notation (T:XYZW)
- X = Eccentric (lowering) seconds
- Y = Pause at bottom
- Z = Concentric (X=explosive, A=controlled)
- W = Pause at top
- Example: T:30A1 = 3s down, no pause, controlled up, 1s squeeze

## Key Features

### 1. Training Program View
- Day selector (Day 1, 2, 3)
- Superset pairs (A1/A2, B1/B2, C1/C2)
- Exercise cards with video thumbnails
- Tempo guide per exercise

### 2. Workout Session
- Start workout button
- Current exercise with "START SET" button
- Circular rest timer with audio cues
- Rep/weight logging per set
- Progressive overload suggestions
- Session summary on complete

### 3. Stats & Progress
- Weight progression charts
- PR tracking
- Calendar view of completed workouts

## Audio Feedback (No Vibration on iOS)

| Event | Sound |
|-------|-------|
| Set started | Short beep |
| 10 seconds left | Warning tone |
| Rest complete | Alarm sound |
| Workout complete | Success chime |
| PR achieved | Celebration sound |

## File Structure

```
/gym-tracker/
├── CLAUDE.md           # This file
├── agents/             # AI agents
├── docs/prds/          # Feature specs
├── inspiration/        # Design screenshots
├── src/
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   │   ├── ui/         # shadcn components
│   │   ├── workout/    # Workout-specific
│   │   ├── stats/      # Stats/charts
│   │   └── shared/     # Shared components
│   ├── lib/            # Utilities, DB, audio
│   └── data/           # Static data (exercises, programs)
└── public/
    ├── icons/          # PWA icons
    ├── sounds/         # Audio files
    └── manifest.json   # PWA manifest
```

## Development Rules

1. **Dark mode only** - No light theme needed
2. **Offline-first** - All data in IndexedDB
3. **Touch-friendly** - Large targets, no hover states
4. **Performance** - Smooth 60fps animations
5. **Audio feedback** - Web Audio API for timer cues

## NPT Program Structure

The app is pre-loaded with Kwadwo's NPT 3-Day Full Body Hypertrophy program:
- Day 1: Full Body A (Mon)
- Day 2: Full Body B (Tue)
- Day 3: Full Body C (Thu)

Each day has:
- Warmup exercises
- 3 supersets (A, B, C) with 2 exercises each
- Finisher (dead hang for spine decompression)

## Related Files
- Design inspiration: `/assets/Gym Mode screens/`
- NPT program data: `/domains/health/training-program.md`
- Plan: `~/.claude/plans/foamy-wandering-rossum.md`

---
*Created: 2025-12-27*
