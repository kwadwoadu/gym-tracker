# Smart Contextual Home Dashboard

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

The home page shows the same layout regardless of context. Whether it is 6am on a rest day or 5pm right after finishing a workout, the user sees the identical arrangement of gamification widgets, day tabs, and exercise lists.

This means:
- **Morning**: No workout preview or time estimate to plan the day
- **Pre-workout**: No warmup checklist or readiness prompt
- **Post-workout**: No session summary, no celebration, no recovery tips
- **Rest day**: Same training UI shown even though no workout is planned

The home page should feel like a personal trainer who knows what time it is, what you did yesterday, and what you should focus on right now.

---

## 2. Solution

Implement a context-aware dashboard that adapts its primary content block based on four states:

### Morning State (5:00 - 10:00, training day)
- Today's workout preview card with exercise list and time estimate
- "Ready to Train?" prompt
- Yesterday's recovery notes (if post-workout data exists)
- Streak maintenance reminder if at risk

### Pre-Workout State (user taps "Ready" or within 30min of usual workout time)
- Warmup checklist (dynamic based on today's muscle groups)
- Hydration reminder
- Last session's performance summary for same workout day
- Quick-access to start workout

### Post-Workout State (within 2 hours of completing a workout)
- Session summary: duration, total volume, sets completed, PRs hit
- Celebration animation for milestones (new PR, streak milestone, challenge completed)
- Recovery tips based on muscle groups trained
- Next workout preview with rest day count

### Rest Day State (no workout scheduled or completed today)
- Recovery tips and mobility suggestions
- Next workout preview with countdown ("Push day in 2 days")
- Streak maintenance activity (e.g., "Log a stretch to keep your streak")
- Weekly progress summary

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Home page engagement | 20% increase in time-on-page | Analytics timestamp tracking |
| Post-workout view rate | 80% of users see post-workout summary | Track state transitions |
| Recovery tip interaction | 30% of rest day users tap a recovery suggestion | Track tap events |
| Workout preview accuracy | Time estimate within 15% of actual | Compare estimate vs completed duration |
| Context detection accuracy | 95% correct state assignment | Manual QA across time zones |

---

## 4. Requirements

### Must Have
- [ ] Four dashboard states: Morning, Pre-Workout, Post-Workout, Rest Day
- [ ] Time-of-day detection for morning state (5:00 - 10:00 local time)
- [ ] Workout completion detection for post-workout state
- [ ] Rest day detection based on training schedule
- [ ] Today's workout preview with exercise list and duration estimate
- [ ] Post-workout session summary with volume and PR data
- [ ] Smooth transition between states

### Should Have
- [ ] Recovery tips based on trained muscle groups
- [ ] Celebration animations for PRs and milestones
- [ ] "Last time you did this workout" comparison
- [ ] Warmup checklist for pre-workout state
- [ ] Streak risk warning ("Train today to keep your 5-day streak!")
- [ ] Next workout countdown on rest days

### Won't Have (this version)
- Whoop recovery integration for readiness score
- Weather-based outdoor workout suggestions
- Social feed or community activity on dashboard
- AI-generated workout modifications based on fatigue
- Calendar integration for scheduling workouts

---

## 5. User Flow

### Flow 1: Morning Training Day
1. User opens app at 7:00am on a training day
2. Dashboard shows Morning state
3. Hero section: "Today: Upper Body - Push" with exercise list preview
4. Stats row: "~45 min | 6 exercises | 4 supersets"
5. Below: "Last time (Feb 28): 12,450kg total volume, PR on bench press"
6. CTA: "Start Workout" (from hero-workout-action PRD)
7. Compact gamification strip below

### Flow 2: Post-Workout
1. User completes workout and returns to home page
2. Dashboard shows Post-Workout state
3. Celebration card: "Great session!" with confetti animation
4. Summary: Duration (52 min), Volume (14,200kg), Sets (24/24), PRs (1)
5. PR highlight: "New PR! Bench Press: 85kg x 10 reps"
6. Recovery section: "You trained chest, triceps, shoulders. Rest these groups for 48h."
7. Next preview: "Next workout: Lower Body (tomorrow)"

### Flow 3: Rest Day
1. User opens app on a non-training day
2. Dashboard shows Rest Day state
3. Recovery card: "Recovery Day - Your muscles are rebuilding"
4. Trained yesterday: muscle group heatmap with recovery timeline
5. Mobility suggestion: "Try 10 min hip flexor stretch (you trained legs yesterday)"
6. Next workout: "Push day in 2 days" with exercise preview
7. Weekly progress: "3/4 workouts completed this week"
8. Streak: "Keep your 5-day streak - log a stretch or walk"

### Flow 4: Pre-Workout
1. User taps "I'm ready" on morning card, or it is their usual workout time
2. Dashboard transitions to Pre-Workout state
3. Warmup checklist appears based on today's muscle groups
4. Hydration reminder: "Drink 500ml water before starting"
5. Performance context: "Last Push day: bench 80kg x 10. Try 82.5kg today?"
6. Large CTA: "Start Upper Body - Push"

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `DashboardStateProvider` | Context provider managing current dashboard state |
| `MorningDashboard` | Morning state layout |
| `PreWorkoutDashboard` | Pre-workout state with warmup checklist |
| `PostWorkoutDashboard` | Post-workout summary and celebrations |
| `RestDayDashboard` | Rest day recovery tips and next workout preview |
| `WorkoutPreviewCard` | Compact exercise list with duration |
| `SessionSummaryCard` | Post-workout stats summary |
| `RecoveryTipsCard` | Muscle recovery suggestions |
| `StreakRiskBanner` | Warning when streak is at risk |
| `CelebrationOverlay` | Confetti/animation for milestones |

### Visual Design

**State Indicator**:
- Small pill badge at top showing current state
- Morning: sun icon + "Good morning"
- Pre-workout: fire icon + "Ready to train"
- Post-workout: trophy icon + "Session complete"
- Rest day: moon icon + "Recovery day"

**Color Accents by State**:
- Morning: `#CDFF00` (default accent)
- Pre-workout: `#FF6B35` (warm orange)
- Post-workout: `#00D4AA` (success green)
- Rest day: `#7B8CDE` (calm blue)

**Layout**: Each state uses the same container structure (hero card area + content area) but fills it with different content. The hero card position from `hero-workout-action.md` remains constant.

### Wireframe - Post-Workout State

```
+------------------------------------------+
| [Logo] SetFlow                    [gear] |
|          Nordic PPL                       |
+------------------------------------------+
| [trophy] Session Complete                |
+------------------------------------------+
| +--------------------------------------+ |
| | GREAT SESSION!                       | |
| |                                      | |
| |  52 min  |  14,200kg  |  24/24 sets  | |
| |                                      | |
| |  NEW PR: Bench Press 85kg x 10      | |
| |                                      | |
| +--------------------------------------+ |
+------------------------------------------+
| RECOVERY                                 |
| +--------------------------------------+ |
| | Chest, Triceps, Shoulders trained    | |
| | Rest these groups for 48 hours       | |
| |                                      | |
| | [muscle heatmap mini]               | |
| +--------------------------------------+ |
+------------------------------------------+
| NEXT WORKOUT                             |
| +--------------------------------------+ |
| | Lower Body - tomorrow               | |
| | 5 exercises - ~40 min               | |
| +--------------------------------------+ |
+------------------------------------------+
| [flame] 6  |  Lv.12  |  3/3 daily  [v] |
+------------------------------------------+
```

### Wireframe - Rest Day State

```
+------------------------------------------+
| [Logo] SetFlow                    [gear] |
|          Nordic PPL                       |
+------------------------------------------+
| [moon] Recovery Day                      |
+------------------------------------------+
| +--------------------------------------+ |
| | YOUR MUSCLES ARE REBUILDING          | |
| |                                      | |
| | Yesterday: Push (chest, tri, delts)  | |
| | Recovery: ~36h remaining             | |
| |                                      | |
| | [muscle recovery heatmap]           | |
| +--------------------------------------+ |
+------------------------------------------+
| MOBILITY SUGGESTION                      |
| +--------------------------------------+ |
| | 10 min hip flexor stretch            | |
| | Great for desk workers + leg day     | |
| | [Start Mobility]                     | |
| +--------------------------------------+ |
+------------------------------------------+
| NEXT WORKOUT                             |
| +--------------------------------------+ |
| | Push day in 2 days                   | |
| | Upper Body - Push                    | |
| | 6 exercises - ~45 min               | |
| +--------------------------------------+ |
+------------------------------------------+
| THIS WEEK: 3/4 workouts completed        |
+------------------------------------------+
| [flame] 6  |  Lv.12  |  2/3 daily  [v] |
+------------------------------------------+
```

---

## 7. Technical Spec

### Dashboard State Machine

```typescript
// /src/lib/dashboard-state.ts
export type DashboardState = 'morning' | 'pre-workout' | 'post-workout' | 'rest-day';

export interface DashboardContext {
  state: DashboardState;
  todayWorkout: TrainingDay | null;
  lastCompletedWorkout: WorkoutLog | null;
  nextWorkout: { day: TrainingDay; daysUntil: number } | null;
  isRestDay: boolean;
  streakAtRisk: boolean;
}

export function determineDashboardState(
  currentHour: number,
  todayWorkout: TrainingDay | null,
  recentLogs: WorkoutLog[],
  trainingDaysPerWeek: number[],
): DashboardState {
  const today = new Date();
  const todayDayOfWeek = today.getDay();

  // Check if workout was completed in last 2 hours
  const recentCompletion = recentLogs.find(log => {
    const logTime = new Date(log.completedAt || log.date);
    const hoursAgo = (Date.now() - logTime.getTime()) / (1000 * 60 * 60);
    return log.isComplete && hoursAgo < 2;
  });

  if (recentCompletion) return 'post-workout';

  // Check if rest day
  const isTrainingDay = todayWorkout !== null;
  if (!isTrainingDay) return 'rest-day';

  // Morning state (5:00 - 10:00)
  if (currentHour >= 5 && currentHour < 10) return 'morning';

  // Default to morning for training days outside specific windows
  return 'morning';
}
```

### Recovery Tips Engine

```typescript
// /src/lib/recovery-tips.ts
export interface RecoveryTip {
  title: string;
  description: string;
  duration: string;
  muscleGroups: string[];
}

const RECOVERY_TIPS: Record<string, RecoveryTip[]> = {
  chest: [
    { title: "Doorway Chest Stretch", description: "Hold for 30s each side", duration: "2 min", muscleGroups: ["chest"] },
    { title: "Foam Roll Pecs", description: "Slow rolls across chest", duration: "3 min", muscleGroups: ["chest"] },
  ],
  legs: [
    { title: "Hip Flexor Stretch", description: "Kneeling lunge stretch, 30s per side", duration: "3 min", muscleGroups: ["hip_flexors", "quads"] },
    { title: "Foam Roll Quads", description: "Front of thigh, pause on tender spots", duration: "4 min", muscleGroups: ["quads"] },
  ],
  // ... more muscle groups
};

export function getRecoveryTips(trainedMuscles: string[]): RecoveryTip[] {
  return trainedMuscles
    .flatMap(muscle => RECOVERY_TIPS[muscle] || [])
    .slice(0, 3); // Max 3 suggestions
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/dashboard-state.ts` | State machine for dashboard context detection |
| `src/lib/recovery-tips.ts` | Recovery tip engine based on trained muscles |
| `src/components/home/DashboardStateProvider.tsx` | Context provider for dashboard state |
| `src/components/home/MorningDashboard.tsx` | Morning state layout |
| `src/components/home/PreWorkoutDashboard.tsx` | Pre-workout layout with warmup checklist |
| `src/components/home/PostWorkoutDashboard.tsx` | Post-workout summary |
| `src/components/home/RestDayDashboard.tsx` | Rest day recovery and next workout |
| `src/components/home/WorkoutPreviewCard.tsx` | Compact workout preview |
| `src/components/home/SessionSummaryCard.tsx` | Post-workout stats card |
| `src/components/home/RecoveryTipsCard.tsx` | Recovery suggestions card |
| `src/components/home/StreakRiskBanner.tsx` | Streak at-risk warning |
| `src/components/home/CelebrationOverlay.tsx` | Confetti animation for milestones |
| `src/data/recovery-tips.ts` | Recovery tip data by muscle group |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Integrate DashboardStateProvider, render state-specific dashboard |
| `src/lib/queries.ts` | Add `useRecentWorkouts` hook for last 24h workout detection |
| `src/lib/api-client.ts` | Add query for recent workout logs with time filter |

---

## 8. Implementation Plan

### Dependencies
- [ ] `hero-workout-action.md` (PRD 1) should ship first - this builds on the hero card layout
- [ ] `workout-duration.ts` from PRD 1 needed for time estimates
- [ ] Existing stats queries provide volume and PR data

### Build Order

1. [ ] **Create `dashboard-state.ts`** - State machine logic
2. [ ] **Create `DashboardStateProvider`** - React context for state
3. [ ] **Create `WorkoutPreviewCard`** - Reusable preview component
4. [ ] **Create `MorningDashboard`** - Morning state with workout preview
5. [ ] **Create `PostWorkoutDashboard`** - Session summary and celebration
6. [ ] **Create `SessionSummaryCard`** - Stats summary component
7. [ ] **Create `CelebrationOverlay`** - Confetti/milestone animation
8. [ ] **Create `RestDayDashboard`** - Recovery tips and next workout
9. [ ] **Create `RecoveryTipsCard`** - Recovery suggestions
10. [ ] **Create `recovery-tips.ts`** - Tip data for all muscle groups
11. [ ] **Create `PreWorkoutDashboard`** - Warmup checklist and readiness
12. [ ] **Create `StreakRiskBanner`** - At-risk streak warning
13. [ ] **Integrate into `page.tsx`** - Wire state provider and conditional rendering
14. [ ] **Testing** - All four states across time zones, offline, PWA

### Agents to Consult
- **Frontend Specialist** - State management, animation
- **Wellness Director** - Recovery tip accuracy and timing
- **Movement Specialist** - Warmup checklist content

---

## 9. Testing

### Functional Tests
- [ ] Morning state appears between 5:00 - 10:00 on training days
- [ ] Post-workout state appears within 2 hours of workout completion
- [ ] Rest day state appears on non-training days
- [ ] Pre-workout state appears when user taps "Ready"
- [ ] Workout preview shows correct exercises and duration
- [ ] Session summary shows accurate volume, sets, PRs
- [ ] Recovery tips match trained muscle groups
- [ ] Streak risk banner appears when streak will break without training today
- [ ] Next workout countdown is accurate
- [ ] State transitions are smooth (no flicker)
- [ ] Dashboard state persists across page refreshes within same time window
- [ ] Works with different program sizes (1-day, 3-day, 6-day)

### UI Verification
- [ ] State indicator pill shows correct icon and text
- [ ] Color accents change per state
- [ ] Celebration animation plays smoothly
- [ ] Recovery heatmap renders correctly
- [ ] All cards meet 44px touch target minimum
- [ ] Dark theme colors correct across all states
- [ ] Works offline (all data from local cache)
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested
- [ ] All 4 states manually tested
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User in different timezone than server | Use `Intl.DateTimeFormat` for local time, never server time |
| Workout completed at 11:59pm | Post-workout state persists for 2 hours, even past midnight |
| User has no workout history | Morning state with generic preview, no "last time" comparison |
| User works out at unusual hours (2am) | State machine still works - post-workout triggers on completion, not time |
| Multiple workouts in one day | Post-workout shows most recent session |
| App opened mid-workout (resumed session) | No dashboard change - stays in workout flow |
| Rest day but user wants to train | "Start Workout" still accessible via hero card/day tabs below |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State detection inaccurate | Wrong dashboard shown | Use multiple signals (time + workout data), allow manual override |
| Recovery tips medically inaccurate | User harm | Disclaim tips, keep suggestions to stretching/mobility only |
| Post-workout celebration feels gimmicky | User annoyance | Make celebration subtle (brief animation), skippable |
| Too many components on home page | Performance regression | Lazy load state-specific components, only render active state |
| Time-of-day logic brittle across timezones | Wrong state for travelers | Always use `new Date()` client-side, never server timezone |

---

## Dependencies

- `hero-workout-action.md` (PRD 1) - Hero card layout is the foundation
- `workout-duration.ts` from PRD 1 for time estimates
- Existing muscle visualization (`WeeklyMuscleHeatmap`) can be reused for recovery heatmap

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
