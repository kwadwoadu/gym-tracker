# PRD: Muscle Visualization

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-01-14
> **Roadmap Phase:** Phase 2 - Enhanced UX

---

## 1. Problem

Users can see which muscle groups an exercise targets (as text), but they:
- Can't quickly visualize which body parts are being worked
- Don't know if a muscle is a primary or secondary target
- Have no overview of weekly muscle coverage across their training
- Miss the educational/motivational aspect of seeing their body being trained

This limits understanding of program balance and makes it harder to identify if certain muscles are being neglected.

---

## 2. Solution

Add interactive SVG body diagrams that visually highlight muscles for each exercise. Users will see:
- **Per-exercise muscle maps** - Anatomical diagram showing primary (bright) vs secondary (dimmed) muscles
- **Quick muscle preview during workouts** - Compact visualization while logging sets
- **Weekly muscle coverage** - Stats page showing aggregate muscle work across the week

Visual style inspired by fitness apps like JEFIT, showing a human figure with highlighted muscle regions.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Feature usage | 60% of users view muscle diagram within first week | Track tap events on exercise cards |
| Session engagement | Users spend 5+ seconds viewing muscle info | Time tracking on expanded exercise view |
| Stats page visits | 20% increase in stats page views | Compare before/after stats page analytics |

---

## 4. Requirements

### Must Have
- [ ] SVG body diagram component (front + back views)
- [ ] Primary/secondary muscle distinction with visual differentiation
- [ ] Muscle visualization in exercise detail view
- [ ] Muscle preview during active workout session
- [ ] Update exercise data model to support primary/secondary muscle classification

### Should Have
- [ ] Weekly muscle coverage visualization on stats page
- [ ] Muscle filter in exercise browser (tap muscle to filter exercises)
- [ ] Smooth animations when highlighting muscles

### Won't Have (this version)
- Individual muscle head detail (e.g., biceps long head vs short head)
- 3D muscle visualization
- Muscle growth tracking or body composition
- Custom body type selection

---

## 5. User Flow

### Flow 1: Exercise Detail View
1. User taps exercise card in program view
2. Exercise detail sheet slides up
3. Body diagram shows with highlighted muscles
4. Primary muscles = bright accent color (#CDFF00)
5. Secondary muscles = dimmed color (50% opacity)
6. User taps muscle region for tooltip with muscle name

### Flow 2: During Workout
1. User is logging a set for current exercise
2. Compact muscle indicator shows in exercise header
3. Small body diagram (thumbnail size) with highlighted regions
4. Tapping expands to full muscle detail sheet

### Flow 3: Weekly Muscle Coverage (Stats)
1. User navigates to Stats page
2. "Muscle Coverage" section shows body diagram
3. Muscles colored by training volume this week:
   - Not trained = gray
   - Light training = light green
   - Moderate = medium green
   - Heavy = bright accent (#CDFF00)
4. Tapping a muscle shows exercises that targeted it

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `MuscleMap` | Full-size SVG body diagram (front + back) |
| `MuscleMapMini` | Compact 60x80px thumbnail for in-workout use |
| `MuscleHighlight` | Individual muscle region with fill color control |
| `MuscleLegend` | Primary/secondary color legend |
| `WeeklyMuscleHeatmap` | Stats page aggregate visualization |

### Visual Design

**Colors**:
- Primary muscle: `#CDFF00` (accent lime)
- Secondary muscle: `#CDFF00` at 40% opacity
- Untrained muscle: `#333333` (dark gray)
- Body outline: `#666666` (medium gray)

**Layout**:
- Full diagram: 200px wide, aspect ratio maintained
- Mini diagram: 60x80px
- Two views: Front (chest, biceps, quads, abs) / Back (back, triceps, hamstrings, glutes)

### Wireframe

```
┌─────────────────────────────────────────┐
│  Exercise Detail Sheet                   │
├─────────────────────────────────────────┤
│  [Video Thumbnail]                       │
│                                          │
│  Barbell Bench Press                     │
│  4 x 10-12 reps | T:30A1                │
│                                          │
│  ┌─────────┐  ┌─────────┐               │
│  │  FRONT  │  │  BACK   │               │
│  │   ██    │  │         │               │
│  │  ████   │  │   ▓▓    │  ← Primary    │
│  │  ▓▓▓▓   │  │         │  ← Secondary  │
│  │    │    │  │   │     │               │
│  │   │ │   │  │  │ │    │               │
│  └─────────┘  └─────────┘               │
│                                          │
│  ● Primary: Chest                        │
│  ○ Secondary: Triceps, Front Delts       │
│                                          │
│  [Form Cues...]                          │
└─────────────────────────────────────────┘
```

---

## 7. Technical Spec

### Data Model Changes

Update exercise muscle groups to distinguish primary vs secondary:

```typescript
// Current (flat array)
muscleGroups: ["chest", "triceps", "shoulders"]

// New (structured)
muscles: {
  primary: ["chest"],
  secondary: ["triceps", "front_delts"]
}
```

**Migration strategy**: Add `muscles` field alongside existing `muscleGroups`. Use `muscles` if present, fall back to `muscleGroups` (all treated as primary) for backward compatibility.

### SVG Muscle Mapping

Create mapping from muscle names to SVG path IDs:

```typescript
// /src/data/muscle-map.ts
export const MUSCLE_SVG_IDS = {
  chest: { view: 'front', pathId: 'chest-region' },
  back: { view: 'back', pathId: 'back-region' },
  biceps: { view: 'front', pathId: 'biceps-left,biceps-right' },
  triceps: { view: 'back', pathId: 'triceps-left,triceps-right' },
  quads: { view: 'front', pathId: 'quad-left,quad-right' },
  hamstrings: { view: 'back', pathId: 'hamstring-left,hamstring-right' },
  glutes: { view: 'back', pathId: 'glutes-region' },
  shoulders: { view: 'front', pathId: 'shoulder-left,shoulder-right' },
  front_delts: { view: 'front', pathId: 'front-delt-left,front-delt-right' },
  rear_delts: { view: 'back', pathId: 'rear-delt-left,rear-delt-right' },
  lateral_delts: { view: 'front', pathId: 'lat-delt-left,lat-delt-right' },
  lats: { view: 'back', pathId: 'lat-left,lat-right' },
  traps: { view: 'back', pathId: 'traps-region' },
  core: { view: 'front', pathId: 'abs-region' },
  obliques: { view: 'front', pathId: 'oblique-left,oblique-right' },
  forearms: { view: 'front', pathId: 'forearm-left,forearm-right' },
  calves: { view: 'back', pathId: 'calf-left,calf-right' },
  hip_flexors: { view: 'front', pathId: 'hip-flexor-left,hip-flexor-right' },
  erector_spinae: { view: 'back', pathId: 'erector-region' },
  rhomboids: { view: 'back', pathId: 'rhomboid-region' }
};
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `/src/components/shared/MuscleMap.tsx` | NEW - Main SVG body diagram component |
| `/src/components/shared/MuscleMapMini.tsx` | NEW - Compact variant for workout view |
| `/src/components/shared/muscle-svg.tsx` | NEW - SVG paths for body regions |
| `/src/components/stats/WeeklyMuscleHeatmap.tsx` | NEW - Stats page muscle coverage |
| `/src/data/muscle-map.ts` | NEW - Muscle to SVG path mapping |
| `/src/data/exercises.json` | MODIFY - Add primary/secondary muscle data |
| `/src/components/workout/exercise-card.tsx` | MODIFY - Add MuscleMapMini |
| `/src/app/exercises/[id]/page.tsx` | MODIFY - Add full MuscleMap to detail view |
| `/src/app/stats/page.tsx` | MODIFY - Add WeeklyMuscleHeatmap section |
| `/src/lib/db.ts` | MODIFY - Add weekly muscle volume query |

### API/Queries

| Query | Input | Output |
|-------|-------|--------|
| `getWeeklyMuscleVolume()` | `weekStart: Date` | `{ muscle: string, sets: number, volume: number }[]` |
| `getExercisesByMuscle()` | `muscle: string` | `Exercise[]` |

---

## 8. Implementation Plan

### Dependencies
- [ ] Source or create SVG body diagram asset (front + back views)
- [ ] Review existing muscle groups for completeness

### Build Order

1. [ ] **Create SVG assets** - Body diagram with named path IDs for each muscle
2. [ ] **Create MuscleMap component** - Render SVG with dynamic highlighting
3. [ ] **Update exercises.json** - Add primary/secondary classification to all 97 exercises
4. [ ] **Create muscle-map.ts** - Muscle name to SVG path mapping
5. [ ] **Add to exercise detail view** - Show MuscleMap when viewing exercise
6. [ ] **Create MuscleMapMini** - Compact variant
7. [ ] **Add to workout session** - Show mini map during set logging
8. [ ] **Create WeeklyMuscleHeatmap** - Stats page aggregate view
9. [ ] **Add getWeeklyMuscleVolume query** - Calculate muscle coverage
10. [ ] **Integrate with stats page** - Add muscle coverage section
11. [ ] **Add animations** - Smooth transitions when highlighting muscles
12. [ ] **Testing** - Verify on iOS Safari PWA, offline mode

### Agents to Consult
- **Frontend Specialist** - SVG component implementation, animations
- **Movement Specialist** - Verify primary/secondary muscle classifications
- **Database Specialist** - Weekly volume query optimization

### Risks

| Risk | Mitigation |
|------|------------|
| SVG complexity hurts performance | Use simple paths, lazy load, test on low-end devices |
| Muscle classification disputes | Consult Movement Specialist, use standard anatomical references |
| Data migration breaks existing logs | Backward-compatible schema with fallback |
| SVG not rendering in iOS Safari | Test early, use inline SVG not external file |

---

## 9. Testing

### Functional Tests
- [ ] MuscleMap renders all muscle regions correctly
- [ ] Primary muscles highlight in accent color
- [ ] Secondary muscles highlight in dimmed color
- [ ] Mini map shows in workout session
- [ ] Exercise detail view shows full map
- [ ] Weekly heatmap calculates correct volume per muscle
- [ ] Tapping muscle shows exercises that target it
- [ ] Works offline (no external SVG fetch)

### UI Verification
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome
- [ ] Verify 44px touch targets on muscle regions
- [ ] Check accessibility (color contrast, screen reader labels)
- [ ] Animations smooth at 60fps
- [ ] Dark theme colors render correctly

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

## Changelog

| Date | Change |
|------|--------|
| 2026-01-14 | Initial draft |
