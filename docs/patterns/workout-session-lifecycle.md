# Workout Session Lifecycle Pattern

## When to Use

- Session-based activities with start/end
- Tracking duration and completion state
- Partial progress saving
- History and analytics

## Core Principle

A workout session is a state machine: Not Started -> In Progress -> Complete. Track start time immediately, end time on completion, and save partial progress throughout.

## Implementation

### Session Data Model

```typescript
export interface WorkoutLog {
  id: string;
  date: string;          // ISO date (YYYY-MM-DD)
  programId: string;
  dayId: string;
  dayName: string;
  sets: SetLog[];        // Grows as user completes sets
  startTime: string;     // ISO timestamp
  endTime?: string;      // Set on completion
  duration?: number;     // Calculated minutes
  notes?: string;
  isComplete: boolean;   // State flag
}

export interface SetLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  unit: "kg" | "lbs";
  rpe?: number;          // Rate of perceived exertion
  isComplete: boolean;
  completedAt?: string;
}
```

### Create Session (Start Workout)

```typescript
// CORRECT: Create log immediately with isComplete: false
export async function createWorkoutLog(
  programId: string,
  dayId: string,
  dayName: string
): Promise<string> {
  const id = generateId();
  await db.workoutLogs.add({
    id,
    date: getToday(),
    programId,
    dayId,
    dayName,
    sets: [],                           // Empty, will grow
    startTime: new Date().toISOString(),
    isComplete: false,                  // Not done yet
  });
  return id;
}
```

### Add Set (During Workout)

```typescript
// CORRECT: Append to sets array, update in place
export async function addSetToWorkout(
  workoutId: string,
  set: SetLog
): Promise<void> {
  const workout = await db.workoutLogs.get(workoutId);
  if (!workout) throw new Error("Workout not found");

  const updatedSets = [...workout.sets, set];
  await db.workoutLogs.update(workoutId, { sets: updatedSets });
}
```

### Update Existing Set

```typescript
// CORRECT: Update specific set by ID
export async function updateSetInWorkoutLog(
  workoutLogId: string,
  setId: string,
  updates: { weight?: number; actualReps?: number; rpe?: number }
): Promise<boolean> {
  const log = await db.workoutLogs.get(workoutLogId);
  if (!log) return false;

  const setIndex = log.sets.findIndex((s) => s.id === setId);
  if (setIndex === -1) return false;

  const updatedSets = [...log.sets];
  updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };

  await db.workoutLogs.update(workoutLogId, { sets: updatedSets });
  return true;
}
```

### Complete Session (End Workout)

```typescript
// CORRECT: Set endTime, calculate duration, mark complete
export async function completeWorkout(workoutId: string): Promise<void> {
  const workout = await db.workoutLogs.get(workoutId);
  if (!workout) return;

  const endTime = new Date();
  const startTime = new Date(workout.startTime);
  const durationMinutes = Math.round((endTime - startTime) / 60000);

  await db.workoutLogs.update(workoutId, {
    endTime: endTime.toISOString(),
    duration: durationMinutes,
    isComplete: true,
  });
}
```

### Query Last Session

```typescript
// CORRECT: Filter by complete, sort by date descending
export async function getLastWorkoutForDay(
  dayId: string
): Promise<WorkoutLog | undefined> {
  const logs = await db.workoutLogs
    .where("dayId")
    .equals(dayId)
    .and((log) => log.isComplete)  // Only completed workouts
    .reverse()
    .sortBy("date");
  return logs[0];
}
```

### Recent Sessions

```typescript
export async function getRecentWorkoutLogs(
  limit: number = 10
): Promise<WorkoutLog[]> {
  return db.workoutLogs
    .orderBy("date")
    .reverse()
    .limit(limit)
    .toArray();
}
```

## Files Using This Pattern

- `/lib/db.ts` - WorkoutLog CRUD operations
- `/components/workout/WorkoutSession.tsx` - Session UI
- `/app/workout/[dayId]/page.tsx` - Workout page

## Gotchas

1. **Save early** - Create log on start, not on first set
2. **Track partial progress** - User might close app mid-workout
3. **Use ISO dates** - `getToday()` returns YYYY-MM-DD for grouping
4. **Duration is optional** - Only set when complete
5. **isComplete index** - Query by completion state efficiently
6. **Multiple incomplete** - Handle case where user starts but doesn't finish

## Testing

1. Start workout, verify log created immediately
2. Add 3 sets, close browser, reopen - verify sets persist
3. Complete workout, verify duration calculated
4. Query "last workout" - verify returns most recent complete
5. Test timezone handling (date vs datetime)
