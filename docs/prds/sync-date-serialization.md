# Sync Date Serialization Fix

> Fix the `toISOString is not a function` error in cloud sync

---

## 1. Problem Statement

Cloud sync fails with error:
```
Sync error: TypeError: a.toISOString is not a function
    at i.mapToDriverValue (.next/server/chunks/510.js:40:64383)
```

**Impact**: Users cannot sync workout data between devices. The 3 workouts logged on mobile are stuck locally.

---

## 2. Root Cause Analysis

### Data Flow Mismatch

| Layer | Date Storage | Example |
|-------|--------------|---------|
| **Client (IndexedDB)** | ISO strings | `"2026-01-02T10:30:00.000Z"` |
| **Server (PostgreSQL)** | Date objects | `new Date()` |
| **Drizzle ORM** | Calls `.toISOString()` on timestamp values | Fails on strings |

### The Bug Location

In `/src/app/api/sync/route.ts`, data from IndexedDB is spread directly into Drizzle:

```typescript
// Line 56-59: BUG - exercise.createdAt is a STRING from client
await cloudDb.insert(exercises).values({ ...exercise, userId })
```

The client sends:
```json
{ "id": "ex-1", "name": "Squat", "createdAt": "2026-01-02T10:00:00Z" }
```

But Drizzle expects:
```typescript
{ id: "ex-1", name: "Squat", createdAt: new Date("2026-01-02T10:00:00Z") }
```

### Affected Fields

All timestamp columns in the schema require Date objects:

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

---

## 3. Solution

### Approach: Transform dates at API boundary

Create a helper function that converts string dates to Date objects before inserting into the database.

### Helper Function

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

### Transform Each Entity

In `/src/app/api/sync/route.ts`, transform data before insert:

```typescript
// BEFORE (buggy)
await cloudDb.insert(exercises).values({ ...exercise, userId })

// AFTER (fixed)
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

## 4. Implementation Plan

### Step 1: Create date utility file
- [ ] Create `/src/lib/db/utils.ts` with `toDate` and `toDateRequired` helpers

### Step 2: Fix exercises sync
- [ ] Transform createdAt to Date before insert
- [ ] Explicitly map all fields (no spread operator)

### Step 3: Fix programs sync
- [ ] Transform createdAt, updatedAt to Date

### Step 4: Fix trainingDays sync
- [ ] Transform createdAt, updatedAt to Date

### Step 5: Fix workoutLogs sync
- [ ] Transform createdAt, updatedAt to Date
- [ ] Note: date, startTime, endTime are TEXT columns (no change needed)

### Step 6: Fix personalRecords sync
- [ ] Transform createdAt, updatedAt to Date

### Step 7: Fix achievements sync
- [ ] Transform unlockedAt to Date
- [ ] Add null check for invalid dates

### Step 8: Fix onboardingProfiles sync (already partially done)
- [ ] Verify completedAt handling is correct

### Step 9: Add validation logging
- [ ] Log which dates were invalid for debugging

### Step 10: Deploy and test
- [ ] Deploy to Vercel
- [ ] Test sync from mobile
- [ ] Verify workouts appear on desktop

---

## 5. Files to Modify

| File | Changes |
|------|---------|
| `/src/lib/db/utils.ts` | **CREATE** - Date conversion utilities |
| `/src/app/api/sync/route.ts` | **MODIFY** - Transform all date fields |

---

## 6. Testing

### Manual Test Steps
1. Open https://gym.adu.dk on mobile
2. Sign in with Clerk
3. Verify SyncIndicator shows success (checkmark)
4. Open https://gym.adu.dk on desktop
5. Sign in with same account
6. Verify workouts appear on desktop

### Edge Cases
- Client sends null dates: Should use fallback (new Date())
- Client sends invalid date string: Should use fallback
- Client sends Date object: Should work as-is

---

## 7. Acceptance Criteria

- [ ] Sync completes without errors
- [ ] Workouts logged on mobile appear on desktop
- [ ] No `toISOString` errors in Vercel logs
- [ ] All timestamp fields correctly stored in PostgreSQL

---

*Created: 2026-01-03*
*Priority: Critical - Blocking core functionality*
