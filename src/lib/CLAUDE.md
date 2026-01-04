# Backend Rules - SetFlow (Gym-Tracker)

> IndexedDB patterns, audio system, and utility functions

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Database Specialist |
| **Collaborators** | Sync Specialist, Audio Engineer, Software Engineer |

---

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
| `/lib/utils.ts` | Volume calculations, 1RM estimates, helpers |

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

---

## Data Protection Rules

### Workout Data is Sacred
- Never auto-delete workout logs
- Never modify historical data without consent
- Always preserve user workout history

### Schema Migrations
1. Always increment `db.version()` for changes
2. Test migration locally first
3. Handle missing fields gracefully
4. Never drop tables without explicit confirmation

### Backup Strategy
- Export function in `/lib/export.ts`
- JSON format for portability
- User-initiated backups

---

## Environment Rules

### Development
- Use browser IndexedDB directly
- Console.log for debugging
- No network required

### Production
- Same IndexedDB behavior
- Error logging to console
- Optional cloud sync (Neon)

---

## Cross-References

| Resource | Location |
|----------|----------|
| Static data | `/src/data/CLAUDE.md` |
| Audio pattern | `/docs/patterns/audio-cue-system.md` |
| Sync pattern | `/docs/patterns/pwa-offline-sync.md` |
| Components | `/src/components/CLAUDE.md` |

---

*Backend Rules | Updated: January 4, 2026*
