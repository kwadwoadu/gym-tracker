# Backend Rules - SetFlow (Gym-Tracker)

> IndexedDB patterns, audio system, and utility functions

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary** | Database Specialist |
| **Collaborators** | Sync Specialist, Audio Engineer, Software Engineer |

---

## Database (Hybrid: Prisma + IndexedDB)

SetFlow uses a **hybrid data architecture**:
- **Prisma/PostgreSQL**: Server-side persistence, cloud sync
- **IndexedDB**: Client-side caching for offline-first experience

### Key Database Files
| File | Purpose |
|------|---------|
| `/lib/prisma.ts` | Prisma client instance |
| `/lib/queries.ts` | Database queries (Prisma-based) |
| `/prisma/schema.prisma` | Database schema definition |

### Query Patterns
```typescript
// CORRECT: Use Prisma via queries module
import { getWorkouts, getExercise } from '@/lib/queries';
const workouts = await getWorkouts(userId);
const exercise = await getExercise(exerciseId);

// WRONG: Direct Prisma in components
import { prisma } from '@/lib/prisma';
const workouts = await prisma.workout.findMany(); // Server only!
```

## Key Files
| File | Purpose |
|------|---------|
| `/lib/prisma.ts` | Prisma client singleton |
| `/lib/queries.ts` | Server-side database queries |
| `/lib/auth-helpers.ts` | 3-level Clerk auth fallback (getClerkId, getCurrentUser) |
| `/lib/jwt-utils.ts` | Shared JWT decode for Clerk __session cookie |
| `/lib/audio.ts` | Web Audio API sounds (iOS-compatible) |
| `/lib/gamification.ts` | Achievement unlocking logic |
| `/lib/api-client.ts` | API communication for sync |
| `/lib/programs.ts` | Program management logic |
| `/lib/utils.ts` | Volume calculations, 1RM estimates, helpers |

## Authentication Pattern (Vercel Edge Runtime Workaround)

**RULE: Use `getClerkId()` or `getCurrentUser()` for ALL auth access. Never call `auth()` directly.**

Clerk's `auth()` fails silently on Vercel Edge Runtime due to middleware detection bug ([clerk/javascript#2045](https://github.com/clerk/javascript/issues/2045)).

```typescript
// CORRECT: 3-level fallback
import { getClerkId } from '@/lib/auth-helpers';
const userId = await getClerkId();

// WRONG: Direct auth() - fails on Vercel
import { auth } from '@clerk/nextjs/server';
const { userId } = await auth();
```

Fallback chain: `auth()` -> `x-clerk-user-id` header (set by middleware) -> direct `__session` JWT decode.

See: `docs/solutions/security-issues/2026-03-06-clerk-vercel-auth-fallback.md`

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
- Cloud sync via `/lib/api-client.ts` and `/app/api/sync/` routes
- Clerk authentication for user identity
- Neon PostgreSQL for cloud persistence
- Device ID tracking for multi-device sync

## Common Mistakes to Avoid
- NEVER forget to await IndexedDB operations
- NEVER block render with sync operations
- NEVER play audio without user gesture (iOS will fail)
- NEVER modify db schema without version bump
- NEVER use synchronous localStorage for large data
- NEVER stack retry layers (e.g., manual loop + fetchWithRetry = 6 API calls). Single retry layer only.
- NEVER use magic numbers for timeouts/thresholds. Extract to named constants with comments.
- fetchWithRetry MUST handle both HTTP errors (401) AND network errors (fetch throws). Always wrap in try-catch.

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

*Backend Rules | Updated: March 6, 2026*
