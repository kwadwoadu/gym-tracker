# Rest Day Intelligence

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - New Features

---

## 1. Problem

SetFlow currently treats rest days as empty screens. When a user opens the app on a rest day, they see their training program with no workout scheduled, which communicates "nothing to do today." This is a missed opportunity because:

1. **Rest days are training days** - Recovery, mobility, and nutrition are critical for progress, but the app ignores them entirely
2. **Users lose engagement** - No reason to open the app on rest days means broken daily habits and reduced streak motivation
3. **No recovery context** - Users don't know if they're under-recovered or ready to train based on yesterday's session intensity
4. **Muscle awareness gap** - Users who trained heavy legs yesterday might do a pickup basketball game, not realizing their quads need 48+ hours of recovery
5. **Hydration and sleep are invisible** - Two of the biggest recovery levers get zero attention in the current experience

For users with Whoop or similar wearables, recovery data exists but is siloed in a separate app. SetFlow could surface this data in the context of their training program.

---

## 2. Solution

### Intelligent Rest Day Screen
When the app detects no workout is scheduled (or the user explicitly marks a rest day), show a dedicated rest day experience:

### Recovery Dashboard
- **Yesterday's Impact**: Which muscles were trained, estimated recovery time per muscle group
- **Recovery Score**: Whoop recovery percentage (if connected) or a simple self-assessment (1-5 how do you feel?)
- **Next Workout Preview**: What's coming tomorrow, which muscles to prepare

### Active Recovery Suggestions
- **Mobility Routines**: 10-15 minute routines targeting yesterday's trained muscles
- **Light Movement**: Walking, yoga, swimming suggestions based on intensity of recent sessions
- **Stretch Sequences**: Muscle-specific stretches with hold times

### Reminders & Habits
- **Hydration Tracker**: Simple water intake logging (glasses/bottles)
- **Sleep Reminder**: Evening notification with recommended sleep time based on training load
- **Nutrition Focus**: Protein target reminder, emphasize recovery-supporting meals

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Rest day app opens | 40% of users open app on rest days (up from ~10%) | DAU on non-training days |
| Mobility routine starts | 15% of rest day sessions include a mobility routine | Track "Start Routine" taps |
| Self-assessment completion | 50% of rest day users complete recovery self-assessment | Track submission events |
| Hydration logs | 25% of users log water on rest days | Track hydration entries |
| Weekly retention | 10% improvement in 7-day retention | Compare cohorts before/after feature |
| Whoop connection rate | 20% of users connect Whoop within first month | Track successful OAuth connections |

---

## 4. Requirements

### Must Have
- [ ] Rest day detection: no workout scheduled for today OR user marks rest day manually
- [ ] Yesterday's workout summary: muscles trained, total volume, session intensity
- [ ] Muscle recovery timeline: estimated hours until each muscle group is recovered (based on volume and intensity)
- [ ] Next workout preview: name, exercises, estimated duration
- [ ] Recovery self-assessment: 1-5 scale with emoji (if user has no Whoop)
- [ ] Mobility routine suggestions: 2-3 routines targeting yesterday's muscles (stored locally)
- [ ] Active Recovery mode: start a guided light movement session with timer

### Should Have
- [ ] Whoop API integration: pull recovery score, HRV, sleep quality
- [ ] Hydration tracking: simple counter with daily target (e.g., 8 glasses)
- [ ] Sleep reminder notification: push notification at calculated bedtime
- [ ] Nutrition card: protein target reminder based on body weight
- [ ] Rest day streak: track consecutive rest days with mobility completed
- [ ] Muscle heat map: visual body outline showing recovery status (green/yellow/red)

### Won't Have (this version)
- Full nutrition tracking or meal logging
- Integration with sleep tracking apps beyond Whoop
- AI-generated personalized mobility routines
- Video-guided mobility sessions (text + timer only)
- Heart rate monitoring during active recovery

---

## 5. User Flow

### Flow 1: Rest Day (No Whoop)
1. User opens app on a rest day
2. App detects no workout scheduled, shows Rest Day screen
3. Header: "Rest Day - Recovery Focus"
4. Recovery self-assessment prompt: "How are you feeling?" (1-5 scale)
5. User taps 3/5 ("Moderate")
6. Shows yesterday's workout impact (Legs - 14,200kg volume)
7. Muscle recovery card: Quads (16h remaining), Hamstrings (12h remaining), Glutes (8h remaining)
8. Mobility suggestion: "Lower Body Mobility - 12 min"
9. User taps "Start Routine"
10. Timer-guided mobility session begins
11. Next workout preview at bottom: "Tomorrow: Upper Body Push - 6 exercises"

### Flow 2: Rest Day (Whoop Connected)
1. User opens app on rest day
2. Whoop recovery score auto-fetched: 78% (Green)
3. Sleep quality card: 7.2h sleep, 85% efficiency
4. HRV: 62ms (above baseline)
5. Recovery assessment auto-filled from Whoop data
6. Recommendation: "Good recovery. Light mobility recommended, ready for tomorrow's session."
7. Same mobility suggestions and next workout preview

### Flow 3: Active Recovery Session
1. User on rest day screen taps "Active Recovery"
2. Selects routine: "Hip Mobility Flow - 10 min"
3. Exercise list: 6 movements with hold times
4. Timer starts: "Pigeon Stretch - Left - 45 seconds"
5. Audio cue at transition (reuses existing Web Audio system)
6. Progress bar shows 2/6 movements complete
7. Session completes, logged as "Active Recovery" in workout history
8. Streak maintained

### Flow 4: Hydration Logging
1. Rest day screen shows hydration card: "Water: 0/8 glasses"
2. User taps "+" to log a glass
3. Counter increments with subtle animation
4. Progress bar fills toward daily target
5. At 8/8: card shows checkmark, accent color highlight

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `RestDayScreen` | Main rest day layout, replaces home when no workout scheduled |
| `RecoveryAssessment` | 1-5 scale self-assessment with emoji indicators |
| `MuscleRecoveryCard` | Per-muscle recovery timeline with progress bars |
| `MobilityRoutineCard` | Routine suggestion card with duration and muscle targets |
| `ActiveRecoverySession` | Timer-guided mobility session UI |
| `NextWorkoutPreview` | Compact card showing tomorrow's workout |
| `HydrationTracker` | Water intake counter with daily target |
| `WhoopRecoveryCard` | Whoop recovery score, HRV, sleep data |
| `MuscleHeatMap` | Body outline SVG with color-coded recovery zones |

### Visual Design

**Rest Day Screen**:
- Background: `#0A0A0A`
- Header accent: Soft blue-green (`#38BDF8`) instead of lime to differentiate from training days
- Cards: `#1A1A1A` with rounded-xl
- Recovery colors: Green (`#22C55E`) recovered, Yellow (`#F59E0B`) recovering, Red (`#EF4444`) fatigued

**Recovery Assessment**:
- 5 circles in a row, each with emoji: dead / tired / moderate / good / great
- Selected circle: scaled up 1.2x with `#38BDF8` ring
- Smooth Framer Motion scale animation

**Muscle Recovery Card**:
- Muscle name left-aligned, hours remaining right-aligned
- Progress bar: gradient from red (0%) to green (100%)
- Bar height: 8px, rounded-full

**Hydration Tracker**:
- Row of 8 water drop icons
- Filled: `#38BDF8`, unfilled: `#2A2A2A`
- Tap any to fill up to that point
- Counter text: "5/8 glasses" below

### Wireframe - Rest Day Screen

```
+------------------------------------------+
| [Logo] SetFlow                    [gear] |
|          Rest Day                        |
+------------------------------------------+
| +--------------------------------------+ |
| | How are you feeling?                 | |
| |                                      | |
| | [X]  [:/]  [:|]  [:)]  [:D]         | |
| |  1    2     3     4      5           | |
| +--------------------------------------+ |
+------------------------------------------+
| +--------------------------------------+ |
| | YESTERDAY'S IMPACT                   | |
| | Lower Body - Pull  |  14,200kg vol  | |
| |                                      | |
| | Quads       [======----]  16h left   | |
| | Hamstrings  [========--]  12h left   | |
| | Glutes      [==========]  Ready     | |
| +--------------------------------------+ |
+------------------------------------------+
| +--------------------------------------+ |
| | SUGGESTED MOBILITY          12 min   | |
| |                                      | |
| | Lower Body Recovery Flow             | |
| | Targets: Quads, Hamstrings, Hips     | |
| |                                      | |
| | [======= Start Routine =========]   | |
| +--------------------------------------+ |
+------------------------------------------+
| +--------------------------------------+ |
| | HYDRATION            5/8 glasses     | |
| | [*] [*] [*] [*] [*] [ ] [ ] [ ]    | |
| +--------------------------------------+ |
+------------------------------------------+
| +--------------------------------------+ |
| | TOMORROW                             | |
| | Upper Body - Push           ~45min   | |
| | 6 exercises - 4 supersets            | |
| +--------------------------------------+ |
+------------------------------------------+
| [Home] [Community] [Stats] [Profile]    |
+------------------------------------------+
```

### Wireframe - Active Recovery Session

```
+------------------------------------------+
| [<Back]  Active Recovery        2/6      |
+------------------------------------------+
|                                          |
|          PIGEON STRETCH                  |
|            Left Side                     |
|                                          |
|              (  45  )                    |
|              seconds                     |
|                                          |
|   [=============-------]  30s left      |
|                                          |
+------------------------------------------+
| Next: Pigeon Stretch - Right             |
+------------------------------------------+
|                                          |
| [========= Skip =========]              |
|                                          |
+------------------------------------------+
```

---

## 7. Technical Spec

### Muscle Recovery Estimation

```typescript
// /src/lib/recovery.ts
interface MuscleRecoveryEstimate {
  muscleGroup: string;
  totalVolume: number;        // kg
  recoveryHoursTotal: number; // estimated total recovery time
  hoursElapsed: number;       // since workout ended
  hoursRemaining: number;     // clamped to 0
  percentRecovered: number;   // 0-100
  status: 'fatigued' | 'recovering' | 'recovered';
}

const BASE_RECOVERY_HOURS: Record<string, number> = {
  quads: 48,
  hamstrings: 48,
  glutes: 36,
  chest: 48,
  back: 48,
  shoulders: 36,
  biceps: 24,
  triceps: 24,
  calves: 24,
  core: 24,
};

export function estimateMuscleRecovery(
  workoutLog: WorkoutLog,
  exercises: Exercise[],
  now: Date = new Date()
): MuscleRecoveryEstimate[] {
  const workoutEnd = new Date(workoutLog.completedAt);
  const hoursElapsed = (now.getTime() - workoutEnd.getTime()) / (1000 * 60 * 60);

  // Group volume by muscle
  const muscleVolume = new Map<string, number>();

  for (const setLog of workoutLog.sets) {
    const exercise = exercises.find(e => e.id === setLog.exerciseId);
    if (!exercise) continue;

    const volume = setLog.weight * setLog.reps;
    for (const muscle of exercise.muscleGroups) {
      muscleVolume.set(muscle, (muscleVolume.get(muscle) || 0) + volume);
    }
  }

  // Calculate recovery per muscle
  const estimates: MuscleRecoveryEstimate[] = [];
  for (const [muscle, volume] of muscleVolume) {
    const baseHours = BASE_RECOVERY_HOURS[muscle] || 36;

    // Scale recovery time by volume intensity
    // Higher volume = longer recovery (up to 1.5x base)
    const volumeMultiplier = Math.min(1.5, 1 + (volume / 10000) * 0.5);
    const totalHours = Math.round(baseHours * volumeMultiplier);

    const hoursRemaining = Math.max(0, totalHours - hoursElapsed);
    const percentRecovered = Math.min(100, Math.round((hoursElapsed / totalHours) * 100));

    let status: MuscleRecoveryEstimate['status'];
    if (percentRecovered >= 100) status = 'recovered';
    else if (percentRecovered >= 50) status = 'recovering';
    else status = 'fatigued';

    estimates.push({
      muscleGroup: muscle,
      totalVolume: volume,
      recoveryHoursTotal: totalHours,
      hoursElapsed: Math.round(hoursElapsed),
      hoursRemaining: Math.round(hoursRemaining),
      percentRecovered,
      status,
    });
  }

  return estimates.sort((a, b) => a.percentRecovered - b.percentRecovered);
}
```

### Whoop API Integration

```typescript
// /src/lib/whoop.ts
interface WhoopRecovery {
  score: number;              // 0-100
  hrvRmssd: number;           // ms
  restingHeartRate: number;   // bpm
  sleepDuration: number;      // hours
  sleepEfficiency: number;    // 0-100
  status: 'red' | 'yellow' | 'green';
}

const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1';

export async function fetchWhoopRecovery(
  accessToken: string,
  date: string // YYYY-MM-DD
): Promise<WhoopRecovery | null> {
  try {
    const response = await fetch(
      `${WHOOP_API_BASE}/recovery?start=${date}T00:00:00.000Z&end=${date}T23:59:59.999Z`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.records?.length) return null;

    const record = data.records[0];
    const score = record.score.recovery_score;

    return {
      score,
      hrvRmssd: record.score.hrv_rmssd_milli,
      restingHeartRate: record.score.resting_heart_rate,
      sleepDuration: record.sleep?.score?.stage_summary?.total_in_bed_time_milli
        ? record.sleep.score.stage_summary.total_in_bed_time_milli / 3600000
        : 0,
      sleepEfficiency: record.sleep?.score?.sleep_efficiency_percentage || 0,
      status: score >= 67 ? 'green' : score >= 34 ? 'yellow' : 'red',
    };
  } catch {
    return null;
  }
}
```

### Mobility Routines Data

```typescript
// /src/data/mobility-routines.ts
export interface MobilityRoutine {
  id: string;
  name: string;
  targetMuscles: string[];
  durationMinutes: number;
  movements: MobilityMovement[];
}

export interface MobilityMovement {
  name: string;
  holdSeconds: number;
  sides: 'both' | 'left_right';  // bilateral or unilateral
  description: string;
  targetMuscle: string;
}

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: 'lower-body-recovery',
    name: 'Lower Body Recovery Flow',
    targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    durationMinutes: 12,
    movements: [
      {
        name: 'Pigeon Stretch',
        holdSeconds: 45,
        sides: 'left_right',
        description: 'Front knee at 90 degrees, back leg extended. Sink hips toward floor.',
        targetMuscle: 'glutes',
      },
      {
        name: 'Couch Stretch',
        holdSeconds: 45,
        sides: 'left_right',
        description: 'Back knee against wall, front foot planted. Drive hips forward.',
        targetMuscle: 'quads',
      },
      {
        name: 'Standing Hamstring Fold',
        holdSeconds: 60,
        sides: 'both',
        description: 'Feet hip-width, fold forward from hips. Let gravity pull you down.',
        targetMuscle: 'hamstrings',
      },
      {
        name: '90/90 Hip Switch',
        holdSeconds: 30,
        sides: 'left_right',
        description: 'Sit with both knees at 90 degrees. Rotate to switch sides.',
        targetMuscle: 'glutes',
      },
      {
        name: 'Wall Calf Stretch',
        holdSeconds: 30,
        sides: 'left_right',
        description: 'Hands on wall, one foot back with heel down. Lean forward.',
        targetMuscle: 'calves',
      },
      {
        name: 'Deep Squat Hold',
        holdSeconds: 60,
        sides: 'both',
        description: 'Full depth squat, elbows pressing knees out. Hold and breathe.',
        targetMuscle: 'quads',
      },
    ],
  },
  {
    id: 'upper-body-recovery',
    name: 'Upper Body Recovery Flow',
    targetMuscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    durationMinutes: 10,
    movements: [
      {
        name: 'Doorway Chest Stretch',
        holdSeconds: 30,
        sides: 'left_right',
        description: 'Arm at 90 degrees on door frame. Step through until stretch in chest.',
        targetMuscle: 'chest',
      },
      {
        name: 'Thread the Needle',
        holdSeconds: 30,
        sides: 'left_right',
        description: 'On all fours, reach one arm under body. Follow with gaze.',
        targetMuscle: 'back',
      },
      {
        name: 'Cross-Body Shoulder Stretch',
        holdSeconds: 30,
        sides: 'left_right',
        description: 'Pull arm across chest with opposite hand. Keep shoulder down.',
        targetMuscle: 'shoulders',
      },
      {
        name: 'Overhead Tricep Stretch',
        holdSeconds: 30,
        sides: 'left_right',
        description: 'Reach behind head, elbow pointing up. Gently push elbow back.',
        targetMuscle: 'triceps',
      },
      {
        name: 'Hanging Lat Stretch',
        holdSeconds: 45,
        sides: 'both',
        description: 'Hang from pull-up bar or door frame. Relax shoulders completely.',
        targetMuscle: 'back',
      },
    ],
  },
];

export function getRoutinesForMuscles(trainedMuscles: string[]): MobilityRoutine[] {
  return MOBILITY_ROUTINES.filter(routine =>
    routine.targetMuscles.some(m => trainedMuscles.includes(m))
  );
}
```

### Rest Day Detection

```typescript
// /src/lib/rest-day.ts
import { db } from '@/lib/db';

interface RestDayContext {
  isRestDay: boolean;
  lastWorkout: WorkoutLog | null;
  nextTrainingDay: TrainingDay | null;
  trainedMuscles: string[];
}

export async function getRestDayContext(
  programDays: TrainingDay[],
  exercises: Exercise[]
): Promise<RestDayContext> {
  const today = new Date().toISOString().split('T')[0];

  // Check if user already worked out today
  const todayLogs = await db.workoutLogs
    .where('date')
    .equals(today)
    .filter(log => log.isComplete)
    .toArray();

  if (todayLogs.length > 0) {
    return {
      isRestDay: false,
      lastWorkout: todayLogs[0],
      nextTrainingDay: null,
      trainedMuscles: [],
    };
  }

  // Find last completed workout
  const recentLogs = await db.workoutLogs
    .orderBy('date')
    .reverse()
    .filter(log => log.isComplete)
    .limit(1)
    .toArray();

  const lastWorkout = recentLogs[0] || null;

  // Determine trained muscles from last workout
  const trainedMuscles: string[] = [];
  if (lastWorkout) {
    const muscleSet = new Set<string>();
    for (const setLog of lastWorkout.sets) {
      const exercise = exercises.find(e => e.id === setLog.exerciseId);
      if (exercise) {
        exercise.muscleGroups.forEach(m => muscleSet.add(m));
      }
    }
    trainedMuscles.push(...muscleSet);
  }

  // Get next training day
  const nextDay = getNextTrainingDay(programDays, recentLogs);

  return {
    isRestDay: true,
    lastWorkout,
    nextTrainingDay: nextDay,
    trainedMuscles,
  };
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/recovery.ts` | Muscle recovery estimation engine |
| `src/lib/rest-day.ts` | Rest day detection and context |
| `src/lib/whoop.ts` | Whoop API client for recovery data |
| `src/data/mobility-routines.ts` | Pre-built mobility routine data |
| `src/components/rest-day/RestDayScreen.tsx` | Main rest day layout |
| `src/components/rest-day/RecoveryAssessment.tsx` | Self-assessment 1-5 scale UI |
| `src/components/rest-day/MuscleRecoveryCard.tsx` | Recovery timeline per muscle |
| `src/components/rest-day/MobilityRoutineCard.tsx` | Routine suggestion card |
| `src/components/rest-day/ActiveRecoverySession.tsx` | Timer-guided mobility session |
| `src/components/rest-day/HydrationTracker.tsx` | Water intake counter |
| `src/components/rest-day/NextWorkoutPreview.tsx` | Tomorrow's workout preview |
| `src/components/rest-day/WhoopRecoveryCard.tsx` | Whoop data display |
| `src/components/rest-day/MuscleHeatMap.tsx` | Body outline SVG with recovery colors |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Conditionally render RestDayScreen when isRestDay is true |
| `src/lib/db.ts` | Add hydrationLogs and recoveryAssessments tables to Dexie schema |
| `src/app/settings/page.tsx` | Add Whoop connection toggle in settings |
| `src/lib/audio.ts` | Add mobility timer transition sounds (reuse existing audio cue infrastructure) |

---

## 8. Implementation Plan

### Dependencies
- [ ] Dexie.js for local hydration and assessment data (already integrated)
- [ ] Whoop Developer API access (optional - OAuth2 flow)
- [ ] Existing Web Audio API system for mobility timer cues
- [ ] Existing workout log data for muscle recovery analysis
- [ ] No new external dependencies for core features

### Build Order

1. [ ] **Muscle recovery estimation** - `recovery.ts` with volume-based calculations
2. [ ] **Rest day detection** - `rest-day.ts` with context gathering
3. [ ] **Mobility routines data** - `mobility-routines.ts` with 2+ routines
4. [ ] **RecoveryAssessment component** - 1-5 scale self-assessment
5. [ ] **MuscleRecoveryCard component** - Recovery progress bars per muscle
6. [ ] **MobilityRoutineCard component** - Suggested routines with start button
7. [ ] **ActiveRecoverySession component** - Timer-guided mobility flow
8. [ ] **HydrationTracker component** - Water intake counter
9. [ ] **NextWorkoutPreview component** - Tomorrow's workout card
10. [ ] **RestDayScreen layout** - Compose all rest day components
11. [ ] **Home page integration** - Conditional rendering on rest days
12. [ ] **Whoop API integration** - OAuth flow and recovery data fetch (optional)
13. [ ] **WhoopRecoveryCard component** - Whoop data display (optional)
14. [ ] **Dexie schema update** - Add hydration and assessment tables
15. [ ] **Test** - Full rest day flow, muscle recovery accuracy, mobility timer, offline

### Agents to Consult
- **Wellness Director (AduOS)** - Whoop integration patterns, recovery science
- **Movement Specialist** - Mobility routine design and accuracy
- **Audio Engineer** - Timer transition sounds for mobility sessions
- **Frontend Specialist** - Framer Motion animations for assessment and recovery cards
- **PWA Specialist** - Push notification support for sleep reminders

---

## 9. Testing

### Functional Tests
- [ ] Rest day correctly detected when no workout logged today
- [ ] Yesterday's workout impact shows correct muscles and volume
- [ ] Muscle recovery percentages update correctly over time (mock time progression)
- [ ] Recovery estimation handles edge cases: no workout history, workout 3+ days ago
- [ ] Mobility routines match trained muscles (train legs -> get lower body routine)
- [ ] Active recovery timer counts down correctly with audio cues
- [ ] Timer handles bilateral movements (left side then right side)
- [ ] Hydration counter increments, persists across app closes
- [ ] Self-assessment saves to Dexie and displays on subsequent visits same day
- [ ] Next workout preview shows correct day based on program sequence
- [ ] Whoop data fetches and displays correctly (with mock API)
- [ ] Graceful fallback when Whoop is not connected (show self-assessment instead)

### UI Verification
- [ ] Rest day screen is visually distinct from training day (blue-green accent vs lime)
- [ ] All tap targets 44px+ (assessment circles, hydration drops, start routine button)
- [ ] Recovery progress bars render smoothly at different percentages
- [ ] Active recovery session is usable during stretching (large timer, minimal interaction needed)
- [ ] Dark theme colors correct on all components
- [ ] Animations smooth at 60fps (assessment selection, hydration fill)
- [ ] Works completely offline (all data local)
- [ ] Test on iOS Safari PWA
- [ ] Test on Android Chrome
- [ ] Test on iPhone SE (smallest viewport)

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] Deployed to staging
- [ ] iOS Safari PWA tested
- [ ] Mobility routines reviewed by Movement Specialist for accuracy
- [ ] Recovery time estimates validated against exercise science literature
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| No workout history at all (new user) | Show generic rest day tips, skip muscle recovery section |
| Last workout was 5+ days ago | Show all muscles as recovered, suggest starting a new training cycle |
| User works out twice in one day | Use most recent completed workout for recovery context |
| User manually marks training day as rest day | Override detection, show rest day screen |
| Whoop token expired | Silent fallback to self-assessment, show "Reconnect Whoop" in settings |
| Mobility routine has 0 matching muscles | Show general full-body mobility routine as fallback |
| User closes app mid-mobility session | Save progress, offer to resume on next open |
| Multiple muscle groups in one exercise (compound) | Count each muscle group independently in recovery estimates |
| Hydration logged at 11:50pm, resets at midnight | Daily reset at midnight local time, previous day data persisted |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Recovery time estimates are inaccurate | Users overtrain or under-rest | Use conservative estimates, add disclaimer "estimates based on general guidelines", allow user adjustment |
| Whoop API rate limits or downtime | Recovery card shows stale data | Cache last successful fetch, show timestamp, graceful fallback to self-assessment |
| Rest day screen reduces "Start Workout" convenience | Users who want to train on rest day are blocked | Add "Train Anyway" button that switches to normal home view |
| Mobility routines feel generic | Low engagement with recovery routines | Start with well-researched routines, plan to add variety in future iterations |
| Push notifications for sleep reminders | iOS PWA notification limitations | Use in-app banner instead for PWA, native push only if app is installed |
| Users find self-assessment tedious | Skip assessment, miss context | Make it optional, remember last response, pre-fill from Whoop if connected |

---

## Dependencies

- Workout log data (existing) - required for muscle recovery analysis
- Exercise data with muscleGroups field (existing) - maps exercises to muscles
- Web Audio API system (existing) - reused for mobility timer cues
- Dexie.js (existing) - stores hydration logs and assessments locally
- Whoop Developer API (new, optional) - OAuth2 flow for recovery data
- Should be implemented after core training features are stable

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
