---
name: exercise-creation
type: skill
description: Add new exercises to the SetFlow exercise library with proper categorization, form cues, and integration.
agents: [movement-specialist, periodization-specialist, injury-rehab-specialist, database-specialist, frontend-specialist]
---

# Skill: Exercise Creation

Add new exercises to the SetFlow exercise library with proper categorization, form cues, and integration.

---

## Purpose

Standardize the process of adding exercises to ensure:
- Consistent data structure
- Proper muscle group categorization
- Quality form cues
- Appropriate tempo defaults
- Database integrity

---

## When to Use

- User requests new exercise
- Adding exercises from a program
- Importing exercise library
- Creating exercise variations

---

## Inputs Required

| Input | Required | Description |
|-------|----------|-------------|
| Exercise name | Yes | Clear, standard name |
| Equipment | Yes | barbell, dumbbell, machine, bodyweight, cable, kettlebell |
| Primary muscles | Yes | Main muscle groups targeted |
| Secondary muscles | No | Supporting muscles |
| Video URL | No | YouTube embed for form reference |
| Form cues | Yes | 3-5 coaching cues |
| Common mistakes | No | What to avoid |

---

## Workflow Steps

### Step 1: Movement Specialist - Validate Exercise
```
Check:
- [ ] Exercise name is standard (not abbreviations)
- [ ] Equipment type is valid
- [ ] Primary muscles are correct
- [ ] Secondary muscles are comprehensive
- [ ] Movement pattern identified (hinge, squat, push, pull, etc.)
```

### Step 2: Movement Specialist - Define Form Cues
```
Provide:
- 3-5 clear coaching cues
- Common mistakes list (2-4)
- Fix for each mistake
- ROM recommendations
```

### Step 3: Periodization Specialist - Set Defaults
```
Define:
- Default sets: [number]
- Default reps: [range, e.g., "8-12"]
- Default tempo: [T:XYZW notation]
- Default rest: [seconds]
- Recommended RPE: [range]
```

### Step 4: Injury & Rehab Specialist - Flag Contraindications
```
Identify:
- Injuries this exercise may aggravate
- Population restrictions (if any)
- Safer alternatives for each restriction
```

### Step 5: Database Specialist - Add to Library
```
Add to /src/data/exercises.json:

{
  "id": "[kebab-case-id]",
  "name": "[Exercise Name]",
  "equipment": "[equipment-type]",
  "muscleGroups": {
    "primary": ["muscle1", "muscle2"],
    "secondary": ["muscle3"]
  },
  "movementPattern": "[pattern]",
  "videoUrl": "[youtube-url]",
  "formCues": [
    "Cue 1",
    "Cue 2",
    "Cue 3"
  ],
  "commonMistakes": [
    { "mistake": "X", "fix": "Do Y instead" }
  ],
  "defaults": {
    "sets": 3,
    "reps": "8-12",
    "tempo": "T:30X1",
    "restSeconds": 90
  },
  "contraindications": ["shoulder-impingement"]
}
```

### Step 6: Frontend Specialist - Verify Display
```
Check:
- [ ] Exercise appears in exercise picker
- [ ] Card displays correctly
- [ ] Video thumbnail loads (if URL provided)
- [ ] Form cues display on exercise detail
```

---

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Exercise JSON | `/src/data/exercises.json` | JSON object |
| Exercise card | Exercise picker | React component |
| Form reference | Exercise detail view | Expandable section |

---

## Agents Involved

| Agent | Responsibility |
|-------|----------------|
| Movement Specialist | Validate, form cues, ROM |
| Periodization Specialist | Rep/set defaults, tempo |
| Injury & Rehab Specialist | Contraindications |
| Database Specialist | Add to JSON, schema |
| Frontend Specialist | UI verification |

---

## Example: Adding Romanian Deadlift

### Inputs
```
Name: Romanian Deadlift
Equipment: Barbell
Primary: Hamstrings, Glutes
Secondary: Lower Back, Core
```

### Movement Specialist Output
```yaml
formCues:
  - "Soft knees, not bent knees"
  - "Push hips back like closing a door with your butt"
  - "Bar stays on your thighs the entire movement"
  - "Feel the stretch in your hamstrings before returning"
  - "Maintain neutral spine throughout"

commonMistakes:
  - mistake: "Too much knee bend (becomes a squat)"
    fix: "Keep shins vertical, think hinge not squat"
  - mistake: "Rounding the lower back"
    fix: "Brace core, stop lowering when spine rounds"
  - mistake: "Bar drifting away from body"
    fix: "Drag bar along thighs"

movementPattern: "hinge"
```

### Periodization Specialist Output
```yaml
defaults:
  sets: 3
  reps: "8-12"
  tempo: "T:30A1"  # 3s eccentric, controlled concentric, 1s squeeze
  restSeconds: 90
  recommendedRPE: "7-8"
```

### Injury Specialist Output
```yaml
contraindications:
  - "lower-back-disc"
  - "hamstring-strain"
alternatives:
  lower-back-disc: "Cable Pull-Through"
  hamstring-strain: "Leg Curl (light)"
```

### Final JSON
```json
{
  "id": "romanian-deadlift",
  "name": "Romanian Deadlift",
  "equipment": "barbell",
  "muscleGroups": {
    "primary": ["hamstrings", "glutes"],
    "secondary": ["lower-back", "core"]
  },
  "movementPattern": "hinge",
  "videoUrl": null,
  "formCues": [
    "Soft knees, not bent knees",
    "Push hips back like closing a door with your butt",
    "Bar stays on your thighs the entire movement",
    "Feel the stretch in your hamstrings before returning",
    "Maintain neutral spine throughout"
  ],
  "commonMistakes": [
    { "mistake": "Too much knee bend", "fix": "Keep shins vertical" },
    { "mistake": "Rounding lower back", "fix": "Brace core, stop when spine rounds" },
    { "mistake": "Bar drifting away", "fix": "Drag bar along thighs" }
  ],
  "defaults": {
    "sets": 3,
    "reps": "8-12",
    "tempo": "T:30A1",
    "restSeconds": 90
  },
  "contraindications": ["lower-back-disc", "hamstring-strain"]
}
```

---

## Error Handling

| Error | Resolution |
|-------|------------|
| Duplicate exercise ID | Check existing library, create variation ID |
| Invalid equipment type | Use valid enum: barbell, dumbbell, machine, bodyweight, cable, kettlebell |
| Missing muscle groups | Movement Specialist must define before proceeding |
| No form cues | Movement Specialist must provide minimum 3 cues |

---

## Success Criteria

- [ ] Exercise appears in picker without errors
- [ ] All required fields populated
- [ ] Form cues are clear and actionable
- [ ] Contraindications flagged appropriately
- [ ] Defaults are reasonable for exercise type

---

*Exercise Creation Skill | SetFlow | Created: January 1, 2026*
