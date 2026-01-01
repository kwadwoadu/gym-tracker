# SetFlow Technical Architecture

> PWA for tracking gym workouts with progressive overload

---

## System Overview

SetFlow is an offline-first Progressive Web App built for gym environments where network connectivity is unreliable. All data is stored locally using IndexedDB (via Dexie.js), with optional sync between devices.

```
┌─────────────────────────────────────────────────────────────────┐
│                           Browser                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │   React 19    │  │  Dexie.js     │  │ Web Audio API │       │
│  │   Next.js 15  │  │  (IndexedDB)  │  │  (Sounds)     │       │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘       │
│          │                  │                  │                │
│  ┌───────┴──────────────────┴──────────────────┴───────┐       │
│  │                    Service Worker                    │       │
│  │                 (Offline Caching)                    │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │      Vercel       │
                    │    (Hosting)      │
                    └───────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15 (App Router) |
| UI Library | React | 19 |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | Latest |
| Animations | Framer Motion | 11 |
| Database | Dexie.js (IndexedDB) | 4 |
| PWA | @ducanh2912/next-pwa | Latest |
| Charts | Recharts | 2 |
| Audio | Web Audio API | Native |
| Auth | Clerk | Latest |
| Hosting | Vercel | - |

---

## Application Layers

### 1. Presentation Layer (`/src/app/`, `/src/components/`)

```
/src/app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home/Dashboard
├── workout/
│   └── page.tsx        # Active workout session
├── programs/
│   └── page.tsx        # Training program browser
├── stats/
│   └── page.tsx        # Progress charts
└── settings/
    └── page.tsx        # User preferences

/src/components/
├── ui/                 # shadcn/ui primitives
├── workout/            # Workout-specific components
│   ├── exercise-card.tsx
│   ├── set-logger.tsx
│   ├── rest-timer.tsx
│   └── session-summary.tsx
├── stats/              # Charts and progress
│   ├── weight-chart.tsx
│   ├── volume-chart.tsx
│   └── pr-board.tsx
└── shared/             # Reusable components
    ├── navigation.tsx
    └── bottom-nav.tsx
```

### 2. Data Layer (`/src/lib/db.ts`)

```typescript
// Dexie.js Schema
const db = new Dexie('SetFlowDB')

db.version(1).stores({
  exercises: 'id, name, *muscleGroups',
  programs: 'id, name',
  trainingDays: 'id, programId, name',
  workoutLogs: 'id, date, dayId',
  setLogs: 'id, workoutLogId, exerciseId, setNumber',
  userSettings: 'id'
})
```

### 3. Audio Layer (`/src/lib/audio.ts`)

```typescript
// Web Audio API for timer sounds
class AudioManager {
  private context: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()

  async init(): Promise<void>
  play(soundName: string, volume?: number): void
  async resume(): Promise<void>  // iOS requires user gesture
}
```

### 4. PWA Layer (`next.config.ts`, `/public/manifest.json`)

```typescript
// next.config.ts
import withPWA from '@ducanh2912/next-pwa'

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})(nextConfig)
```

---

## Data Model

### Core Entities

```
┌─────────────────┐     ┌─────────────────┐
│    Exercise     │     │    Program      │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ name            │     │ name            │
│ muscleGroups    │     │ description     │
│ equipment       │     │ goal            │
│ videoUrl        │     │ level           │
│ formCues[]      │     │ daysPerWeek     │
│ defaults{}      │     └────────┬────────┘
└─────────────────┘              │
                                 │ has many
                                 ▼
┌─────────────────┐     ┌─────────────────┐
│    Superset     │◄────│  TrainingDay    │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ label (A/B/C)   │     │ programId       │
│ exercises[]     │     │ name            │
└─────────────────┘     │ supersets[]     │
                        │ warmup[]        │
                        │ finisher[]      │
                        └─────────────────┘
                                 │
                                 │ logs as
                                 ▼
┌─────────────────┐     ┌─────────────────┐
│    SetLog       │◄────│  WorkoutLog     │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ workoutLogId    │     │ date            │
│ exerciseId      │     │ dayId           │
│ setNumber       │     │ duration        │
│ weight          │     │ notes           │
│ reps            │     │ completed       │
│ rpe             │     └─────────────────┘
└─────────────────┘
```

### Tempo Notation (T:XYZW)

| Position | Meaning | Values |
|----------|---------|--------|
| X | Eccentric (lowering) | 0-9 seconds |
| Y | Pause at bottom | 0-9 seconds |
| Z | Concentric (lifting) | 0-9, X (explosive), A (controlled) |
| W | Pause at top | 0-9 seconds |

Example: `T:30A1` = 3s down, no pause, controlled up, 1s squeeze

---

## Key Flows

### Workout Session Flow

```
User starts workout
        │
        ▼
┌───────────────────┐
│ Load TrainingDay  │ ── From IndexedDB
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Display Exercise  │ ── With tempo, target reps
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  [START SET]      │ ── User performs set
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Log Weight/Reps   │ ── Save to SetLog
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Rest Timer       │ ── Audio countdown
│  (countdown)      │
└─────────┬─────────┘
          │
          ▼
    [Next Set or Exercise]
          │
          ▼
┌───────────────────┐
│ Session Complete  │ ── Summary + save WorkoutLog
└───────────────────┘
```

### Progressive Overload Suggestion Flow

```
User logs set
        │
        ▼
┌───────────────────┐
│ Analyze History   │ ── Last 3 sessions
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Check Criteria:   │
│ - All sets at max │
│ - RPE < 9         │
│ - 2+ sessions     │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
[Met]       [Not Met]
    │           │
    ▼           │
┌───────────┐   │
│ Show      │   │
│ Suggestion│   │
│ +2.5kg ↑  │   │
└───────────┘   │
                │
                ▼
          [No Action]
```

---

## Offline-First Strategy

### What's Cached

| Resource | Strategy | Duration |
|----------|----------|----------|
| App shell (HTML, CSS, JS) | Precache | Forever (until new deploy) |
| Static assets | Precache | Forever |
| Program data | IndexedDB | Forever (user data) |
| Workout logs | IndexedDB | Forever (user data) |
| Audio files | Runtime cache | 30 days |

### Sync Strategy (Cross-Device)

Since there's no backend, sync works via URL-based data sharing:

```
Device A                    Device B
    │                           │
    ▼                           │
Export to JSON                  │
    │                           │
    ▼                           │
Compress (LZ-string)            │
    │                           │
    ▼                           │
Generate URL or QR              │
    │                           │
    ────────────────────────────│
    │                           ▼
    │                     Scan/Open URL
    │                           │
    │                           ▼
    │                     Decompress
    │                           │
    │                           ▼
    │                     Import to IndexedDB
```

---

## iOS PWA Considerations

### Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| AudioContext suspended | Resume on first user touch |
| No vibration API | Use audio cues instead |
| Storage limits | Monitor quota, warn at 80% |
| No background sync | Rely on foreground operations |
| No push notifications | N/A for MVP |

### iOS Audio Handling

```typescript
// Resume AudioContext on first user interaction
useEffect(() => {
  const handleInteraction = async () => {
    await audioManager.resume()
    document.removeEventListener('touchstart', handleInteraction)
  }

  document.addEventListener('touchstart', handleInteraction, { once: true })

  return () => {
    document.removeEventListener('touchstart', handleInteraction)
  }
}, [])
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Animation FPS | 60fps |

### Bundle Size Budget

| Category | Budget |
|----------|--------|
| JavaScript (gzipped) | < 150KB |
| CSS (gzipped) | < 30KB |
| Audio files | < 500KB total |
| PWA manifest + icons | < 100KB |

---

## Security Considerations

### Data Protection

- All data stored locally (no cloud transmission)
- Optional Clerk auth for future cloud features
- No PII beyond what user enters

### PWA Security

- HTTPS required for service workers
- Content Security Policy configured
- No external API calls (offline-first)

---

## File Structure Summary

```
/gym-tracker/
├── CLAUDE.md                   # Project brain
├── agents/                     # 13 AI agents
│   ├── CLAUDE.md               # Orchestration rules
│   ├── setflow-lead.md         # Tier 0
│   ├── [technical agents]      # Tier 1 (5)
│   ├── [fitness agents]        # Tier 2 (6)
│   └── prd-specialist.md       # Tier 3
├── skills/                     # Reusable workflows
│   ├── CLAUDE.md               # Skills index
│   ├── exercise-creation.md
│   ├── program-creation.md
│   └── progression-logic.md
├── docs/
│   ├── architecture.md         # This file
│   └── prds/                   # Feature specifications
├── src/
│   ├── app/                    # Next.js 15 App Router
│   ├── components/             # React components
│   ├── lib/                    # Utilities (db, audio)
│   └── data/                   # Static data (exercises, programs)
└── public/
    ├── manifest.json           # PWA manifest
    ├── icons/                  # PWA icons
    └── sounds/                 # Audio files
```

---

## Development Workflow

### Local Development

```bash
npm run dev     # Start Next.js dev server
# PWA disabled in development mode
```

### Production Build

```bash
npm run build   # Generate production build
npm run start   # Test production locally
# PWA enabled, service worker active
```

### Deployment

```bash
git push origin main
# Vercel auto-deploys from main branch
```

---

*SetFlow Architecture | Version 1.0 | January 1, 2026*
