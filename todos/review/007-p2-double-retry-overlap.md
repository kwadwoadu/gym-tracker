---
id: REV-007
severity: P2
agent: architecture-strategist
status: done
file: src/app/workout/[dayId]/page.tsx
line: 921-932
created: 2026-03-06
---

# finishWorkout retry loop overlaps with fetchWithRetry (up to 6 API calls)

## Description
finishWorkout has its own 3-attempt retry loop, AND workoutLogsApi.create uses fetchWithRetry which retries on 401. This means up to 6 total API calls on failure, with no coordination.

## Proposed Fix
Remove the manual retry loop in finishWorkout. Keep only localStorage safety net + error UI. Let fetchWithRetry handle the 401 case:
```typescript
try {
  const savedLog = await workoutLogsApi.create(workoutLogData);
  setWorkoutLogId(savedLog.id);
  localStorage.removeItem("pending-workout");
  // ... secondary operations
} catch (error) {
  setSaveError("Workout saved locally. Will sync when connection is restored.");
}
```
