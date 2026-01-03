# Progressive Overload Pattern

## When to Use

- Weight/rep suggestion systems
- Performance tracking with progression logic
- "What should I lift today?" features
- Plateau detection and nudging

## Core Principle

Track global performance per exercise (not per day), then nudge increases when user consistently hits targets. Pre-fill with last weight, suggest increase only when ready.

## Implementation

### Global Weight Memory

```typescript
// CORRECT: Search ALL completed workouts for this exercise
export async function getLastWeightForExercise(
  exerciseId: string
): Promise<{
  weight: number;
  reps: number;
  targetReps: number;
  date: string;
  hitTarget: boolean;
} | null> {
  // Get all completed workouts, sorted by date descending
  const logs = await db.workoutLogs
    .filter((log) => log.isComplete)
    .reverse()
    .sortBy("date");

  // Search through logs to find most recent set for this exercise
  for (const log of logs) {
    const exerciseSets = log.sets.filter(
      (s) => s.exerciseId === exerciseId && s.isComplete
    );

    if (exerciseSets.length > 0) {
      // Get the last set (highest set number)
      const lastSet = exerciseSets.reduce((best, set) =>
        set.setNumber > best.setNumber ? set : best
      );
      return {
        weight: lastSet.weight,
        reps: lastSet.actualReps,
        targetReps: lastSet.targetReps,
        date: log.date,
        hitTarget: lastSet.actualReps >= lastSet.targetReps,
      };
    }
  }
  return null;
}
```

### Weight Suggestion with Nudge

```typescript
// CORRECT: Pre-fill last weight, suggest increase separately
export async function getGlobalWeightSuggestion(exerciseId: string) {
  const lastData = await getLastWeightForExercise(exerciseId);
  if (!lastData) return null;

  const settings = await getUserSettings();
  const shouldNudge = lastData.hitTarget && settings.autoProgressWeight;
  const nudgeWeight = shouldNudge
    ? lastData.weight + settings.progressionIncrement
    : null;

  return {
    suggestedWeight: lastData.weight,    // Pre-fill with SAME weight
    lastWeight: lastData.weight,
    lastReps: lastData.reps,
    lastDate: lastData.date,
    hitTargetLastTime: lastData.hitTarget,
    shouldNudgeIncrease: shouldNudge,
    nudgeWeight,                          // Separate suggestion
  };
}

// WRONG: Auto-increasing without user awareness
return {
  suggestedWeight: lastData.hitTarget
    ? lastData.weight + 2.5  // User doesn't know why
    : lastData.weight,
};
```

### User Settings for Progression

```typescript
export interface UserSettings {
  autoProgressWeight: boolean;      // Enable/disable nudging
  progressionIncrement: number;     // Default 2.5kg
}
```

### Displaying the Nudge (UI Pattern)

```typescript
// CORRECT: Show current weight + optional nudge
function WeightInput({ exerciseId }) {
  const suggestion = await getGlobalWeightSuggestion(exerciseId);

  return (
    <div>
      <input defaultValue={suggestion.suggestedWeight} />
      {suggestion.shouldNudgeIncrease && (
        <NudgeCard>
          You hit all reps last time! Ready for {suggestion.nudgeWeight}kg?
        </NudgeCard>
      )}
    </div>
  );
}
```

### PR Detection

```typescript
// Check if this set is a Personal Record
export async function checkAndAddPR(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  unit: "kg" | "lbs",
  workoutLogId: string
): Promise<boolean> {
  const existingPRs = await getPersonalRecords(exerciseId);

  // PR if no existing record beats this weight+reps combo
  const isPR = !existingPRs.some(
    (pr) => pr.weight >= weight && pr.reps >= reps
  );

  if (isPR) {
    await addPersonalRecord({
      exerciseId,
      exerciseName,
      weight,
      reps,
      unit,
      date: getToday(),
      workoutLogId,
    });
  }

  return isPR;
}
```

## Files Using This Pattern

- `/lib/db.ts` - getGlobalWeightSuggestion, checkAndAddPR
- `/components/workout/SetInput.tsx` - Weight pre-fill UI
- `/components/workout/ChallengeCard.tsx` - Nudge display

## Gotchas

1. **Global not per-day** - User might do same exercise on different days
2. **Pre-fill vs auto-increase** - Always pre-fill same weight, nudge separately
3. **User override** - User can always ignore suggestion
4. **Multiple rep ranges** - Consider if 8 reps at 80kg beats 12 reps at 70kg
5. **Progression increment** - Let user configure (2.5kg default)
6. **Hit target = all reps** - Not just "close enough"

## Testing

1. Complete workout with 10 reps at 50kg (target: 10)
2. Next session: verify 50kg pre-filled, nudge shows 52.5kg
3. Complete with 8 reps (missed target)
4. Next session: verify no nudge appears
5. Test with autoProgressWeight disabled
6. Test exercise with no history (no suggestion)
