# SetFlow v2 - Maintenance Sprint PRD

**Status**: SHIPPED
**Created**: 2026-01-04
**Author**: Kwadwo Adu
**Priority**: High
**Project**: SetFlow (gym-tracker)

---

## 1. Problem Statement

SetFlow v2 shipped with six issues that degrade user experience and reliability. These span three severity tiers:

- **Critical (HIGH)**: Reset function returns 500 (data corruption risk), cross-device workout resume broken (localStorage-only sessions)
- **Medium**: Exercise tutorial videos missing for all 97 exercises, no skip button for sets/exercises/warmup/finisher
- **Low**: Weight memory feature not discoverable, manifest.json returns 401 blocking PWA installation

Users cannot reset their program, cannot continue workouts on a different device, and have no way to skip exercises when equipment is unavailable. Together these issues make the app feel incomplete and unreliable.

---

## 2. Proposed Solution

Address all six issues in a structured maintenance sprint across three phases:

1. **Phase 1 (Critical)**: Fix reset endpoint with Prisma transactions, add ActiveSession model for cross-device resume, fix manifest.json auth bypass
2. **Phase 2 (UX)**: Add skip buttons across all workout phases, improve weight memory discoverability with inline indicators and tooltips
3. **Phase 3 (Content)**: Populate all 97 exercises with curated YouTube tutorial video URLs

Each issue is a self-contained subsection with its own checklist, implementation approach, and files to modify.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Reset success rate | 100% (zero 500 errors) | Hit /api/reset in production, verify 200 response |
| Cross-device resume | Session resumable on any device | Start workout on phone, resume on tablet within 6h |
| Videos populated | 97/97 exercises with valid videoUrl | Query exercises.json, verify all URLs return 200 |
| Skip tracking accuracy | All skipped items logged with flag | Complete workout with skips, verify logs contain `skipped: true` |
| Weight memory visibility | "Last time" shown for all exercises with history | Log 2 workouts for same exercise, verify indicator appears |
| PWA installability | manifest.json returns 200 unauthenticated | Fetch /manifest.json in incognito, verify 200 |

---

## 4. Requirements

### Must Have
- [ ] Reset endpoint uses Prisma `$transaction` with `deleteMany` (no N+1 deletes)
- [ ] ActiveSession Prisma model stores in-progress workout state in PostgreSQL
- [ ] Cross-device resume dialog when active session detected on different device
- [ ] manifest.json excluded from Clerk middleware auth
- [ ] Skip button on SetLogger component for individual sets
- [ ] Skip toggle for warmup and finisher items
- [ ] `skipped` field added to SetLog interface
- [ ] "Last time: Xkg x Y reps" indicator near weight input in SetLogger

### Should Have
- [ ] Skip entire exercise via long-press or dedicated button
- [ ] Skip reason tracking (equipment_taken, time, fatigue)
- [ ] First-time tooltip on ChallengeCard explaining weight memory
- [ ] Weight memory explanation in settings page
- [ ] All 97 exercises have curated YouTube videoUrl

### Won't Have (this sprint)
- Video player redesign (existing component is sufficient)
- Offline video caching (YouTube requires network)
- Multi-device concurrent session support (one active session per user)

---

## 5. User Flows

### Flow 1: Program Reset
1. User navigates to Settings page
2. User taps "Reset to Default Program"
3. Confirmation dialog appears: "This will delete all workout history and reinstall the default program."
4. User confirms
5. App calls `POST /api/reset`
6. Prisma transaction deletes all user data (PRs, logs, days, programs, achievements)
7. Default program is re-seeded
8. User sees success toast, redirected to home
9. If transaction fails, user sees error toast, no data is deleted (atomic rollback)

### Flow 2: Cross-Device Workout Resume
1. User starts workout on Phone A
2. Session state is saved to PostgreSQL via `POST /api/session`
3. User opens app on Tablet B
4. App calls `GET /api/session`, finds active session from Phone A
5. Resume dialog appears: "You have an active workout from another device. Resume or Start Fresh?"
6. User taps "Resume" - session state loads, workout continues
7. User taps "Start Fresh" - `DELETE /api/session`, new workout begins

### Flow 3: Skipping a Set
1. User is in workout, SetLogger showing current set
2. User taps "Skip Set" (ghost button next to "Log Set")
3. Set is logged with `skipped: true`, set counter advances
4. Skipped set appears dimmed in completed sets list
5. Volume calculation excludes skipped sets

### Flow 4: Weight Memory Discovery
1. User starts a set for an exercise they have done before
2. Below the weight input, small text shows "Last time: 15kg x 10 reps"
3. Weight input is pre-filled with 15kg
4. If user hit target reps last time, ChallengeCard appears with progressive overload nudge
5. First time ChallengeCard appears, tooltip explains the feature

---

## 6. Design

### Issue 1: Reset - N/A (API-only change)

### Issue 2: Exercise Videos - N/A (existing video player component)

### Issue 3: Cross-Device Resume Dialog

```
┌─────────────────────────────────┐
│                                 │
│   ┌─────────────────────────┐   │
│   │  Active Workout Found   │   │
│   │                         │   │
│   │  Day 1: Full Body A     │   │
│   │  Started 45 min ago     │   │
│   │  3/12 sets completed    │   │
│   │                         │   │
│   │  ┌─────────┐ ┌───────┐ │   │
│   │  │ Resume  │ │ Fresh │ │   │
│   │  └─────────┘ └───────┘ │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

| Component | Spec |
|-----------|------|
| Dialog overlay | `bg-black/60` backdrop blur |
| Dialog card | `bg-[#1A1A1A]` rounded-2xl, p-6 |
| Title | 18px semibold, white |
| Metadata | 14px, `#A0A0A0` |
| Resume button | `bg-[#CDFF00]` text-black, 56px height |
| Fresh button | ghost variant, `border-[#2A2A2A]`, 56px height |

### Issue 4: Skip Button

```
┌──────────────────────────────────┐
│  Set 3 of 4                     │
│  ┌──────────┐  ┌──────────────┐ │
│  │ Skip Set │  │   Log Set    │ │
│  │  (ghost) │  │   (primary)  │ │
│  └──────────┘  └──────────────┘ │
└──────────────────────────────────┘
```

| Component | Spec |
|-----------|------|
| Skip Set button | ghost variant, 44px min height, `text-[#A0A0A0]` |
| Log Set button | `bg-[#CDFF00]` text-black, 56px height |
| Skipped set badge | `opacity-40`, strikethrough text |
| Skip warmup toggle | 44x44px ghost button right-aligned |

### Issue 5: Weight Memory Indicator

```
┌──────────────────────────────────┐
│  Weight (kg)                     │
│  ┌────────────────────────────┐  │
│  │  15                        │  │
│  └────────────────────────────┘  │
│  Last time: 15kg x 10 reps      │
└──────────────────────────────────┘
```

| Component | Spec |
|-----------|------|
| Indicator text | 12px, `text-[#666666]` |
| Position | Below weight input, 4px gap |

### Issue 6: Manifest Fix - N/A (middleware config change)

---

## 7. Technical Spec

### Issue 1: Reset Function

**Current (broken)**: N+1 deletes with no transaction in `src/lib/seed.ts`

**Fix**: New batch endpoint with Prisma transaction:

```typescript
// NEW: /src/app/api/reset/route.ts
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.personalRecord.deleteMany({ where: { userId: user.id } });
      await tx.workoutLog.deleteMany({ where: { userId: user.id } });
      await tx.trainingDay.deleteMany({ where: { program: { userId: user.id } } });
      await tx.program.deleteMany({ where: { userId: user.id } });
      await tx.achievement.deleteMany({ where: { userId: user.id } });
    });
    await installDefaultProgram(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset failed:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
```

### Issue 3: ActiveSession Model

```prisma
// prisma/schema.prisma
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
  deviceId        String?

  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Issue 4: SetLog Extension

```typescript
// src/lib/db.ts - extend SetLog interface
interface SetLog {
  exerciseId: string;
  setNumber: number;
  weight: number;
  actualReps: number;
  rpe: number;
  skipped?: boolean;
  skipReason?: string; // "equipment_taken" | "time" | "fatigue"
}
```

### Issue 6: Middleware Fix

```typescript
// src/middleware.ts - add manifest.json to public routes
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/manifest.json",
]);
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/reset/route.ts` | Batch reset endpoint with Prisma transaction |
| `src/app/api/session/route.ts` | Active session CRUD (GET/POST/DELETE) |

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/seed.ts` | Update `resetToDefault()` to call new endpoint |
| `src/app/settings/page.tsx` | Wire reset button to POST /api/reset |
| `prisma/schema.prisma` | Add ActiveSession model |
| `src/app/workout/[dayId]/page.tsx` | Sync session to PostgreSQL, check on load, add skip logic |
| `src/lib/api-client.ts` | Add session API methods, update SetLog type |
| `src/components/workout/set-logger.tsx` | Add skip button, "last time" indicator |
| `src/components/workout/challenge-card.tsx` | Add first-time tooltip wrapper |
| `src/components/stats/recent-workouts.tsx` | Display skipped sets with dimmed style |
| `src/middleware.ts` | Add manifest.json to public routes |
| `src/data/exercises.json` | Add videoUrl to all 97 exercises |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Prisma CLI available (`npx prisma`)
- [ ] PostgreSQL database accessible (Neon)
- [ ] Clerk middleware configuration understood
- [ ] exercises.json current exercise count verified

### Build Order

**Phase 1: Critical Fixes (Issues 1, 3, 6)**
1. Create `/api/reset` endpoint with Prisma `$transaction` and `deleteMany`
2. Update `resetToDefault()` in seed.ts to use new endpoint
3. Wire settings page reset button to new endpoint
4. Add ActiveSession model to Prisma schema
5. Run migration: `npx prisma migrate dev --name add_active_session`
6. Create `/api/session` CRUD endpoints (GET/POST/DELETE)
7. Update workout page to sync session state to PostgreSQL on each set
8. Add resume dialog component for cross-device detection
9. Update middleware matcher to exclude manifest.json
10. Verify manifest.json returns 200 in incognito

**Phase 2: UX Improvements (Issues 4, 5)**
11. Add `skipped` and `skipReason` fields to SetLog interface
12. Add "Skip Set" ghost button to SetLogger component
13. Handle skip logic in workout page state management
14. Add skip toggles for warmup/finisher items
15. Display skipped sets with dimmed/strikethrough style in history
16. Add "Last time: Xkg x Y reps" indicator below weight input
17. Add first-time tooltip to ChallengeCard
18. Add weight memory explanation text in settings page

**Phase 3: Content (Issue 2)**
19. Research and curate YouTube video URLs for all 97 exercises
20. Add videoUrl field to each exercise in exercises.json
21. Update seed function to include videoUrl in database
22. Test video player loads on exercise detail view
23. Verify videos load correctly on mobile Safari

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Reset fails mid-transaction | Prisma `$transaction` ensures atomic rollback, no partial deletes |
| Active session expired (>6 hours) | Auto-delete stale sessions on GET, show "Session expired" message |
| Two devices update session simultaneously | Last-write-wins with `lastUpdated` timestamp |
| User skips all sets in a workout | Allow completion with 100% skipped, log as incomplete workout |
| YouTube video becomes unavailable | Exercise still functional without video, show placeholder |
| exercises.json has duplicate videoUrl | No harm, different exercises may reference same tutorial |
| Manifest.json cached with 401 | Service worker cache bust on next deploy, clear via version update |
| No internet during session sync | Fall back to localStorage, sync on reconnect |
| User has no workout history for exercise | "Last time" indicator hidden, no ChallengeCard shown |

---

## 10. Testing

### Functional Tests
- [ ] POST /api/reset returns 200 and deletes all user data
- [ ] POST /api/reset re-seeds default program after deletion
- [ ] POST /api/reset rolls back on failure (no partial deletion)
- [ ] GET /api/session returns active session when one exists
- [ ] GET /api/session returns 404 when no active session
- [ ] POST /api/session creates/updates session state
- [ ] DELETE /api/session clears session on workout complete
- [ ] Resume dialog appears when session exists from different device
- [ ] "Resume" loads session state and continues workout
- [ ] "Start Fresh" deletes session and starts new workout
- [ ] Skip Set logs set with `skipped: true`
- [ ] Skip warmup item toggles without affecting other items
- [ ] Skipped sets excluded from volume calculation
- [ ] Weight pre-fill shows correct value from last workout
- [ ] "Last time" indicator shows for exercises with history
- [ ] ChallengeCard appears when target reps were hit last time
- [ ] manifest.json returns 200 without authentication
- [ ] All 97 videoUrls are valid YouTube links (HTTP 200)

### UI Verification
- [ ] Reset confirmation dialog has clear warning text
- [ ] Resume dialog shows workout metadata (day name, time, sets completed)
- [ ] Skip Set button is 44px+ touch target, ghost variant
- [ ] Skipped sets appear dimmed in completed sets list
- [ ] "Last time" text is 12px muted color, positioned below weight input
- [ ] ChallengeCard tooltip appears on first encounter
- [ ] Video player renders within exercise detail view on mobile
- [ ] All buttons meet 44px minimum touch target

---

## 11. Launch Checklist

- [ ] Reset function returns 200 and completes successfully
- [ ] Cross-device resume works (tested on 2 physical devices)
- [ ] All 97 exercises have valid videoUrl
- [ ] Skip buttons work for sets, exercises, warmup, finisher
- [ ] Weight memory indicator visible and accurate
- [ ] manifest.json returns 200 without auth
- [ ] All changes tested offline (airplane mode on iOS Safari)
- [ ] No console errors in Vercel production logs
- [ ] Prisma migration applied to production database
- [ ] CHANGELOG.md updated with all fixes

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Reset transaction fails mid-way | Data corruption, orphaned records | Prisma `$transaction` guarantees atomic rollback |
| YouTube videos become unavailable | Broken tutorial links, empty player | Use stable channels (Jeff Nippard, RP), check links quarterly |
| Session sync conflicts between devices | Lost workout data, duplicate sets | Last-write-wins with `lastUpdated` timestamp, show warning |
| Skip feature abused (users skip everything) | Inaccurate progress tracking, misleading stats | Track skip rate per user, warn if >30% |
| Prisma migration breaks production | App downtime | Test migration on staging, backup database before deploy |
| manifest.json route change breaks other JSON files | Unintended auth bypass | Use specific `/manifest.json` path, not wildcard |

---

## 13. Dependencies

| Dependency | Required For | Status |
|------------|-------------|--------|
| Prisma CLI + Neon PostgreSQL | Reset endpoint, ActiveSession model | Available |
| Prisma migration applied | ActiveSession model in production | Needs deploy |
| Clerk middleware access | manifest.json auth fix | Available |
| exercises.json with all 97 exercises | Video URL population | Available (see exercise-database.md) |
| ChallengeCard component | Weight memory tooltip | Exists (weight-memory-edit-sets.md) |
| EditSetDrawer component | N/A this sprint | Exists |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-04 | Initial PRD created with 6 issues |
| 2026-03-26 | PRD quality audit: restructured as 14-section maintenance sprint PRD, added user flows, design specs (ASCII wireframes + component tables), edge cases table, testing checklists, launch checklist, dependencies table, implementation build order |
| 2026-03-26 | SHIPPED: All critical fixes implemented - reset endpoint with $transaction, ActiveSession model + cross-device resume, manifest.json public route, skip button with skipped field, weight memory "Last time" indicator, settings page reset button |

---

## Related PRDs

- [Weight Memory + Edit Sets](./weight-memory-edit-sets.md) - ChallengeCard implementation
- [Post-Migration Fixes](./post-migration-fixes.md) - builtInId mapping context
- [Exercise Database](./exercise-database.md) - Exercise schema and catalog
- [Superset Quality Sprint](./superset-quality-sprint.md) - Related bug fixes

---

*SetFlow v2 - Maintenance Sprint | Created: 2026-01-04 | Updated: 2026-03-26*
