# SetFlow - Project Brain

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

---

## Pattern-Driven Development

Patterns live in `/docs/patterns/`. Before implementing:
1. Check if a pattern exists
2. Follow the pattern exactly
3. If creating new patterns, document them

### Available Patterns

| Pattern | Purpose |
|---------|---------|
| [PWA Offline Sync](/docs/patterns/pwa-offline-sync.md) | Device sync with IndexedDB |
| [Audio Cue System](/docs/patterns/audio-cue-system.md) | iOS-compatible Web Audio |
| [Local-First Data Model](/docs/patterns/local-first-data.md) | Dexie.js schema design |
| [Workout Session Lifecycle](/docs/patterns/workout-session-lifecycle.md) | Session start/end/save |
| [Progressive Overload](/docs/patterns/progressive-overload.md) | Weight suggestion logic |

Pattern files include: when to use, implementation, gotchas, testing.

---

## Agent Team

SetFlow has a dedicated 14-agent team organized in 4 tiers. See `/agents/CLAUDE.md` for full routing and workflows.

### Architecture
```
                    ┌──────────────────┐
                    │   SetFlow Lead   │
                    │  (Orchestrator)  │
                    └────────┬─────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
     ▼                       ▼                       ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  TECHNICAL  │      │   FITNESS   │      │   SUPPORT   │
│  (6 agents) │      │  (6 agents) │      │  (1 agent)  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Tier 0: Orchestration
| Agent | Purpose |
|-------|---------|
| SetFlow Lead | Coordination, routing, decisions |

### Tier 1: Technical (6 agents)
| Agent | Purpose |
|-------|---------|
| Software Engineer | Full-stack Next.js 15 implementation |
| Frontend Specialist | React 19, shadcn/ui, dark theme |
| PWA Specialist | Offline-first, iOS quirks, service workers |
| Database Specialist | Prisma, PostgreSQL, data layer |
| Sync Specialist | Cross-device sync, Clerk auth, cloud sync |
| Debugger | Bug investigation, root cause analysis |

### Tier 2: Fitness Domain (6 agents)
| Agent | Purpose |
|-------|---------|
| Periodization Specialist | Program design, progressive overload, deloads |
| Injury & Rehab Specialist | Injury modifications, rehabilitation protocols |
| Movement Specialist | Form cues, mobility, warm-up/cooldown |
| Action Sports Coach | Snowboarding, surfing, skiing conditioning |
| Progress Analyst | Data analysis, plateau detection, PR prediction |
| Audio Engineer | Web Audio API, timer sounds, haptics fallback |

### Tier 3: Support (1 agent)
| Agent | Purpose |
|-------|---------|
| PRD Specialist | Feature specs, acceptance criteria |

### AduOS Integration (Hybrid Model)

SetFlow leverages AduOS core agents for expertise outside project scope:
- **Wellness Director** - Whoop integration, holistic health planning
- **Fitness Coach (AduOS)** - General training philosophy
- **Health Coach** - Nutrition timing, recovery optimization
- **Technical Lead** - Complex architecture decisions
- **Code Reviewer** - Before PRs, quality gates
- **Security Specialist** - Clerk auth, data protection

---

## Domain Linkage

**Primary Domain**: Health
**Secondary Domain**: Career (potential product)

---

## Default Program Structure

The app comes pre-loaded with a Full Body Training program:
- Day 1: Full Body A
- Day 2: Full Body B
- Day 3: Full Body C

Each day can have:
- Warmup exercises
- Multiple supersets with exercises
- Finisher exercises

Users can add/remove training days and customize the program to their needs.

## Related Files
- Design inspiration: `/assets/Gym Mode screens/`
- Program data: `/src/data/program.json`

---

## Environment Safety Rules

### Data Protection
- **Workout logs are sacred** - Never auto-delete workout data
- **PRs are permanent** - Never recalculate without user consent
- **IndexedDB versioning** - Always increment version for schema changes
- **Confirm before destructive** - Get explicit approval for data deletion

### PWA Testing Protocol
Before any deploy, verify:
- [ ] App works completely offline (airplane mode test)
- [ ] Audio plays on iOS Safari (first interaction trigger)
- [ ] Data persists after app close and reopen
- [ ] Session survives power loss (6-hour expiry)
- [ ] Add to home screen works on iOS and Android

### Development Environment
- **Local**: IndexedDB in browser, no network needed
- **Production**: Vercel + optional Neon PostgreSQL for sync
- **Never** push schema changes without local testing

---

## Proactive Behavior Triggers

| Event | Agent(s) to Invoke | Action |
|-------|-------------------|--------|
| New exercise added | Movement Specialist -> Database Specialist | Validate muscle groups, add to exercises.json |
| PWA bug reported | PWA Specialist -> Debugger | Check iOS quirks first |
| Audio not playing | Audio Engineer -> PWA Specialist | Verify Web Audio context |
| Sync failing | Sync Specialist -> Database Specialist | Check auth, network, data format |
| Performance issue | Frontend Specialist -> Software Engineer | Profile animations, check 60fps |
| New program needed | Periodization Specialist -> Action Sports Coach | Design appropriate periodization |
| User hit plateau | Progress Analyst -> Periodization Specialist | Analyze data, recommend changes |
| Injury reported | Injury & Rehab Specialist -> Movement Specialist | Provide modifications |

---

## Collaboration Contract

### Before Any Task
1. **Restate understanding** - Confirm what needs to be built
2. **Check offline compatibility** - Will this work without network?
3. **Verify iOS PWA compatibility** - Any iOS-specific quirks?
4. **Check existing patterns** - Is there a pattern in `/docs/patterns/`?
5. **Review touch targets** - Are all targets 44px+ minimum?

### After Task Completion
1. **Brief summary** - What was done
2. **Test offline** - Verify works without network
3. **Update CHANGELOG.md** - Document significant changes
4. **List files modified** - For tracking
5. **Note follow-up actions** - What else might be needed

### Commit Attribution
All commits: `Kwadwo Adu <kwadwo.adu@signkit.io>` (no Claude Code attribution)

---

## Documentation Map

| Document | Location | Purpose |
|----------|----------|---------|
| **Project Brain** | `/CLAUDE.md` | This file - overview and rules |
| **Agents** | `/agents/CLAUDE.md` | 14-agent team, routing, workflows |
| **Components** | `/src/components/CLAUDE.md` | UI component architecture |
| **App Routes** | `/src/app/CLAUDE.md` | Next.js routing conventions |
| **Database** | `/src/lib/CLAUDE.md` | IndexedDB and Dexie patterns |
| **Static Data** | `/src/data/CLAUDE.md` | Exercises, programs, achievements |
| **Prisma** | `/prisma/CLAUDE.md` | Schema safety and migrations |
| **Public Assets** | `/public/CLAUDE.md` | PWA icons, sounds, manifest |
| **Patterns** | `/docs/patterns/CLAUDE.md` | Reusable implementation patterns |
| **Docs** | `/docs/CLAUDE.md` | PRDs and documentation rules |
| **Roadmap** | `/roadmap/CLAUDE.md` | Feature planning |
| **Skills** | `/skills/CLAUDE.md` | Reusable workflows |
| **Inspiration** | `/inspiration/CLAUDE.md` | Design reference |

---

## AduOS Integration

### Health Domain Connection
SetFlow is part of the Health domain in AduOS:
- Training data feeds into Wellness Director planning
- Whoop recovery data can inform workout intensity
- Goals tracked in `/domains/health/goals.md`

### Daily Rhythm
- Morning briefing may include workout recommendation
- Evening reflection may include workout summary
- Weekly review includes training volume analysis

---

*Created: 2025-12-27*
*Updated: 2026-01-04*
