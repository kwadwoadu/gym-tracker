# Workout Plan Selection PRD

## Overview
Plan selection screen allowing users to choose from preset workout programs or start from scratch after completing onboarding.

## Status: Complete

## Problem Statement
Users need a structured workout program to track. Without preset options, users must manually create their entire program, which is time-consuming and requires fitness knowledge.

## Solution
A plan selection page at `/onboarding/plans` with:
- 3 preset programs (Full Body 3-Day, PPL 6-Day, Upper/Lower 4-Day)
- Personalized recommendation based on onboarding data
- "Start from Scratch" option for custom programs

## Preset Programs

### 1. Full Body 3-Day (Beginner)
- **Frequency**: 3 days/week
- **Structure**: Full body each session
- **Target**: Beginners, busy schedules
- **File**: `src/data/programs/full-body-3day.json`

### 2. Push/Pull/Legs 6-Day (Intermediate)
- **Frequency**: 6 days/week
- **Structure**: Push A, Pull A, Legs A, Push B, Pull B, Legs B
- **Target**: Intermediate+, maximize gains
- **File**: `src/data/programs/ppl-6day.json`

### 3. Upper/Lower 4-Day (Intermediate)
- **Frequency**: 4 days/week
- **Structure**: Upper A, Lower A, Upper B, Lower B
- **Target**: Intermediate, balanced approach
- **File**: `src/data/programs/upper-lower-4day.json`

## Recommendation Logic
Based on onboarding profile:
- Beginners always get Full Body
- 3 or fewer days/week = Full Body
- 4-5 days/week = Upper/Lower
- 6 days/week = PPL

## User Flow
1. Complete onboarding (or skip)
2. Arrive at `/onboarding/plans`
3. See recommended program pre-selected
4. Browse other options
5. Click "Get Started" to install program
6. Redirected to main app (/)

## Technical Implementation

### Components Created
- `src/components/plan-selection/plan-card.tsx` - Program card with details
- `src/components/plan-selection/start-scratch-card.tsx` - Empty program option

### Pages Created
- `src/app/onboarding/plans/page.tsx` - Plan selection page

### Utilities Created
- `src/lib/programs.ts`:
  - `getPresetPrograms()` - List all presets
  - `getRecommendedProgram()` - Get recommendation based on profile
  - `installPresetProgram()` - Copy preset to user's IndexedDB
  - `createEmptyProgram()` - Create blank program
  - `hasInstalledProgram()` - Check if program exists

### Data Files Created
- `src/data/programs/full-body-3day.json`
- `src/data/programs/ppl-6day.json`
- `src/data/programs/upper-lower-4day.json`

### Routing Changes
- `src/app/page.tsx` - Checks for installed program, redirects to onboarding if needed
- `src/lib/seed.ts` - Added `seedExercisesOnly()` to avoid auto-seeding programs

## Design Decisions
1. **Pre-selected recommendation**: Reduces decision fatigue
2. **Card-based selection**: Clear visual hierarchy
3. **Difficulty badges**: Color-coded (green/yellow/red)
4. **Start from scratch last**: Discourages blank slate for new users

## Program Structure
Each preset follows the schema:
```json
{
  "id": "preset-...",
  "meta": { "name", "description", "difficulty", "daysPerWeek", "targetAudience" },
  "program": { "id", "name", "description", "isActive" },
  "trainingDays": [{ "id", "name", "dayNumber", "warmup", "supersets", "finisher" }]
}
```

## Success Metrics
- Plan selection completion rate > 95%
- Preset selection rate > 80%
- Custom program rate < 20%
- D7 retention improvement +15%
