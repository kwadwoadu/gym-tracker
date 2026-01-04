# SetFlow v2 - Critical Fixes PRD

**Status**: Not Started
**Created**: 2026-01-04
**Author**: Kwadwo Adu
**Priority**: High

---

## Problem Statement

SetFlow v2 has shipped with six issues that impact user experience and reliability. This PRD addresses critical bugs (reset function, cross-device resume), medium-priority UX gaps (exercise videos, skip buttons), and minor polish items (weight memory visibility, manifest auth).

### Issue Summary

| # | Issue | Priority | Impact |
|---|-------|----------|--------|
| 1 | Reset function returns 500 | HIGH | Users cannot reset their program |
| 2 | Exercise videos missing | MEDIUM | No tutorial videos for 97 exercises |
| 3 | Cross-device workout resume | HIGH | Cannot continue workout on different device |
| 4 | Skip button missing | MEDIUM | Forced to complete everything |
| 5 | Weight memory not obvious | LOW | Feature exists but users don't notice |
| 6 | Manifest.json 401 error | LOW | PWA installation may fail |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Reset success rate | 100% | No 500 errors on /api/seed reset action |
| Cross-device resume | Works | Session persists in PostgreSQL, resumable on any device |
| Videos populated | 97/97 | All exercises have valid YouTube videoUrl |
| Skip tracking | Accurate | Skipped items tracked in workout logs |
| PWA installability | 100% | manifest.json returns 200 for all users |

---

## Technical Implementation

### Issue 1: Reset Function Failing (HIGH)

#### Root Cause
The `resetToDefault()` function in `/src/lib/seed.ts` deletes workouts, PRs, and programs one-by-one in separate loops. This is fragile because:
1. No transaction - partial failures leave orphaned data
2. Sequential API calls - slow and timeout-prone
3. No batch operations - N+1 delete pattern

#### Current Implementation (Broken)
```typescript
// src/lib/seed.ts - lines 301-353
export async function resetToDefault(): Promise<void> {
  // Delete all workout logs ONE BY ONE
  const workouts = await workoutLogsApi.list();
  for (const workout of workouts) {
    await workoutLogsApi.delete(workout.id);
  }

  // Delete all personal records ONE BY ONE
  const prs = await personalRecordsApi.list();
  for (const pr of prs) {
    await personalRecordsApi.delete(pr.id);
  }

  // Delete all programs ONE BY ONE
  const programs = await programsApi.list();
  for (const program of programs) {
    await programsApi.delete(program.id);
  }
  // ... continues
}
```

#### Proposed Solution

1. **Create batch delete endpoint**: `/api/reset` that uses Prisma transactions
2. **Use `deleteMany` instead of loops**: Atomic batch operations
3. **Add proper error handling**: Rollback on failure

```typescript
// NEW: /src/app/api/reset/route.ts
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.$transaction(async (tx) => {
      // Batch delete in correct order (cascade)
      await tx.personalRecord.deleteMany({ where: { userId: user.id } });
      await tx.workoutLog.deleteMany({ where: { userId: user.id } });
      await tx.trainingDay.deleteMany({ where: { program: { userId: user.id } } });
      await tx.program.deleteMany({ where: { userId: user.id } });
      await tx.achievement.deleteMany({ where: { userId: user.id } });
    });

    // Re-seed default program
    await installDefaultProgram(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset failed:", error);
    return NextResponse.json({ error: "Reset failed", details: String(error) }, { status: 500 });
  }
}
```

#### Files to Modify
| File | Change |
|------|--------|
| `src/app/api/reset/route.ts` | NEW - Batch reset endpoint |
| `src/lib/seed.ts` | Update resetToDefault to use batch operations |
| `src/app/settings/page.tsx` | Update reset button to call new endpoint |

---

### Issue 2: Exercise Videos Missing (MEDIUM)

#### Root Cause
All 97 exercises in `/src/data/exercises.json` have `videoUrl: null`. The YouTube player component exists but has no data.

#### Current State
```json
{
  "id": "ex-barbell-bench",
  "name": "Barbell Bench Press",
  "muscleGroups": ["chest", "triceps", "shoulders"],
  "equipment": "barbell",
  "isCustom": false
  // NOTE: videoUrl field is missing entirely
}
```

#### Proposed Solution

1. **Add videoUrl to exercises.json**: Populate with YouTube tutorial links
2. **Use high-quality sources**: Prefer channels like Jeff Nippard, Athlean-X, Renaissance Periodization
3. **Short-form preferred**: 1-3 minute focused tutorials

```json
{
  "id": "ex-barbell-bench",
  "name": "Barbell Bench Press",
  "muscleGroups": ["chest", "triceps", "shoulders"],
  "equipment": "barbell",
  "isCustom": false,
  "videoUrl": "https://www.youtube.com/watch?v=rT7DgCr-3pg"
}
```

#### Video Sources (in priority order)
1. **Nordic Performance Training** (primary - public channel)
2. Jeff Nippard (fallback)
3. Athlean-X (fallback)
4. Renaissance Periodization (fallback)

#### Video Selection Criteria
- Max 3 minutes (prefer under 2 min)
- Form-focused, not promotional
- High production quality
- Clear demonstration angle
- No excessive ads/sponsors in video
- **Verify all links work before committing**

#### Files to Modify
| File | Change |
|------|--------|
| `src/data/exercises.json` | Add videoUrl to all 97 exercises |
| `src/lib/seed.ts` | Ensure videoUrl is included in seeding |

---

### Issue 3: Cross-Device Workout Resume (HIGH)

#### Root Cause
Active workout sessions are stored in `localStorage` which is device-specific. The current implementation uses `SESSION_KEY_PREFIX` in the workout page:

```typescript
// src/app/workout/[dayId]/page.tsx - lines 136-137
const SESSION_KEY_PREFIX = "setflow-session-";
const SESSION_EXPIRY_HOURS = 6;
```

#### Current Flow (Broken)
1. User starts workout on Phone A
2. Session saved to localStorage on Phone A
3. User switches to Tablet B
4. Tablet B has no session data - must start fresh

#### Proposed Solution

1. **New Prisma model**: `ActiveSession` to store in-progress workouts
2. **Sync on login**: Check for active session when app loads
3. **Resume prompt**: Show dialog if active session exists on different device
4. **Session ownership**: Only one active session per user at a time

```prisma
// prisma/schema.prisma - NEW MODEL
model ActiveSession {
  id              String   @id @default(cuid())
  dayId           String
  phase           String   // "warmup" | "exercise" | "rest" | "finisher"
  workoutState    Json     // {supersetIndex, exerciseIndex, setNumber}
  completedSets   Json     // SetLog[]
  warmupChecked   Json     // boolean[]
  finisherChecked Json     // boolean[]
  currentVolume   Float    @default(0)
  startTime       DateTime
  lastUpdated     DateTime @updatedAt
  deviceId        String?  // Optional device identifier

  userId          String   @unique // Only one active session per user
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/session` | GET | Get active session for current user |
| `/api/session` | POST | Create/update active session |
| `/api/session` | DELETE | Clear active session (on complete) |

#### Resume Flow
```
App Load
    |
    v
Check /api/session
    |
    +--> No active session --> Normal flow
    |
    +--> Active session exists
             |
             +--> Same device --> Auto-resume
             |
             +--> Different device --> Show resume dialog
                      |
                      +--> "Resume" --> Load session, continue
                      |
                      +--> "Start Fresh" --> Delete session, new workout
```

#### Files to Modify
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add ActiveSession model |
| `src/app/api/session/route.ts` | NEW - Session CRUD endpoints |
| `src/app/workout/[dayId]/page.tsx` | Sync session to PostgreSQL, check on load |
| `src/lib/api-client.ts` | Add session API methods |

---

### Issue 4: Skip Button Missing (MEDIUM)

#### Root Cause
No UI exists to skip sets, exercises, or warmup/finisher items. Users are forced to complete everything or abandon the workout.

#### Use Cases
1. **Skip set**: "I can only do 3 sets today, not 4"
2. **Skip exercise**: "The cable machine is taken"
3. **Skip warmup item**: "I'm already warmed up"
4. **Skip finisher**: "Running late, need to go"

#### Proposed Solution

1. **Skip button on SetLogger**: "Skip Set" appears next to "Log Set"
2. **Skip on exercise card**: Long-press or swipe to skip entire exercise
3. **Skip checkbox for warmup/finisher**: Individual skip toggles
4. **Tracking**: Log skipped items with `skipped: true` flag

#### UI Changes

**SetLogger Component**
```tsx
// Add skip button to SetLogger footer
<div className="flex gap-2">
  <Button variant="ghost" onClick={onSkipSet}>
    Skip Set
  </Button>
  <Button onClick={onLogSet}>
    Log Set
  </Button>
</div>
```

**Set Log Schema Update**
```typescript
interface SetLog {
  exerciseId: string;
  setNumber: number;
  weight: number;
  actualReps: number;
  rpe: number;
  skipped?: boolean;  // NEW
  skipReason?: string; // Optional: "equipment_taken", "time", "fatigue"
}
```

**Warmup/Finisher Items**
```tsx
// Add skip toggle next to checkbox
<div className="flex items-center gap-2">
  <Checkbox checked={completed} onChange={onComplete} />
  <span>Cat-Cow Stretch x 10</span>
  <Button size="sm" variant="ghost" onClick={() => onSkip(index)}>
    Skip
  </Button>
</div>
```

#### Files to Modify
| File | Change |
|------|--------|
| `src/components/workout/set-logger.tsx` | Add skip button |
| `src/app/workout/[dayId]/page.tsx` | Handle skip logic, update state |
| `src/lib/api-client.ts` | Update SetLog type with skipped flag |
| `src/components/stats/recent-workouts.tsx` | Display skipped sets differently |

---

### Issue 5: Verify Weight Memory Visibility (LOW)

#### Current State
The weight memory feature exists and works:
- `ChallengeCard` component shows progressive overload prompts
- `globalSuggestion` state tracks last weight/reps
- Pre-fill works on the weight input

However, users may not notice or understand the feature.

#### Proposed Improvements

1. **Onboarding tooltip**: First-time tooltip on ChallengeCard explaining the feature
2. **Visual indicator**: Small badge showing "Last: 15kg x 10" near weight input
3. **Settings explanation**: Add description in settings page

#### Implementation

**Last Weight Indicator**
```tsx
// Add to SetLogger, near weight input
{globalSuggestion && (
  <div className="text-xs text-muted-foreground">
    Last time: {globalSuggestion.lastWeight}kg x {globalSuggestion.lastReps} reps
  </div>
)}
```

**First-Time Tooltip**
```tsx
// Wrap ChallengeCard with tooltip on first appearance
const [hasSeenChallenge, setHasSeenChallenge] = useState(
  localStorage.getItem('hasSeenChallengeCard') === 'true'
);

{!hasSeenChallenge && (
  <Tooltip content="We track your weights! When you hit your target reps, we'll suggest increasing the weight.">
    <ChallengeCard ... />
  </Tooltip>
)}
```

#### Files to Modify
| File | Change |
|------|--------|
| `src/components/workout/set-logger.tsx` | Add "last time" indicator |
| `src/components/workout/challenge-card.tsx` | Add first-time tooltip wrapper |
| `src/app/settings/page.tsx` | Add weight memory explanation |

---

### Issue 6: Manifest.json 401 Error (LOW)

#### Root Cause
The Clerk middleware is catching `/manifest.json` requests and returning 401 because the file isn't in the public routes matcher.

#### Current Middleware
```typescript
// src/middleware.ts - lines 43-50
export const config = {
  matcher: [
    // Skip static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

Note: The matcher already excludes `webmanifest` but not `json` files. The issue is that `js(?!on)` negative lookahead allows `.json` through.

#### Proposed Solution

Update the middleware matcher to explicitly exclude `manifest.json`:

```typescript
export const config = {
  matcher: [
    // Skip static files, Next.js internals, and PWA files
    "/((?!_next|manifest\\.json|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

Or add to public routes:
```typescript
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/manifest.json",  // Add this
]);
```

#### Files to Modify
| File | Change |
|------|--------|
| `src/middleware.ts` | Add manifest.json to excluded paths |

---

## Implementation Checklist

### Phase 1: Critical Fixes (Issues 1, 3, 6)
- [ ] Create `/api/reset` endpoint with Prisma transactions
- [ ] Update `resetToDefault()` to use batch operations
- [ ] Test reset flow end-to-end
- [ ] Add ActiveSession model to Prisma schema
- [ ] Run migration: `npx prisma migrate dev --name add_active_session`
- [ ] Create `/api/session` CRUD endpoints
- [ ] Update workout page to sync session to PostgreSQL
- [ ] Add resume dialog for cross-device sessions
- [ ] Test cross-device resume flow
- [ ] Update middleware to exclude manifest.json
- [ ] Verify PWA installation works

### Phase 2: UX Improvements (Issues 4, 5)
- [ ] Add skip button to SetLogger component
- [ ] Handle skip logic in workout page state
- [ ] Update SetLog type with skipped flag
- [ ] Add skip toggles for warmup/finisher items
- [ ] Display skipped sets in workout history
- [ ] Add "last time" indicator to SetLogger
- [ ] Add first-time tooltip to ChallengeCard
- [ ] Add weight memory explanation in settings

### Phase 3: Content (Issue 2)
- [ ] Research YouTube videos for all 97 exercises
- [ ] Add videoUrl to exercises.json
- [ ] Update seed function to include videoUrl
- [ ] Test video player in exercise detail view
- [ ] Verify videos load on mobile

---

## Launch Criteria

Before marking this PRD complete:

- [ ] Reset function returns 200 and completes successfully
- [ ] Cross-device resume works (test on 2 devices)
- [ ] All 97 exercises have valid videoUrl
- [ ] Skip buttons work for sets, exercises, warmup, finisher
- [ ] Weight memory is visible and understood by new users
- [ ] manifest.json returns 200 without auth
- [ ] All changes tested offline (PWA requirement)
- [ ] No console errors in production
- [ ] CHANGELOG.md updated

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Reset transaction fails mid-way | Data corruption | Use Prisma $transaction for atomicity |
| YouTube videos become unavailable | Broken tutorial links | Use stable channels, check links quarterly |
| Session sync conflicts | Lost workout data | Last-write-wins with timestamp, show warning |
| Skip abuse | Inaccurate progress data | Track skip rate, warn if > 30% |

---

## Related PRDs

- [Weight Memory + Edit Sets](./weight-memory-edit-sets.md) - ChallengeCard implementation
- [Post-Migration Fixes](./post-migration-fixes.md) - builtInId mapping context
- [Exercise Database](./exercise-database.md) - Exercise schema

---

## Dependencies

- Prisma migration must complete before session sync
- exercises.json update requires re-seeding for existing users
- Middleware change requires Vercel redeploy

---

*SetFlow v2 - Critical Fixes | Created: 2026-01-04*
