# PRD: Built-in Deload Week

> **Status:** Shipped
> **Owner:** Kwadwo
> **Created:** 2026-03-27
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - AI Features

---

## 1. Problem

SetFlow detects when a deload is needed (via `detectDeloadNeed()` analyzing RPE, consecutive weeks, and performance decline) and shows a "Deload Recommended" card on the home screen. But there is NO way to actually execute a deload. Users see the recommendation, then have to mentally track reduced weights themselves. This means:

1. No structured deload execution - users guess how much to reduce
2. Weight memory gets polluted - deload weights overwrite normal weight suggestions
3. No tracking of deload progress - no way to know when the deload week ends
4. No reassurance that normal weights are preserved

Without this, the deload detection feature is informational only, not actionable.

---

## 2. Solution

Two-screen deload flow (based on approved prototype #6):

**Screen 1 - Guided Entry**: When deload is recommended, show a bottom sheet explaining WHY (data-driven reasons), WHAT (protocol with exact weight reductions per exercise), and reassuring that weight memory is preserved. One-tap "Start Deload Week" activation.

**Screen 2 - Week Tracker**: During an active deload week, the home page shows a progress dashboard with day counter, ring progress, exercise cards with deload weights, and week history. Weight memory is preserved by marking deload workouts with `isDeload: true` and filtering them out of weight suggestion queries.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Deload activation rate | >40% of users who see recommendation activate it | Track "Start Deload Week" taps vs recommendation displays |
| Deload completion rate | >70% complete full 7-day deload | Track deload start vs Day 7 completion |
| Weight memory accuracy | 100% return to pre-deload weights | Verify `getLastWeightForExercise` skips deload logs |
| Post-deload performance | >60% hit target reps on first normal session | Compare pre-deload stall vs post-deload performance |

---

## 4. Requirements

### Must Have
- [ ] `isDeload` boolean field on WorkoutLog (Dexie schema v8)
- [ ] `getLastWeightForExercise()` filters out deload-marked logs
- [ ] Active deload state persisted in localStorage (`setflow-deload-session`)
- [ ] Guided bottom sheet with reasons, protocol, and weight preview
- [ ] "Start Deload Week" activates 7-day deload period
- [ ] Deload progress tracker on home page during active deload
- [ ] Exercise cards show original weight (strikethrough) and deload weight (yellow)
- [ ] Weight reduction applied automatically based on protocol (30% default)
- [ ] "End Deload Early" with confirmation dialog
- [ ] Deload auto-ends after 7 days

### Should Have
- [ ] Day-by-day history showing completed deload workouts
- [ ] Ring/circular progress indicator (Day X of 7)
- [ ] Stats grid (intensity reduction, volume reduction, days remaining)
- [ ] Green reassurance card showing preserved weight memory
- [ ] Smooth transitions between guided entry and tracker screens

### Won't Have (this version)
- Custom deload duration (always 7 days)
- Custom reduction percentage per exercise
- Deload history (past deload weeks)
- AI-optimized deload protocol (uses fixed 30%/-40% for now)

---

## 5. User Flows

### Flow 1: Activate Deload
1. User opens SetFlow home page
2. TrainingInsights card shows "Deload Recommended" (existing)
3. User taps the card -> bottom sheet slides up
4. Sheet shows: why (3 data-driven reasons), protocol (exercises with weight reductions), weight memory reassurance
5. User taps "Start Deload Week"
6. Checkmark animation plays
7. Sheet closes, home page shows deload tracker dashboard
8. Deload session saved to localStorage with start date and protocol

### Flow 2: Workout During Deload
1. User opens home during active deload
2. Deload tracker shows Day X of 7 with progress
3. Exercise cards show reduced weights (e.g., ~~95kg~~ -> 67kg)
4. User taps "Start Today's Workout"
5. Workout starts with deload weights pre-filled
6. Workout saved with `isDeload: true` flag
7. `getLastWeightForExercise()` ignores this log for future weight suggestions

### Flow 3: End Deload (Automatic)
1. After Day 7, deload auto-ends
2. Home page returns to normal (no tracker)
3. Next workout: weight suggestions come from pre-deload history (95kg, not 67kg)
4. ChallengeCard may appear if target reps were hit pre-deload

### Flow 4: End Deload Early
1. User taps "End Deload Early" during active deload
2. Confirmation dialog: "End deload early? You've completed X of 7 days."
3. "End Now" clears deload session, returns to normal
4. "Keep Going" dismisses dialog

---

## 6. Design

Based on approved prototype: `~/Desktop/setflow-deload-prototypes/06-combined-guided-tracker.html`

### Components

| Component | File | Purpose |
|-----------|------|---------|
| DeloadSheet | `src/components/deload/DeloadSheet.tsx` | Guided bottom sheet with reasons + protocol |
| DeloadTracker | `src/components/deload/DeloadTracker.tsx` | Week-long progress dashboard |
| DeloadExerciseCard | `src/components/deload/DeloadExerciseCard.tsx` | Exercise with strikethrough + deload weight |
| DeloadConfirmDialog | `src/components/deload/DeloadConfirmDialog.tsx` | End early confirmation |

### Visual Spec

| Element | Value |
|---------|-------|
| Deload accent | #EAB308 (yellow-500) |
| Deload card border | 1px solid #EAB308/40 |
| Deload badge bg | #EAB308/20 |
| Strikethrough weight | #666666, line-through |
| Deload weight | #EAB308, font-bold |
| Progress ring | #EAB308 stroke, #2A2A2A track |
| Reassurance card | #CDFF00/10 bg, #CDFF00 border |
| "Start Deload" CTA | #EAB308 bg, white text, 56px |
| "End Early" button | ghost, #EAB308 text |

---

## 7. Technical Spec

### Schema Change (Dexie v8)

```typescript
// src/lib/db.ts - WorkoutLog interface
export interface WorkoutLog {
  // ... existing fields
  isDeload?: boolean; // NEW: marks workout as part of a deload week
}

// Dexie version bump
db.version(8).stores({
  // Same stores, no index change needed (isDeload queried via filter)
});
```

### Deload Session State (localStorage)

```typescript
// src/lib/deload.ts
interface DeloadSession {
  startDate: string; // ISO date
  endDate: string; // ISO date (startDate + 7 days)
  protocol: {
    intensityReduction: number; // 0.3 = 30%
    volumeReduction: number; // 0.4 = 40%
  };
  exerciseWeights: Record<string, { normal: number; deload: number }>;
}

function getActiveDeload(): DeloadSession | null
function startDeload(protocol: DeloadRecommendation['protocol']): DeloadSession
function endDeload(): void
function isDeloadActive(): boolean
function getDeloadDay(): number // 1-7
function getDeloadWeight(exerciseId: string, normalWeight: number): number
```

### Weight Memory Filter

```typescript
// src/lib/db.ts - getLastWeightForExercise modification
export async function getLastWeightForExercise(exerciseId: string) {
  const logs = await db.workoutLogs
    .filter((log) => log.isComplete && !log.isDeload) // ADD: skip deload logs
    .reverse()
    .sortBy("date");
  // ... rest unchanged
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/deload.ts` | Deload session management (localStorage) |
| `src/components/deload/DeloadSheet.tsx` | Guided bottom sheet |
| `src/components/deload/DeloadTracker.tsx` | Week progress dashboard |
| `src/components/deload/DeloadExerciseCard.tsx` | Exercise with deload weight |
| `src/components/deload/DeloadConfirmDialog.tsx` | End early confirmation |

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/db.ts` | Add `isDeload` to WorkoutLog, bump to v8, filter in `getLastWeightForExercise` |
| `src/lib/workout-helpers.ts` | `getGlobalWeightSuggestion` respects deload filter |
| `src/hooks/use-workout-session.ts` | Pass `isDeload` to workout log creation in `finishWorkout` |
| `src/components/home/TrainingInsights.tsx` | Make deload card tappable, open DeloadSheet |
| `src/app/page.tsx` | Render DeloadTracker when deload is active (replaces normal dashboard) |
| `src/components/workout/set-logger.tsx` | Pre-fill deload weight when deload active |

---

## 8. Implementation Plan

### Dependencies
- [x] Deload detection (`deload-detector.ts`) - exists
- [x] Weight memory (`getLastWeightForExercise`) - exists
- [x] Prototype approved (06-combined-guided-tracker.html)
- [ ] None blocking

### Build Order

1. [ ] Create `src/lib/deload.ts` - session management utilities
2. [ ] Modify `src/lib/db.ts` - add `isDeload` to WorkoutLog, bump schema to v8
3. [ ] Modify `src/lib/db.ts` - filter deload logs in `getLastWeightForExercise`
4. [ ] Modify `src/lib/workout-helpers.ts` - respect deload in weight suggestions
5. [ ] Create `DeloadSheet.tsx` - guided bottom sheet (from prototype 6, Screen 1)
6. [ ] Create `DeloadTracker.tsx` - progress dashboard (from prototype 6, Screen 2)
7. [ ] Create `DeloadExerciseCard.tsx` - exercise with deload weight display
8. [ ] Create `DeloadConfirmDialog.tsx` - end early confirmation
9. [ ] Modify `TrainingInsights.tsx` - open DeloadSheet on tap
10. [ ] Modify `page.tsx` - render DeloadTracker during active deload
11. [ ] Modify `use-workout-session.ts` - mark workouts as deload
12. [ ] Modify `set-logger.tsx` - pre-fill deload weights

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User has no workout history for an exercise | Can't calculate deload weight, skip that exercise |
| Deload spans across week boundary | Use calendar days, not training days |
| User doesn't train during deload week | Deload still auto-ends after 7 calendar days |
| Multiple programs active | Deload applies to all exercises globally |
| User changes program during deload | Deload continues, new exercises get deload weights from their history |
| App cleared / reinstalled during deload | Deload session lost (localStorage), but `isDeload` flags on logs persist |
| Very short deload (ended Day 1) | Allowed, weight memory still correct |

---

## 10. Testing

### Functional Tests
- [ ] `isDeload` field persists on WorkoutLog after save
- [ ] `getLastWeightForExercise` returns pre-deload weight, not deload weight
- [ ] Deload session starts and ends correctly via localStorage
- [ ] `getDeloadDay()` returns correct day (1-7)
- [ ] Auto-end works after 7 calendar days
- [ ] End early clears deload session
- [ ] Deload weight = normal weight * (1 - intensityReduction)

### UI Verification
- [ ] Bottom sheet opens from TrainingInsights card
- [ ] Sheet shows correct reasons from `detectDeloadNeed()`
- [ ] Exercise weights match protocol reduction
- [ ] Tracker shows correct day progress
- [ ] Ring/progress bar animates
- [ ] "End Deload Early" shows confirmation
- [ ] Post-deload: weight suggestions return to normal
- [ ] All touch targets 44px+
- [ ] Works offline (localStorage + IndexedDB)
- [ ] iOS Safari PWA tested

---

## 11. Launch Checklist

- [ ] Code complete
- [ ] Dexie schema v8 migration tested
- [ ] Weight memory preservation verified end-to-end
- [ ] Deployed to gym.adu.dk
- [ ] Tested on iOS Safari PWA
- [ ] CHANGELOG updated

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema migration breaks existing data | Workout logs lost | `isDeload` is optional boolean, defaults to undefined (falsy) |
| Deload weight suggestion during normal training | Wrong weight shown | Filter is in `getLastWeightForExercise`, tested explicitly |
| User forgets deload is active | Trains at reduced weights unknowingly | Persistent yellow banner + tracker on home page |
| localStorage cleared | Deload session lost | `isDeload` flag on logs persists in IndexedDB as backup |

---

## 13. Dependencies

| Dependency | Status |
|------------|--------|
| `detectDeloadNeed()` | Complete (deload-detector.ts) |
| `getLastWeightForExercise()` | Complete (db.ts) |
| TrainingInsights card | Complete (TrainingInsights.tsx) |
| Vaul drawer (shadcn) | Installed |
| Framer Motion | Installed |
| Prototype 6 approved | Complete (~/Desktop/setflow-deload-prototypes/) |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-27 | Initial PRD created from approved prototype #6 (guided modal + week tracker) |
| 2026-03-27 | Shipped: wired deload components into TrainingInsights, home page, workout session, and set logger |
