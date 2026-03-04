# Start Workout as Hero Action

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P0
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

Users must scroll past multiple gamification widgets before reaching workout controls. The current home page layout stacks vertically:

1. Header (program name)
2. Streak Tracker (day streak + week progress)
3. XP Progress Bar (level, tier, XP to next)
4. Daily Challenges (variable height, up to 3 cards)
5. Weekly Challenges (variable height, up to 2 cards)
6. Day Tabs (training day selector)
7. Workout content (warmup, supersets, finisher)
8. Fixed bottom bar with "Start Workout" button

The primary action - starting a workout - requires either scrolling to view workout content or trusting the fixed bottom bar without context. On a typical session, 300-400px of gamification content sits between the header and the first piece of workout-relevant information.

For a user who opens the app at the gym ready to train, this creates unnecessary friction. The app should prioritize the workout start action above all else.

---

## 2. Solution

Restructure the home page to make starting a workout the hero action:

### Hero Workout Card
A persistent, prominent card at the top of the screen (directly below the header) that shows:
- Next logical training day name (e.g., "Upper Body - Push")
- Exercise count and estimated duration
- Large "Start Workout" CTA button
- "Quick Start" option that auto-selects the next training day based on workout history

### Compact Gamification Strip
Collapse the streak tracker, XP bar, and challenge progress into a single horizontal strip:
- Streak flame icon + count
- XP level badge
- Challenge progress (e.g., "2/3 daily, 1/2 weekly")
- Tappable to expand full gamification details

### Layout Order (New)
1. Header
2. **Hero Workout Card** (NEW)
3. **Compact Gamification Strip** (collapsed from 4 sections into 1)
4. Day Tabs + workout content

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to workout start | < 3 seconds from app launch | Track timestamp from page load to workout route navigation |
| Tap count to start | 1 tap (hero card) | UX audit |
| Quick Start usage | 30% of workout starts use Quick Start | Track Quick Start vs manual day selection |
| Home page scroll depth | 80% of users see workout content without scrolling | Viewport intersection observer |

---

## 4. Requirements

### Must Have
- [ ] Hero workout card at top of home page with "Start [Day Name]" CTA
- [ ] Quick Start button that auto-selects next logical training day
- [ ] Compact gamification strip replacing expanded streak/XP/challenge sections
- [ ] Gamification strip expandable to show full details
- [ ] Next day logic: check last completed workout, suggest the next day in sequence

### Should Have
- [ ] Estimated workout duration on hero card (based on exercise count and avg rest times)
- [ ] "Last completed" indicator showing when the user last trained
- [ ] Smooth expand/collapse animation for gamification strip
- [ ] Haptic feedback on Quick Start tap (iOS)

### Won't Have (this version)
- AI-powered workout recommendations based on fatigue/recovery
- Calendar-based day suggestions (e.g., "It's Monday, you usually do Push")
- Workout countdown timer on hero card

---

## 5. User Flow

### Flow 1: Quick Start
1. User opens app
2. Hero card shows "Upper Body - Push" with exercise count
3. User taps "Quick Start"
4. App determines next training day (Day 2 if Day 1 was last completed)
5. Navigates directly to `/workout/[dayId]`
6. Workout begins

### Flow 2: Manual Day Selection
1. User opens app
2. Hero card shows suggested day
3. User scrolls to Day Tabs and selects a different day
4. Hero card updates to show selected day
5. User taps "Start [Day Name]" on hero card
6. Navigates to `/workout/[dayId]`

### Flow 3: View Gamification
1. User opens app
2. Compact strip shows: streak flame (5), Lv.12, challenges (2/3)
3. User taps strip
4. Strip expands to show full XP bar, daily challenges, weekly challenges
5. User taps again or scrolls - strip collapses back

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `HeroWorkoutCard` | Primary CTA card with day name, stats, start button |
| `GamificationStrip` | Collapsed summary of streak/XP/challenges |
| `GamificationExpanded` | Full detail view (existing components composed) |
| `QuickStartButton` | Auto-select next training day and navigate |

### Visual Design

**Hero Card**:
- Background: `#1A1A1A` with subtle `#CDFF00` border-left accent (3px)
- Height: ~120px
- Day name: 20px bold white
- Stats row: 14px muted (exercise count, est. duration)
- CTA: Full-width `#CDFF00` button, 48px height, "Start [Day Name]" with Play icon
- Quick Start: Ghost button below CTA, "Quick Start: [Next Day]"

**Gamification Strip**:
- Background: `#111111`
- Height: 44px (collapsed), variable (expanded)
- Horizontal layout: flame + streak | level badge | challenge dots
- Chevron icon indicating expandable
- Accent color highlights for active streak/completed challenges

### Wireframe

```
+------------------------------------------+
| [Logo] SetFlow                    [gear] |
|          Nordic PPL                       |
+------------------------------------------+
| +--------------------------------------+ |
| | HERO CARD                            | |
| |                                      | |
| | Upper Body - Push            ~45min  | |
| | 6 exercises - 4 supersets            | |
| |                                      | |
| | [====== Start Upper Push =========]  | |
| |                                      | |
| | Quick Start: Lower Body (next)       | |
| +--------------------------------------+ |
+------------------------------------------+
| [flame] 5  |  Lv.12  |  2/3 daily  [v]  |
+------------------------------------------+
| [Day 1] [Day 2] [Day 3] [Day 4]         |
|                                           |
| Upper Body - Push                         |
| 4 supersets - 6 exercises                 |
|                                           |
| WARMUP                                    |
| ...                                       |
+------------------------------------------+
```

---

## 7. Technical Spec

### Next Day Logic

```typescript
// /src/lib/next-day.ts
export function getNextTrainingDay(
  sortedDays: TrainingDay[],
  workoutLogs: WorkoutLog[]
): TrainingDay | null {
  if (!sortedDays.length) return null;

  // Find last completed workout
  const lastLog = workoutLogs
    .filter(l => l.isComplete)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!lastLog) return sortedDays[0]; // First day if no history

  // Find which day was last completed
  const lastDayIndex = sortedDays.findIndex(d => d.id === lastLog.dayId);
  if (lastDayIndex === -1) return sortedDays[0];

  // Return next day in sequence (wrap around)
  const nextIndex = (lastDayIndex + 1) % sortedDays.length;
  return sortedDays[nextIndex];
}
```

### Estimated Duration

```typescript
// /src/lib/workout-duration.ts
export function estimateWorkoutDuration(day: TrainingDay): number {
  const warmupMinutes = (day.warmup?.length || 0) * 1.5;
  const supersets = day.supersets as Superset[];
  const exerciseMinutes = supersets.reduce((total, ss) => {
    return total + ss.exercises.reduce((exTotal, ex) => {
      const setTime = ex.sets * 1.5; // ~90s per set
      const restTime = ex.sets * ((ex.restSeconds || 90) / 60);
      return exTotal + setTime + restTime;
    }, 0);
  }, 0);
  const finisherMinutes = (day.finisher?.length || 0) * 3;

  return Math.round(warmupMinutes + exerciseMinutes + finisherMinutes);
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/HeroWorkoutCard.tsx` | Hero card with CTA and Quick Start |
| `src/components/home/GamificationStrip.tsx` | Collapsed gamification summary |
| `src/lib/next-day.ts` | Next training day logic |
| `src/lib/workout-duration.ts` | Workout duration estimation |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Restructure layout: hero card at top, compact gamification, move start button logic |
| `src/components/gamification/XPBar.tsx` | Add compact/inline variant for strip |
| `src/components/gamification/index.ts` | Export compact variants |

---

## 8. Implementation Plan

### Dependencies
- [ ] No external dependencies required
- [ ] Existing gamification components can be composed into strip

### Build Order

1. [ ] **Create `next-day.ts`** - Next training day selection logic
2. [ ] **Create `workout-duration.ts`** - Duration estimation utility
3. [ ] **Create `HeroWorkoutCard`** - Hero card component with CTA
4. [ ] **Create `GamificationStrip`** - Collapsed gamification summary
5. [ ] **Refactor `page.tsx`** - Move hero card to top, replace expanded gamification with strip
6. [ ] **Add expand/collapse** - Framer Motion animation for gamification detail toggle
7. [ ] **Wire Quick Start** - Connect next-day logic to router navigation
8. [ ] **Test** - Verify on iOS Safari PWA, offline mode, multiple program configurations

### Agents to Consult
- **Frontend Specialist** - Component composition, animation
- **UX Designer** - Hero card layout, tap target sizing

---

## 9. Testing

### Functional Tests
- [ ] Hero card displays correct next training day
- [ ] Quick Start navigates to correct workout
- [ ] Day wraps around (Day 4 -> Day 1) correctly
- [ ] Hero card updates when user manually selects different day tab
- [ ] Gamification strip shows correct streak, level, challenge counts
- [ ] Strip expands and collapses smoothly
- [ ] Duration estimate is reasonable (within 20% of actual)
- [ ] Works with 1-day, 3-day, 4-day, and 6-day programs

### UI Verification
- [ ] Hero card is visible without scrolling on iPhone SE (smallest viewport)
- [ ] CTA button meets 44px touch target minimum
- [ ] Quick Start text is readable (14px minimum)
- [ ] Dark theme colors render correctly (#1A1A1A card on #0A0A0A bg)
- [ ] Animations smooth at 60fps
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
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| No workout history (new user) | Quick Start defaults to Day 1 |
| All days completed this week | Show Day 1 with "New cycle" label |
| Program has only 1 day | Hide Quick Start (same as selected) |
| User mid-workout (active session) | Hero card shows "Resume Workout" instead of "Start" |
| No active program | Hero card shows "Select Program" CTA |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gamification strip feels too compressed | Users miss challenge details | Expandable detail view, visual indicator for incomplete challenges |
| Quick Start picks wrong day | User frustration | Show day name clearly, allow override via tabs |
| Hero card pushes content below fold | Less workout preview visible | Keep hero card compact (~120px), test on small viewports |
| Breaking change for existing layout | Regression | Feature flag for gradual rollout |

---

## Dependencies

- None - this is a pure frontend restructure using existing data queries
- Should be implemented before `smart-home-dashboard.md` (PRD 3) as that builds on this layout

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
