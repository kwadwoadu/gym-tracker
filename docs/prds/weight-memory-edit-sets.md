# PRD: Global Weight Memory + Edit Completed Sets

**Status**: In Progress
**Created**: 2026-01-01
**Author**: Kwadwo Adu

---

## Problem Statement

1. **Weight not remembered**: The app doesn't remember what weight I used last time for an exercise. Even if I did the same exercise last week, the weight field doesn't pre-fill with my previous weight.

2. **No progressive overload nudge**: When I hit my target reps, there's no gamified encouragement to try a heavier weight next time.

3. **Can't edit completed sets**: Once I log a set during a workout, I can't go back and fix mistakes (wrong reps, weight, or RPE).

---

## Requirements

### Feature 1: Global Weight Memory + Progressive Overload Nudge

#### User Stories
- As a user, I want the app to remember my last weight for each exercise across ALL training days, so I don't have to remember or look it up
- As a user, I want to see a motivating challenge when I'm ready to increase weight, so I'm encouraged to progress
- As a user, I can dismiss the challenge if I'm not ready, so I don't feel pressured

#### Specifications
1. **Weight Memory**: Search ALL workout logs (not just same training day) to find last weight used for exercise
2. **Pre-fill**: Automatically fill weight input with last used weight
3. **Challenge Card**: Show only when user hit target reps last time
   - Dismissible card with lime glow/pulse animation
   - "Ready to level up? Try {suggestedWeight}kg"
   - Accept button applies the suggested weight
   - X button dismisses (stored in session, resets each workout)
4. **Suggested Increase**: Last weight + progressionIncrement (default 2.5kg)

### Feature 2: Edit Completed Sets

#### User Stories
- As a user, I want to edit sets I've already completed during my workout, so I can fix mistakes
- As a user, I want to edit sets from my workout history, so I can correct errors after the fact

#### Specifications
1. **During Workout**: Show list of completed sets, tappable to edit
2. **From History**: Tap any set badge in stats/history to edit
3. **Edit Drawer**: Bottom drawer with weight, reps, RPE inputs (same UI as SetLogger)
4. **Auto-recalculate**: Volume updates after edits

---

## Technical Design

### New Database Functions (`/src/lib/db.ts`)

```typescript
// Get last weight for exercise across ALL workouts
getLastWeightForExercise(exerciseId: string): Promise<{
  weight: number;
  reps: number;
  targetReps: number;
  date: string;
  hitTarget: boolean;
} | null>

// Get weight suggestion with progressive overload logic
getGlobalWeightSuggestion(exerciseId: string): Promise<{
  suggestedWeight: number;
  lastWeight: number;
  lastReps: number;
  hitTargetLastTime: boolean;
  shouldNudgeIncrease: boolean;
  nudgeWeight: number | null;
} | null>

// Update a specific set within a workout log
updateSetInWorkoutLog(workoutLogId: string, setId: string, updates: {
  weight?: number;
  actualReps?: number;
  rpe?: number;
}): Promise<boolean>
```

### New Components

| Component | Purpose |
|-----------|---------|
| `/src/components/workout/challenge-card.tsx` | Gamified progressive overload nudge with glow |
| `/src/components/workout/edit-set-drawer.tsx` | Bottom drawer for editing sets |

### Modified Files

| File | Changes |
|------|---------|
| `/src/lib/db.ts` | Add 3 new functions |
| `/src/components/workout/set-logger.tsx` | Add globalSuggestion prop, show ChallengeCard |
| `/src/app/workout/[dayId]/page.tsx` | Fetch global suggestions, show completed sets list, add edit drawer |
| `/src/components/stats/recent-workouts.tsx` | Make set badges tappable, add edit drawer |
| `/src/app/stats/page.tsx` | Handle onSetEdited callback |

---

## UI/UX Design

### Challenge Card
- Dark card with lime (#CDFF00) border glow
- Pulsing animation (2s ease-in-out infinite)
- Icon: TrendingUp or Dumbbell
- Text: "Ready to level up? Try 17.5kg"
- Buttons: "Accept" (primary) + "X" dismiss
- Framer Motion entrance/exit

### Edit Set Drawer
- Same visual style as SetLogger
- Weight: Display with +/- quick buttons
- Reps: Counter with +/- buttons
- RPE: Slider 1-10 with color coding
- Footer: Cancel (ghost) + Save (primary)

### Completed Sets List (During Workout)
- Collapsible section below current set
- Each row: Exercise name + weight/reps badge
- Tap to open edit drawer
- Subtle background to differentiate from active area

---

## Edge Cases

1. **No previous data**: Use default weight (20kg), no challenge card
2. **First time doing exercise**: No suggestion available
3. **User dismissed challenge**: Stored in React state (resets each workout)
4. **Edit affects volume**: Recalculate total volume after save
5. **Edit affects PRs**: Could create new PR or invalidate existing (handle in future)
6. **Cloud sync**: Trigger sync after history edits

---

## Success Metrics

- Weight pre-fill accuracy: 100% for exercises with history
- Challenge card engagement rate: Track accept vs dismiss
- Edit feature usage: Track edits per workout session

---

## Implementation Checklist

- [ ] Add DB functions (getLastWeightForExercise, getGlobalWeightSuggestion, updateSetInWorkoutLog)
- [ ] Create EditSetDrawer component
- [ ] Add completed sets list to workout page
- [ ] Wire up edit during workout
- [ ] Add edit from history (RecentWorkouts)
- [ ] Create ChallengeCard component
- [ ] Integrate global suggestions into SetLogger
- [ ] Test end-to-end
- [ ] Deploy to Vercel
