# Exercise Database PRD

**Status**: In Progress
**Created**: 2026-01-01
**Author**: Kwadwo Adu

---

## 1. Problem Statement

- Current exercise database has only 27 exercises
- Program JSON files reference exercises that don't exist (e.g., `ex-barbell-bench`, `ex-pullup`)
- Users see incomplete workouts with empty supersets
- Limited equipment variety (missing many commercial gym and bodyweight options)

---

## 2. Solution

Expand `src/data/exercises.json` from 27 to ~97 exercises covering all major muscle groups and equipment types, and ensure all program files reference valid exercise IDs.

### Exercise Categories

**Chest (10)**: Barbell Bench, Incline Barbell Bench, Decline Barbell Bench, Incline DB Press, Flat DB Press, Decline DB Press, Cable Fly, Incline Cable Fly, Chest Dips, Machine Chest Press

**Back (12)**: Pull-up, Chin-up, Wide Lat Pulldown, Neutral Pulldown, Close Grip Pulldown, Barbell Row, Dumbbell Row, Seated Cable Row, T-Bar Row, Chest Supported Row, Straight Arm Pulldown, Deadlift

**Shoulders (10)**: OHP, DB Shoulder Press, Arnold Press, Lateral Raises, Cable Lateral Raises, Front Raises, Incline Delt Press, Machine Shoulder Press, Face Pulls, Y-Raises

**Rear Delts (5)**: Rear Delt Fly, Rear Delt Cable Fly, Rear Delt Cable Row, Reverse Pec Deck, Band Pull-Aparts

**Triceps (8)**: Pushdown, Rope Pushdown, Overhead Extension, Cross Cable Extension, Skull Crushers, Kickback, Close Grip Bench, Tricep Dips

**Biceps (8)**: Barbell Curl, EZ Bar Curl, Dumbbell Curl, Hammer Curl, Incline Bicep Curls, Preacher Curl, Cable Curl, Concentration Curl

**Quads (8)**: Back Squat, Front Squat, Hack Squat, Leg Press, Leg Extension, RFESS, Walking Lunge, Goblet Squat

**Hamstrings (6)**: RDL, Dumbbell RDL, Lying Ham Curl, Seated Leg Curl, Nordic Curl, Good Morning

**Glutes (6)**: Hip Thrust, Glute Bridge Machine, Cable Kickback, Sumo Deadlift, Hip Abduction, Step-Ups

**Calves (4)**: Standing Calf Raise, Seated Calf Raise, Leg Press Calf, Tibialis Raise

**Abs/Core (8)**: Ab Crunch Machine, Cable Crunch, Hanging Leg Raise, Lying Leg Raise, Plank, Russian Twist, Ab Wheel, Woodchop

**Warmup/Mobility (12)**: Band Pull-Aparts, Band Face Pulls, Shoulder Circles, Arm Circles, Hip Circles, Cat-Cow, BW Squats, Glute Bridges BW, Dead Hang, World's Greatest Stretch, Leg Swings, Thoracic Rotation

### Equipment Types Supported
`barbell`, `dumbbells`, `machine`, `cable`, `bodyweight`, `band`, `bench`, `pull-up-bar`, `dip-station`, `leg-press`, `plate`, `ab-wheel`

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Exercise count | 97 exercises in exercises.json | `Object.keys(exercises).length` |
| Program completeness | All programs load without missing exercise errors | Load each program, verify no empty supersets |
| Equipment coverage | All 12 equipment types represented | Count distinct equipment values |
| Muscle group coverage | All major muscle groups have 4+ exercises | Group exercises by muscleGroups, count per group |
| Zero broken references | 0 programs reference non-existent exercise IDs | Cross-reference program JSONs with exercises.json |

---

## 4. Requirements

### Must Have
- [x] Expand exercises.json from 27 to ~97 exercises
- [ ] All exercise IDs follow `ex-{descriptive-name}` format
- [ ] All exercises have `muscleGroups` array populated
- [ ] All exercises have `equipment` field populated
- [ ] PPL 6-day program references only valid exercise IDs
- [ ] Upper/Lower 4-day program references only valid exercise IDs
- [x] Full Body 3-day program references only valid exercise IDs
- [ ] Each exercise has `isCustom: false` for preset exercises

### Should Have
- [ ] Video URLs for top 20 most common exercises
- [ ] Warmup/mobility exercises for all program types
- [ ] Consistent muscle group naming across all exercises

### Won't Have (this version)
- Video URLs for all 97 exercises (can be added later)
- Custom exercise creation UI (separate PRD)
- Exercise search/filter UI (separate PRD)

---

## 5. User Flows

### Flow A: Program Loads With All Exercises
1. User selects a preset program during onboarding (PPL, Upper/Lower, Full Body)
2. System loads program JSON with training day definitions
3. For each superset exercise, system looks up `exerciseId` in exercises.json
4. All exercises resolve to valid entries with name, muscle groups, equipment
5. User sees complete training day with all supersets populated
6. No empty sections or "Unknown Exercise" placeholders

### Flow B: Exercise Display in Workout
1. User starts a workout for a training day
2. System loads exercises for the day's supersets and warmup
3. Each exercise card shows: name, muscle groups, equipment icon
4. Tempo notation (T:XYZW) displays correctly for each exercise
5. Rest timer shows the correct rest seconds per exercise

### Flow C: Adding Exercises to Programs (Future)
1. User navigates to program editor
2. User searches exercises by name or muscle group
3. Exercise picker shows all 97 exercises grouped by category
4. User selects exercise and assigns sets, reps, tempo, rest

---

## 6. Design

### Wireframes

```
Exercise Card (in Workout View):
┌─────────────────────────────────────────┐
│  ┌──────┐  Barbell Bench Press          │
│  │ icon │  Chest | Barbell               │
│  └──────┘  T:3010 | Rest: 90s           │
│                                          │
│  Set 1: __ kg x 8 reps                 │
│  Set 2: __ kg x 8 reps                 │
│  Set 3: __ kg x 6 reps                 │
│  Set 4: __ kg x 6 reps                 │
└─────────────────────────────────────────┘

Exercise Library (Future):
┌─────────────────────────────────────────┐
│  Search exercises...           [Filter] │
│─────────────────────────────────────────│
│  CHEST (10)                             │
│  ├─ Barbell Bench Press      barbell    │
│  ├─ Incline Barbell Bench    barbell    │
│  ├─ Flat Dumbbell Press      dumbbells  │
│  └─ ...                                 │
│  BACK (12)                              │
│  ├─ Pull-up                  pull-up-bar│
│  └─ ...                                 │
└─────────────────────────────────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| ExerciseCard | `/src/components/workout/exercise-card.tsx` | Display exercise in workout view |
| ExerciseLibrary | (future) | Browseable exercise catalog |
| EquipmentIcon | `/src/components/shared/equipment-icon.tsx` | Icon per equipment type |

### Visual Spec

| Element | Property | Value |
|---------|----------|-------|
| Exercise card background | Color | `#1A1A1A` |
| Exercise name | Font | 16px semibold `#FFFFFF` |
| Muscle group tag | Font | 12px `#A0A0A0` |
| Equipment tag | Font | 12px `#A0A0A0` |
| Category header | Font | 14px bold `#CDFF00` |
| Card border radius | Radius | 12px |
| Card padding | Spacing | 16px |

---

## 7. Technical Spec

### Exercise Schema

```typescript
interface Exercise {
  id: string;           // ex-{descriptive-name}
  name: string;         // Display name
  videoUrl?: string;    // Optional YouTube URL (skipped for v1)
  muscleGroups: string[];
  equipment: string;
  isCustom: boolean;    // false for preset exercises
}
```

### Superset Exercise Schema (in program JSON)

```json
{
  "exerciseId": "ex-barbell-bench",
  "sets": 4,
  "reps": "8,8,6,6",
  "tempo": "T:3010",
  "restSeconds": 90
}
```

### Files to Create

| File | Description |
|------|-------------|
| (none) | All changes are modifications to existing files |

### Files to Modify

| File | Changes |
|------|---------|
| `src/data/exercises.json` | Expand from 27 to ~97 exercises |
| `src/data/programs/full-body-3day.json` | Verify all exercise IDs exist |
| `src/data/programs/ppl-6day.json` | Complete all 6 days with valid exercise IDs |
| `src/data/programs/upper-lower-4day.json` | Complete all 4 days with valid exercise IDs |

### Missing Exercises (Critical)

These exercises are referenced in program JSONs but don't exist:
```
ex-barbell-bench, ex-incline-db-press, ex-ohp, ex-tricep-pushdown,
ex-overhead-tricep-ext, ex-seated-cable-row, ex-face-pulls,
ex-rear-delt-fly, ex-barbell-curl, ex-hammer-curl, ex-barbell-squat,
ex-leg-press, ex-rdl, ex-standing-calf-raise, ex-cable-fly,
ex-db-shoulder-press, ex-front-raises, ex-skull-crushers, ex-pullup,
ex-barbell-row, ex-preacher-curl, ex-hip-thrust, ex-walking-lunge,
ex-seated-leg-curl, ex-seated-calf-raise
```

### Training Principles for Program Structure
1. Compound movements first (squat, bench, deadlift, OHP)
2. Antagonist superset pairings (push/pull, chest/back, biceps/triceps)
3. Progressive rep schemes (8,8,6,6 for strength, 10,10,8,8 for hypertrophy)
4. Appropriate rest (90-120s compounds, 45-60s isolation)
5. Tempo notation for time under tension (T:XYZW format)

---

## 8. Implementation Plan

### Dependencies Checklist
- [x] exercises.json file exists with 27 exercises
- [x] Program JSON structure defined and working for Full Body
- [x] Exercise TypeScript interface defined
- [ ] PPL program JSON file exists (may need creation)
- [ ] Upper/Lower program JSON file exists (may need creation)

### Build Order

**Phase 1: Exercise Data (1 day)**
1. [ ] Add all Chest exercises (10) to exercises.json
2. [ ] Add all Back exercises (12) to exercises.json
3. [ ] Add all Shoulders + Rear Delts exercises (15) to exercises.json
4. [ ] Add all Arms exercises (16 - triceps + biceps) to exercises.json
5. [ ] Add all Legs exercises (20 - quads + hamstrings + glutes + calves) to exercises.json
6. [ ] Add all Abs/Core exercises (8) to exercises.json
7. [ ] Add all Warmup/Mobility exercises (12) to exercises.json
8. [ ] Validate JSON format and no duplicate IDs

**Phase 2: Program Validation (1 day)**
9. [ ] Cross-reference Full Body 3-day with exercises.json
10. [ ] Complete PPL 6-day program with valid exercise IDs
11. [ ] Complete Upper/Lower 4-day program with valid exercise IDs
12. [ ] Verify all supersets have proper antagonist pairings

**Phase 3: Testing (0.5 day)**
13. [ ] Load each program and verify no missing exercises
14. [ ] Verify exercise names display correctly
15. [ ] Test on mobile viewport
16. [ ] Deploy to Vercel

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Duplicate exercise ID in JSON | Validate no duplicates during build, last entry wins |
| Program references non-existent exercise | Log error to console, skip the exercise in superset |
| Exercise missing muscleGroups | Default to empty array, display "Uncategorized" |
| Exercise missing equipment | Default to "bodyweight" |
| Very long exercise name | Truncate with ellipsis on mobile (max-w constraint) |
| Future custom exercises with conflicting IDs | Custom exercises use `custom-{uuid}` format, no conflict |

---

## 10. Testing

### Functional Tests
- [ ] exercises.json contains exactly ~97 exercises
- [ ] Every exercise has required fields: id, name, muscleGroups, equipment, isCustom
- [ ] No duplicate exercise IDs
- [ ] All exercise IDs match `ex-{descriptive-name}` pattern
- [ ] All program JSON exercise references resolve to valid exercises
- [ ] Full Body 3-day loads all 3 days completely
- [ ] PPL 6-day loads all 6 days completely
- [ ] Upper/Lower 4-day loads all 4 days completely

### UI Verification
- [ ] Exercise names display (not IDs) in workout view
- [ ] Muscle group tags display correctly per exercise
- [ ] Equipment type displays correctly per exercise
- [ ] No empty supersets in any program
- [ ] Warmup exercises display for each training day
- [ ] Finisher exercises display where defined
- [ ] All exercise cards meet 44px minimum touch target

---

## 11. Launch Checklist

- [ ] exercises.json expanded to ~97 exercises
- [ ] All 3 preset programs load without errors
- [ ] No "Unknown Exercise" or raw IDs shown in UI
- [ ] All muscle groups covered (chest, back, shoulders, arms, legs, core)
- [ ] All equipment types have at least one exercise
- [ ] Works completely offline
- [ ] Deploy to gym.adu.dk via `npx vercel --prod`

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| exercises.json becomes too large | Slower initial load | ~97 exercises is small (<50KB), no performance concern |
| Exercise naming inconsistency | Confusion in UI | Standardize naming convention: "{Adjective} {Equipment} {Movement}" |
| Program exercise mismatch after update | Broken workouts | Cross-reference script validates all references before deploy |
| Missing exercises for niche programs | Incomplete training days | Cover all common gym exercises first, add niche ones on demand |
| ID format change needed later | Breaking change | Use stable `ex-{name}` format from start, never change IDs |

---

## 13. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| exercises.json | Exists (27 entries) | Needs expansion to ~97 |
| Full Body 3-day program | Working | Needs ID verification |
| PPL 6-day program | Partial | Needs completion |
| Upper/Lower 4-day program | Partial | Needs completion |
| Exercise TypeScript interface | Defined | No changes needed |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-01 | Initial PRD created |
| 2026-03-26 | PRD quality audit: added missing sections (success metrics table, requirements MoSCoW, user flows, design wireframes, component table, visual spec, implementation plan, edge cases table, testing, launch checklist, risks & mitigations, dependencies, changelog), reformatted to 14-section standard |
