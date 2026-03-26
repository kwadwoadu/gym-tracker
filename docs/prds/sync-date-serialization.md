# Sync Date Serialization Fix

**Status**: In Progress
**Created**: 2026-01-03
**Author**: Kwadwo Adu
**Priority**: Critical - Blocking core functionality

> Fix the `toISOString is not a function` error in cloud sync

---

## 1. Problem Statement

Cloud sync fails with error:
```
Sync error: TypeError: a.toISOString is not a function
    at i.mapToDriverValue (.next/server/chunks/510.js:40:64383)
```

**Impact**: Users cannot sync workout data between devices. Workouts logged on mobile are stuck locally and don't appear on desktop.

**Root cause**: IndexedDB stores dates as ISO strings (e.g., `"2026-01-02T10:30:00.000Z"`), but Drizzle ORM expects Date objects and calls `.toISOString()` on them. When a string is passed where a Date is expected, the method doesn't exist on the string prototype.

---

## 2. Solution

Create a date conversion utility and transform all date fields at the API boundary (in `/src/app/api/sync/route.ts`) before inserting into the database.

### Approach: Transform dates at API boundary

Instead of spreading client data directly into Drizzle inserts, explicitly map all fields and convert string dates to Date objects using helper functions.

### Helper Functions

```typescript
// /src/lib/db/utils.ts (new file)
export function toDate(value: string | Date | null | undefined): Date | null
export function toDateRequired(value: string | Date | null | undefined): Date
```

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Sync error rate | 0 toISOString errors | Check Vercel function logs |
| Cross-device sync | Workouts appear on all signed-in devices | Log on mobile, verify on desktop |
| Date integrity | All timestamps stored correctly in PostgreSQL | Query cloud DB, verify date columns |
| Invalid date handling | No crashes on malformed dates | Send null/invalid dates, verify graceful fallback |
| Sync completion rate | 100% of sync attempts succeed | Monitor sync API response codes |

---

## 4. Requirements

### Must Have
- [ ] `toDate()` helper safely converts string/Date/null to Date or null
- [ ] `toDateRequired()` helper converts with fallback to `new Date()`
- [ ] All entity inserts in sync route use explicit field mapping (no spread)
- [ ] All timestamp fields converted before insert: exercises, programs, trainingDays, workoutLogs, personalRecords, achievements, onboardingProfiles, userSettings, syncMetadata

### Should Have
- [ ] Validation logging for invalid date values
- [ ] Unit tests for `toDate()` and `toDateRequired()`

### Won't Have (this version)
- Client-side date normalization (fix is server-side only)
- Migration of existing bad data in cloud DB
- Date format standardization across the entire codebase

---

## 5. User Flows

### Flow A: Successful Sync After Fix
1. User logs a workout on mobile (data stored in IndexedDB as ISO strings)
2. AutoSyncProvider triggers `pushToCloud()`
3. Client sends workout data with string dates to `/api/sync`
4. API route receives data and passes through `toDateRequired()` for each timestamp field
5. Drizzle ORM receives proper Date objects
6. Data inserts successfully into Neon PostgreSQL
7. User opens desktop browser, signs in
8. `pullFromCloud()` retrieves synced data
9. Workouts appear on desktop

### Flow B: Invalid Date Handling
1. Client sends data with a malformed date (e.g., `"not-a-date"`)
2. `toDate()` detects invalid date via `isNaN(date.getTime())`
3. Returns null for optional fields, or `new Date()` for required fields
4. Insert proceeds without crashing
5. Warning logged for debugging

---

## 6. Design

### Wireframes

```
This is a backend-only fix. No UI changes required.

Before Fix:
  Client (IndexedDB)          Server (Drizzle)
  ┌──────────────┐           ┌──────────────┐
  │ createdAt:   │  ──POST──>│ .toISOString()│
  │ "2026-01..."│           │  CRASHES!     │
  └──────────────┘           └──────────────┘

After Fix:
  Client (IndexedDB)    API Boundary     Server (Drizzle)
  ┌──────────────┐    ┌──────────┐     ┌──────────────┐
  │ createdAt:   │──> │ toDate() │ ──> │ .toISOString()│
  │ "2026-01..."│    │ -> Date  │     │  SUCCESS!     │
  └──────────────┘    └──────────┘     └──────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| (No UI components) | - | Backend-only fix |

### Visual Spec

No visual changes. SyncIndicator should show "Synced" (green checkmark) instead of error state after this fix.

---

## 7. Technical Spec

### TypeScript Schemas

```typescript
// /src/lib/db/utils.ts (new file)

/**
 * Safely converts a string or Date to a Date object.
 * Returns null if the input is null/undefined or invalid.
 */
export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Converts a string date to Date object, with fallback to current time.
 * Use for required timestamp fields like createdAt.
 */
export function toDateRequired(value: string | Date | null | undefined): Date {
  const date = toDate(value);
  return date || new Date();
}
```

### Affected Tables and Fields

| Table | Timestamp Fields |
|-------|------------------|
| `exercises` | createdAt, updatedAt, deletedAt |
| `programs` | createdAt, updatedAt, deletedAt |
| `trainingDays` | createdAt, updatedAt, deletedAt |
| `workoutLogs` | createdAt, updatedAt, deletedAt |
| `personalRecords` | createdAt, updatedAt, deletedAt |
| `userSettings` | createdAt, updatedAt |
| `syncMetadata` | lastSyncedAt, createdAt, updatedAt |
| `achievements` | unlockedAt, createdAt |
| `onboardingProfiles` | completedAt, createdAt, updatedAt |

### Files to Create

| File | Description |
|------|-------------|
| `/src/lib/db/utils.ts` | Date conversion utilities (`toDate`, `toDateRequired`) |

### Files to Modify

| File | Changes |
|------|---------|
| `/src/app/api/sync/route.ts` | Transform all date fields using `toDate`/`toDateRequired` before insert, replace spread operator with explicit field mapping |

### Example Transform

```typescript
// BEFORE (buggy - spread passes strings to Drizzle)
await cloudDb.insert(exercises).values({ ...exercise, userId })

// AFTER (fixed - explicit mapping with date conversion)
await cloudDb.insert(exercises).values({
  id: exercise.id,
  userId,
  name: exercise.name,
  videoUrl: exercise.videoUrl,
  muscleGroups: exercise.muscleGroups,
  equipment: exercise.equipment,
  isCustom: exercise.isCustom,
  createdAt: toDateRequired(exercise.createdAt),
  updatedAt: new Date(),
})
```

---

## 8. Implementation Plan

### Dependencies Checklist
- [x] Sync API route exists (`/src/app/api/sync/route.ts`)
- [x] Drizzle ORM configured with Neon PostgreSQL
- [x] Cloud schema defined with timestamp columns
- [ ] None blocking, can start immediately

### Build Order

**Phase 1: Create Utility (15 min)**
1. [ ] Create `/src/lib/db/utils.ts` with `toDate` and `toDateRequired` helpers

**Phase 2: Fix Each Entity (2 hours)**
2. [ ] Fix exercises sync - explicit field mapping with date conversion
3. [ ] Fix programs sync - explicit field mapping with date conversion
4. [ ] Fix trainingDays sync - explicit field mapping with date conversion
5. [ ] Fix workoutLogs sync - explicit field mapping with date conversion (note: date, startTime, endTime are TEXT, no conversion needed)
6. [ ] Fix personalRecords sync - explicit field mapping with date conversion
7. [ ] Fix achievements sync - transform unlockedAt with null check
8. [ ] Fix onboardingProfiles sync - verify completedAt handling
9. [ ] Fix userSettings sync - explicit field mapping with date conversion
10. [ ] Fix syncMetadata - explicit field mapping with date conversion

**Phase 3: Validation + Deploy (30 min)**
11. [ ] Add console.warn logging for invalid dates
12. [ ] Deploy to Vercel
13. [ ] Test sync from mobile
14. [ ] Verify workouts appear on desktop

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Client sends null date for required field | `toDateRequired()` returns `new Date()` as fallback |
| Client sends invalid date string (e.g., "not-a-date") | `toDate()` returns null, `toDateRequired()` returns `new Date()` |
| Client sends Date object (not string) | `instanceof Date` check passes through unchanged |
| Client sends empty string | `toDate()` treats as falsy, returns null |
| Client sends Unix timestamp number | `new Date(number)` works correctly |
| deletedAt is null (not deleted) | `toDate()` returns null, column accepts null |
| Timezone differences between client and server | ISO strings are UTC, `new Date()` on server is UTC |

---

## 10. Testing

### Functional Tests
- [ ] `toDate("2026-01-02T10:00:00Z")` returns valid Date object
- [ ] `toDate(new Date())` returns the same Date object
- [ ] `toDate(null)` returns null
- [ ] `toDate(undefined)` returns null
- [ ] `toDate("invalid")` returns null
- [ ] `toDateRequired(null)` returns current Date (not null)
- [ ] `toDateRequired("invalid")` returns current Date (not null)
- [ ] Sync API processes exercise with string dates without error
- [ ] Sync API processes workout log with string dates without error
- [ ] All 9 entity types sync without toISOString errors

### UI Verification
- [ ] SyncIndicator shows green checkmark after sync (not error state)
- [ ] Workouts logged on mobile appear on desktop after sync
- [ ] No error toasts during sync
- [ ] Vercel function logs show no toISOString errors

---

## 11. Launch Checklist

- [ ] `/src/lib/db/utils.ts` created with toDate and toDateRequired
- [ ] All 9 entity sync blocks use explicit field mapping (no spread)
- [ ] All timestamp fields pass through toDate/toDateRequired
- [ ] No toISOString errors in Vercel logs
- [ ] Sync completes successfully from mobile to desktop
- [ ] Invalid date fallback tested
- [ ] Deploy to gym.adu.dk via `npx vercel --prod`

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing a timestamp field in conversion | That field still crashes | Audit every entity's schema columns against the sync code |
| Fallback date (new Date()) creates wrong timestamps | Data shows as "just now" instead of actual date | Log warnings for fallback usage, investigate root cause |
| Explicit field mapping misses new columns | New columns not synced | Add sync code review to schema change checklist |
| Performance impact of date conversion | Slower sync | Negligible, date conversion is O(1) per field |

---

## 13. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Sync API route (`/api/sync`) | Exists | Needs modification (no new routes) |
| Drizzle ORM | Configured | Expects Date objects for timestamp columns |
| Neon PostgreSQL | Provisioned | Cloud database receiving synced data |
| Clerk authentication | Working | Provides userId for sync |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-03 | Initial PRD created |
| 2026-03-26 | PRD quality audit: added missing sections (success metrics table, requirements MoSCoW, user flows, design diagrams, implementation plan with build order, edge cases table, testing checklists, launch checklist, risks & mitigations, dependencies, changelog), reformatted to 14-section standard |
