# Swipe-Based Workout Flow

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - UX Polish

---

## 1. Problem

The current workout session page (`/workout/[dayId]`) has two UX friction points:

**Tab navigation requires precise taps.** Exercises within supersets are navigated via tab controls. During a workout - when hands are sweaty, grip is fatigued, and attention is split - precise tapping on small tab targets leads to mis-taps and frustration.

**Set logging replaces the full screen.** When the `SetLogger` component is active (weight input, rep count, RPE selection), it takes over the entire viewport. The user loses context of where they are in the workout, how many exercises remain, and their overall progress. After logging a set, the transition back is jarring.

These issues compound during high-intensity training when cognitive load should be minimal and interactions should be muscle-memory simple.

---

## 2. Solution

Replace tab-based exercise navigation with gesture-driven flows:

### Horizontal Swipe Navigation
- Swipe right to advance to the next exercise
- Swipe left to go back to the previous exercise
- Each exercise occupies a full-width pane in a horizontal carousel
- Embla Carousel (already a dependency from onboarding) handles gesture physics

### Bottom Sheet Set Logger
- Set logging slides up as a bottom sheet (drawer) instead of replacing the screen
- Sheet covers ~60% of the viewport, keeping exercise name and progress dots visible at top
- User can see which exercise they are on while logging
- Drag down to dismiss sheet, swipe to next exercise

### Progress Dots
- Horizontal dot indicators at the top of the workout screen
- Filled dot = exercise complete (all sets logged)
- Current dot = highlighted with accent color
- Empty dot = exercise remaining
- Shows overall workout progress at a glance

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Exercise transition time | < 1 second (swipe) vs current ~2s (tap) | Timestamp between exercise views |
| Mis-tap rate | Reduce by 50% | Track tap corrections (going back immediately after advancing) |
| Workout completion rate | Maintain or improve current rate | Compare pre/post completion percentages |
| Set logging speed | No regression from current flow | Time from sheet open to set logged |
| Progress visibility | 100% of users can see progress dots during set logging | Bottom sheet height leaves dots visible |

---

## 4. Requirements

### Must Have
- [ ] Horizontal swipe between exercises using Embla Carousel
- [ ] Bottom sheet for set logging (Drawer component from shadcn/ui)
- [ ] Progress dots showing exercise completion status
- [ ] Swipe right = next exercise, left = previous
- [ ] Exercise content visible above bottom sheet during set logging
- [ ] Maintain all existing set logging functionality (weight, reps, RPE, challenge card)

### Should Have
- [ ] Haptic feedback on swipe completion (iOS)
- [ ] Snap animation when swiping between exercises
- [ ] Auto-advance to next exercise after completing all sets
- [ ] Superset grouping visible in progress dots (grouped dots with bracket)
- [ ] Swipe disabled during active rest timer (prevent accidental navigation)

### Won't Have (this version)
- Vertical swipe between sets within an exercise
- Voice-controlled set logging
- Workout reordering via drag-and-drop
- Split-screen view showing two exercises simultaneously

---

## 5. User Flow

### Flow 1: Normal Workout Progression
1. User starts workout from home page
2. First exercise shows full-screen with exercise name, sets/reps target, muscle map mini
3. Progress dots at top: [*] [ ] [ ] [ ] [ ] [ ]
4. User taps "Log Set" button at bottom
5. Bottom sheet slides up with weight input, rep counter, RPE slider
6. User logs set, sheet stays open for next set
7. After final set, sheet auto-dismisses
8. User swipes right to next exercise
9. Progress dots update: [x] [*] [ ] [ ] [ ] [ ]

### Flow 2: Skip and Return
1. User is on exercise 3
2. Cable machine is occupied - user swipes right twice to exercise 5
3. Progress dots: [x] [x] [ ] [ ] [*] [ ]
4. User completes exercise 5
5. User swipes left twice back to exercise 3
6. Progress dots: [x] [x] [*] [ ] [x] [ ]
7. Cable machine is free - user completes exercise 3

### Flow 3: Superset Workflow
1. Superset A contains exercises 1a and 1b
2. User completes set 1 of exercise 1a
3. Swipes right to exercise 1b
4. Completes set 1 of exercise 1b
5. Rest timer starts (covers bottom, progress dots still visible)
6. Timer completes, user swipes left back to 1a for set 2
7. Progress dots show superset grouping: [(x)(x)] [( )( )] [( )]

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `WorkoutCarousel` | Embla Carousel wrapping exercise panes |
| `ExercisePane` | Full-width exercise view (name, targets, muscle map, log button) |
| `ProgressDots` | Horizontal dot indicators with completion state |
| `SetLoggerSheet` | Bottom sheet variant of SetLogger |
| `SupersetDotGroup` | Grouped dots for superset exercises |

### Visual Design

**Progress Dots**:
- Dot size: 8px diameter, 6px gap
- Complete: `#CDFF00` filled
- Current: `#CDFF00` with pulse animation
- Remaining: `#333333` filled
- Superset group: dots closer together (3px gap) with subtle bracket below

**Exercise Pane**:
- Full viewport width
- Content vertically centered in available space (above sheet)
- Exercise name: 24px bold
- Set/rep target: 16px muted
- Muscle map mini: 60x80px, top-right corner
- "Log Set" button: full-width, 48px, accent color, bottom of pane

**Bottom Sheet**:
- Height: 60% of viewport (snap point)
- Background: `#1A1A1A`
- Drag handle: 40px wide, 4px tall, `#333333`, centered at top
- Contains: weight input, rep counter, RPE slider, challenge card, "Log Set" CTA
- Dismiss: drag down or tap outside

### Wireframe

```
+------------------------------------------+
| [<] Upper Body - Push           Set 2/4  |
+------------------------------------------+
| [x] [x] [*] [ ] [ ] [ ]    <- dots      |
+------------------------------------------+
|                                          |
|                              [muscle]    |
|     Barbell Bench Press                  |
|     4 x 10-12 reps | T:30A1             |
|                                          |
|     Set 2 of 4                           |
|     Last: 80kg x 10                      |
|                                          |
|                                          |
|                                          |
+==========================================+
| -------- (drag handle) --------          |
|                                          |
|  Weight (kg)     [  80  ] [-] [+]        |
|  Reps            [  10  ] [-] [+]        |
|  RPE             [||||......] 8          |
|                                          |
|  [======== Log Set ================]     |
|  [Skip Set]                              |
+------------------------------------------+
```

---

## 7. Technical Spec

### Carousel Implementation

```typescript
// Uses Embla Carousel (already installed for onboarding)
import useEmblaCarousel from 'embla-carousel-react';

function WorkoutCarousel({ exercises, onExerciseChange }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    watchDrag: (api, event) => {
      // Disable swipe during rest timer
      if (isRestTimerActive) return false;
      return true;
    },
  });

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      const index = emblaApi.selectedScrollSnap();
      onExerciseChange(index);
    });
  }, [emblaApi]);

  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex">
        {exercises.map((ex, i) => (
          <ExercisePane key={ex.id} exercise={ex} index={i} />
        ))}
      </div>
    </div>
  );
}
```

### Bottom Sheet Integration

```typescript
// Uses shadcn/ui Drawer (Vaul) - already installed
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

function SetLoggerSheet({ exercise, setNumber, onLog, onSkip }: Props) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full h-12 bg-primary">
          Log Set {setNumber}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[60vh]">
        <SetLogger
          exercise={exercise}
          setNumber={setNumber}
          onLog={onLog}
          onSkip={onSkip}
          variant="sheet" // New prop for sheet-optimized layout
        />
      </DrawerContent>
    </Drawer>
  );
}
```

### Flattening Supersets for Carousel

```typescript
// /src/lib/flatten-exercises.ts
export interface FlatExercise {
  exerciseId: string;
  supersetId: string;
  supersetLabel: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
  indexInSuperset: number;
  supersetSize: number;
}

export function flattenSupersets(supersets: Superset[]): FlatExercise[] {
  return supersets.flatMap(ss =>
    ss.exercises.map((ex, i) => ({
      ...ex,
      supersetId: ss.id,
      supersetLabel: ss.label,
      indexInSuperset: i,
      supersetSize: ss.exercises.length,
    }))
  );
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/workout/WorkoutCarousel.tsx` | Embla Carousel wrapper for exercises |
| `src/components/workout/ExercisePane.tsx` | Full-width exercise view pane |
| `src/components/workout/ProgressDots.tsx` | Dot indicators with completion state |
| `src/components/workout/SetLoggerSheet.tsx` | Bottom sheet wrapper for SetLogger |
| `src/lib/flatten-exercises.ts` | Utility to flatten supersets into linear exercise list |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/workout/[dayId]/page.tsx` | Replace tab navigation with carousel, integrate bottom sheet |
| `src/components/workout/set-logger.tsx` | Add `variant` prop for sheet-optimized layout |
| `src/components/workout/rest-timer.tsx` | Ensure timer works above bottom sheet |
| `src/components/workout/exercise-card.tsx` | Adapt for full-pane display |
| `src/components/workout/superset-view.tsx` | May be replaced by carousel panes |

---

## 8. Implementation Plan

### Dependencies
- [x] `embla-carousel-react` - Already installed (used in onboarding)
- [x] `@/components/ui/drawer` - Already installed (Vaul via shadcn/ui)
- [ ] Review existing workout page state management for compatibility

### Build Order

1. [ ] **Create `flatten-exercises.ts`** - Utility to linearize supersets
2. [ ] **Create `ProgressDots`** - Dot indicators component
3. [ ] **Create `ExercisePane`** - Single exercise full-width view
4. [ ] **Create `WorkoutCarousel`** - Embla wrapper with swipe handling
5. [ ] **Modify `set-logger.tsx`** - Add sheet variant with compact layout
6. [ ] **Create `SetLoggerSheet`** - Drawer wrapper for set logger
7. [ ] **Refactor workout page** - Replace tabs with carousel + bottom sheet
8. [ ] **Handle rest timer** - Ensure timer overlay works with new layout
9. [ ] **Superset dot grouping** - Visual grouping in progress dots
10. [ ] **Auto-advance** - Move to next exercise after final set
11. [ ] **Testing** - Verify gestures on iOS Safari PWA, offline mode

### Agents to Consult
- **Frontend Specialist** - Gesture handling, carousel physics, bottom sheet UX
- **Movement Specialist** - Validate superset workflow makes sense with swipe model

---

## 9. Testing

### Functional Tests
- [ ] Swipe right advances to next exercise
- [ ] Swipe left returns to previous exercise
- [ ] Cannot swipe past first/last exercise
- [ ] Progress dots update on exercise completion
- [ ] Bottom sheet opens with correct exercise data
- [ ] Set logging works correctly in sheet (weight, reps, RPE)
- [ ] Challenge card appears in sheet when applicable
- [ ] Rest timer displays correctly above/over sheet
- [ ] Auto-advance works after completing all sets
- [ ] Skipping exercises works (swipe past, return later)
- [ ] Workout completion triggers correctly after all exercises done
- [ ] Swipe disabled during rest timer countdown
- [ ] Exercise data persists when swiping away and back

### UI Verification
- [ ] Smooth 60fps swipe animations
- [ ] Bottom sheet snap point at 60% viewport
- [ ] Progress dots visible during set logging (above sheet)
- [ ] Touch targets meet 44px minimum
- [ ] Dark theme colors correct
- [ ] Works offline (IndexedDB data)
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome
- [ ] Test on iPhone SE (smallest viewport)
- [ ] Test on iPad (larger viewport)

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
| Single exercise workout | No swipe needed, progress dot = 1 dot |
| 10+ exercises | Progress dots shrink to fit (6px at 10+, 4px at 15+) |
| User rotates device mid-workout | Carousel re-initializes at current index |
| Bottom sheet open + swipe attempt | Sheet intercepts vertical gesture, horizontal swipe works on pane above sheet |
| Rest timer active + swipe | Swipe disabled, visual lock indicator shown |
| Offline mid-workout | All state in local storage/IndexedDB, no disruption |
| Superset with 3+ exercises | All exercises get individual panes, grouped in dots |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Swipe conflicts with bottom sheet gestures | Mis-navigation during set logging | Horizontal swipe only on exercise pane area (above sheet) |
| Embla Carousel performance with heavy exercise panes | Jank during swipe | Virtualize panes - only render current +/- 1 |
| Users expect tap navigation (muscle memory) | Confusion for existing users | Keep day tab selector at top, add swipe tutorial overlay on first use |
| Superset workflow unclear with linear swipe | Users miss paired exercises | Visual grouping in dots + "Superset A1/A2" label on pane |
| Bottom sheet height varies per device | Set logger may be cramped | Responsive snap points: 50% on tall devices, 65% on short |

---

## Dependencies

- `hero-workout-action.md` (PRD 1) should ship first - it restructures the home page which feeds into the workout start flow
- Existing skip button functionality from `setflow-v2-fixes.md` integrates into bottom sheet

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
