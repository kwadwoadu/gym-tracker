# Skill: Progression Logic

Define and implement progressive overload rules for SetFlow to auto-suggest weight increases.

---

## Purpose

Standardize how SetFlow suggests weight increases to ensure:
- Evidence-based progression rates
- Conservative recommendations (better to succeed)
- Exercise-appropriate increases
- Plateau detection and response
- User confidence building

---

## When to Use

- Setting up new exercise progression
- Adjusting progression for exercise type
- Troubleshooting stalled progress
- Creating custom progression rules
- Fine-tuning auto-suggestion sensitivity

---

## Inputs Required

| Input | Required | Description |
|-------|----------|-------------|
| Exercise type | Yes | Compound/isolation |
| Lift category | Yes | Upper/lower, push/pull/hinge/squat |
| User level | Yes | Beginner/intermediate/advanced |
| Rep range | Yes | Target reps for progression |
| Current performance | Yes | Recent workout data |

---

## Core Progression Rules

### The Double Progression Model
```
1. Start at bottom of rep range (e.g., 8 reps)
2. Add reps each session until top of range (e.g., 12 reps)
3. When top of range achieved, increase weight
4. Reset to bottom of rep range
5. Repeat
```

### Weight Increase Amounts

| Category | Increase | Example |
|----------|----------|---------|
| Lower body compounds | 2.5kg (5lbs) | Squat, Deadlift |
| Upper body compounds | 1.25kg (2.5lbs) | Bench, OHP |
| Isolation exercises | 1-2kg (2.5lbs) | Curls, Extensions |
| Machine exercises | 2.5-5kg (5-10lbs) | Leg Press, Cables |

### Level-Based Adjustments

| Level | Progression Rate | Notes |
|-------|------------------|-------|
| Beginner | Every session | Linear progression works well |
| Intermediate | Every 1-2 weeks | Double progression model |
| Advanced | Every 2-4 weeks | Periodized approach |

---

## Workflow Steps

### Step 1: Periodization Specialist - Define Rules
```
For each exercise category, define:
- [ ] Target rep range (e.g., 8-12)
- [ ] Weight increment (e.g., 2.5kg)
- [ ] Success threshold (e.g., all sets at top of range)
- [ ] Minimum sessions before suggestion
```

### Step 2: Progress Analyst - Analyze History
```
Check recent performance:
- [ ] Last 3 sessions with this exercise
- [ ] Reps achieved per set
- [ ] RPE if recorded
- [ ] Trend direction (improving, plateau, declining)
```

### Step 3: Progress Analyst - Generate Suggestion
```
Logic tree:
IF all sets hit top of rep range
  AND RPE < 9
  AND at least 2 sessions at this weight
THEN suggest weight increase

IF stuck at same weight for 3+ sessions
THEN flag plateau, suggest modification
```

### Step 4: Database Specialist - Store Progression
```
Save to progression settings:

{
  "exerciseId": "bench-press",
  "progressionType": "double",
  "repRange": { "min": 8, "max": 12 },
  "increment": 2.5,
  "unit": "kg",
  "minimumSessionsBeforeSuggestion": 2,
  "successThreshold": "all_sets_at_max"
}
```

### Step 5: Frontend Specialist - Display Suggestion
```
UI implementation:
- [ ] Show suggestion badge on exercise card
- [ ] Display recommended weight with +increment
- [ ] Allow user to accept/decline
- [ ] Log user's decision for learning
```

---

## Progression Types

### 1. Double Progression (Default)
```
Best for: Most exercises, intermediate lifters
How: Add reps until top of range, then add weight

Example:
Week 1: 60kg x 8, 8, 8
Week 2: 60kg x 10, 9, 8
Week 3: 60kg x 12, 11, 10
Week 4: 60kg x 12, 12, 12 -> Suggest 62.5kg
Week 5: 62.5kg x 8, 8, 7
```

### 2. Linear Progression
```
Best for: Beginners, compound lifts
How: Add weight every session if successful

Example:
Week 1: 60kg x 5, 5, 5
Week 2: 62.5kg x 5, 5, 5
Week 3: 65kg x 5, 5, 5
Week 4: 67.5kg x 5, 5, 4 -> Stay at 67.5kg
```

### 3. Wave Loading
```
Best for: Strength focus, advanced lifters
How: Cycle through intensity waves

Example:
Wave 1: 80% x 5, 85% x 3, 90% x 1
Wave 2: 82.5% x 5, 87.5% x 3, 92.5% x 1
Wave 3: 85% x 5, 90% x 3, 95% x 1
```

### 4. RPE-Based Progression
```
Best for: Experienced lifters, auto-regulation
How: Progress based on perceived difficulty

Example:
Target: 3x8 @ RPE 7-8
If RPE < 7: Suggest weight increase
If RPE 7-8: Stay at current weight
If RPE > 8: Consider reducing weight
```

---

## Plateau Detection

### Definition
A plateau occurs when:
- Same weight for 3+ consecutive sessions
- Reps not increasing
- Unable to progress to next weight

### Detection Logic
```typescript
const detectPlateau = (exerciseHistory: SetLog[][]): boolean => {
  const lastThree = exerciseHistory.slice(-3)

  // Check if weight is identical
  const weights = lastThree.map(session =>
    Math.max(...session.map(s => s.weight))
  )
  const sameWeight = weights.every(w => w === weights[0])

  // Check if reps progressed
  const reps = lastThree.map(session =>
    session.reduce((sum, s) => sum + s.reps, 0)
  )
  const noRepProgress = reps[2] <= reps[0]

  return sameWeight && noRepProgress
}
```

### Plateau Responses

| Situation | Suggestion |
|-----------|------------|
| 3 sessions, no progress | "Try adding 1 rep per set" |
| 4 sessions, no progress | "Consider a deload week" |
| 5+ sessions, no progress | "Time for exercise variation" |

---

## Agents Involved

| Agent | Responsibility |
|-------|----------------|
| Periodization Specialist | Define progression rules, thresholds |
| Progress Analyst | Analyze data, detect patterns |
| Database Specialist | Store rules, query history |
| Frontend Specialist | Display suggestions, capture decisions |

---

## Example: Bench Press Progression

### Configuration
```json
{
  "exerciseId": "bench-press",
  "category": "upper-compound",
  "progressionType": "double",
  "repRange": { "min": 8, "max": 12 },
  "increment": 2.5,
  "unit": "kg",
  "successCriteria": {
    "minimumSessions": 2,
    "allSetsAtMax": true,
    "maxRPE": 8
  }
}
```

### User History
```
Session 1: 70kg x 10, 9, 8
Session 2: 70kg x 11, 10, 10
Session 3: 70kg x 12, 12, 11
Session 4: 70kg x 12, 12, 12 (RPE 7)
```

### Suggestion Generated
```
"Great work! You hit 12 reps on all sets.
Ready to try 72.5kg next session?"

[Accept] [Not Yet]
```

---

## Progression Display UI

### During Workout
```
BENCH PRESS - Set 3 of 3
Current: 70kg x 12 reps

[Previous: 70kg x 12 | Suggestion: 72.5kg ↑]

Weight: [70] kg
Reps: [___]

[LOG SET]
```

### On Exercise Card
```
┌────────────────────────────┐
│ 🏋️ Bench Press            │
│ 3 sets | 8-12 reps        │
│                            │
│ Last: 70kg x 12/12/12     │
│ ⬆️ Ready for 72.5kg       │
└────────────────────────────┘
```

---

## Error Handling

| Error | Resolution |
|-------|------------|
| No history data | Use conservative starting suggestion |
| Inconsistent data | Use most recent 3 sessions only |
| User declines 3x | Stop suggesting until user opts in |
| Weight not available | Suggest closest available increment |

---

## Success Criteria

- [ ] Progression rules defined per exercise type
- [ ] Historical data correctly analyzed
- [ ] Suggestions are conservative (success-focused)
- [ ] Plateau detection catches stalls
- [ ] UI clearly shows suggestions
- [ ] User decisions are logged

---

## Configuration Options

Users can customize in settings:
```typescript
interface ProgressionSettings {
  enabled: boolean              // Show suggestions
  aggressiveness: 'conservative' | 'moderate' | 'aggressive'
  roundToNearest: number        // 1.25, 2.5, or 5kg
  minimumSessionsBeforeSuggestion: number
  respectRPE: boolean           // Use RPE in calculations
}
```

---

*Progression Logic Skill | SetFlow | Created: January 1, 2026*
