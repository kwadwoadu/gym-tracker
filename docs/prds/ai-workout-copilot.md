# AI Workout Copilot (In-Session Coach)

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - AI Features

---

## Problem Statement

Users get zero real-time feedback during their workouts. They log sets mechanically without knowing whether they should increase weight, adjust rest times, or stop early due to fatigue. When performance plateaus, users have no guidance on what to change. When an exercise is unavailable (machine taken, equipment missing), they don't know what to substitute.

Currently, SetFlow tracks progressive overload with simple rules (all sets at max reps + RPE < 9 = suggest +2.5kg), but this is a static rule that ignores session-level performance trends, fatigue accumulation across supersets, rest time patterns, and multi-week plateaus.

---

## Proposed Solution

An AI copilot that lives inside the active workout session, analyzing performance in real-time and providing contextual coaching cues. The copilot covers three integrated capabilities:

### 1. Real-Time Performance Coach

Analyzes sets as they're logged and provides actionable suggestions:

- **Weight/RPE suggestions**: "RPE has been 6 for 3 consecutive sets - consider increasing by 2.5kg"
- **Rest optimization**: "You're averaging 3 min rest between sets - for hypertrophy, try 90s for more metabolic stress"
- **Fatigue detection**: "Performance dropping across sets (12 -> 10 -> 7 reps) - consider ending after this superset"
- **Set quality feedback**: "Strong set! RPE 8 at target reps - perfect intensity"
- **Tempo reminders**: "Your last 3 sets had no eccentric control - focus on the 3-second lowering phase"

### 2. AI Plateau Breaker

Detects multi-week stalls and suggests evidence-based interventions:

- **Stall detection**: Identifies when a lift hasn't progressed in 2+ weeks despite consistent training
- **Technique variations**: "Bench press stalling at 90kg - try paused reps (2s at chest) for 2 weeks to break through"
- **Volume adjustments**: "Add a back-off set at 80% after your working sets"
- **Periodization shifts**: "Consider a deload week - you've been pushing hard for 5 weeks"
- **Exercise rotation**: "Swap flat bench for incline DB press for 3 weeks, then return"

### 3. Exercise Substitution Engine

Instantly suggests equivalent exercises when needed:

- **Equipment unavailable**: "Barbell bench taken? Try: Dumbbell Bench Press (same primary muscles, similar movement)"
- **Injury accommodation**: "Shoulder pain on OHP? Try: Landmine Press (reduced ROM, less impingement risk)"
- **Home workout fallback**: "No cable machine? Try: Banded Face Pulls (same rear delt activation)"
- **Muscle-matched**: Substitutions always target the same primary muscles with matching equipment availability

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Copilot suggestion acceptance rate | >40% of suggestions acted on | Track suggestion shown vs. weight/rest changed |
| Session completion rate | +10% improvement with copilot on | Compare completion rates copilot on vs. off |
| Plateau break rate | >50% of detected plateaus broken within 3 weeks | Track stall detection -> subsequent PR |
| Substitution usage | >60% acceptance when offered | Track substitution suggestions vs. swaps made |
| User engagement | Users interact with copilot in >70% of sessions | Track sessions with copilot interactions |
| NPS impact | +8 points for copilot users | Survey cohort comparison |

---

## User Stories

- As a user mid-workout, I want AI to tell me if I should increase weight based on my RPE trend so I don't under-train.
- As a user resting too long between sets, I want a nudge to keep my rest periods optimal for my goals.
- As a user whose bench press has stalled for 3 weeks, I want specific technique variations to try.
- As a user whose preferred machine is occupied, I want an instant substitute exercise that targets the same muscles.
- As a user feeling unusually fatigued, I want AI to recognize this and suggest cutting the workout short rather than pushing through with bad form.
- As a user, I want to be able to dismiss copilot suggestions without friction.

---

## Technical Scope

### Architecture

```
User logs a set
      |
      v
┌─────────────────────┐
│ Local Analysis      │ -- RPE trend, rep dropoff, rest times (on-device)
│ (lightweight rules) │
└─────────┬───────────┘
          |
    ┌─────┴──────────────┐
    |                    |
    v                    v
[Simple cue]       [Complex analysis needed]
    |                    |
    v                    v
Show inline tip    ┌─────────────────────┐
                   │ AI API Call          │ -- Plateau analysis, substitution
                   │ (between sets/rest)  │
                   └─────────┬───────────┘
                             |
                             v
                   ┌─────────────────────┐
                   │ Copilot Card        │ -- Dismissible suggestion UI
                   └─────────────────────┘
```

### Two-Tier Analysis System

**Tier 1 - On-Device (instant, no API call)**:
- RPE trend across sets (simple moving average)
- Rep dropoff detection (>30% decrease = fatigue flag)
- Rest time tracking vs. target
- Weight vs. last session comparison
- Volume accumulation per muscle group

**Tier 2 - AI-Powered (API call during rest periods)**:
- Multi-week plateau detection and intervention suggestions
- Exercise substitution with reasoning
- Periodization recommendations
- Fatigue pattern analysis across sessions

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/workout-copilot.ts` | Core copilot engine: local analysis + AI orchestration |
| `/src/lib/ai/copilot-rules.ts` | On-device rule engine for Tier 1 analysis (no API needed) |
| `/src/lib/ai/plateau-detector.ts` | Multi-week stall detection logic using workout history |
| `/src/lib/ai/exercise-substitutor.ts` | Muscle-matched exercise substitution with equipment filtering |
| `/src/lib/ai/prompts/copilot-prompt.ts` | Prompt templates for Tier 2 AI analysis |
| `/src/components/workout/copilot-card.tsx` | Dismissible suggestion card shown during workout |
| `/src/components/workout/copilot-drawer.tsx` | Expandable drawer for detailed AI coaching (plateau analysis, substitution options) |
| `/src/components/workout/substitution-picker.tsx` | Exercise substitution selection UI with muscle map comparison |
| `/src/hooks/use-copilot.ts` | React hook managing copilot state, suggestion queue, and dismissals |
| `/src/app/api/ai/copilot/route.ts` | API route for Tier 2 AI analysis |

### Files to Modify

| File | Change |
|------|--------|
| `/src/components/workout/set-logger.tsx` | Integrate copilot card after set completion |
| `/src/components/workout/rest-timer.tsx` | Show copilot suggestions during rest periods |
| `/src/components/workout/exercise-card.tsx` | Add substitution button and copilot indicator |
| `/src/lib/db.ts` | Add `CopilotSuggestion` interface and table for tracking suggestion history |
| `/src/lib/queries.ts` | Add `useCopilotSuggestions()`, `usePlateauHistory()` hooks |
| `/src/lib/feature-flags.ts` | Add `AI_WORKOUT_COPILOT` feature flag |
| `/src/data/exercises.json` | Ensure substitution metadata (movement pattern, difficulty) exists |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| None new | Tier 1 uses pure TypeScript, Tier 2 uses shared `ai-client.ts` from PRD 1 | - |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model (Tier 2) | Claude 3.5 Haiku (fast, cheap for real-time use) |
| Input tokens | ~800 (current set data + recent history summary) |
| Output tokens | ~200 (suggestion + reasoning) |
| Latency target | <2 seconds (must complete during rest period) |
| Cost per suggestion | ~$0.001 |
| Calls per session | 2-5 Tier 2 calls per workout (most handled by Tier 1 locally) |
| Offline fallback | Tier 1 rules work fully offline; Tier 2 silently disabled |

---

## Design Requirements

### Copilot Card (In-Workout)

```
┌─────────────────────────────────────────┐
│  Set Logger                              │
│  Bench Press - Set 3 of 4                │
│  [Weight: 85kg]  [Reps: 10]  [RPE: 6]   │
│                                          │
│  [Complete Set]                          │
│                                          │
│  ┌─ Copilot ────────────────────────┐    │
│  │  ↑ Weight suggestion             │    │
│  │  RPE 6 for 3 sets in a row.     │    │
│  │  Try 87.5kg next set.           │    │
│  │                                   │    │
│  │  [Apply +2.5kg]  [Dismiss]  [x]  │    │
│  └───────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Plateau Alert Card

```
┌─ Copilot: Plateau Detected ─────────────┐
│                                          │
│  Bench Press has been at 85kg x 10       │
│  for 3 weeks.                            │
│                                          │
│  Suggested interventions:                │
│  1. Paused reps (2s at chest) - 2 weeks  │
│  2. Add back-off set at 70kg x 12        │
│  3. Swap to Incline DB Press for variety  │
│                                          │
│  [Try #1]  [Try #2]  [Try #3]  [Ignore]  │
└──────────────────────────────────────────┘
```

### Substitution Picker

```
┌─ Exercise Unavailable? ─────────────────┐
│                                          │
│  Current: Barbell Bench Press            │
│  Primary: Chest | Secondary: Triceps     │
│                                          │
│  Suggested substitutes:                  │
│  ┌────────────────────────────────────┐  │
│  │ Dumbbell Bench Press     95% match │  │
│  │ Chest, Triceps, Front Delts       │  │
│  │ [Swap]                            │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Machine Chest Press      88% match │  │
│  │ Chest, Triceps                    │  │
│  │ [Swap]                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Show More]                [Cancel]     │
└──────────────────────────────────────────┘
```

### Visual Style
- Copilot cards use subtle border with accent color (#CDFF00) left stripe
- Background: `#1A1A1A` (card surface) with slight glow effect
- Dismissible with swipe-left or X button
- Non-intrusive: appears below set logger, doesn't block logging flow
- Plateau alerts use warning color (#F59E0B) accent
- Substitution match percentage shown as colored badge

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User ignores all suggestions | Reduce suggestion frequency after 5 consecutive dismissals; reset next session |
| Copilot suggests weight increase but user is injured | Never override user RPE; if RPE is reported high, respect it regardless of weight |
| Network unavailable for Tier 2 | Silently fall back to Tier 1 only; no error messages during workout |
| First workout ever (no history) | Disable copilot for first session; show "Copilot activates after your first workout" |
| User does exercises out of programmed order | Copilot adapts to actual exercise order, not planned |
| Plateau on isolation exercises | Different thresholds: compound lifts stall at 2 weeks, isolation at 3 weeks |
| Multiple suggestions at once | Queue system: show max 1 suggestion at a time, prioritize by impact |
| Substitution exercise also unavailable | Allow chaining: "This one too? Here's another option" |
| RPE not logged (optional field) | Fall back to rep-based analysis only; prompt user to log RPE for better coaching |

---

## Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Current set data (weight, reps, RPE) | Tier 2: sent to Claude API | Not stored by API |
| Recent workout history (last 4 weeks, aggregated) | Tier 2: sent to Claude API | Not stored by API |
| Exercise names and muscle groups | Tier 2: sent for substitution context | Not stored by API |
| Suggestion history (accepted/dismissed) | Stored locally in IndexedDB | Until user clears data |
| Tier 1 analysis | Never leaves device | Local only |

### User Control
- Toggle copilot on/off in Settings (default: on)
- Individual suggestion types can be disabled (weight, rest, fatigue, plateaus)
- "Quiet mode" option: copilot only shows critical alerts (fatigue/injury risk)

---

## Priority

**P1 - Should Ship**

The copilot transforms SetFlow from a passive tracker into an active training partner. The two-tier architecture (local rules + AI) ensures the feature works even offline, with AI adding depth when connectivity allows. This is the most visible AI feature during the core use case (active workout session).

---

## Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| AI client (`ai-client.ts`) | Created in PRD 1 | Tier 2 API calls |
| Workout logging flow | Complete | Set data input |
| SetLog with RPE field | Complete | Performance analysis |
| Exercise database with muscle data | Complete | Substitution engine |
| Progressive overload pattern | Complete | Baseline comparison |
| Feature flags system | Complete | Gating rollout |
| PRD 1 (AI Program Generation) | Recommended first | Shared AI infrastructure |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft - combines Workout Copilot, Plateau Breaker, and Exercise Substitution |
