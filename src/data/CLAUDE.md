# Static Data Layer - SetFlow

> Governance for exercise database, program templates, and achievement definitions

## Purpose

Manage static data that powers SetFlow's workout tracking. This includes exercise definitions, training program templates, and achievement configurations.

---

## Agent Ownership

| Role | Agent |
|------|-------|
| **Primary (Exercises)** | Movement Specialist |
| **Primary (Programs)** | Periodization Specialist |
| **Collaborators** | Database Specialist, Frontend Specialist, Injury & Rehab Specialist |

---

## Data Files

| File | Purpose | Format |
|------|---------|--------|
| `exercises.json` | Master exercise library (97 exercises) | `ExerciseDefinition[]` |
| `exercise-videos.csv` | Video URL reference export | CSV (id, name, equipment, muscleGroups, videoUrl) |
| `program.json` | Default training program | Full program structure |
| `programs/*.json` | Template programs | Program templates |
| `achievements.ts` | Achievement definitions | `AchievementDefinition[]` |
| `daily-challenges.ts` | Daily challenge pool (16 challenges) | `DailyChallenge[]` |
| `weekly-challenges.ts` | Weekly challenge pool (16 challenges) | `WeeklyChallenge[]` |

---

## Exercise Format

### Schema
```typescript
interface ExerciseDefinition {
  id: string;              // "ex-barbell-bench"
  name: string;            // "Barbell Bench Press"
  muscleGroups: string[];  // ["chest", "triceps", "front_delts"]
  equipment: string;       // "barbell" | "dumbbell" | "cable" | "machine" | "bodyweight"
  videoUrl: string | null; // YouTube/Vimeo link
  formCues?: string[];     // ["Retract scapula", "Touch chest"]
  contraindications?: string[]; // ["shoulder_injury", "l5_s1"]
}
```

### Valid Muscle Groups
```
chest, back, shoulders, biceps, triceps, forearms,
quads, hamstrings, glutes, calves, core, hip_flexors,
front_delts, rear_delts, lateral_delts, traps, lats,
rhomboids, erector_spinae, tibialis
```

### Valid Equipment
```
barbell, dumbbell, cable, machine, bodyweight,
kettlebell, resistance_band, smith_machine, trap_bar
```

### Example Exercise
```json
{
  "id": "ex-barbell-bench",
  "name": "Barbell Bench Press",
  "muscleGroups": ["chest", "triceps", "front_delts"],
  "equipment": "barbell",
  "videoUrl": null,
  "formCues": [
    "Retract and depress scapula",
    "Grip slightly wider than shoulders",
    "Touch mid-chest, drive through feet"
  ]
}
```

---

## Program Format

### Schema
```typescript
interface Program {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  days: TrainingDay[];
}

interface TrainingDay {
  id: string;
  name: string;           // "Day 1: Full Body A"
  dayNumber: number;
  warmup: Exercise[];
  supersets: Superset[];
  finisher: Exercise[];
}

interface Superset {
  id: string;
  label: string;          // "A", "B", "C"
  exercises: SupersetExercise[];
}

interface SupersetExercise {
  exerciseId: string;
  sets: number;
  reps: string;           // "8-10" or "12"
  tempo: string;          // "T:30A1"
  restSeconds: number;
}
```

### Default Program Structure
The app ships with **Full Body Training** (3 days):
- Day 1: Full Body A (lower emphasis)
- Day 2: Full Body B (push emphasis)
- Day 3: Full Body C (pull emphasis)

Each day contains:
- Optional warmup exercises
- 3-4 supersets (A, B, C, D)
- Optional finisher

---

## Achievement Tiers

### Tier Definitions
| Tier | Color | Difficulty |
|------|-------|------------|
| Bronze | #CD7F32 | Early milestones |
| Silver | #C0C0C0 | Intermediate goals |
| Gold | #FFD700 | Major achievements |

### Achievement Categories
```typescript
type AchievementCategory =
  | 'consistency'   // Streak-based
  | 'volume'        // Total work done
  | 'strength'      // PR-based
  | 'milestones'    // Workout counts
  | 'special';      // Unique achievements
```

### Example Achievements
```typescript
// Bronze tier
{ id: 'first-workout', tier: 'bronze', title: 'First Steps', requirement: 1 workout }
{ id: 'week-streak', tier: 'bronze', title: '7-Day Streak', requirement: 7 consecutive days }

// Silver tier
{ id: 'century-club', tier: 'silver', title: 'Century Club', requirement: 100 workouts }
{ id: 'month-streak', tier: 'silver', title: '30-Day Warrior', requirement: 30 consecutive days }

// Gold tier
{ id: 'year-streak', tier: 'gold', title: 'Yearly Legend', requirement: 365 consecutive days }
{ id: 'thousand-sets', tier: 'gold', title: '1000 Sets', requirement: 1000 total sets }
```

---

## Gamification Challenges

### Challenge Pool Design
- 3 daily challenges selected each day (seeded by date for consistency)
- 3 weekly challenges selected each week (seeded by Monday's date)
- Hash-based shuffling ensures same challenges appear on same days across devices
- Challenges reset at midnight (daily) or Monday (weekly)

### Daily Challenge Schema
```typescript
interface DailyChallenge {
  id: string;              // "daily-workout"
  title: string;           // "Complete a Workout"
  description: string;     // "Finish any workout today"
  icon: string;            // Lucide icon name: "Dumbbell"
  xpReward: number;        // 15-150 XP
  requirement: {
    type: string;          // "workout" | "reps" | "volume" | "sets" | "prs"
    value: number;         // Target to complete
  };
}
```

### Weekly Challenge Schema
```typescript
interface WeeklyChallenge {
  id: string;              // "weekly-workouts-3"
  title: string;           // "Triple Threat"
  description: string;     // "Complete 3 workouts this week"
  icon: string;            // Lucide icon name
  xpReward: number;        // 100-750 XP
  requirement: {
    type: string;          // "workouts" | "volume" | "streak" | "prs" | "sets" | "reps"
    value: number;         // Target to complete
  };
}
```

### Challenge Requirement Types
| Type | Daily Range | Weekly Range | Description |
|------|-------------|--------------|-------------|
| `workout` / `workouts` | 1-2 | 3-7 | Complete workouts |
| `reps` | 50-200 | 500-1000 | Total reps logged |
| `volume` | 1000-5000 kg | 10000-50000 kg | Total weight x reps |
| `sets` | 10-30 | 50-100 | Completed sets |
| `prs` | 1-2 | 3-5 | Personal records set |
| `meals` | 3-5 | - | Meals logged (daily only) |
| `supplements` | 1 | - | Supplement check (daily only) |
| `streak` | - | 7 | Maintain streak (weekly only) |
| `protein_days` | - | 3-7 | Hit protein goal (weekly only) |

### XP Reward Tiers
| Difficulty | Daily XP | Weekly XP |
|------------|----------|-----------|
| Easy | 15-25 | 100-150 |
| Medium | 30-50 | 200-300 |
| Hard | 75-100 | 400-500 |
| Epic | 125-150 | 600-750 |

### Helper Functions
```typescript
// daily-challenges.ts
getDailyChallenges(date?: Date): DailyChallenge[]  // Returns 3 challenges for date
getTodayDate(): string                              // "YYYY-MM-DD" format
getDailyChallengeById(id: string): DailyChallenge | undefined

// weekly-challenges.ts
getWeeklyChallenges(date?: Date): WeeklyChallenge[] // Returns 3 challenges for week
getWeekId(date?: Date): string                      // Monday's date "YYYY-MM-DD"
getDaysRemainingInWeek(date?: Date): number         // 0-6 days left
getWeeklyChallengeById(id: string): WeeklyChallenge | undefined
```

### Deterministic Seeding
Challenges use a hash-based seed to ensure consistency:
- Same date = same 3 daily challenges
- Same week = same 3 weekly challenges
- Works across devices and sessions

---

## Adding New Data

### Adding Exercises
1. **Movement Specialist** validates:
   - Muscle groups are anatomically correct
   - Equipment is available in typical gyms
   - Form cues are evidence-based
2. **Injury & Rehab Specialist** flags:
   - Contraindications for common injuries
3. **Database Specialist** adds to `exercises.json`
4. **Frontend Specialist** verifies exercise card renders

### Adding Programs
1. **Periodization Specialist** designs:
   - Progressive structure
   - Appropriate volume/intensity
   - Recovery considerations
2. **Action Sports Coach** (if sport-specific):
   - Sport-relevant exercise selection
   - Seasonal timing
3. **Database Specialist** creates `programs/[name].json`
4. **Frontend Specialist** adds program card

### Adding Achievements
1. Define in `achievements.ts`
2. Implement unlock logic in `/lib/gamification.ts`
3. Create badge asset if needed
4. Test unlock triggers

---

## Data Protection Rules

### Never Delete Without Confirmation
- Exercise definitions linked to workout history
- Program modifications require migration plan
- Achievement definitions are permanent

### Backward Compatibility
- New fields must be optional
- Removed fields must have fallback
- ID changes require data migration

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcoding exercises in components | Can't update without code change | Use `exercises.json` |
| Duplicate exercise definitions | Data inconsistency | Single source of truth |
| Inventing muscle groups | Breaks filtering | Use valid muscle groups list |
| Removing achievements | Breaks user progress | Mark deprecated, never delete |
| Hardcoding exercise counts in docs | Gets stale when exercises added | Use "all exercises" or verify count |

---

## Cross-References

| Resource | Location |
|----------|----------|
| Database operations | `/src/lib/db.ts` |
| Gamification logic | `/src/lib/gamification.ts` |
| Program management | `/src/lib/programs.ts` |
| Movement patterns | `/docs/patterns/progressive-overload.md` |

---

*Created: January 4, 2026*
