# PRD: Global Weight Memory + Edit Completed Sets

**Status**: In Progress
**Created**: 2026-01-01
**Author**: Kwadwo Adu

---

## 1. Problem Statement

1. **Weight not remembered**: The app doesn't remember what weight I used last time for an exercise. Even if I did the same exercise last week, the weight field doesn't pre-fill with my previous weight.

2. **No progressive overload nudge**: When I hit my target reps, there's no gamified encouragement to try a heavier weight next time.

3. **Can't edit completed sets**: Once I log a set during a workout, I can't go back and fix mistakes (wrong reps, weight, or RPE).

---

## 2. Solution

Two features working together to support progressive overload and data accuracy:

**Feature A: Global Weight Memory + Progressive Overload Nudge**
- Search all workout logs across all training days to find the last weight used for each exercise
- Pre-fill the weight input with the last used weight
- Show a gamified "challenge card" when the user hit their target reps last time, suggesting a small weight increase (default +2.5kg)

**Feature B: Edit Completed Sets**
- Allow editing of completed sets during an active workout session
- Allow editing of sets from workout history via stats/recent workouts
- Bottom drawer UI matching the existing SetLogger component style

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Weight pre-fill accuracy | 100% for exercises with history | Manual verification across exercise types |
| Challenge card display rate | Shows on every qualifying exercise | Verify card appears when target reps were hit last session |
| Challenge card acceptance rate | >30% accept | Track accept vs dismiss in analytics |
| Edit feature usage | >5 edits per week for active users | Count edit operations per user per week |
| Data accuracy improvement | Fewer mis-logged sets | Compare set correction rate before/after |

---

## 4. Requirements

### Must Have
- [x] `getLastWeightForExercise()` DB function searches all workout logs
- [x] Weight input pre-fills with last used weight for exercise
- [ ] Challenge card appears when user hit target reps last time
- [ ] Challenge card shows suggested weight (last weight + 2.5kg)
- [ ] Challenge card is dismissible (stored in session state)
- [ ] Edit completed sets during active workout
- [ ] Edit drawer with weight, reps, RPE inputs
- [ ] Volume auto-recalculates after edit
- [ ] Edit sets from workout history (stats page)

### Should Have
- [ ] Accept button on challenge card applies suggested weight
- [ ] Framer Motion entrance/exit animations on challenge card
- [ ] Lime glow pulse animation on challenge card border
- [ ] Collapsible completed sets list below active set

### Won't Have (this version)
- PR recalculation on set edits (handle in future)
- Custom progression increment per exercise
- Weight memory across different rep ranges (e.g. 5x5 vs 3x10)

---

## 5. User Flows

### Flow A: Weight Memory + Progressive Overload
1. User navigates to workout page for a training day
2. User taps an exercise to start logging
3. System queries `getGlobalWeightSuggestion(exerciseId)`
4. If previous data exists, weight input pre-fills with last used weight
5. If user hit target reps last time, challenge card appears above the set logger
6. User taps "Accept" to apply suggested weight, or "X" to dismiss
7. Dismissed state persists in React state for the session (resets next workout)
8. User completes the set and logs it

### Flow B: Edit Set During Workout
1. User is in an active workout session
2. User scrolls down to the completed sets section
3. User taps a completed set row (exercise name + weight/reps badge)
4. Edit drawer slides up from the bottom
5. User modifies weight, reps, or RPE using +/- buttons or direct input
6. User taps "Save" to confirm or "Cancel" to discard
7. Volume and stats recalculate automatically
8. Completed sets list updates with new values

### Flow C: Edit Set From History
1. User navigates to Stats page
2. User views recent workouts section
3. User taps a set badge on a past workout
4. Edit drawer slides up with current values pre-filled
5. User modifies values and taps "Save"
6. Workout log updates in IndexedDB
7. Cloud sync triggers if signed in

---

## 6. Design

### Wireframes

```
Challenge Card:
┌─────────────────────────────────────────┐
│  ┌──────┐                               │
│  │  ↑   │  Ready to level up?          │
│  │ icon │  Try 17.5kg (+2.5kg)         │
│  └──────┘                               │
│           [  Accept  ]        [ X ]     │
└─────────────────────────────────────────┘
  Border: 1px solid #CDFF00 with glow

Edit Set Drawer:
┌─────────────────────────────────────────┐
│  ──────────  (drag handle)              │
│                                          │
│  Weight (kg)                            │
│  [ - ]    17.5    [ + ]                 │
│                                          │
│  Reps                                   │
│  [ - ]     8      [ + ]                 │
│                                          │
│  RPE                                    │
│  ○──────────●────── 7/10                │
│                                          │
│  [ Cancel ]            [ Save ]         │
└─────────────────────────────────────────┘

Completed Sets List (during workout):
┌─────────────────────────────────────────┐
│  ▼ Completed Sets (3)                   │
│  ┌───────────────────────────────────┐  │
│  │ Bench Press       15kg x 8  RPE7 │  │
│  ├───────────────────────────────────┤  │
│  │ Bench Press       15kg x 8  RPE8 │  │
│  ├───────────────────────────────────┤  │
│  │ Bench Press       17.5kg x 6 RPE9│  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Component Table

| Component | File | Props |
|-----------|------|-------|
| ChallengeCard | `/src/components/workout/challenge-card.tsx` | `suggestedWeight`, `lastWeight`, `onAccept`, `onDismiss` |
| EditSetDrawer | `/src/components/workout/edit-set-drawer.tsx` | `set`, `isOpen`, `onSave`, `onClose` |
| CompletedSetsList | `/src/components/workout/completed-sets-list.tsx` | `sets`, `onEditSet` |

### Visual Spec

| Element | Property | Value |
|---------|----------|-------|
| Challenge card background | Color | `#1A1A1A` |
| Challenge card border | Color | `#CDFF00` with `box-shadow: 0 0 12px rgba(205, 255, 0, 0.3)` |
| Challenge card pulse | Animation | `2s ease-in-out infinite` border glow |
| Accept button | Background | `#CDFF00`, text `#0A0A0A` |
| Dismiss button | Style | Ghost, `#666666` icon |
| Edit drawer background | Color | `#1A1A1A` |
| Edit drawer handle | Color | `#2A2A2A`, 40px wide, 4px tall, rounded |
| +/- buttons | Size | 44x44px, `#2A2A2A` bg |
| RPE slider track | Color | `#2A2A2A`, filled portion `#CDFF00` |
| Save button | Background | `#CDFF00`, text `#0A0A0A`, 56px height |
| Cancel button | Style | Ghost, `#A0A0A0` text |
| Completed set row | Background | `#111111`, border-bottom `#2A2A2A` |

---

## 7. Technical Spec

### TypeScript Schemas

```typescript
// Weight suggestion response
interface WeightSuggestion {
  suggestedWeight: number;
  lastWeight: number;
  lastReps: number;
  hitTargetLastTime: boolean;
  shouldNudgeIncrease: boolean;
  nudgeWeight: number | null;
}

// Last weight lookup response
interface LastWeightResult {
  weight: number;
  reps: number;
  targetReps: number;
  date: string;
  hitTarget: boolean;
}

// Set edit payload
interface SetEditPayload {
  weight?: number;
  actualReps?: number;
  rpe?: number;
}

// Challenge card state
interface ChallengeCardState {
  dismissed: Set<string>; // exerciseIds dismissed this session
}
```

### New Database Functions (`/src/lib/db.ts`)

```typescript
getLastWeightForExercise(exerciseId: string): Promise<LastWeightResult | null>

getGlobalWeightSuggestion(exerciseId: string): Promise<WeightSuggestion | null>

updateSetInWorkoutLog(workoutLogId: string, setId: string, updates: SetEditPayload): Promise<boolean>
```

### Files to Create

| File | Description |
|------|-------------|
| `/src/components/workout/challenge-card.tsx` | Gamified progressive overload nudge with lime glow |
| `/src/components/workout/edit-set-drawer.tsx` | Bottom drawer for editing completed sets |
| `/src/components/workout/completed-sets-list.tsx` | Collapsible list of completed sets during workout |

### Files to Modify

| File | Changes |
|------|---------|
| `/src/lib/db.ts` | Add `getLastWeightForExercise`, `getGlobalWeightSuggestion`, `updateSetInWorkoutLog` |
| `/src/components/workout/set-logger.tsx` | Add `globalSuggestion` prop, render ChallengeCard above inputs |
| `/src/app/workout/[dayId]/page.tsx` | Fetch global suggestions, render completed sets list, wire edit drawer |
| `/src/components/stats/recent-workouts.tsx` | Make set badges tappable, open edit drawer on tap |
| `/src/app/stats/page.tsx` | Handle `onSetEdited` callback, invalidate queries after edit |

---

## 8. Implementation Plan

### Dependencies Checklist
- [x] IndexedDB workout logs exist with weight/reps data
- [x] SetLogger component exists and accepts props
- [x] Framer Motion installed for animations
- [x] Stats page with recent workouts section exists
- [ ] None blocking, can start immediately

### Build Order

**Phase 1: Weight Memory (2 days)**
1. [ ] Implement `getLastWeightForExercise()` in db.ts
2. [ ] Implement `getGlobalWeightSuggestion()` in db.ts
3. [ ] Wire weight pre-fill into SetLogger component
4. [ ] Test pre-fill across multiple exercises and training days

**Phase 2: Challenge Card (1 day)**
5. [ ] Create ChallengeCard component with lime glow animation
6. [ ] Add challenge card rendering in SetLogger when suggestion available
7. [ ] Implement dismiss logic (session-scoped React state)
8. [ ] Wire "Accept" button to apply suggested weight

**Phase 3: Edit Sets (2 days)**
9. [ ] Implement `updateSetInWorkoutLog()` in db.ts
10. [ ] Create EditSetDrawer component
11. [ ] Create CompletedSetsList component
12. [ ] Wire edit drawer into workout page for active sessions
13. [ ] Wire edit drawer into stats page for history edits
14. [ ] Add volume recalculation after edits

**Phase 4: Testing + Polish (1 day)**
15. [ ] End-to-end testing of all flows
16. [ ] Verify offline functionality
17. [ ] Test on iOS Safari PWA
18. [ ] Deploy to Vercel

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| No previous data for exercise | Use default weight (20kg), do not show challenge card |
| First time doing an exercise | No suggestion available, weight input starts empty |
| User dismissed challenge | Stored in React state (Set of exerciseIds), resets each workout |
| Edit changes total volume | Recalculate total volume immediately after save |
| Edit creates new PR | Not handled in v1, future enhancement |
| Edit invalidates existing PR | Not handled in v1, future enhancement |
| Cloud sync after history edit | Trigger `pushToCloud()` after edit if signed in |
| Concurrent edits (two tabs) | IndexedDB handles last-write-wins, acceptable for v1 |
| Very large weight values | Cap at 999kg, validate input range |
| Negative reps or weight | Validate minimum 0 for reps, 0.5 for weight |

---

## 10. Testing

### Functional Tests
- [ ] `getLastWeightForExercise` returns correct weight for exercise with history
- [ ] `getLastWeightForExercise` returns null for exercise without history
- [ ] `getGlobalWeightSuggestion` returns +2.5kg when target reps were hit
- [ ] `getGlobalWeightSuggestion` returns same weight when target reps were not hit
- [ ] `updateSetInWorkoutLog` updates the correct set in the correct workout log
- [ ] Volume recalculates correctly after set edit
- [ ] Challenge card dismiss state persists within session
- [ ] Challenge card dismiss state resets on new workout

### UI Verification
- [ ] Weight input pre-fills with last used weight on exercise start
- [ ] Challenge card renders with lime glow animation
- [ ] Challenge card "Accept" updates weight input to suggested value
- [ ] Challenge card "X" dismisses and does not reappear for that exercise
- [ ] Edit drawer opens on completed set tap
- [ ] Edit drawer +/- buttons change weight/reps correctly
- [ ] RPE slider moves and displays correct value
- [ ] Save button closes drawer and updates the set row
- [ ] Cancel button closes drawer without saving
- [ ] Completed sets list is collapsible
- [ ] All touch targets are at least 44x44px
- [ ] Works offline (no network required)
- [ ] Works on iOS Safari in PWA mode

---

## 11. Launch Checklist

- [ ] Weight pre-fill works for all exercises with prior history
- [ ] Challenge card appears when target reps were hit last time
- [ ] Challenge card dismiss works and persists per session
- [ ] Edit drawer opens from both active workout and history
- [ ] Volume recalculates after edits
- [ ] Cloud sync triggers after history edits (if signed in)
- [ ] All animations run at 60fps
- [ ] Works completely offline
- [ ] iOS Safari PWA tested
- [ ] Deploy to gym.adu.dk via `npx vercel --prod`

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Weight query slow with large history | Degraded UX on exercise start | Index workout logs by exerciseId, limit query to last 30 days first |
| Challenge card feels annoying | Users dismiss and ignore it | Dismissible per session, subtle animation, only shows when relevant |
| Editing history causes data inconsistency | PRs or streaks become inaccurate | v1 does not recalculate PRs on edit, documented as known limitation |
| Edit drawer blocks workout flow | Frustrating mid-workout UX | Drawer is swipe-dismissible, fast save, no confirmation dialog |
| Suggested weight increment too small/large | Irrelevant suggestions | Default 2.5kg works for most exercises, future: per-exercise config |

---

## 13. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| IndexedDB workout logs (Dexie.js) | Available | Weight/reps data already stored |
| SetLogger component | Available | Needs new prop for global suggestion |
| Framer Motion | Installed | Used for challenge card + drawer animations |
| Stats/recent workouts section | Available | Needs tappable set badges |
| Cloud sync (`pushToCloud`) | Available | Needs trigger after history edits |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-01 | Initial PRD created |
| 2026-03-26 | PRD quality audit: added missing sections (solution, user flows, design wireframes, component table, visual spec, implementation plan, testing, launch checklist, risks & mitigations, dependencies, changelog), reformatted to 14-section standard |
