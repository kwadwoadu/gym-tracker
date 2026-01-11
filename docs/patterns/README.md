# SetFlow Patterns

Reusable patterns extracted from the SetFlow (gym-tracker) codebase.

## Pattern Index

| Pattern | Purpose | Key File |
|---------|---------|----------|
| [PWA Offline Sync](./pwa-offline-sync.md) | Device sync with IndexedDB | `/lib/sync.ts` |
| [Audio Cue System](./audio-cue-system.md) | iOS-compatible Web Audio | `/lib/audio.ts` |
| [Local-First Data Model](./local-first-data.md) | Dexie.js schema design | `/lib/db.ts` |
| [Workout Session Lifecycle](./workout-session-lifecycle.md) | Session start/end/save | `/lib/db.ts` |
| [Progressive Overload](./progressive-overload.md) | Weight suggestion logic | `/lib/db.ts` |
| [Time-Period Grouping](./time-period-grouping.md) | Group activities by time of day | `/data/time-periods.ts` |

## Usage

Before implementing any feature:
1. Check if a pattern exists here
2. Follow the pattern exactly
3. Document new patterns when they emerge

## Pattern Format

Each pattern includes:
- **When to Use** - Situations where pattern applies
- **Core Principle** - Problem this solves
- **Implementation** - Code examples (correct vs wrong)
- **Files Using This Pattern** - Where to find examples
- **Gotchas** - Common mistakes
- **Testing** - How to verify
