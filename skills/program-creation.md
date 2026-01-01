---
name: program-creation
type: skill
description: Build complete training programs for SetFlow with proper periodization, exercise selection, and progression rules.
agents: [periodization-specialist, movement-specialist, injury-rehab-specialist, action-sports-coach, database-specialist, frontend-specialist]
---

# Skill: Program Creation

Build complete training programs for SetFlow with proper periodization, exercise selection, and progression rules.

---

## Purpose

Standardize the process of creating training programs to ensure:
- Evidence-based periodization
- Balanced muscle group coverage
- Appropriate volume and intensity
- Clear progression pathways
- Injury-aware exercise selection

---

## When to Use

- Creating new training program
- Modifying existing program
- Building sport-specific program
- Creating injury-modified program
- Importing external program

---

## Inputs Required

| Input | Required | Description |
|-------|----------|-------------|
| Program name | Yes | Descriptive name |
| Training goal | Yes | Strength, hypertrophy, endurance, sport-specific |
| Days per week | Yes | 2-6 training days |
| Equipment available | Yes | Home, commercial gym, minimal |
| User level | Yes | Beginner, intermediate, advanced |
| Time per session | No | 45-90 minutes typical |
| Injuries/limitations | No | Modify exercise selection |
| Sport preparation | No | For action sports conditioning |

---

## Workflow Steps

### Step 1: Periodization Specialist - Design Structure
```
Define:
- [ ] Mesocycle length (typically 4-6 weeks)
- [ ] Weekly structure (training days/rest days)
- [ ] Rep/set schemes per phase
- [ ] Progressive overload method
- [ ] Deload protocol (week 4 or 5)
```

### Step 2: Periodization Specialist - Volume Distribution
```
Calculate weekly volume per muscle group:

| Muscle Group | Sets/Week Target |
|--------------|------------------|
| Chest        | 10-20            |
| Back         | 10-20            |
| Shoulders    | 8-15             |
| Quads        | 10-20            |
| Hamstrings   | 8-15             |
| Glutes       | 8-15             |
| Arms         | 6-12             |
| Core         | 6-10             |

Distribute across training days.
```

### Step 3: Movement Specialist - Select Exercises
```
For each muscle group:
- [ ] Include compound movements (multi-joint)
- [ ] Include isolation movements (if volume allows)
- [ ] Balance movement patterns (push/pull, hinge/squat)
- [ ] Consider fatigue management (heavy compounds first)
```

### Step 4: Movement Specialist - Define Supersets
```
Pair exercises efficiently:
- Antagonist pairs (push + pull)
- Non-competing (upper + core)
- Pre-exhaust (isolation before compound)

Label: A1/A2, B1/B2, C1/C2
```

### Step 5: Injury & Rehab Specialist - Review Selection
```
Check:
- [ ] No contraindicated exercises for user's injuries
- [ ] Alternatives provided for flagged exercises
- [ ] Prehab exercises included if needed
- [ ] Volume appropriate for injury status
```

### Step 6: Action Sports Coach - Sport Modifications (if applicable)
```
For sport-specific programs:
- [ ] Include sport-relevant movement patterns
- [ ] Add conditioning appropriate to sport
- [ ] Consider seasonal timing (pre-season, in-season)
- [ ] Balance gym work with sport demands
```

### Step 7: Database Specialist - Create Program JSON
```
Create /src/data/programs/[program-name].json:

{
  "id": "[kebab-case-id]",
  "name": "[Program Name]",
  "description": "[Brief description]",
  "goal": "[strength|hypertrophy|endurance|sport]",
  "level": "[beginner|intermediate|advanced]",
  "daysPerWeek": [number],
  "mesocycleWeeks": [number],
  "days": [
    {
      "id": "[day-id]",
      "name": "[Day Name]",
      "warmup": [...],
      "supersets": [...],
      "finisher": [...]
    }
  ],
  "progressionRules": {...},
  "deloadProtocol": {...}
}
```

### Step 8: Frontend Specialist - Verify Display
```
Check:
- [ ] Program appears in program selector
- [ ] All days display correctly
- [ ] Supersets are clearly labeled
- [ ] Exercise cards render properly
- [ ] Timer and rest periods work
```

---

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Program JSON | `/src/data/programs/[name].json` | JSON file |
| Volume report | Console/notes | Summary table |
| Program card | Program selector | React component |

---

## Agents Involved

| Agent | Responsibility |
|-------|----------------|
| Periodization Specialist | Structure, volume, progression |
| Movement Specialist | Exercise selection, supersets |
| Injury & Rehab Specialist | Contraindication review |
| Action Sports Coach | Sport-specific modifications |
| Database Specialist | JSON structure, storage |
| Frontend Specialist | UI verification |

---

## Program Templates

### Full Body (3 days)
```
Day 1: Full Body A
- Focus: Squat pattern, horizontal push/pull
- Volume: 15-20 sets

Day 2: Full Body B
- Focus: Hinge pattern, vertical push/pull
- Volume: 15-20 sets

Day 3: Full Body C
- Focus: Mixed patterns, isolation work
- Volume: 15-20 sets
```

### Upper/Lower (4 days)
```
Day 1: Upper A (Strength focus)
Day 2: Lower A (Quad focus)
Day 3: Upper B (Hypertrophy focus)
Day 4: Lower B (Hinge focus)
```

### Push/Pull/Legs (6 days)
```
Day 1: Push A (Chest focus)
Day 2: Pull A (Back width)
Day 3: Legs A (Quad focus)
Day 4: Push B (Shoulder focus)
Day 5: Pull B (Back thickness)
Day 6: Legs B (Hinge focus)
```

### Action Sports Prep (4 days)
```
Day 1: Lower (Sport-specific patterns)
Day 2: Upper + Core (Stability focus)
Day 3: Power + Conditioning
Day 4: Mobility + Activation
```

---

## Example: Creating "Snowboard Prep" Program

### Inputs
```
Name: Snowboard Season Prep
Goal: Sport-specific (snowboarding)
Days: 4
Equipment: Commercial gym
Level: Intermediate
Injuries: None
Sport: Snowboarding (6 weeks out)
```

### Periodization Specialist Output
```yaml
structure:
  mesocycleWeeks: 6
  phases:
    - weeks: 1-2
      focus: "Foundation - build base strength"
    - weeks: 3-4
      focus: "Sport-specific - rotational power, single leg"
    - weeks: 5-6
      focus: "Peaking - reduce volume, maintain intensity"
  deload: "Week 6 (taper into season)"
```

### Action Sports Coach Output
```yaml
snowboard_requirements:
  quad_endurance: true  # Sustained isometric
  rotational_power: true  # Turns
  hip_mobility: true  # Carving
  core_stability: true  # Anti-rotation

exercises_to_include:
  - Wall Sits (extended)
  - Single Leg Squat Holds
  - Medicine Ball Rotational Throws
  - Cable Woodchops
  - 90/90 Hip Switches
  - Pallof Press
```

### Final Program Structure
```json
{
  "id": "snowboard-prep",
  "name": "Snowboard Season Prep",
  "description": "6-week program to prepare for snowboard season",
  "goal": "sport",
  "level": "intermediate",
  "daysPerWeek": 4,
  "mesocycleWeeks": 6,
  "days": [
    {
      "id": "day-1",
      "name": "Lower Strength",
      "warmup": ["hip-circles", "leg-swings", "goblet-squat"],
      "supersets": [
        {
          "label": "A",
          "exercises": [
            { "exerciseId": "back-squat", "sets": 4, "reps": "6-8" },
            { "exerciseId": "nordic-curl", "sets": 3, "reps": "6-8" }
          ]
        },
        {
          "label": "B",
          "exercises": [
            { "exerciseId": "single-leg-rdl", "sets": 3, "reps": "10-12" },
            { "exerciseId": "wall-sit", "sets": 3, "reps": "60s" }
          ]
        }
      ],
      "finisher": ["calf-raises"]
    }
  ]
}
```

---

## Error Handling

| Error | Resolution |
|-------|------------|
| Volume imbalance | Periodization Specialist adjusts sets |
| Missing movement pattern | Movement Specialist adds exercise |
| Contraindicated exercise | Injury Specialist provides alternative |
| Too many exercises | Prioritize compounds, reduce isolation |

---

## Success Criteria

- [ ] All training days complete with exercises
- [ ] Volume targets met for each muscle group
- [ ] Movement patterns balanced
- [ ] Progressive overload rules defined
- [ ] Deload protocol specified
- [ ] Program displays correctly in app

---

*Program Creation Skill | SetFlow | Created: January 1, 2026*
