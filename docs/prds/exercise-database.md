# Exercise Database PRD

## Overview
Comprehensive exercise database expansion to support all preset workout programs with ~97 exercises covering all major muscle groups and equipment types.

## Status: In Progress

## Problem Statement
- Current exercise database has only 27 exercises
- Program JSON files reference exercises that don't exist (e.g., `ex-barbell-bench`, `ex-pullup`)
- Users see incomplete workouts with empty supersets
- Limited equipment variety (missing many commercial gym and bodyweight options)

## Solution
Expand `src/data/exercises.json` from 27 to ~97 exercises and ensure all program files reference valid exercise IDs.

## Exercise Categories

### Chest (10 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-barbell-bench | Barbell Bench Press | barbell |
| ex-incline-barbell-bench | Incline Barbell Bench Press | barbell |
| ex-decline-barbell-bench | Decline Barbell Bench Press | barbell |
| ex-incline-db-press | Incline Dumbbell Press | dumbbells |
| ex-flat-db-press | Flat Dumbbell Press | dumbbells |
| ex-decline-db-press | Decline Dumbbell Press | dumbbells |
| ex-cable-fly | Cable Fly | cable |
| ex-incline-cable-fly | Incline Cable Fly | cable |
| ex-chest-dips | Chest Dips | dip-station |
| ex-machine-chest-press | Machine Chest Press | machine |

### Back (12 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-pullup | Pull-up | pull-up-bar |
| ex-chinup | Chin-up | pull-up-bar |
| ex-wide-lat-pulldown | Wide Grip Lat Pulldown | cable |
| ex-neutral-pulldown | Neutral Grip Pulldown | cable |
| ex-close-grip-pulldown | Close Grip Pulldown | cable |
| ex-barbell-row | Barbell Row | barbell |
| ex-dumbbell-row | Dumbbell Row | dumbbells |
| ex-seated-cable-row | Seated Cable Row | cable |
| ex-t-bar-row | T-Bar Row | machine |
| ex-chest-supported-row | Chest Supported Row | dumbbells |
| ex-straight-arm-pulldown | Straight Arm Pulldown | cable |
| ex-deadlift | Conventional Deadlift | barbell |

### Shoulders (10 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-ohp | Overhead Press | barbell |
| ex-db-shoulder-press | Dumbbell Shoulder Press | dumbbells |
| ex-arnold-press | Arnold Press | dumbbells |
| ex-lateral-raises | Lateral Raises | dumbbells |
| ex-cable-lateral-raises | Cable Lateral Raises | cable |
| ex-front-raises | Front Raises | dumbbells |
| ex-incline-delt-press | Incline DB Anterior Delt Press | dumbbells |
| ex-machine-shoulder-press | Machine Shoulder Press | machine |
| ex-face-pulls | Face Pulls | cable |
| ex-y-raises | Y-Raises | cable |

### Rear Delts (5 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-rear-delt-fly | Rear Delt Fly | dumbbells |
| ex-rear-delt-cable-fly | Rear Delt Cable Fly | cable |
| ex-rear-delt-cable-row | Rear Delt Cable Row | cable |
| ex-reverse-pec-deck | Reverse Pec Deck | machine |
| ex-band-pull-aparts | Band Pull-Aparts | band |

### Triceps (8 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-tricep-pushdown | Tricep Pushdown | cable |
| ex-rope-pushdown | Rope Tricep Pushdown | cable |
| ex-overhead-tricep-ext | Overhead Tricep Extension | cable |
| ex-cross-cable-tricep | Cross Cable Tricep Extension | cable |
| ex-skull-crushers | Skull Crushers | barbell |
| ex-dumbbell-kickback | Dumbbell Kickback | dumbbells |
| ex-close-grip-bench | Close Grip Bench Press | barbell |
| ex-tricep-dips | Tricep Dips | dip-station |

### Biceps (8 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-barbell-curl | Barbell Curl | barbell |
| ex-ez-bar-curl | EZ Bar Curl | barbell |
| ex-dumbbell-curl | Dumbbell Curl | dumbbells |
| ex-hammer-curl | Hammer Curl | dumbbells |
| ex-incline-bicep-curls | Incline Supinated Bicep Curls | dumbbells |
| ex-preacher-curl | Preacher Curl | machine |
| ex-cable-curl | Cable Curl | cable |
| ex-concentration-curl | Concentration Curl | dumbbells |

### Quads (8 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-barbell-squat | Barbell Back Squat | barbell |
| ex-front-squat | Front Squat | barbell |
| ex-hack-squat | Hack Squat | machine |
| ex-leg-press | Leg Press | machine |
| ex-leg-extension | Leg Extension | machine |
| ex-rfess | Rear Foot Elevated Split Squat | bench |
| ex-walking-lunge | Walking Lunge | dumbbells |
| ex-goblet-squat | Goblet Squat | dumbbells |

### Hamstrings (6 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-rdl | Romanian Deadlift | barbell |
| ex-dumbbell-rdl | Dumbbell Romanian Deadlift | dumbbells |
| ex-lying-ham-curl | Lying Hamstring Curl | machine |
| ex-seated-leg-curl | Seated Leg Curl | machine |
| ex-nordic-curl | Nordic Hamstring Curl | bodyweight |
| ex-good-morning | Good Morning | barbell |

### Glutes (6 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-hip-thrust | Barbell Hip Thrust | barbell |
| ex-glute-bridge | Glute Bridge (Machine) | machine |
| ex-cable-kickback | Cable Glute Kickback | cable |
| ex-sumo-deadlift | Sumo Deadlift | barbell |
| ex-hip-abduction | Hip Abduction Machine | machine |
| ex-step-ups | Step-Ups | dumbbells |

### Calves (4 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-standing-calf-raise | Standing Calf Raise | machine |
| ex-seated-calf-raise | Seated Calf Raise | machine |
| ex-leg-press-calf | Leg Press Calf Raise | leg-press |
| ex-tibialis-raise | Tibialis Anterior Raise | plate |

### Abs/Core (8 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-ab-crunch | Ab Crunch Machine | machine |
| ex-cable-crunch | Cable Crunch | cable |
| ex-hanging-leg-raise | Hanging Leg Raise | pull-up-bar |
| ex-leg-raise | Lying Leg Raise | bodyweight |
| ex-plank | Plank | bodyweight |
| ex-russian-twist | Russian Twist | dumbbells |
| ex-ab-wheel | Ab Wheel Rollout | ab-wheel |
| ex-woodchop | Cable Woodchop | cable |

### Warmup/Mobility (12 exercises)
| ID | Name | Equipment |
|----|------|-----------|
| ex-band-pull-aparts | Band Pull-Aparts | band |
| ex-band-face-pulls | Band Face Pulls | band |
| ex-shoulder-circles | Shoulder Circles | bodyweight |
| ex-arm-circles | Arm Circles | bodyweight |
| ex-hip-circles | Hip Circles | bodyweight |
| ex-cat-cow | Cat-Cow | bodyweight |
| ex-bw-squats | Bodyweight Squats | bodyweight |
| ex-glute-bridges-bw | Glute Bridges (Bodyweight) | bodyweight |
| ex-dead-hang | Dead Hang | pull-up-bar |
| ex-world-greatest-stretch | World's Greatest Stretch | bodyweight |
| ex-leg-swings | Leg Swings | bodyweight |
| ex-thoracic-rotation | Thoracic Rotation | bodyweight |

## Equipment Types Supported
- `barbell` - Commercial gym
- `dumbbells` - Home/Commercial gym
- `machine` - Commercial gym
- `cable` - Commercial gym
- `bodyweight` - No equipment
- `band` - Home gym
- `bench` - Home/Commercial gym
- `pull-up-bar` - Home/Commercial gym
- `dip-station` - Commercial gym
- `leg-press` - Commercial gym
- `plate` - Home/Commercial gym
- `ab-wheel` - Home gym

## Exercise Schema
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

## Missing Exercises (Critical)
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

## Technical Implementation

### Files to Modify
1. `src/data/exercises.json` - Expand from 27 to ~97 exercises
2. `src/data/programs/full-body-3day.json` - Verify exercise IDs
3. `src/data/programs/ppl-6day.json` - Complete all 6 days
4. `src/data/programs/upper-lower-4day.json` - Complete all 4 days

### Program Structure (per day)
Each training day follows this structure:
- **Warmup**: 3-4 exercises (10-15 reps)
- **Supersets A-D**: 2 exercises each (antagonist pairings)
- **Finisher**: 1 exercise (typically Dead Hang for spine decompression)

### Superset Exercise Schema
```json
{
  "exerciseId": "ex-barbell-bench",
  "sets": 4,
  "reps": "8,8,6,6",
  "tempo": "T:3010",
  "restSeconds": 90
}
```

## Training Principles
1. Compound movements first (squat, bench, deadlift, OHP)
2. Antagonist superset pairings (push/pull, chest/back, biceps/triceps)
3. Progressive rep schemes (8,8,6,6 for strength, 10,10,8,8 for hypertrophy)
4. Appropriate rest (90-120s compounds, 45-60s isolation)
5. Tempo notation for time under tension (T:XYZW format)

## Success Metrics
- All programs load without missing exercise errors
- All training days show complete supersets (no empty sections)
- Exercise count increased from 27 to ~97
- All equipment types represented

## Design Decisions
1. **No video URLs for v1**: Can be added later, speeds up implementation
2. **Comprehensive equipment support**: Gym, home gym, and bodyweight options
3. **Muscle group standardization**: Consistent naming across all exercises
4. **ID format consistency**: `ex-{descriptive-name}` pattern
