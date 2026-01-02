# Backend Rules - SetFlow (Gym-Tracker)

## Database (IndexedDB via Dexie)
- All data in `/lib/db.ts` (main database module)
- Tables: exercises, workouts, sets, programs, achievements, settings
- NEVER modify schema without incrementing db.version()

## Query Patterns
```typescript
// CORRECT: Use Dexie methods
const workouts = await db.workouts.where('date').above(lastWeek).toArray();
const exercise = await db.exercises.get(exerciseId);

// WRONG: Direct IndexedDB access
const workouts = indexedDB.transaction('workouts')...;
```

## Key Files
| File | Purpose |
|------|---------|
| `/lib/db.ts` | IndexedDB schema + all database operations |
| `/lib/audio.ts` | Web Audio API sounds (iOS-compatible) |
| `/lib/gamification.ts` | Achievement unlocking logic |
| `/lib/sync.ts` | Cross-device sync via URL/QR |
| `/lib/calculations.ts` | Volume, 1RM estimates |

## Offline Requirements
- NEVER assume network availability
- All operations MUST work offline
- Sync is optional enhancement, not requirement
- Graceful degradation when sync fails

## Audio System
```typescript
// CORRECT: Use the audio module
import { playSound } from '@/lib/audio';
await playSound('rest-complete');

// Available sounds: set-start, rest-warning, rest-complete, workout-complete, pr-celebration
```

**iOS Quirks:**
- AudioContext requires user interaction to start
- Resume AudioContext on first touch event
- Use Web Audio API, not HTML5 audio elements

## Progressive Overload Logic
- Track last weight used per exercise (global weight memory)
- Suggest weight increases after consistent performance
- ChallengeCard prompts when ready to progress

## Gamification System
- 25+ achievements defined in `/data/achievements.ts`
- Achievement tiers: bronze, silver, gold
- Track: workouts, volume, PRs, streaks
- Unlock via `/lib/gamification.ts`

## Sync System
- Export data to URL (compressed JSON)
- Import via QR code scan or URL paste
- Optional Neon database for cloud sync
- Device ID tracking for multi-device

## Common Mistakes to Avoid
- NEVER forget to await IndexedDB operations
- NEVER block render with sync operations
- NEVER play audio without user gesture (iOS will fail)
- NEVER modify db schema without version bump
- NEVER use synchronous localStorage for large data
